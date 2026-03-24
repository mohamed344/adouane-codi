/**
 * Generate search keywords with synonym groups from tariff data.
 *
 * Usage:
 *   npx tsx scripts/generate-keywords.ts
 *
 * This script:
 * 1. Fetches all tariff descriptions from Supabase
 * 2. Extracts meaningful French words
 * 3. Maps them to EN/AR using the translation dictionary
 * 4. Adds curated synonym groups for common trade terms
 * 5. Upserts into search_keywords with synonym_group
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── Translation dictionary (subset from tariff-translations.ts) ───
// We inline a focused version here for keyword extraction
const frToEnAr: Record<string, { en: string; ar: string }> = {
  // Animals
  animaux: { en: "animals", ar: "حيوانات" },
  chevaux: { en: "horses", ar: "خيول" },
  bovins: { en: "cattle", ar: "أبقار" },
  ovins: { en: "sheep", ar: "أغنام" },
  caprins: { en: "goats", ar: "ماعز" },
  volailles: { en: "poultry", ar: "دواجن" },
  poissons: { en: "fish", ar: "أسماك" },
  viande: { en: "meat", ar: "لحم" },
  viandes: { en: "meats", ar: "لحوم" },
  lait: { en: "milk", ar: "حليب" },
  beurre: { en: "butter", ar: "زبدة" },
  fromage: { en: "cheese", ar: "جبن" },
  oeufs: { en: "eggs", ar: "بيض" },
  miel: { en: "honey", ar: "عسل" },
  sucre: { en: "sugar", ar: "سكر" },
  sel: { en: "salt", ar: "ملح" },
  // Vegetables & Fruits
  legumes: { en: "vegetables", ar: "خضروات" },
  tomates: { en: "tomatoes", ar: "طماطم" },
  pommes: { en: "apples", ar: "تفاح" },
  oranges: { en: "oranges", ar: "برتقال" },
  bananes: { en: "bananas", ar: "موز" },
  dattes: { en: "dates", ar: "تمور" },
  raisins: { en: "grapes", ar: "عنب" },
  olives: { en: "olives", ar: "زيتون" },
  cereales: { en: "cereals", ar: "حبوب" },
  riz: { en: "rice", ar: "أرز" },
  ble: { en: "wheat", ar: "قمح" },
  orge: { en: "barley", ar: "شعير" },
  mais: { en: "corn", ar: "ذرة" },
  cafe: { en: "coffee", ar: "قهوة" },
  the: { en: "tea", ar: "شاي" },
  tabac: { en: "tobacco", ar: "تبغ" },
  huile: { en: "oil", ar: "زيت" },
  huiles: { en: "oils", ar: "زيوت" },
  farine: { en: "flour", ar: "دقيق" },
  pate: { en: "pasta", ar: "معكرونة" },
  pates: { en: "pasta", ar: "معكرونة" },
  chocolat: { en: "chocolate", ar: "شوكولاتة" },
  biscuits: { en: "biscuits", ar: "بسكويت" },
  confiture: { en: "jam", ar: "مربى" },
  jus: { en: "juice", ar: "عصير" },
  eau: { en: "water", ar: "ماء" },
  boissons: { en: "beverages", ar: "مشروبات" },
  biere: { en: "beer", ar: "بيرة" },
  vin: { en: "wine", ar: "نبيذ" },
  vins: { en: "wines", ar: "نبيذ" },
  alcool: { en: "alcohol", ar: "كحول" },
  vinaigre: { en: "vinegar", ar: "خل" },
  epices: { en: "spices", ar: "توابل" },
  poivre: { en: "pepper", ar: "فلفل" },
  // Chemicals & Pharmaceuticals
  medicaments: { en: "medicines", ar: "أدوية" },
  medicament: { en: "medicine", ar: "دواء" },
  pharmaceutiques: { en: "pharmaceutical", ar: "أدوية" },
  chimiques: { en: "chemical", ar: "كيميائية" },
  engrais: { en: "fertilizers", ar: "أسمدة" },
  insecticides: { en: "insecticides", ar: "مبيدات حشرية" },
  savon: { en: "soap", ar: "صابون" },
  savons: { en: "soaps", ar: "صابون" },
  parfums: { en: "perfumes", ar: "عطور" },
  cosmetiques: { en: "cosmetics", ar: "مستحضرات تجميل" },
  peintures: { en: "paints", ar: "دهانات" },
  plastiques: { en: "plastics", ar: "بلاستيك" },
  caoutchouc: { en: "rubber", ar: "مطاط" },
  // Textiles
  coton: { en: "cotton", ar: "قطن" },
  laine: { en: "wool", ar: "صوف" },
  soie: { en: "silk", ar: "حرير" },
  fibres: { en: "fibers", ar: "ألياف" },
  tissus: { en: "fabrics", ar: "أقمشة" },
  tissu: { en: "fabric", ar: "قماش" },
  vetements: { en: "clothing", ar: "ملابس" },
  chaussures: { en: "shoes", ar: "أحذية" },
  cuir: { en: "leather", ar: "جلد" },
  // Metals & Minerals
  fer: { en: "iron", ar: "حديد" },
  acier: { en: "steel", ar: "فولاذ" },
  aluminium: { en: "aluminum", ar: "ألمنيوم" },
  cuivre: { en: "copper", ar: "نحاس" },
  zinc: { en: "zinc", ar: "زنك" },
  plomb: { en: "lead", ar: "رصاص" },
  or: { en: "gold", ar: "ذهب" },
  argent: { en: "silver", ar: "فضة" },
  ciment: { en: "cement", ar: "إسمنت" },
  verre: { en: "glass", ar: "زجاج" },
  ceramique: { en: "ceramic", ar: "سيراميك" },
  bois: { en: "wood", ar: "خشب" },
  papier: { en: "paper", ar: "ورق" },
  carton: { en: "cardboard", ar: "كرتون" },
  pierre: { en: "stone", ar: "حجر" },
  marbre: { en: "marble", ar: "رخام" },
  sable: { en: "sand", ar: "رمل" },
  charbon: { en: "coal", ar: "فحم" },
  petrole: { en: "petroleum", ar: "بترول" },
  gaz: { en: "gas", ar: "غاز" },
  // Machinery & Electronics
  machines: { en: "machines", ar: "آلات" },
  moteurs: { en: "engines", ar: "محركات" },
  moteur: { en: "engine", ar: "محرك" },
  pompes: { en: "pumps", ar: "مضخات" },
  turbines: { en: "turbines", ar: "توربينات" },
  ordinateurs: { en: "computers", ar: "حواسيب" },
  ordinateur: { en: "computer", ar: "حاسوب" },
  telephones: { en: "phones", ar: "هواتف" },
  telephone: { en: "phone", ar: "هاتف" },
  television: { en: "television", ar: "تلفزيون" },
  cameras: { en: "cameras", ar: "كاميرات" },
  cables: { en: "cables", ar: "كابلات" },
  fils: { en: "wires", ar: "أسلاك" },
  piles: { en: "batteries", ar: "بطاريات" },
  lampes: { en: "lamps", ar: "مصابيح" },
  transformateurs: { en: "transformers", ar: "محولات" },
  // Vehicles
  voitures: { en: "cars", ar: "سيارات" },
  voiture: { en: "car", ar: "سيارة" },
  vehicules: { en: "vehicles", ar: "مركبات" },
  vehicule: { en: "vehicle", ar: "مركبة" },
  automobiles: { en: "automobiles", ar: "سيارات" },
  automobile: { en: "automobile", ar: "سيارة" },
  camions: { en: "trucks", ar: "شاحنات" },
  camion: { en: "truck", ar: "شاحنة" },
  autobus: { en: "buses", ar: "حافلات" },
  tracteurs: { en: "tractors", ar: "جرارات" },
  tracteur: { en: "tractor", ar: "جرار" },
  motocycles: { en: "motorcycles", ar: "دراجات نارية" },
  bicyclettes: { en: "bicycles", ar: "دراجات" },
  remorques: { en: "trailers", ar: "مقطورات" },
  navires: { en: "ships", ar: "سفن" },
  bateaux: { en: "boats", ar: "قوارب" },
  avions: { en: "aircraft", ar: "طائرات" },
  pneumatiques: { en: "tires", ar: "إطارات" },
  pneus: { en: "tires", ar: "إطارات" },
  // Furniture & Household
  meubles: { en: "furniture", ar: "أثاث" },
  matelas: { en: "mattresses", ar: "مراتب" },
  jouets: { en: "toys", ar: "ألعاب" },
  montres: { en: "watches", ar: "ساعات" },
  bijoux: { en: "jewelry", ar: "مجوهرات" },
  // Construction
  tuyaux: { en: "pipes", ar: "أنابيب" },
  tubes: { en: "tubes", ar: "أنابيب" },
  robinets: { en: "taps", ar: "صنابير" },
  serrures: { en: "locks", ar: "أقفال" },
  vis: { en: "screws", ar: "براغي" },
  clous: { en: "nails", ar: "مسامير" },
  // Agriculture
  semences: { en: "seeds", ar: "بذور" },
  plantes: { en: "plants", ar: "نباتات" },
  fleurs: { en: "flowers", ar: "أزهار" },
  arbres: { en: "trees", ar: "أشجار" },
  fruits: { en: "fruits", ar: "فواكه" },
  noix: { en: "nuts", ar: "مكسرات" },
  // Misc
  armes: { en: "weapons", ar: "أسلحة" },
  munitions: { en: "ammunition", ar: "ذخيرة" },
  instruments: { en: "instruments", ar: "أدوات" },
  appareils: { en: "apparatus", ar: "أجهزة" },
  accessoires: { en: "accessories", ar: "إكسسوارات" },
  pieces: { en: "parts", ar: "قطع غيار" },
  parties: { en: "parts", ar: "أجزاء" },
};

// ─── Synonym groups: multiple terms that refer to the same concept ───
// Each group maps a group_id → array of {fr, en, ar} entries
const synonymGroups: Record<string, Array<{ fr: string; en: string; ar: string }>> = {
  vehicle: [
    { fr: "voiture", en: "car", ar: "سيارة" },
    { fr: "voitures", en: "cars", ar: "سيارات" },
    { fr: "automobile", en: "automobile", ar: "سيارة" },
    { fr: "automobiles", en: "automobiles", ar: "سيارات" },
    { fr: "vehicule", en: "vehicle", ar: "مركبة" },
    { fr: "vehicules", en: "vehicles", ar: "مركبات" },
    { fr: "auto", en: "auto", ar: "سيارة" },
  ],
  truck: [
    { fr: "camion", en: "truck", ar: "شاحنة" },
    { fr: "camions", en: "trucks", ar: "شاحنات" },
    { fr: "poids lourd", en: "heavy vehicle", ar: "مركبة ثقيلة" },
  ],
  phone: [
    { fr: "telephone", en: "phone", ar: "هاتف" },
    { fr: "telephones", en: "phones", ar: "هواتف" },
    { fr: "portable", en: "mobile", ar: "محمول" },
    { fr: "mobile", en: "mobile", ar: "محمول" },
    { fr: "cellulaire", en: "cellular", ar: "خلوي" },
    { fr: "smartphone", en: "smartphone", ar: "هاتف ذكي" },
  ],
  computer: [
    { fr: "ordinateur", en: "computer", ar: "حاسوب" },
    { fr: "ordinateurs", en: "computers", ar: "حواسيب" },
    { fr: "informatique", en: "computing", ar: "حوسبة" },
    { fr: "machines automatiques de traitement", en: "computers", ar: "حواسيب" },
    { fr: "laptop", en: "laptop", ar: "حاسوب محمول" },
  ],
  wheat: [
    { fr: "ble", en: "wheat", ar: "قمح" },
    { fr: "froment", en: "wheat", ar: "قمح" },
    { fr: "bles", en: "wheat", ar: "قمح" },
  ],
  sugar_group: [
    { fr: "sucre", en: "sugar", ar: "سكر" },
    { fr: "sucres", en: "sugars", ar: "سكريات" },
    { fr: "sucreries", en: "confectionery", ar: "حلويات" },
  ],
  medicine: [
    { fr: "medicament", en: "medicine", ar: "دواء" },
    { fr: "medicaments", en: "medicines", ar: "أدوية" },
    { fr: "pharmaceutique", en: "pharmaceutical", ar: "صيدلاني" },
    { fr: "pharmaceutiques", en: "pharmaceutical", ar: "أدوية" },
    { fr: "remede", en: "remedy", ar: "علاج" },
  ],
  iron_steel: [
    { fr: "fer", en: "iron", ar: "حديد" },
    { fr: "acier", en: "steel", ar: "فولاذ" },
    { fr: "fonte", en: "cast iron", ar: "حديد صب" },
    { fr: "siderurgie", en: "iron and steel", ar: "حديد وصلب" },
  ],
  cement_group: [
    { fr: "ciment", en: "cement", ar: "إسمنت" },
    { fr: "ciments", en: "cements", ar: "إسمنت" },
    { fr: "beton", en: "concrete", ar: "خرسانة" },
  ],
  fabric: [
    { fr: "tissu", en: "fabric", ar: "قماش" },
    { fr: "tissus", en: "fabrics", ar: "أقمشة" },
    { fr: "textile", en: "textile", ar: "نسيج" },
    { fr: "textiles", en: "textiles", ar: "منسوجات" },
    { fr: "etoffe", en: "cloth", ar: "قماش" },
  ],
  clothing: [
    { fr: "vetements", en: "clothing", ar: "ملابس" },
    { fr: "vetement", en: "garment", ar: "ملبس" },
    { fr: "habillement", en: "apparel", ar: "ألبسة" },
    { fr: "habits", en: "clothes", ar: "ملابس" },
    { fr: "confection", en: "ready-made", ar: "ألبسة جاهزة" },
  ],
  milk: [
    { fr: "lait", en: "milk", ar: "حليب" },
    { fr: "laits", en: "milks", ar: "ألبان" },
    { fr: "laitier", en: "dairy", ar: "ألبان" },
    { fr: "laitiere", en: "dairy", ar: "ألبان" },
    { fr: "lactose", en: "lactose", ar: "لاكتوز" },
  ],
  oil: [
    { fr: "huile", en: "oil", ar: "زيت" },
    { fr: "huiles", en: "oils", ar: "زيوت" },
    { fr: "oleagineux", en: "oilseeds", ar: "بذور زيتية" },
  ],
  rice_group: [
    { fr: "riz", en: "rice", ar: "أرز" },
  ],
  coffee_group: [
    { fr: "cafe", en: "coffee", ar: "قهوة" },
    { fr: "cafes", en: "coffees", ar: "قهوة" },
  ],
  tea_group: [
    { fr: "the", en: "tea", ar: "شاي" },
    { fr: "thes", en: "teas", ar: "شاي" },
  ],
  shoes: [
    { fr: "chaussures", en: "shoes", ar: "أحذية" },
    { fr: "chaussure", en: "shoe", ar: "حذاء" },
    { fr: "bottes", en: "boots", ar: "أحذية طويلة" },
    { fr: "sandales", en: "sandals", ar: "صنادل" },
  ],
  furniture_group: [
    { fr: "meubles", en: "furniture", ar: "أثاث" },
    { fr: "meuble", en: "furniture", ar: "أثاث" },
    { fr: "mobilier", en: "furnishings", ar: "تأثيث" },
  ],
  wood_group: [
    { fr: "bois", en: "wood", ar: "خشب" },
    { fr: "boiserie", en: "woodwork", ar: "أعمال خشبية" },
    { fr: "sciage", en: "sawn wood", ar: "خشب منشور" },
  ],
  paper_group: [
    { fr: "papier", en: "paper", ar: "ورق" },
    { fr: "papiers", en: "papers", ar: "أوراق" },
    { fr: "carton", en: "cardboard", ar: "كرتون" },
  ],
  glass_group: [
    { fr: "verre", en: "glass", ar: "زجاج" },
    { fr: "verres", en: "glasses", ar: "زجاج" },
    { fr: "verrerie", en: "glassware", ar: "أواني زجاجية" },
  ],
  petroleum: [
    { fr: "petrole", en: "petroleum", ar: "بترول" },
    { fr: "essence", en: "gasoline", ar: "بنزين" },
    { fr: "gasoil", en: "diesel", ar: "ديزل" },
    { fr: "diesel", en: "diesel", ar: "ديزل" },
    { fr: "carburant", en: "fuel", ar: "وقود" },
    { fr: "carburants", en: "fuels", ar: "وقود" },
    { fr: "hydrocarbures", en: "hydrocarbons", ar: "هيدروكربونات" },
  ],
  plastic_group: [
    { fr: "plastique", en: "plastic", ar: "بلاستيك" },
    { fr: "plastiques", en: "plastics", ar: "بلاستيك" },
    { fr: "polymere", en: "polymer", ar: "بوليمر" },
    { fr: "polymeres", en: "polymers", ar: "بوليمرات" },
  ],
  rubber_group: [
    { fr: "caoutchouc", en: "rubber", ar: "مطاط" },
    { fr: "pneumatique", en: "tire", ar: "إطار" },
    { fr: "pneumatiques", en: "tires", ar: "إطارات" },
    { fr: "pneu", en: "tire", ar: "إطار" },
    { fr: "pneus", en: "tires", ar: "إطارات" },
  ],
  engine: [
    { fr: "moteur", en: "engine", ar: "محرك" },
    { fr: "moteurs", en: "engines", ar: "محركات" },
  ],
  tractor_group: [
    { fr: "tracteur", en: "tractor", ar: "جرار" },
    { fr: "tracteurs", en: "tractors", ar: "جرارات" },
  ],
  ship: [
    { fr: "navire", en: "ship", ar: "سفينة" },
    { fr: "navires", en: "ships", ar: "سفن" },
    { fr: "bateau", en: "boat", ar: "قارب" },
    { fr: "bateaux", en: "boats", ar: "قوارب" },
  ],
  aircraft_group: [
    { fr: "avion", en: "aircraft", ar: "طائرة" },
    { fr: "avions", en: "aircraft", ar: "طائرات" },
    { fr: "aeronef", en: "aircraft", ar: "طائرة" },
  ],
  copper_group: [
    { fr: "cuivre", en: "copper", ar: "نحاس" },
  ],
  aluminum_group: [
    { fr: "aluminium", en: "aluminum", ar: "ألمنيوم" },
  ],
  gold_group: [
    { fr: "or", en: "gold", ar: "ذهب" },
    { fr: "bijoux", en: "jewelry", ar: "مجوهرات" },
    { fr: "bijouterie", en: "jewelry", ar: "مجوهرات" },
  ],
  soap_group: [
    { fr: "savon", en: "soap", ar: "صابون" },
    { fr: "savons", en: "soaps", ar: "صابون" },
    { fr: "detergent", en: "detergent", ar: "منظف" },
    { fr: "detergents", en: "detergents", ar: "منظفات" },
  ],
  cosmetics_group: [
    { fr: "cosmetiques", en: "cosmetics", ar: "مستحضرات تجميل" },
    { fr: "parfums", en: "perfumes", ar: "عطور" },
    { fr: "parfum", en: "perfume", ar: "عطر" },
    { fr: "maquillage", en: "makeup", ar: "مكياج" },
  ],
  fertilizer: [
    { fr: "engrais", en: "fertilizer", ar: "سمد" },
    { fr: "engrais", en: "fertilizers", ar: "أسمدة" },
  ],
  fruit_group: [
    { fr: "fruits", en: "fruits", ar: "فواكه" },
    { fr: "fruit", en: "fruit", ar: "فاكهة" },
  ],
  vegetable_group: [
    { fr: "legumes", en: "vegetables", ar: "خضروات" },
    { fr: "legume", en: "vegetable", ar: "خضار" },
  ],
  fish_group: [
    { fr: "poisson", en: "fish", ar: "سمك" },
    { fr: "poissons", en: "fish", ar: "أسماك" },
    { fr: "sardines", en: "sardines", ar: "سردين" },
    { fr: "thon", en: "tuna", ar: "تونة" },
    { fr: "thons", en: "tuna", ar: "تونة" },
    { fr: "saumon", en: "salmon", ar: "سلمون" },
    { fr: "saumons", en: "salmon", ar: "سلمون" },
  ],
  meat_group: [
    { fr: "viande", en: "meat", ar: "لحم" },
    { fr: "viandes", en: "meats", ar: "لحوم" },
    { fr: "boeuf", en: "beef", ar: "لحم بقري" },
    { fr: "poulet", en: "chicken", ar: "دجاج" },
    { fr: "agneau", en: "lamb", ar: "لحم غنم" },
  ],
  chicken: [
    { fr: "poulet", en: "chicken", ar: "دجاج" },
    { fr: "poulets", en: "chickens", ar: "دجاج" },
    { fr: "volaille", en: "poultry", ar: "دواجن" },
    { fr: "volailles", en: "poultry", ar: "دواجن" },
  ],
  tobacco_group: [
    { fr: "tabac", en: "tobacco", ar: "تبغ" },
    { fr: "tabacs", en: "tobacco", ar: "تبغ" },
    { fr: "cigarettes", en: "cigarettes", ar: "سجائر" },
    { fr: "cigares", en: "cigars", ar: "سيجار" },
  ],
};

// ─── Stop words to skip when extracting from descriptions ───
const stopWords = new Set([
  "de", "des", "du", "la", "le", "les", "un", "une", "et", "ou", "en", "au", "aux",
  "que", "qui", "ne", "ni", "se", "ce", "ces", "par", "sur", "sous", "dans", "pour",
  "avec", "sans", "non", "pas", "est", "sont", "ont", "ete", "leurs", "leur",
  "autres", "autre", "meme", "dont", "soit", "tout", "tous", "toute", "toutes",
  "plus", "mais", "comme", "aussi", "bien", "ici", "entre", "apres", "avant",
  "cette", "ainsi", "dits", "dit", "compris", "denommes",
]);

interface KeywordRow {
  term_fr: string;
  term_en: string;
  term_ar: string;
  synonym_group: string | null;
}

async function main() {
  console.log("=== Generating Search Keywords ===\n");

  const allKeywords: Map<string, KeywordRow> = new Map();

  // Step 1: Add all synonym group entries
  console.log("Adding synonym groups...");
  for (const [groupId, entries] of Object.entries(synonymGroups)) {
    for (const entry of entries) {
      const key = entry.fr.toLowerCase();
      allKeywords.set(key, {
        term_fr: entry.fr,
        term_en: entry.en,
        term_ar: entry.ar,
        synonym_group: groupId,
      });
    }
  }
  console.log(`  ${allKeywords.size} keywords from synonym groups`);

  // Step 2: Add dictionary entries (without overwriting synonym group entries)
  console.log("Adding dictionary entries...");
  let dictCount = 0;
  for (const [fr, trans] of Object.entries(frToEnAr)) {
    const key = fr.toLowerCase();
    if (!allKeywords.has(key)) {
      allKeywords.set(key, {
        term_fr: fr,
        term_en: trans.en,
        term_ar: trans.ar,
        synonym_group: null,
      });
      dictCount++;
    }
  }
  console.log(`  ${dictCount} keywords from dictionary`);

  // Step 3: Extract words from tariff descriptions
  console.log("Fetching tariff descriptions...");
  // Fetch all descriptions (paginated to avoid Supabase row limit)
  let allDescriptions: { description: string }[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data: batch, error: batchErr } = await supabase
      .from("tariff_codes")
      .select("description")
      .range(from, from + pageSize - 1);
    if (batchErr) {
      console.error("Error fetching tariff codes:", batchErr);
      process.exit(1);
    }
    if (!batch || batch.length === 0) break;
    allDescriptions.push(...batch);
    from += pageSize;
    if (batch.length < pageSize) break;
  }
  const tariffCodes = allDescriptions;
  const error = null;

  if (error) {
    console.error("Error fetching tariff codes:", error);
    process.exit(1);
  }

  console.log(`  Fetched ${tariffCodes.length} descriptions`);

  // Extract unique meaningful words
  const wordCounts: Map<string, number> = new Map();
  for (const tc of tariffCodes) {
    const desc = (tc.description || "").toLowerCase();
    // Split on non-letter characters (keeping accented chars)
    const words = desc.split(/[^a-zàâäéèêëïîôùûüÿçœæ]+/);
    for (const w of words) {
      if (w.length >= 3 && !stopWords.has(w) && !/^\d+$/.test(w)) {
        wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
      }
    }
  }

  // Add frequently occurring words that have translations
  let extractedCount = 0;
  for (const [word, count] of wordCounts.entries()) {
    if (count >= 2 && !allKeywords.has(word)) {
      // Check if we have a translation
      const trans = frToEnAr[word];
      if (trans) {
        allKeywords.set(word, {
          term_fr: word,
          term_en: trans.en,
          term_ar: trans.ar,
          synonym_group: null,
        });
        extractedCount++;
      }
    }
  }
  console.log(`  ${extractedCount} keywords extracted from descriptions`);

  // Step 4: Upsert into search_keywords
  console.log(`\nUpserting ${allKeywords.size} total keywords...`);

  // Clear existing keywords
  await supabase.from("search_keywords").delete().neq("id", 0);

  const rows = Array.from(allKeywords.values());
  // Batch insert in groups of 200
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const { error: insertError } = await supabase
      .from("search_keywords")
      .insert(batch);
    if (insertError) {
      console.error(`Error inserting batch at ${i}:`, insertError);
      // Try one by one for debugging
      for (const row of batch) {
        const { error: singleError } = await supabase
          .from("search_keywords")
          .insert(row);
        if (singleError) {
          console.error(`  Failed: ${row.term_fr} - ${singleError.message}`);
        }
      }
    }
    console.log(`  ${Math.min(i + 200, rows.length)}/${rows.length}`);
  }

  console.log("\n=== Done! Keywords generated and inserted. ===");
  console.log(`Total keywords: ${allKeywords.size}`);
  console.log(`Synonym groups: ${Object.keys(synonymGroups).length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
