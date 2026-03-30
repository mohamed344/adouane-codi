/**
 * Scrape position pages to capture heading rows and build full product designations.
 *
 * On douane.gov.dz, position pages contain intermediate heading rows
 * (e.g., "Pneumatiques rechapés :") that are NOT leaf tariff codes but provide
 * context for the "Désignation du Produit". This script:
 *   1. Loads rangees.json to know which position pages to fetch
 *   2. For each position page, captures ALL rows (headings + leaf codes)
 *   3. Builds the full designation by prepending parent headings
 *   4. Saves back to tariff_lines.json with a new `designation` field
 *
 * Usage:
 *   npx tsx scripts/scrape-designations.ts
 *   npx tsx scripts/scrape-designations.ts --resume
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
const PROGRESS_FILE = path.join(DATA_DIR, "designation_progress.json");

interface Rangee {
  section_code: string;
  chapitre_code: string;
  code: string;
  description: string;
}

interface TariffLine {
  full_code: string;
  section_code: string;
  chapitre_code: string;
  range_code: string;
  position_code: string;
  description: string;
  designation?: string;
  [key: string]: any;
}

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

/** Count the dash level: "- - - Foo" => 3, "Foo" => 0 */
function dashLevel(desc: string): number {
  const match = desc.match(/^(- )+/);
  if (!match) return 0;
  return match[0].split("- ").length - 1;
}

interface PositionRow {
  isHeading: boolean;
  code: string | null; // null for headings
  description: string;
  level: number;
}

/**
 * Scrape a position page and return ALL rows (headings + leaf codes).
 */
async function scrapePositionPage(
  sectionCode: string,
  chapitreCode: string,
  rangeCode: string
): Promise<PositionRow[]> {
  const url = `${BASE_URL}?page=position&section=${sectionCode}&chapitre=${chapitreCode}&range=${rangeCode}`;
  const $ = await fetchPage(url);
  const rows: PositionRow[] = [];

  // Get ALL table rows in the tariff table
  $("table tbody tr, table tr").each((_, el) => {
    const tds = $(el).find("td");
    if (tds.length < 2) return;

    const hasHref = !!$(el).attr("data-href");
    const codeText = $(tds.eq(0)).text().trim();
    const description = cleanText($(tds.eq(1)).text());

    if (!description) return;

    if (hasHref) {
      // Leaf code with data-href (clickable sous_position)
      const href = $(el).attr("data-href") || "";
      const spMatch = href.match(/sous_position=(\d+)/);
      const fullCode = spMatch ? spMatch[1] : codeText;
      rows.push({
        isHeading: false,
        code: fullCode,
        description,
        level: dashLevel(description),
      });
    } else if (description && !codeText.match(/^(Position|Code|N°)/i)) {
      // Heading row (no data-href) — intermediate category
      rows.push({
        isHeading: true,
        code: null,
        description,
        level: dashLevel(description),
      });
    }
  });

  return rows;
}

/**
 * Build full designation for each leaf code by collecting parent headings.
 */
function buildDesignations(rows: PositionRow[]): Map<string, string> {
  const designations = new Map<string, string>();

  // Stack of active headings at each dash level
  const headingStack: Map<number, string> = new Map();

  for (const row of rows) {
    if (row.isHeading) {
      // Clear any headings at same or deeper level
      const level = row.level;
      for (const [k] of headingStack) {
        if (k >= level) headingStack.delete(k);
      }
      headingStack.set(level, row.description);
    } else if (row.code) {
      // Leaf code: collect all parent headings with level < this row's level
      const parentHeadings: string[] = [];
      const sortedLevels = [...headingStack.keys()].sort((a, b) => a - b);
      for (const lvl of sortedLevels) {
        if (lvl < row.level) {
          parentHeadings.push(headingStack.get(lvl)!);
        }
      }

      if (parentHeadings.length > 0) {
        designations.set(
          row.code,
          parentHeadings.join("\n") + "\n" + row.description
        );
      } else {
        designations.set(row.code, row.description);
      }
    }
  }

  return designations;
}

async function main() {
  const resume = process.argv.includes("--resume");

  console.log("=== Designation Scraper ===\n");

  // Load rangees
  const rangees: Rangee[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "rangees.json"), "utf-8")
  );
  console.log(`Loaded ${rangees.length} rangées (position pages to scrape)`);

  // Load tariff lines
  const lines: TariffLine[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "tariff_lines.json"), "utf-8")
  );
  console.log(`Loaded ${lines.length} tariff lines`);

  // Build lookup map
  const lineMap = new Map<string, TariffLine>();
  for (const line of lines) {
    lineMap.set(line.full_code, line);
  }

  // Resume support
  let startIndex = 0;
  if (resume && fs.existsSync(PROGRESS_FILE)) {
    const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
    startIndex = progress.lastRangeeIndex + 1;
    // Merge saved designations
    if (progress.designations) {
      for (const [code, desig] of Object.entries(progress.designations)) {
        const line = lineMap.get(code);
        if (line) line.designation = desig as string;
      }
    }
    console.log(`Resuming from rangée index ${startIndex}`);
  }

  let updatedCount = 0;
  let errorCount = 0;
  const allDesignations: Record<string, string> = {};

  // Pre-fill with existing designations
  for (const line of lines) {
    if (line.designation) {
      allDesignations[line.full_code] = line.designation;
    }
  }

  for (let i = startIndex; i < rangees.length; i++) {
    const rangee = rangees[i];

    try {
      const rows = await scrapePositionPage(
        rangee.section_code,
        rangee.chapitre_code,
        rangee.code
      );
      const designations = buildDesignations(rows);

      for (const [code, designation] of designations) {
        const line = lineMap.get(code);
        if (line) {
          line.designation = designation;
          allDesignations[code] = designation;
          updatedCount++;
        }
      }
    } catch (err: any) {
      console.warn(
        `  Warning: failed for rangée ${rangee.section_code}/${rangee.chapitre_code}/${rangee.code}: ${err.message}`
      );
      errorCount++;
    }

    // Progress logging
    if ((i + 1) % 50 === 0 || i === rangees.length - 1) {
      const pct = (((i + 1) / rangees.length) * 100).toFixed(1);
      console.log(
        `  ${i + 1}/${rangees.length} (${pct}%) — updated: ${updatedCount}, errors: ${errorCount}`
      );
    }

    // Save progress every 100 rangées
    if ((i + 1) % 100 === 0) {
      fs.writeFileSync(
        PROGRESS_FILE,
        JSON.stringify({ lastRangeeIndex: i, designations: allDesignations })
      );
    }

    if (i < rangees.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Save final results
  fs.writeFileSync(
    path.join(DATA_DIR, "tariff_lines.json"),
    JSON.stringify(lines, null, 2)
  );
  console.log(`\nSaved tariff_lines.json with designations`);

  // Clean up progress file
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }

  console.log(`\n=== Done! ===`);
  console.log(`Updated ${updatedCount} codes with designations`);
  console.log(`Errors: ${errorCount}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
