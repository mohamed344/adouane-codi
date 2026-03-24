/**
 * Focused tax-rate scraper: reads existing tariff_lines.json and enriches
 * each code with tax rates, usage_group, unit, and tax_advantages by visiting
 * the sous_position detail page.
 *
 * Usage:
 *   npx tsx scripts/scrape-tax-rates.ts
 *   npx tsx scripts/scrape-tax-rates.ts --resume       # resume from last saved progress
 *   npx tsx scripts/scrape-tax-rates.ts --section=07   # only scrape section 07
 */

import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as https from "https";
import * as path from "path";

const BASE_URL = "https://www.douane.gov.dz/spip.php";
const agent = new https.Agent({ rejectUnauthorized: false });
const DELAY_MS = 300;
const DATA_DIR = path.join(__dirname, "..", "data");
const PROGRESS_FILE = path.join(DATA_DIR, "tax_scrape_progress.json");
const SAVE_INTERVAL = 100; // save progress every N codes

// ---------- Types ----------

interface TaxAdvantage {
  taxe: string;
  taux: number;
  document: string;
}

interface TariffLine {
  section_code: string;
  chapitre_code: string;
  range_code: string;
  position_code: string;
  sous_position_code: string;
  full_code: string;
  description: string;
  dd: number | null;
  prct: number | null;
  tcs: number | null;
  tva: number | null;
  dap: number | null;
  other_taxes: { taxe: string; taux: number; observation: string }[];
  usage_group: string | null;
  unit: string | null;
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

// ---------- Scrape detail page ----------

async function scrapeDetailPage(line: TariffLine): Promise<void> {
  const url =
    `${BASE_URL}?page=sous_position` +
    `&section=${line.section_code}` +
    `&chapitre=${line.chapitre_code}` +
    `&range=${line.range_code}` +
    `&position=${line.position_code}` +
    `&sous_position=${line.sous_position_code}`;

  const $ = await fetchPage(url);

  // Extract metadata
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
          if (!line.other_taxes) line.other_taxes = [];
          line.other_taxes.push({ taxe, taux, observation: obs });
      }
    });

  // Second table: Avantages fiscaux
  if (tables.length > 1) {
    if (!line.tax_advantages) line.tax_advantages = [];
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
}

// ---------- Main ----------

async function main() {
  const resume = process.argv.includes("--resume");
  const sectionArg = process.argv.find((a) => a.startsWith("--section="));
  const targetSection = sectionArg?.split("=")[1];

  console.log("=== Tax Rate Scraper ===\n");

  // Load source data
  const sourceFile = path.join(DATA_DIR, "tariff_lines.json");
  if (!fs.existsSync(sourceFile)) {
    console.error(`File not found: ${sourceFile}`);
    console.error("Run the full scraper first: npx tsx scripts/scrape-tarif-douanier.ts");
    process.exit(1);
  }

  const allLines: TariffLine[] = JSON.parse(fs.readFileSync(sourceFile, "utf-8"));
  console.log(`Loaded ${allLines.length} tariff codes from tariff_lines.json`);

  // Filter by section if specified, but keep reference to full array for saving
  let lines = allLines;
  if (targetSection) {
    lines = allLines.filter((l) => l.section_code === targetSection);
    console.log(`Filtered to ${lines.length} codes in section ${targetSection}`);
  }

  // Resume support: load progress file to find where we left off
  let startIndex = 0;
  if (resume && fs.existsSync(PROGRESS_FILE)) {
    const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
    const lastCode = progress.last_code;
    const idx = lines.findIndex((l) => l.full_code === lastCode);
    if (idx >= 0) {
      // Merge already-scraped data back
      const progressLines: TariffLine[] = progress.lines;
      const progressMap = new Map(progressLines.map((l) => [l.full_code, l]));
      for (let i = 0; i <= idx; i++) {
        const saved = progressMap.get(lines[i].full_code);
        if (saved) {
          lines[i] = saved;
        }
      }
      startIndex = idx + 1;
      console.log(`Resuming from index ${startIndex} (after ${lastCode})`);
    }
  }

  const total = lines.length;
  let successCount = 0;
  let errorCount = 0;

  for (let i = startIndex; i < total; i++) {
    const line = lines[i];

    try {
      await scrapeDetailPage(line);
      successCount++;
    } catch (err: any) {
      console.warn(`  Warning: failed for ${line.full_code}: ${err.message}`);
      errorCount++;
    }

    // Progress logging
    if ((i + 1) % 50 === 0 || i === total - 1) {
      const pct = (((i + 1) / total) * 100).toFixed(1);
      console.log(`  ${i + 1}/${total} (${pct}%) — success: ${successCount}, errors: ${errorCount}`);
    }

    // Save progress periodically
    if ((i + 1) % SAVE_INTERVAL === 0 || i === total - 1) {
      fs.writeFileSync(
        PROGRESS_FILE,
        JSON.stringify({ last_code: line.full_code, last_index: i, lines }, null, 2)
      );
    }

    if (i < total - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Save enriched data back to tariff_lines.json (merge into full array if section-filtered)
  if (targetSection) {
    const enrichedMap = new Map(lines.map((l) => [l.full_code, l]));
    for (let i = 0; i < allLines.length; i++) {
      const enriched = enrichedMap.get(allLines[i].full_code);
      if (enriched) allLines[i] = enriched;
    }
    fs.writeFileSync(sourceFile, JSON.stringify(allLines, null, 2));
  } else {
    fs.writeFileSync(sourceFile, JSON.stringify(lines, null, 2));
  }
  console.log(`\n=== Done! ===`);
  console.log(`Updated ${successCount} codes in tariff_lines.json`);
  console.log(`Errors: ${errorCount}`);

  // Clean up progress file
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
