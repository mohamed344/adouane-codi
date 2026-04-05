/**
 * Repair script: re-scrape tax advantages for codes that have empty tax_advantages
 * Also fixes DD/TVA for Section 21 special codes if available on the source.
 */

import axios from "axios";
import * as cheerio from "cheerio";
import * as https from "https";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BASE_URL = "https://www.douane.gov.dz/spip.php";
const agent = new https.Agent({ rejectUnauthorized: false });
const DELAY_MS = 400;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function cleanText(text: string): string {
  return text.replace(/\?/g, "'").replace(/\s+/g, " ").trim();
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

interface TaxAdvantage {
  taxe: string;
  taux: number;
  document: string;
}

async function scrapeTaxData(code: {
  full_code: string;
  section_code: string;
  chapitre_code: string;
}) {
  // Derive range_code (first 4 digits) and position_code (first 6 digits)
  const rangeCode = code.full_code.slice(0, 4);
  const positionCode = code.full_code.slice(0, 6);

  const url =
    `${BASE_URL}?page=sous_position` +
    `&section=${code.section_code}` +
    `&chapitre=${code.chapitre_code}` +
    `&range=${rangeCode}` +
    `&position=${positionCode}` +
    `&sous_position=${code.full_code}`;

  const $ = await fetchPage(url);
  const tables = $("table");

  // Parse DD/TVA from first table
  let dd: number | null = null;
  let tva: number | null = null;

  tables
    .first()
    .find("tbody tr")
    .each((_, el) => {
      const tds = $(el).find("td");
      const taxe = $(tds[0]).text().trim().toUpperCase();
      const taux = parseFloat($(tds[1]).text().trim());
      if (taxe === "D.D") dd = isNaN(taux) ? null : taux;
      if (taxe === "T.V.A") tva = isNaN(taux) ? null : taux;
    });

  // Parse tax advantages from second table
  const taxAdvantages: TaxAdvantage[] = [];
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
            taxAdvantages.push({ taxe, taux, document });
          }
        }
      });
  }

  return { dd, tva, taxAdvantages };
}

async function main() {
  console.log("=== Repair Missing Tax Data ===\n");

  // Fetch all codes with missing tax_advantages or missing DD/TVA
  const { data: codes, error } = await supabase
    .from("tariff_codes")
    .select("full_code, section_code, chapitre_code, dd, tva")
    .or(
      "tax_advantages.is.null,tax_advantages.eq.[],dd.is.null,tva.is.null"
    );

  if (error) {
    console.error("Failed to fetch codes:", error);
    return;
  }

  console.log(`Found ${codes.length} codes to repair.\n`);

  let fixed = 0;
  let noData = 0;
  let errors = 0;

  for (const code of codes) {
    try {
      await sleep(DELAY_MS);
      const result = await scrapeTaxData(code);

      const update: Record<string, unknown> = {};

      // Update tax_advantages if we found any
      if (result.taxAdvantages.length > 0) {
        update.tax_advantages = result.taxAdvantages;
      }

      // Update DD/TVA if they were null and we found values
      if (code.dd === null && result.dd !== null) {
        update.dd = result.dd;
      }
      if (code.tva === null && result.tva !== null) {
        update.tva = result.tva;
      }

      if (Object.keys(update).length > 0) {
        const { error: updateError } = await supabase
          .from("tariff_codes")
          .update(update)
          .eq("full_code", code.full_code);

        if (updateError) {
          console.error(`  ERROR updating ${code.full_code}:`, updateError.message);
          errors++;
        } else {
          const parts = [];
          if (update.tax_advantages) parts.push(`${(update.tax_advantages as TaxAdvantage[]).length} tax advantages`);
          if (update.dd !== undefined) parts.push(`DD=${update.dd}`);
          if (update.tva !== undefined) parts.push(`TVA=${update.tva}`);
          console.log(`  FIXED ${code.full_code}: ${parts.join(", ")}`);
          fixed++;
        }
      } else {
        console.log(`  SKIP  ${code.full_code}: no data on source`);
        noData++;
      }
    } catch (err: any) {
      console.error(`  ERROR ${code.full_code}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Fixed: ${fixed}`);
  console.log(`No data on source: ${noData}`);
  console.log(`Errors: ${errors}`);
}

main();
