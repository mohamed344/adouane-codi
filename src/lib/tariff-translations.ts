/**
 * Dictionary-based translation for French customs tariff descriptions
 * Maps common French customs terms to English and Arabic equivalents
 * Applied at the API layer since DB-level translation is not feasible
 */

const dictionary: Record<string, { en: string; ar: string }> = {
  // Animals
  "Animaux vivants": { en: "Live animals", ar: "حيوانات حية" },
  "reproducteurs de race pure": { en: "purebred breeding", ar: "تربية أصيلة" },
  "reproducteurs": { en: "breeding", ar: "تربية" },
  "De pur sang arabe": { en: "Arabian purebred", ar: "أصيل عربي" },
  "pur sang": { en: "purebred", ar: "أصيل" },
  "Etalons et hongres": { en: "Stallions and geldings", ar: "فحول وخصيان" },
  "Poulains et pouliches": { en: "Foals and fillies", ar: "مهر ومهرة" },
  "Poneys et ponettes": { en: "Ponies", ar: "بوني" },
  "De course": { en: "For racing", ar: "للسباق" },
  "Pour abattage": { en: "For slaughter", ar: "للذبح" },
  "Mulets et bardots": { en: "Mules and hinnies", ar: "بغال" },
  "Volailles vivantes": { en: "Live poultry", ar: "دواجن حية" },
  "Coqs et poules": { en: "Roosters and hens", ar: "ديوك ودجاج" },
  "coqs et poules": { en: "roosters and hens", ar: "ديوك ودجاج" },
  "Dindes et dindons": { en: "Turkeys", ar: "ديك رومي" },
  "Viandes et abats comestibles": { en: "Meat and edible offal", ar: "لحوم وأحشاء صالحة للأكل" },
  "abats comestibles": { en: "edible offal", ar: "أحشاء صالحة للأكل" },
  "demi-carcasses": { en: "half-carcasses", ar: "نصف ذبيحة" },
  "Laits speciaux": { en: "Special milks", ar: "ألبان خاصة" },
  "Lait en poudre": { en: "Milk powder", ar: "حليب مجفف" },
  "lait en poudre": { en: "milk powder", ar: "حليب مجفف" },
  "consommation humaine": { en: "human consumption", ar: "استهلاك بشري" },
  "alimentation animale": { en: "animal feed", ar: "تغذية حيوانية" },
  "industrie pharmaceutique": { en: "pharmaceutical industry", ar: "صناعة دوائية" },
  "vente au detail": { en: "retail sale", ar: "بيع بالتجزئة" },
  "matiere grasse": { en: "fat content", ar: "مادة دهنية" },
  "matieres grasses": { en: "fat content", ar: "مواد دهنية" },
  "contenu net": { en: "net content", ar: "محتوى صافي" },
  "hermetiquement fermes": { en: "hermetically sealed", ar: "محكمة الإغلاق" },
  "race pure": { en: "purebred", ar: "سلالة نقية" },
  "origine animale": { en: "animal origin", ar: "أصل حيواني" },
  "compris ailleurs": { en: "included elsewhere", ar: "مشمولة في مكان آخر" },
  "chair de poisson": { en: "fish flesh", ar: "لحم سمك" },
  "invertebres aquatiques": { en: "aquatic invertebrates", ar: "لافقاريات مائية" },
  "sous-produits": { en: "by-products", ar: "منتجات ثانوية" },
  "relevant de": { en: "falling within", ar: "تابعة لـ" },
  "sous forme de": { en: "in the form of", ar: "على شكل" },
  "en os": { en: "on the bone", ar: "بالعظم" },
};

// Single word translations (applied after multi-word phrases)
const words: Record<string, { en: string; ar: string }> = {
  // Animals
  "Autres": { en: "Others", ar: "أخرى" },
  "autres": { en: "others", ar: "أخرى" },
  "domestique": { en: "domestic", ar: "أليف" },
  "domestiques": { en: "domestic", ar: "أليفة" },
  "juments": { en: "mares", ar: "أفراس" },
  "Juments": { en: "Mares", ar: "أفراس" },
  "abattage": { en: "slaughter", ar: "ذبح" },
  "Anes": { en: "Donkeys", ar: "حمير" },
  "Bovins": { en: "Cattle", ar: "أبقار" },
  "bovins": { en: "cattle", ar: "أبقار" },
  "Vaches": { en: "Cows", ar: "بقر" },
  "vaches": { en: "cows", ar: "بقر" },
  "Taureaux": { en: "Bulls", ar: "ثيران" },
  "Buffles": { en: "Buffaloes", ar: "جاموس" },
  "buffles": { en: "buffaloes", ar: "جاموس" },
  "Porcins": { en: "Swine", ar: "خنازير" },
  "Ovins": { en: "Sheep", ar: "أغنام" },
  "ovins": { en: "sheep", ar: "أغنام" },
  "Caprins": { en: "Goats", ar: "ماعز" },
  "caprins": { en: "goats", ar: "ماعز" },
  "Agneaux": { en: "Lambs", ar: "حملان" },
  "agneaux": { en: "lambs", ar: "حملان" },
  "Canards": { en: "Ducks", ar: "بط" },
  "canards": { en: "ducks", ar: "بط" },
  "Oies": { en: "Geese", ar: "إوز" },
  "oies": { en: "geese", ar: "إوز" },
  "Pintades": { en: "Guinea fowl", ar: "دجاج غينيا" },
  "Poussins": { en: "Chicks", ar: "صيصان" },
  "poussins": { en: "chicks", ar: "صيصان" },
  "volailles": { en: "poultry", ar: "دواجن" },
  // Meat
  "Viande": { en: "Meat", ar: "لحم" },
  "viande": { en: "meat", ar: "لحم" },
  "viandes": { en: "meats", ar: "لحوم" },
  "abats": { en: "offal", ar: "أحشاء" },
  "carcasses": { en: "carcasses", ar: "ذبائح" },
  "morceaux": { en: "cuts", ar: "قطع" },
  "desossee": { en: "boneless", ar: "بدون عظم" },
  "desossees": { en: "boneless", ar: "بدون عظم" },
  "cuisses": { en: "thighs", ar: "أفخاذ" },
  "ailes": { en: "wings", ar: "أجنحة" },
  "poitrines": { en: "breasts", ar: "صدور" },
  "dos": { en: "backs", ar: "ظهور" },
  "cous": { en: "necks", ar: "رقاب" },
  "cou": { en: "neck", ar: "رقبة" },
  "pattes": { en: "feet", ar: "أرجل" },
  "plumes": { en: "feathers", ar: "ريش" },
  "foies": { en: "livers", ar: "أكباد" },
  "foie": { en: "liver", ar: "كبد" },
  "coeur": { en: "heart", ar: "قلب" },
  "gesier": { en: "gizzard", ar: "قانصة" },
  "langues": { en: "tongues", ar: "ألسنة" },
  "rognons": { en: "kidneys", ar: "كلى" },
  // State/condition
  "frais": { en: "fresh", ar: "طازج" },
  "refrigeres": { en: "chilled", ar: "مبرد" },
  "congeles": { en: "frozen", ar: "مجمد" },
  "congelee": { en: "frozen", ar: "مجمدة" },
  "congelees": { en: "frozen", ar: "مجمدة" },
  "fumes": { en: "smoked", ar: "مدخن" },
  "fumee": { en: "smoked", ar: "مدخن" },
  "fumage": { en: "smoking", ar: "تدخين" },
  "sales": { en: "salted", ar: "مملح" },
  "salee": { en: "salted", ar: "مملح" },
  "salees": { en: "salted", ar: "مملحة" },
  "saumure": { en: "brine", ar: "محلول ملحي" },
  "seches": { en: "dried", ar: "مجفف" },
  "sechees": { en: "dried", ar: "مجففة" },
  "seche": { en: "dried", ar: "مجفف" },
  "sechee": { en: "dried", ar: "مجففة" },
  "cuits": { en: "cooked", ar: "مطبوخ" },
  "cuites": { en: "cooked", ar: "مطبوخة" },
  "entieres": { en: "whole", ar: "كاملة" },
  "entier": { en: "whole", ar: "كامل" },
  "vides": { en: "empty", ar: "فارغة" },
  "vivants": { en: "live", ar: "حية" },
  "vivantes": { en: "live", ar: "حية" },
  // Fish
  "Poissons": { en: "Fish", ar: "أسماك" },
  "poissons": { en: "fish", ar: "أسماك" },
  "Truites": { en: "Trout", ar: "سلمون مرقط" },
  "truites": { en: "trout", ar: "سلمون مرقط" },
  "Saumons": { en: "Salmon", ar: "سلمون" },
  "saumons": { en: "salmon", ar: "سلمون" },
  "Thons": { en: "Tuna", ar: "تونة" },
  "thons": { en: "tuna", ar: "تونة" },
  "Sardines": { en: "Sardines", ar: "سردين" },
  "Morues": { en: "Cod", ar: "قد" },
  "morues": { en: "cod", ar: "قد" },
  "Harengs": { en: "Herrings", ar: "رنجة" },
  "harengs": { en: "herrings", ar: "رنجة" },
  "Carpes": { en: "Carp", ar: "شبوط" },
  "carpes": { en: "carp", ar: "شبوط" },
  "Tilapias": { en: "Tilapia", ar: "بلطي" },
  "tilapias": { en: "tilapia", ar: "بلطي" },
  "Anguilles": { en: "Eels", ar: "ثعابين البحر" },
  "Requins": { en: "Sharks", ar: "قروش" },
  "nageoires": { en: "fins", ar: "زعانف" },
  "filets": { en: "fillets", ar: "فيليه" },
  "Filets": { en: "Fillets", ar: "فيليه" },
  "crustaces": { en: "crustaceans", ar: "قشريات" },
  "Crustaces": { en: "Crustaceans", ar: "قشريات" },
  "crevettes": { en: "shrimp", ar: "جمبري" },
  "Crevettes": { en: "Shrimp", ar: "جمبري" },
  "homards": { en: "lobsters", ar: "كركند" },
  "crabes": { en: "crabs", ar: "سرطان البحر" },
  "mollusques": { en: "mollusks", ar: "رخويات" },
  // Dairy
  "Lait": { en: "Milk", ar: "حليب" },
  "lait": { en: "milk", ar: "حليب" },
  "Laits": { en: "Milks", ar: "ألبان" },
  "laiterie": { en: "dairy", ar: "ألبان" },
  "Creme": { en: "Cream", ar: "قشدة" },
  "creme": { en: "cream", ar: "قشدة" },
  "Beurre": { en: "Butter", ar: "زبدة" },
  "beurre": { en: "butter", ar: "زبدة" },
  "Fromage": { en: "Cheese", ar: "جبن" },
  "fromage": { en: "cheese", ar: "جبن" },
  "Fromages": { en: "Cheeses", ar: "أجبان" },
  "Oeufs": { en: "Eggs", ar: "بيض" },
  "oeufs": { en: "eggs", ar: "بيض" },
  "Miel": { en: "Honey", ar: "عسل" },
  "miel": { en: "honey", ar: "عسل" },
  "Yoghourt": { en: "Yogurt", ar: "زبادي" },
  "Lactoserums": { en: "Whey", ar: "مصل اللبن" },
  "lactoserums": { en: "whey", ar: "مصل اللبن" },
  // General terms
  "nourrissons": { en: "infants", ar: "رضع" },
  "consommation": { en: "consumption", ar: "استهلاك" },
  "alimentation": { en: "feeding", ar: "تغذية" },
  "pharmaceutiques": { en: "pharmaceutical", ar: "دوائية" },
  "industrielle": { en: "industrial", ar: "صناعية" },
  "industrie": { en: "industry", ar: "صناعة" },
  "fabrication": { en: "manufacture", ar: "تصنيع" },
  "emballage": { en: "packaging", ar: "تعبئة" },
  "recipients": { en: "containers", ar: "أوعية" },
  "conditionne": { en: "packaged", ar: "معبأ" },
  "poudre": { en: "powder", ar: "مسحوق" },
  "poids": { en: "weight", ar: "وزن" },
  "sucre": { en: "sugar", ar: "سكر" },
  "edulcorants": { en: "sweeteners", ar: "محليات" },
  "additionnes": { en: "added", ar: "مضافة" },
  "excedant": { en: "exceeding", ar: "يتجاوز" },
  "especes": { en: "species", ar: "أنواع" },
  "espece": { en: "species", ar: "نوع" },
  "race": { en: "breed", ar: "سلالة" },
  "tete": { en: "head", ar: "رأس" },
  "pendant": { en: "during", ar: "خلال" },
  "avant": { en: "before", ar: "قبل" },
  "apres": { en: "after", ar: "بعد" },
  "produits": { en: "products", ar: "منتجات" },
  "Produits": { en: "Products", ar: "منتجات" },
  "denommes": { en: "specified", ar: "مذكورة" },
  "presentes": { en: "presented", ar: "مقدمة" },
  "preparations": { en: "preparations", ar: "مستحضرات" },
  "destines": { en: "intended", ar: "مخصصة" },
  "destine": { en: "intended", ar: "مخصص" },
  "destinees": { en: "intended", ar: "مخصصة" },
  "forme": { en: "form", ar: "شكل" },
  "sang": { en: "blood", ar: "دم" },
  "serpent": { en: "snake", ar: "ثعبان" },
  "laitieres": { en: "dairy", ar: "حلوب" },
  "laitances": { en: "milt", ar: "حليب السمك" },
  // Connectors
  "Sans": { en: "Without", ar: "بدون" },
  "sans": { en: "without", ar: "بدون" },
  "avec": { en: "with", ar: "مع" },
  "Avec": { en: "With", ar: "مع" },
  "pour": { en: "for", ar: "لـ" },
  "Pour": { en: "For", ar: "لـ" },
  "non": { en: "not", ar: "غير" },
  "meme": { en: "even", ar: "حتى" },
  "dits": { en: "called", ar: "المسماة" },
  "dit": { en: "called", ar: "المسمى" },
  "ou": { en: "or", ar: "أو" },
  "en": { en: "in", ar: "في" },
  "de": { en: "of", ar: "من" },
  "du": { en: "of the", ar: "من" },
  "des": { en: "of", ar: "من" },
  "la": { en: "the", ar: "" },
  "le": { en: "the", ar: "" },
  "les": { en: "the", ar: "" },
  "un": { en: "a", ar: "" },
  "une": { en: "a", ar: "" },
  "au": { en: "at the", ar: "في" },
  "aux": { en: "to the", ar: "إلى" },
  "que": { en: "than", ar: "من" },
  "ni": { en: "nor", ar: "ولا" },
  "et": { en: "and", ar: "و" },
};

/**
 * Translate a French tariff description to the target language
 * Uses phrase-first then word-by-word replacement
 */
export function translateDescription(frenchText: string, lang: "en" | "ar"): string {
  if (!frenchText) return frenchText;

  let result = frenchText;

  // Step 1: Replace multi-word phrases first (longer phrases first to avoid partial matches)
  const phrases = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    const translation = dictionary[phrase][lang];
    if (translation) {
      result = result.split(phrase).join(translation);
    }
  }

  // Step 2: Replace individual words (preserve dashes and structure)
  // Split by spaces but keep dashes and punctuation
  const parts = result.split(/(\s+|(?<=[,.])\s*)/);
  const translated = parts.map((part) => {
    const trimmed = part.trim();
    if (!trimmed || trimmed === "-" || /^[,.\s]+$/.test(trimmed)) return part;

    // Check exact match in word dictionary
    if (words[trimmed]) {
      return part.replace(trimmed, words[trimmed][lang]);
    }

    // Check without accents for common variations
    return part;
  });

  return translated.join("");
}

/**
 * Get the best available description for the given locale
 */
export function getLocalizedDescription(
  description: string,
  descriptionEn: string | null,
  descriptionAr: string | null,
  locale: string
): { text: string; isFallback: boolean; lang: string } {
  if (locale === "fr") {
    return { text: description, isFallback: false, lang: "fr" };
  }

  if (locale === "en") {
    if (descriptionEn) return { text: descriptionEn, isFallback: false, lang: "en" };
    // Translate on-the-fly
    return { text: translateDescription(description, "en"), isFallback: false, lang: "en" };
  }

  if (locale === "ar") {
    if (descriptionAr) return { text: descriptionAr, isFallback: false, lang: "ar" };
    // Translate on-the-fly
    return { text: translateDescription(description, "ar"), isFallback: false, lang: "ar" };
  }

  return { text: description, isFallback: true, lang: "fr" };
}
