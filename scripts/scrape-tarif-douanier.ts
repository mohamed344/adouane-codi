/**
 * Scraper for Algerian Customs Tariff (Nomenclature Douanière 2026)
 * Source: https://www.douane.gov.dz/spip.php?page=tarif_douanier
 *
 * URL structure:
 *   Sections:       spip.php?page=tarif_douanier
 *   Chapitres:      spip.php?page=chapitre&section=XX
 *   Rangées:        spip.php?page=range&section=XX&chapitre=YY
 *   Positions:      spip.php?page=position&section=XX&chapitre=YY&range=ZZ
 *   Sous-positions: spip.php?page=sous_position&section=XX&chapitre=YY&range=ZZ&position=PPPP&sous_position=SSSSSSSSSS
 */

import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as https from "https";
import * as path from "path";

const BASE_URL = "https://www.douane.gov.dz/spip.php";
const agent = new https.Agent({ rejectUnauthorized: false });
const DELAY_MS = 300; // be respectful to the server
const OUTPUT_DIR = path.join(__dirname, "..", "data");

// ---------- Types ----------

interface Section {
  code: string;
  description: string;
}

interface Chapitre {
  section_code: string;
  code: string;
  description: string;
}

interface Rangee {
  section_code: string;
  chapitre_code: string;
  code: string;
  description: string;
}

interface TaxRate {
  taxe: string;
  taux: number;
  observation: string;
}

interface TaxAdvantage {
  taxe: string;        // "D.D", "T.V.A"
  taux: number;        // reduced rate
  document: string;    // e.g., "CERTIFICAT D'ORIGINE..."
}

interface TariffLine {
  section_code: string;
  chapitre_code: string;
  range_code: string;
  position_code: string;
  sous_position_code: string;
  full_code: string; // e.g. "0101211100"
  description: string;
  dd: number | null;      // Droit de Douane
  prct: number | null;    // PRCT
  tcs: number | null;     // Taxe Complémentaire de Solidarité
  tva: number | null;     // TVA
  dap: number | null;     // DAP
  other_taxes: TaxRate[];
  usage_group: string | null;    // "Biens de consommation", etc.
  unit: string | null;           // "U", "KG", etc.
  tax_advantages: TaxAdvantage[];
}

// ---------- Helpers ----------

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPage(url: string): Promise<cheerio.CheerioAPI> {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data } = await axios.get(url, {
        httpsAgent: agent,
        timeout: 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      return cheerio.load(data);
    } catch (err: any) {
      if (attempt === maxRetries) throw err;
      console.warn(`  Retry ${attempt}/${maxRetries} for ${url}`);
      await sleep(2000 * attempt);
    }
  }
  throw new Error("unreachable");
}

function cleanText(text: string): string {
  return text
    .replace(/\?/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------- Scrape levels ----------

async function scrapeSections(): Promise<Section[]> {
  console.log("Scraping sections...");
  const $ = await fetchPage(`${BASE_URL}?page=tarif_douanier`);
  const sections: Section[] = [];

  $("tr[data-href*='page=chapitre']").each((_, el) => {
    const tds = $(el).find("td");
    const code = $(tds[0]).text().trim();
    const description = cleanText($(tds[1]).text());
    if (code) sections.push({ code, description });
  });

  console.log(`  Found ${sections.length} sections`);
  return sections;
}

async function scrapeChapitres(sectionCode: string): Promise<Chapitre[]> {
  const $ = await fetchPage(
    `${BASE_URL}?page=chapitre&section=${sectionCode}`
  );
  const chapitres: Chapitre[] = [];

  $("tr[data-href*='page=range']").each((_, el) => {
    const tds = $(el).find("td");
    const code = $(tds[0]).text().trim();
    const description = cleanText($(tds[1]).text());
    if (code)
      chapitres.push({ section_code: sectionCode, code, description });
  });

  return chapitres;
}

async function scrapeRangees(
  sectionCode: string,
  chapitreCode: string
): Promise<Rangee[]> {
  const $ = await fetchPage(
    `${BASE_URL}?page=range&section=${sectionCode}&chapitre=${chapitreCode}`
  );
  const rangees: Rangee[] = [];

  $("tr[data-href*='page=position']").each((_, el) => {
    const tds = $(el).find("td");
    const code = $(tds[0]).text().trim();
    const description = cleanText($(tds[1]).text());
    if (code)
      rangees.push({
        section_code: sectionCode,
        chapitre_code: chapitreCode,
        code,
        description,
      });
  });

  return rangees;
}

async function scrapePositions(
  sectionCode: string,
  chapitreCode: string,
  rangeCode: string
): Promise<TariffLine[]> {
  const $ = await fetchPage(
    `${BASE_URL}?page=position&section=${sectionCode}&chapitre=${chapitreCode}&range=${rangeCode}`
  );
  const lines: TariffLine[] = [];

  // Rows with data-href have a sous_position code
  $("tr[data-href*='page=sous_position']").each((_, el) => {
    const href = $(el).attr("data-href") || "";
    const tds = $(el).find("td");
    const positionCode = $(tds[0]).text().trim();
    const description = cleanText($(tds[1]).text());

    // Extract sous_position from href
    const spMatch = href.match(/sous_position=(\d+)/);
    const sousPositionCode = spMatch ? spMatch[1] : "";

    if (positionCode) {
      lines.push({
        section_code: sectionCode,
        chapitre_code: chapitreCode,
        range_code: rangeCode,
        position_code: positionCode,
        sous_position_code: sousPositionCode,
        full_code: sousPositionCode,
        description,
        dd: null,
        prct: null,
        tcs: null,
        tva: null,
        dap: null,
        other_taxes: [],
        usage_group: null,
        unit: null,
        tax_advantages: [],
      });
    }
  });

  // Also capture category rows (no data-href) as context descriptions
  // These are hierarchy markers like "- Chevaux :" — skip them for the data table

  return lines;
}

async function scrapeTaxRates(line: TariffLine): Promise<TariffLine> {
  const url =
    `${BASE_URL}?page=sous_position` +
    `&section=${line.section_code}` +
    `&chapitre=${line.chapitre_code}` +
    `&range=${line.range_code}` +
    `&position=${line.position_code}` +
    `&sous_position=${line.sous_position_code}`;

  try {
    const $ = await fetchPage(url);

    // Extract metadata: Groupe d'utilisation and Unité
    const bodyText = $("body").text();
    const groupeMatch = bodyText.match(/Groupe d'utilisation\s*:\s*([^\n]+)/i);
    if (groupeMatch) {
      line.usage_group = cleanText(groupeMatch[1]);
    }
    const uniteMatch = bodyText.match(/Unit[ée]\s*:\s*([^\n]+)/i);
    if (uniteMatch) {
      line.unit = cleanText(uniteMatch[1]);
    }

    const tables = $("table");

    // First table: Taxes Ad-Valorem
    tables
      .first()
      .find("tbody tr")
      .each((_, el) => {
        const tds = $(el).find("td");
        const taxe = $(tds[0]).text().trim().toUpperCase();
        const taux = parseFloat($(tds[1]).text().trim()) || 0;
        const obs = $(tds[2]).attr("title")?.trim() || "";

        switch (taxe) {
          case "D.D":
            line.dd = taux;
            break;
          case "PRCT":
            line.prct = taux;
            break;
          case "T.C.S":
            line.tcs = taux;
            break;
          case "T.V.A":
            line.tva = taux;
            break;
          case "D.A.P":
            line.dap = taux;
            break;
          default:
            line.other_taxes.push({ taxe, taux, observation: obs });
        }
      });

    // Second table: Avantages fiscaux (tax advantages)
    if (tables.length > 1) {
      tables
        .eq(1)
        .find("tbody tr")
        .each((_, el) => {
          const tds = $(el).find("td");
          if (tds.length >= 3) {
            const taxe = $(tds[0]).text().trim();
            const taux = parseFloat($(tds[1]).text().trim()) || 0;
            const document = cleanText($(tds[2]).text());
            if (taxe) {
              line.tax_advantages.push({ taxe, taux, document });
            }
          }
        });
    }
  } catch (err: any) {
    console.warn(
      `  Warning: could not fetch taxes for ${line.full_code}: ${err.message}`
    );
  }

  return line;
}

// ---------- Main ----------

async function main() {
  const skipTaxDetails = process.argv.includes("--no-taxes");
  const singleSection = process.argv.find((a) => a.startsWith("--section="));
  const targetSection = singleSection?.split("=")[1];

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("=== Algerian Customs Tariff Scraper 2026 ===\n");

  // 1. Scrape sections
  const sections = await scrapeSections();
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "sections.json"),
    JSON.stringify(sections, null, 2)
  );

  const allTariffLines: TariffLine[] = [];
  const allChapitres: Chapitre[] = [];
  const allRangees: Rangee[] = [];

  for (const section of sections) {
    if (targetSection && section.code !== targetSection) continue;

    console.log(`\nSection ${section.code}: ${section.description.slice(0, 60)}...`);

    // 2. Scrape chapitres
    await sleep(DELAY_MS);
    const chapitres = await scrapeChapitres(section.code);
    allChapitres.push(...chapitres);
    console.log(`  ${chapitres.length} chapitres`);

    for (const chapitre of chapitres) {
      // 3. Scrape rangées
      await sleep(DELAY_MS);
      const rangees = await scrapeRangees(section.code, chapitre.code);
      allRangees.push(...rangees);
      console.log(
        `  Chapitre ${chapitre.code}: ${rangees.length} rangées - ${chapitre.description.slice(0, 50)}`
      );

      for (const rangee of rangees) {
        // 4. Scrape positions (tariff lines)
        await sleep(DELAY_MS);
        const positions = await scrapePositions(
          section.code,
          chapitre.code,
          rangee.code
        );

        if (!skipTaxDetails) {
          // 5. Scrape tax rates for each sous-position
          for (const pos of positions) {
            await sleep(DELAY_MS);
            await scrapeTaxRates(pos);
          }
        }

        allTariffLines.push(...positions);
        if (positions.length > 0) {
          console.log(
            `    Range ${rangee.code}: ${positions.length} codes`
          );
        }
      }

      // Save progress after each chapitre
      fs.writeFileSync(
        path.join(OUTPUT_DIR, "tariff_lines_progress.json"),
        JSON.stringify(allTariffLines, null, 2)
      );
    }
  }

  // ---------- Save final outputs ----------

  // JSON
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "sections.json"),
    JSON.stringify(sections, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "chapitres.json"),
    JSON.stringify(allChapitres, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "rangees.json"),
    JSON.stringify(allRangees, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "tariff_lines.json"),
    JSON.stringify(allTariffLines, null, 2)
  );

  // CSV
  const csvHeader = [
    "full_code",
    "section_code",
    "chapitre_code",
    "range_code",
    "position_code",
    "description",
    "dd",
    "prct",
    "tcs",
    "tva",
    "dap",
  ].join(",");

  const csvRows = allTariffLines.map((l) =>
    [
      l.full_code,
      l.section_code,
      l.chapitre_code,
      l.range_code,
      l.position_code,
      `"${l.description.replace(/"/g, '""')}"`,
      l.dd ?? "",
      l.prct ?? "",
      l.tcs ?? "",
      l.tva ?? "",
      l.dap ?? "",
    ].join(",")
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "tariff_douanier_2026.csv"),
    [csvHeader, ...csvRows].join("\n"),
    "utf-8"
  );

  // SQL insert statements
  const sqlLines = allTariffLines.map(
    (l) =>
      `INSERT INTO tariff_codes (full_code, section_code, chapitre_code, range_code, position_code, description, dd, prct, tcs, tva, dap) VALUES ('${l.full_code}', '${l.section_code}', '${l.chapitre_code}', '${l.range_code}', '${l.position_code}', '${l.description.replace(/'/g, "''")}', ${l.dd}, ${l.prct}, ${l.tcs}, ${l.tva}, ${l.dap});`
  );

  const sqlSchema = `-- Algerian Customs Tariff 2026
-- Scraped from douane.gov.dz

CREATE TABLE IF NOT EXISTS tariff_sections (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tariff_chapitres (
  section_code TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY (section_code, code)
);

CREATE TABLE IF NOT EXISTS tariff_codes (
  id SERIAL PRIMARY KEY,
  full_code TEXT UNIQUE NOT NULL,
  section_code TEXT NOT NULL,
  chapitre_code TEXT NOT NULL,
  range_code TEXT NOT NULL,
  position_code TEXT NOT NULL,
  description TEXT NOT NULL,
  dd NUMERIC,
  prct NUMERIC,
  tcs NUMERIC,
  tva NUMERIC,
  dap NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tariff_codes_full_code ON tariff_codes(full_code);
CREATE INDEX idx_tariff_codes_section ON tariff_codes(section_code);
CREATE INDEX idx_tariff_codes_chapitre ON tariff_codes(section_code, chapitre_code);

-- Section data
${sections.map((s) => `INSERT INTO tariff_sections (code, description) VALUES ('${s.code}', '${s.description.replace(/'/g, "''")}');`).join("\n")}

-- Chapitre data
${allChapitres.map((c) => `INSERT INTO tariff_chapitres (section_code, code, description) VALUES ('${c.section_code}', '${c.code}', '${c.description.replace(/'/g, "''")}');`).join("\n")}

-- Tariff line data
${sqlLines.join("\n")}
`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "tariff_douanier_2026.sql"),
    sqlSchema,
    "utf-8"
  );

  console.log(`\n=== Done! ===`);
  console.log(`Total tariff lines: ${allTariffLines.length}`);
  console.log(`Output files in: ${OUTPUT_DIR}/`);
  console.log(`  - sections.json`);
  console.log(`  - chapitres.json`);
  console.log(`  - rangees.json`);
  console.log(`  - tariff_lines.json`);
  console.log(`  - tariff_douanier_2026.csv`);
  console.log(`  - tariff_douanier_2026.sql`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
