/**
 * Repair script: fetches missing tax/detail data for tariff codes
 * that have NULL dd/tva values in the database.
 *
 * Scrapes the douane.gov.dz detail page for each code and updates
 * the database directly via Supabase.
 *
 * Features:
 *   - Adaptive delay: auto-tunes request rate based on server response
 *   - Resume-safe: re-queries NULL rows, so re-running picks up where it left off
 *   - Chapter-level progress logging
 *   - Syncs updated data back to tariff_lines.json
 *
 * Usage:
 *   npx tsx scripts/repair-missing-data.ts
 *   npx tsx scripts/repair-missing-data.ts --limit=100      # process only 100 codes
 *   npx tsx scripts/repair-missing-data.ts --section=16     # only section 16
 *   npx tsx scripts/repair-missing-data.ts --chapter=84     # only chapter 84
 *   npx tsx scripts/repair-missing-data.ts --dry-run        # don't update DB
 *   npx tsx scripts/repair-missing-data.ts --no-json-sync   # skip JSON sync
 */

import axios from "axios";
import * as cheerio from "cheerio";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as https from "https";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const BASE_URL = "https://www.douane.gov.dz/spip.php";
const agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });
const DATA_DIR = path.join(__dirname, "..", "data");

// Adaptive delay settings
const DELAY_BASE = 2000;
const DELAY_MIN = 1500;
const DELAY_MAX = 30000;

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  console.error("Set them in .env.local or pass them as environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ---------- Helpers ----------

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPage(url: string): Promise<cheerio.CheerioAPI> {
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data } = await axios.get(url, {
        httpsAgent: agent,
        timeout: 45000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        },
      });
      return cheerio.load(data);
    } catch (err: any) {
      if (attempt === maxRetries) throw err;
      const backoff = 5000 * attempt + Math.random() * 3000;
      console.warn(`  Retry ${attempt}/${maxRetries} for ${url.split('sous_position=')[1] || url} (waiting ${Math.round(backoff/1000)}s)`);
      await sleep(backoff);
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

// ---------- Scrape detail ----------

interface DetailData {
  dd: number | null;
  prct: number | null;
  tcs: number | null;
  tva: number | null;
  dap: number | null;
  usage_group: string | null;
  unit: string | null;
  cle: string | null;
  tax_advantages: { taxe: string; taux: number; document: string }[];
}

async function scrapeDetail(
  sectionCode: string,
  chapitreCode: string,
  rangeCode: string,
  positionCode: string,
  fullCode: string
): Promise<DetailData> {
  const url =
    `${BASE_URL}?page=sous_position` +
    `&section=${sectionCode}` +
    `&chapitre=${chapitreCode}` +
    `&range=${rangeCode}` +
    `&position=${positionCode}` +
    `&sous_position=${fullCode}`;

  const $ = await fetchPage(url);
  const result: DetailData = {
    dd: null,
    prct: null,
    tcs: null,
    tva: null,
    dap: null,
    usage_group: null,
    unit: null,
    cle: null,
    tax_advantages: [],
  };

  const bodyText = $("body").text();

  // Extract Cle
  const cleMatch = bodyText.match(/Cl[ée]\s+(\w)/i);
  if (cleMatch) result.cle = cleMatch[1];

  // Extract Groupe d'utilisation
  const groupeMatch = bodyText.match(/Groupe d'utilisation\s*:\s*([^\n]+)/i);
  if (groupeMatch) result.usage_group = cleanText(groupeMatch[1]);

  // Extract Unite
  const uniteMatch = bodyText.match(/Unit[ée]\s*:\s*([^\n]+)/i);
  if (uniteMatch) result.unit = cleanText(uniteMatch[1]);

  const tables = $("table");

  // First table: Taxes Ad-Valorem
  tables
    .first()
    .find("tbody tr")
    .each((_, el) => {
      const tds = $(el).find("td");
      const taxe = $(tds[0]).text().trim().toUpperCase();
      const taux = parseFloat($(tds[1]).text().trim()) || 0;

      switch (taxe) {
        case "D.D":
          result.dd = taux;
          break;
        case "PRCT":
          result.prct = taux;
          break;
        case "T.C.S":
          result.tcs = taux;
          break;
        case "T.V.A":
          result.tva = taux;
          break;
        case "D.A.P":
          result.dap = taux;
          break;
      }
    });

  // Second table: Avantages fiscaux
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
            result.tax_advantages.push({ taxe, taux, document });
          }
        }
      });
  }

  return result;
}

// ---------- Main ----------

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const noJsonSync = process.argv.includes("--no-json-sync");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const maxLimit = limitArg ? parseInt(limitArg.split("=")[1]) : undefined;
  const sectionArg = process.argv.find((a) => a.startsWith("--section="));
  const targetSection = sectionArg?.split("=")[1];
  const chapterArg = process.argv.find((a) => a.startsWith("--chapter="));
  const targetChapter = chapterArg?.split("=")[1];

  console.log("=== Repair Missing Tariff Data ===\n");
  if (dryRun) console.log("DRY RUN — no DB updates will be made\n");
  if (targetSection) console.log(`Target section: ${targetSection}`);
  if (targetChapter) console.log(`Target chapter: ${targetChapter}`);

  // Fetch ALL codes with missing data (paginate past Supabase 1000-row limit)
  let allMissing: { full_code: string; section_code: string; chapitre_code: string; range_code: string; position_code: string }[] = [];
  const PAGE_SIZE = 1000;
  let offset = 0;

  while (true) {
    let query = supabase
      .from("tariff_codes")
      .select("full_code, section_code, chapitre_code, range_code, position_code")
      .is("dd", null)
      .order("full_code")
      .range(offset, offset + PAGE_SIZE - 1);

    if (targetSection) {
      query = query.eq("section_code", targetSection);
    }
    if (targetChapter) {
      query = query.eq("chapitre_code", targetChapter);
    }

    const { data, error: fetchError } = await query;
    if (fetchError) {
      console.error("Failed to fetch missing codes:", fetchError);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    allMissing.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  // Apply limit if specified
  const missingCodes = maxLimit ? allMissing.slice(0, maxLimit) : allMissing;

  console.log(`Found ${allMissing.length} codes with missing data`);
  if (maxLimit) console.log(`Limited to: ${maxLimit} (of ${allMissing.length})`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  const total = missingCodes.length;

  if (total === 0) {
    console.log("No missing codes found. Nothing to do!");
    return;
  }

  // Adaptive delay state
  let currentDelay = DELAY_BASE;
  let consecutiveSuccesses = 0;
  let consecutiveErrors = 0;
  let currentChapter = "";

  // Track updates for JSON sync
  const updatedCodes: Map<string, DetailData> = new Map();

  for (let i = 0; i < total; i++) {
    const code = missingCodes[i];

    // Chapter transition logging
    if (code.chapitre_code !== currentChapter) {
      currentChapter = code.chapitre_code;
      const chapterRemaining = missingCodes.filter(
        (c, idx) => idx >= i && c.chapitre_code === currentChapter
      ).length;
      console.log(`\n--- Chapter ${currentChapter} (${chapterRemaining} codes, delay: ${Math.round(currentDelay)}ms) ---`);
    }

    try {
      const detail = await scrapeDetail(
        code.section_code,
        code.chapitre_code,
        code.range_code,
        code.position_code,
        code.full_code
      );

      // Only update if we got actual data
      if (detail.dd === null && detail.tva === null && detail.usage_group === null) {
        skippedCount++;
        consecutiveSuccesses++;
        consecutiveErrors = 0;
      } else if (!dryRun) {
        const { error: updateError } = await supabase
          .from("tariff_codes")
          .update({
            dd: detail.dd,
            prct: detail.prct,
            tcs: detail.tcs,
            tva: detail.tva,
            dap: detail.dap,
            usage_group: detail.usage_group,
            unit: detail.unit,
            cle: detail.cle,
            tax_advantages: detail.tax_advantages,
          })
          .eq("full_code", code.full_code);

        if (updateError) {
          console.warn(`  DB update failed for ${code.full_code}: ${updateError.message}`);
          errorCount++;
          consecutiveErrors++;
          consecutiveSuccesses = 0;
        } else {
          successCount++;
          consecutiveSuccesses++;
          consecutiveErrors = 0;
          updatedCodes.set(code.full_code, detail);
        }
      } else {
        console.log(`  [DRY] ${code.full_code}: DD=${detail.dd}, TVA=${detail.tva}, unit=${detail.unit}, cle=${detail.cle}`);
        successCount++;
        consecutiveSuccesses++;
        consecutiveErrors = 0;
      }
    } catch (err: any) {
      console.warn(`  Failed to scrape ${code.full_code}: ${err.message}`);
      errorCount++;
      consecutiveErrors++;
      consecutiveSuccesses = 0;
    }

    // Adaptive delay adjustment
    if (consecutiveErrors >= 3) {
      console.warn(`  *** ${consecutiveErrors} consecutive errors — pausing 60s and doubling delay ***`);
      await sleep(60000);
      currentDelay = Math.min(currentDelay * 2, DELAY_MAX);
      consecutiveErrors = 0;
    } else if (consecutiveSuccesses >= 5) {
      currentDelay = Math.max(currentDelay - 500, DELAY_MIN);
      consecutiveSuccesses = 0;
    }

    // Progress
    if ((i + 1) % 50 === 0 || i === total - 1) {
      const pct = (((i + 1) / total) * 100).toFixed(1);
      const errRate = total > 0 ? ((errorCount / (i + 1)) * 100).toFixed(1) : "0";
      console.log(
        `  ${i + 1}/${total} (${pct}%) — updated: ${successCount}, errors: ${errorCount} (${errRate}%), skipped: ${skippedCount}, delay: ${Math.round(currentDelay)}ms`
      );
    }

    if (i < total - 1) {
      await sleep(currentDelay);
    }
  }

  console.log(`\n=== Done! ===`);
  console.log(`Updated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Skipped (no data on site): ${skippedCount}`);

  // Sync back to tariff_lines.json
  if (!dryRun && !noJsonSync && updatedCodes.size > 0) {
    const jsonFile = path.join(DATA_DIR, "tariff_lines.json");
    if (fs.existsSync(jsonFile)) {
      console.log(`\nSyncing ${updatedCodes.size} updates back to tariff_lines.json...`);
      try {
        const allLines = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
        let synced = 0;
        for (const line of allLines) {
          const detail = updatedCodes.get(line.full_code);
          if (detail) {
            line.dd = detail.dd;
            line.prct = detail.prct;
            line.tcs = detail.tcs;
            line.tva = detail.tva;
            line.dap = detail.dap;
            line.usage_group = detail.usage_group;
            line.unit = detail.unit;
            line.cle = detail.cle;
            line.tax_advantages = detail.tax_advantages;
            synced++;
          }
        }
        fs.writeFileSync(jsonFile, JSON.stringify(allLines, null, 2));
        console.log(`Synced ${synced} codes to tariff_lines.json`);
      } catch (err: any) {
        console.warn(`Failed to sync JSON: ${err.message}`);
      }
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
