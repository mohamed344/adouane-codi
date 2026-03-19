/**
 * Seed tariff data into Supabase from scraped JSON files.
 *
 * Usage:
 *   npx tsx scripts/seed-tariff-data.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const DATA_DIR = path.join(__dirname, "..", "data");

interface Section {
  code: string;
  description: string;
}

interface Chapitre {
  section_code: string;
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
  dd: number | null;
  prct: number | null;
  tcs: number | null;
  tva: number | null;
  dap: number | null;
  other_taxes: any[];
}

function loadJSON<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.error("Run the scraper first: npx tsx scripts/scrape-tarif-douanier.ts");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function seedSections(sections: Section[]) {
  console.log(`Seeding ${sections.length} sections...`);
  const { error } = await supabase
    .from("tariff_sections")
    .upsert(
      sections.map((s) => ({ code: s.code, description: s.description })),
      { onConflict: "code" }
    );
  if (error) throw error;
  console.log("  Sections done.");
}

async function seedChapitres(chapitres: Chapitre[]) {
  console.log(`Seeding ${chapitres.length} chapitres...`);
  // Batch in groups of 200
  for (let i = 0; i < chapitres.length; i += 200) {
    const batch = chapitres.slice(i, i + 200).map((c) => ({
      section_code: c.section_code,
      code: c.code,
      description: c.description,
    }));
    const { error } = await supabase
      .from("tariff_chapitres")
      .upsert(batch, { onConflict: "section_code,code" });
    if (error) throw error;
  }
  console.log("  Chapitres done.");
}

async function seedTariffCodes(lines: TariffLine[]) {
  console.log(`Seeding ${lines.length} tariff codes...`);
  // Batch in groups of 500
  for (let i = 0; i < lines.length; i += 500) {
    const batch = lines.slice(i, i + 500).map((l) => ({
      full_code: l.full_code,
      section_code: l.section_code,
      chapitre_code: l.chapitre_code,
      range_code: l.range_code,
      position_code: l.position_code,
      description: l.description,
      dd: l.dd,
      prct: l.prct,
      tcs: l.tcs,
      tva: l.tva,
      dap: l.dap,
      other_taxes: l.other_taxes || [],
    }));
    const { error } = await supabase
      .from("tariff_codes")
      .upsert(batch, { onConflict: "full_code" });
    if (error) throw error;
    console.log(`  ${Math.min(i + 500, lines.length)}/${lines.length}`);
  }
  console.log("  Tariff codes done.");
}

async function main() {
  console.log("=== Seeding Tariff Data into Supabase ===\n");

  const sections = loadJSON<Section[]>("sections.json");
  const chapitres = loadJSON<Chapitre[]>("chapitres.json");

  // Use final file if available, otherwise use progress file
  const tariffFile = fs.existsSync(path.join(DATA_DIR, "tariff_lines.json"))
    ? "tariff_lines.json"
    : "tariff_lines_progress.json";
  const tariffLines = loadJSON<TariffLine[]>(tariffFile);

  console.log(`Loaded: ${sections.length} sections, ${chapitres.length} chapitres, ${tariffLines.length} tariff codes\n`);

  await seedSections(sections);
  await seedChapitres(chapitres);
  await seedTariffCodes(tariffLines);

  console.log("\n=== Done! All tariff data seeded. ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
