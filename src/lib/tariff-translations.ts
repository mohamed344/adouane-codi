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
  // Tubes & pipes
  "Tubes et tuyaux": { en: "Tubes and pipes", ar: "أنابيب ومواسير" },
  "tubes et tuyaux": { en: "tubes and pipes", ar: "أنابيب ومواسير" },
  "tube enroule": { en: "coiled tube", ar: "أنبوب ملفوف" },
  "tubes enroules": { en: "coiled tubes", ar: "أنابيب ملفوفة" },
  "profiles creux": { en: "hollow profiles", ar: "مقاطع مجوفة" },
  "sans soudure": { en: "seamless", ar: "بدون لحام" },
  "aciers inoxydables": { en: "stainless steel", ar: "فولاذ مقاوم للصدأ" },
  "acier inoxydable": { en: "stainless steel", ar: "فولاذ مقاوم للصدأ" },
  "fer ou acier": { en: "iron or steel", ar: "حديد أو فولاذ" },
  "matieres plastiques": { en: "plastics", ar: "مواد بلاستيكية" },
  "matiere plastique": { en: "plastic", ar: "مادة بلاستيكية" },
  "diametre exterieur": { en: "outer diameter", ar: "القطر الخارجي" },
  "diametre interieur": { en: "inner diameter", ar: "القطر الداخلي" },
  // Hot/cold rolled steel
  "lamines a chaud": { en: "hot rolled", ar: "مدرفل على الساخن" },
  "lamines a froid": { en: "cold rolled", ar: "مدرفل على البارد" },
  "lamine a chaud": { en: "hot rolled", ar: "مدرفل على الساخن" },
  "lamine a froid": { en: "cold rolled", ar: "مدرفل على البارد" },
  // Electrical
  "courant alternatif": { en: "alternating current", ar: "تيار متردد" },
  "courant continu": { en: "direct current", ar: "تيار مستمر" },
  "haute tension": { en: "high voltage", ar: "جهد عالي" },
  "basse tension": { en: "low voltage", ar: "جهد منخفض" },
  // Machinery
  "machines-outils": { en: "machine tools", ar: "أدوات آلية" },
  "pieces detachees": { en: "spare parts", ar: "قطع غيار" },
  // Construction
  "ciment Portland": { en: "Portland cement", ar: "إسمنت بورتلاند" },
  "beton arme": { en: "reinforced concrete", ar: "خرسانة مسلحة" },
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
  // Common tariff terms
  "appareils": { en: "apparatus", ar: "أجهزة" },
  "appareil": { en: "apparatus", ar: "جهاز" },
  "machines": { en: "machines", ar: "آلات" },
  "machine": { en: "machine", ar: "آلة" },
  "parties": { en: "parts", ar: "أجزاء" },
  "partie": { en: "part", ar: "جزء" },
  "pieces": { en: "parts", ar: "قطع" },
  "types": { en: "types", ar: "أنواع" },
  "type": { en: "type", ar: "نوع" },
  "similaires": { en: "similar", ar: "مماثلة" },
  "similaire": { en: "similar", ar: "مماثل" },
  "acide": { en: "acid", ar: "حمض" },
  "acides": { en: "acids", ar: "أحماض" },
  "epaisseur": { en: "thickness", ar: "سُمك" },
  "largeur": { en: "width", ar: "عرض" },
  "longueur": { en: "length", ar: "طول" },
  "hauteur": { en: "height", ar: "ارتفاع" },
  "diametre": { en: "diameter", ar: "قطر" },
  "superficie": { en: "area", ar: "مساحة" },
  "contenu": { en: "content", ar: "محتوى" },
  "net": { en: "net", ar: "صافي" },
  "brut": { en: "gross", ar: "إجمالي" },
  "utilises": { en: "used", ar: "مستخدمة" },
  "utilise": { en: "used", ar: "مستخدم" },
  "fabriques": { en: "manufactured", ar: "مصنوعة" },
  "fabrique": { en: "manufactured", ar: "مصنوع" },
  "articles": { en: "articles", ar: "مواد" },
  "article": { en: "article", ar: "مادة" },
  "vehicules": { en: "vehicles", ar: "مركبات" },
  "vehicule": { en: "vehicle", ar: "مركبة" },
  "moteur": { en: "engine", ar: "محرك" },
  "moteurs": { en: "engines", ar: "محركات" },
  "camions": { en: "trucks", ar: "شاحنات" },
  "camion": { en: "truck", ar: "شاحنة" },
  "tissus": { en: "fabrics", ar: "أقمشة" },
  "tissu": { en: "fabric", ar: "قماش" },
  "fils": { en: "threads", ar: "خيوط" },
  "fil": { en: "thread", ar: "خيط" },
  "metal": { en: "metal", ar: "معدن" },
  "metaux": { en: "metals", ar: "معادن" },
  "metallique": { en: "metallic", ar: "معدني" },
  "metalliques": { en: "metallic", ar: "معدنية" },
  "fer": { en: "iron", ar: "حديد" },
  "acier": { en: "steel", ar: "فولاذ" },
  "cuivre": { en: "copper", ar: "نحاس" },
  "aluminium": { en: "aluminum", ar: "ألمنيوم" },
  "zinc": { en: "zinc", ar: "زنك" },
  "plomb": { en: "lead", ar: "رصاص" },
  "bois": { en: "wood", ar: "خشب" },
  "papier": { en: "paper", ar: "ورق" },
  "carton": { en: "cardboard", ar: "كرتون" },
  "plastique": { en: "plastic", ar: "بلاستيك" },
  "plastiques": { en: "plastics", ar: "بلاستيك" },
  "caoutchouc": { en: "rubber", ar: "مطاط" },
  "verre": { en: "glass", ar: "زجاج" },
  "ceramique": { en: "ceramic", ar: "سيراميك" },
  "electrique": { en: "electric", ar: "كهربائي" },
  "electriques": { en: "electric", ar: "كهربائية" },
  "electronique": { en: "electronic", ar: "إلكتروني" },
  "electroniques": { en: "electronic", ar: "إلكترونية" },
  "chimique": { en: "chemical", ar: "كيميائي" },
  "chimiques": { en: "chemical", ar: "كيميائية" },
  "organique": { en: "organic", ar: "عضوي" },
  "organiques": { en: "organic", ar: "عضوية" },
  "minerale": { en: "mineral", ar: "معدني" },
  "minerales": { en: "mineral", ar: "معدنية" },
  "mineraux": { en: "minerals", ar: "معادن" },
  "huile": { en: "oil", ar: "زيت" },
  "huiles": { en: "oils", ar: "زيوت" },
  "graisses": { en: "fats", ar: "دهون" },
  "graisse": { en: "fat", ar: "دهن" },
  "eau": { en: "water", ar: "ماء" },
  "eaux": { en: "waters", ar: "مياه" },
  "sel": { en: "salt", ar: "ملح" },
  "sels": { en: "salts", ar: "أملاح" },
  "farine": { en: "flour", ar: "دقيق" },
  "farines": { en: "flours", ar: "دقيق" },
  "cereales": { en: "cereals", ar: "حبوب" },
  "ble": { en: "wheat", ar: "قمح" },
  "orge": { en: "barley", ar: "شعير" },
  "mais": { en: "corn", ar: "ذرة" },
  "riz": { en: "rice", ar: "أرز" },
  "legumes": { en: "vegetables", ar: "خضروات" },
  "fruits": { en: "fruits", ar: "فواكه" },
  "noix": { en: "nuts", ar: "مكسرات" },
  "cafe": { en: "coffee", ar: "قهوة" },
  "the": { en: "tea", ar: "شاي" },
  "tabac": { en: "tobacco", ar: "تبغ" },
  "vin": { en: "wine", ar: "نبيذ" },
  "vins": { en: "wines", ar: "نبيذ" },
  "bieres": { en: "beers", ar: "بيرة" },
  "biere": { en: "beer", ar: "بيرة" },
  "alcool": { en: "alcohol", ar: "كحول" },
  "boissons": { en: "beverages", ar: "مشروبات" },
  "conserves": { en: "preserved", ar: "محفوظة" },
  "concentre": { en: "concentrated", ar: "مركز" },
  "concentres": { en: "concentrated", ar: "مركزة" },
  "naturel": { en: "natural", ar: "طبيعي" },
  "naturels": { en: "natural", ar: "طبيعية" },
  "naturelle": { en: "natural", ar: "طبيعية" },
  "artificiel": { en: "artificial", ar: "اصطناعي" },
  "artificiels": { en: "artificial", ar: "اصطناعية" },
  "synthetique": { en: "synthetic", ar: "صناعي" },
  "synthetiques": { en: "synthetic", ar: "صناعية" },
  "superieur": { en: "greater", ar: "أكبر" },
  "superieure": { en: "greater", ar: "أكبر" },
  "inferieur": { en: "less", ar: "أقل" },
  "inferieure": { en: "less", ar: "أقل" },
  "egal": { en: "equal", ar: "يساوي" },
  "egale": { en: "equal", ar: "يساوي" },
  "maximum": { en: "maximum", ar: "أقصى" },
  "minimum": { en: "minimum", ar: "أدنى" },
  "teneur": { en: "content", ar: "محتوى" },
  "addition": { en: "addition", ar: "إضافة" },
  "traitement": { en: "treatment", ar: "معالجة" },
  "transformation": { en: "processing", ar: "تحويل" },
  "medicaments": { en: "medicines", ar: "أدوية" },
  "medicament": { en: "medicine", ar: "دواء" },
  "savon": { en: "soap", ar: "صابون" },
  "savons": { en: "soaps", ar: "صابون" },
  "parfum": { en: "perfume", ar: "عطر" },
  "parfums": { en: "perfumes", ar: "عطور" },
  "cosmetiques": { en: "cosmetics", ar: "مستحضرات تجميل" },
  "ciment": { en: "cement", ar: "إسمنت" },
  "engrais": { en: "fertilizers", ar: "أسمدة" },
  "peintures": { en: "paints", ar: "دهانات" },
  "peinture": { en: "paint", ar: "دهان" },
  "couleur": { en: "color", ar: "لون" },
  "couleurs": { en: "colors", ar: "ألوان" },
  "blanc": { en: "white", ar: "أبيض" },
  "blancs": { en: "white", ar: "بيضاء" },
  "noir": { en: "black", ar: "أسود" },
  "rouge": { en: "red", ar: "أحمر" },
  "contenant": { en: "containing", ar: "يحتوي على" },
  "composants": { en: "components", ar: "مكونات" },
  "dont": { en: "of which", ar: "منها" },
  "plus": { en: "more", ar: "أكثر" },
  "moins": { en: "less", ar: "أقل" },
  "entre": { en: "between", ar: "بين" },
  "jusqu": { en: "up to", ar: "حتى" },
  "leurs": { en: "their", ar: "لها" },
  "sous": { en: "sub", ar: "تحت" },
  "sur": { en: "on", ar: "على" },
  "par": { en: "by", ar: "بواسطة" },
  "dans": { en: "in", ar: "في" },
  // Tubes, pipes & metal products
  "tube": { en: "tube", ar: "أنبوب" },
  "tubes": { en: "tubes", ar: "أنابيب" },
  "Tubes": { en: "Tubes", ar: "أنابيب" },
  "tuyau": { en: "pipe", ar: "أنبوب" },
  "tuyaux": { en: "pipes", ar: "أنابيب" },
  "Tuyaux": { en: "Pipes", ar: "أنابيب" },
  "enroule": { en: "coiled", ar: "ملفوف" },
  "enroules": { en: "coiled", ar: "ملفوفة" },
  "enroulee": { en: "coiled", ar: "ملفوفة" },
  "enroulees": { en: "coiled", ar: "ملفوفة" },
  "enroulement": { en: "winding", ar: "لف" },
  "lamine": { en: "rolled", ar: "مدرفل" },
  "lamines": { en: "rolled", ar: "مدرفلة" },
  "laminee": { en: "rolled", ar: "مدرفلة" },
  "laminees": { en: "rolled", ar: "مدرفلة" },
  "soude": { en: "welded", ar: "ملحوم" },
  "soudes": { en: "welded", ar: "ملحومة" },
  "soudure": { en: "welding", ar: "لحام" },
  "soudee": { en: "welded", ar: "ملحومة" },
  "soudees": { en: "welded", ar: "ملحومة" },
  "galvanise": { en: "galvanized", ar: "مجلفن" },
  "galvanises": { en: "galvanized", ar: "مجلفنة" },
  "galvanisee": { en: "galvanized", ar: "مجلفنة" },
  "galvanisees": { en: "galvanized", ar: "مجلفنة" },
  "inoxydable": { en: "stainless", ar: "مقاوم للصدأ" },
  "inoxydables": { en: "stainless", ar: "مقاومة للصدأ" },
  "creux": { en: "hollow", ar: "أجوف" },
  "profiles": { en: "profiles", ar: "مقاطع" },
  "barres": { en: "bars", ar: "قضبان" },
  "barre": { en: "bar", ar: "قضيب" },
  "tiges": { en: "rods", ar: "قضبان" },
  "tige": { en: "rod", ar: "قضيب" },
  "toles": { en: "sheets", ar: "ألواح" },
  "tole": { en: "sheet", ar: "لوح" },
  "plaques": { en: "plates", ar: "صفائح" },
  "plaque": { en: "plate", ar: "صفيحة" },
  "feuilles": { en: "foils", ar: "رقائق" },
  "feuille": { en: "foil", ar: "رقيقة" },
  "bandes": { en: "strips", ar: "شرائط" },
  "bande": { en: "strip", ar: "شريط" },
  "bobines": { en: "coils", ar: "لفات" },
  "bobine": { en: "coil", ar: "لفة" },
  "fonte": { en: "cast iron", ar: "حديد زهر" },
  "aciers": { en: "steels", ar: "فولاذ" },
  "allies": { en: "alloy", ar: "سبائكي" },
  "alliage": { en: "alloy", ar: "سبيكة" },
  "alliages": { en: "alloys", ar: "سبائك" },
  "nickel": { en: "nickel", ar: "نيكل" },
  "etain": { en: "tin", ar: "قصدير" },
  "chrome": { en: "chromium", ar: "كروم" },
  "titane": { en: "titanium", ar: "تيتانيوم" },
  "tungstene": { en: "tungsten", ar: "تنغستن" },
  "raccords": { en: "fittings", ar: "وصلات" },
  "raccord": { en: "fitting", ar: "وصلة" },
  "coudes": { en: "elbows", ar: "أكواع" },
  "manchons": { en: "sleeves", ar: "أكمام" },
  "brides": { en: "flanges", ar: "شفاهات" },
  "accessoires": { en: "accessories", ar: "ملحقات" },
  "tuyauterie": { en: "piping", ar: "أنابيب" },
  "oleoducs": { en: "oil pipelines", ar: "أنابيب نفط" },
  "gazoducs": { en: "gas pipelines", ar: "أنابيب غاز" },
  "cuvelage": { en: "casing", ar: "تبطين" },
  "forage": { en: "drilling", ar: "حفر" },
  "petrole": { en: "petroleum", ar: "بترول" },
  "gaz": { en: "gas", ar: "غاز" },
  "extraction": { en: "extraction", ar: "استخراج" },
  "soudable": { en: "weldable", ar: "قابل للحام" },
  "rivetage": { en: "riveting", ar: "برشمة" },
  "rives": { en: "riveted", ar: "مبرشمة" },
  "agrafes": { en: "stapled", ar: "مدبّسة" },
  "circulaire": { en: "circular", ar: "دائري" },
  "section": { en: "section", ar: "مقطع" },
  "exterieur": { en: "external", ar: "خارجي" },
  "interieur": { en: "internal", ar: "داخلي" },
  // Construction & building
  "constructions": { en: "constructions", ar: "إنشاءات" },
  "construction": { en: "construction", ar: "بناء" },
  "ponts": { en: "bridges", ar: "جسور" },
  "pylones": { en: "pylons", ar: "أبراج" },
  "charpentes": { en: "frameworks", ar: "هياكل" },
  "toitures": { en: "roofing", ar: "أسقف" },
  "portes": { en: "doors", ar: "أبواب" },
  "fenetres": { en: "windows", ar: "نوافذ" },
  "cadres": { en: "frames", ar: "إطارات" },
  "cadre": { en: "frame", ar: "إطار" },
  "colonnes": { en: "columns", ar: "أعمدة" },
  "piliers": { en: "pillars", ar: "أعمدة" },
  "reservoirs": { en: "tanks", ar: "خزانات" },
  "reservoir": { en: "tank", ar: "خزان" },
  "citernes": { en: "cisterns", ar: "صهاريج" },
  "chaudieres": { en: "boilers", ar: "غلايات" },
  "chaudiere": { en: "boiler", ar: "غلاية" },
  // Electrical & electronics
  "cables": { en: "cables", ar: "كابلات" },
  "cable": { en: "cable", ar: "كابل" },
  "conducteurs": { en: "conductors", ar: "موصلات" },
  "conducteur": { en: "conductor", ar: "موصل" },
  "isolants": { en: "insulators", ar: "عوازل" },
  "isolant": { en: "insulator", ar: "عازل" },
  "transformateurs": { en: "transformers", ar: "محولات" },
  "transformateur": { en: "transformer", ar: "محول" },
  "generateurs": { en: "generators", ar: "مولدات" },
  "generateur": { en: "generator", ar: "مولد" },
  "commutateurs": { en: "switches", ar: "مفاتيح" },
  "disjoncteurs": { en: "circuit breakers", ar: "قواطع دارة" },
  "relais": { en: "relays", ar: "مرحلات" },
  "fusibles": { en: "fuses", ar: "صمامات" },
  "lampes": { en: "lamps", ar: "مصابيح" },
  "lampe": { en: "lamp", ar: "مصباح" },
  "ampoules": { en: "bulbs", ar: "مصابيح" },
  "batteries": { en: "batteries", ar: "بطاريات" },
  "batterie": { en: "battery", ar: "بطارية" },
  "accumulateurs": { en: "accumulators", ar: "مراكم" },
  "piles": { en: "cells", ar: "خلايا" },
  "pile": { en: "cell", ar: "خلية" },
  // Machinery & equipment
  "pompes": { en: "pumps", ar: "مضخات" },
  "pompe": { en: "pump", ar: "مضخة" },
  "compresseurs": { en: "compressors", ar: "ضواغط" },
  "compresseur": { en: "compressor", ar: "ضاغط" },
  "ventilateurs": { en: "fans", ar: "مراوح" },
  "turbines": { en: "turbines", ar: "توربينات" },
  "turbine": { en: "turbine", ar: "توربين" },
  "soupapes": { en: "valves", ar: "صمامات" },
  "vannes": { en: "valves", ar: "صمامات" },
  "robinets": { en: "taps", ar: "صنابير" },
  "robinet": { en: "tap", ar: "صنبور" },
  "roulements": { en: "bearings", ar: "محامل" },
  "engrenages": { en: "gears", ar: "تروس" },
  "engrenage": { en: "gear", ar: "ترس" },
  "courroies": { en: "belts", ar: "أحزمة" },
  "chaines": { en: "chains", ar: "سلاسل" },
  "ressorts": { en: "springs", ar: "نوابض" },
  "ressort": { en: "spring", ar: "نابض" },
  "vis": { en: "screws", ar: "براغي" },
  "boulons": { en: "bolts", ar: "مسامير" },
  "ecrous": { en: "nuts", ar: "صواميل" },
  "rondelles": { en: "washers", ar: "حلقات" },
  "clous": { en: "nails", ar: "مسامير" },
  // Textiles & clothing
  "coton": { en: "cotton", ar: "قطن" },
  "laine": { en: "wool", ar: "صوف" },
  "soie": { en: "silk", ar: "حرير" },
  "lin": { en: "flax", ar: "كتان" },
  "fibres": { en: "fibers", ar: "ألياف" },
  "fibre": { en: "fiber", ar: "ليف" },
  "vetements": { en: "clothing", ar: "ملابس" },
  "chaussures": { en: "footwear", ar: "أحذية" },
  "cuir": { en: "leather", ar: "جلد" },
  "cuirs": { en: "leathers", ar: "جلود" },
  // Vehicles & transport
  "voiture": { en: "car", ar: "سيارة" },
  "voitures": { en: "cars", ar: "سيارات" },
  "automobile": { en: "automobile", ar: "سيارة" },
  "automobiles": { en: "automobiles", ar: "سيارات" },
  "autobus": { en: "bus", ar: "حافلة" },
  "tracteur": { en: "tractor", ar: "جرار" },
  "tracteurs": { en: "tractors", ar: "جرارات" },
  "remorques": { en: "trailers", ar: "مقطورات" },
  "remorque": { en: "trailer", ar: "مقطورة" },
  "navires": { en: "ships", ar: "سفن" },
  "navire": { en: "ship", ar: "سفينة" },
  "bateaux": { en: "boats", ar: "قوارب" },
  "bateau": { en: "boat", ar: "قارب" },
  "avions": { en: "aircraft", ar: "طائرات" },
  "avion": { en: "aircraft", ar: "طائرة" },
  "pneumatiques": { en: "tires", ar: "إطارات" },
  "pneumatique": { en: "tire", ar: "إطار" },
  "roues": { en: "wheels", ar: "عجلات" },
  "roue": { en: "wheel", ar: "عجلة" },
  "freins": { en: "brakes", ar: "فرامل" },
  "frein": { en: "brake", ar: "فرملة" },
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

// Build reverse lookup maps (English→French, Arabic→French) for search
function buildReverseMaps() {
  const enToFr: Record<string, string> = {};
  const arToFr: Record<string, string> = {};

  // Add phrases (multi-word)
  for (const [fr, translations] of Object.entries(dictionary)) {
    if (translations.en) enToFr[translations.en.toLowerCase()] = fr;
    if (translations.ar) arToFr[translations.ar] = fr;
  }

  // Add single words
  for (const [fr, translations] of Object.entries(words)) {
    if (translations.en) enToFr[translations.en.toLowerCase()] = fr;
    if (translations.ar) arToFr[translations.ar] = fr;
  }

  return { enToFr, arToFr };
}

const { enToFr, arToFr } = buildReverseMaps();

/** Detect if text contains Arabic script */
function hasArabicScript(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/** Detect if text is Latin script (English/French) */
function hasLatinScript(text: string): boolean {
  return /[a-zA-Z\u00C0-\u024F]/.test(text);
}

/** Try to reverse-translate using a specific map */
function tryReverseTranslate(query: string, map: Record<string, string>, isArabic: boolean): string | null {
  const trimmed = query.trim();
  const key = isArabic ? trimmed : trimmed.toLowerCase();

  // Try full phrase match first
  if (map[key]) return map[key];

  // Try word-by-word translation
  const queryWords = trimmed.split(/\s+/);
  const translated = queryWords.map((word) => {
    const wordKey = isArabic ? word : word.toLowerCase();
    return map[wordKey] || null;
  });

  const frenchWords = translated.filter(Boolean);
  if (frenchWords.length > 0) return frenchWords.join(" ");

  return null;
}

/**
 * Reverse-translate an English or Arabic search query to French
 * so it can match against French descriptions in the database.
 * Auto-detects the script of the query (Arabic vs Latin) regardless of locale.
 */
export function reverseTranslateQuery(query: string, fromLang: string): string | null {
  const trimmed = query.trim();

  // Auto-detect: if query contains Arabic script, try Arabic→French first
  if (hasArabicScript(trimmed)) {
    const result = tryReverseTranslate(trimmed, arToFr, true);
    if (result) return result;
  }

  // If query contains Latin script (and not French locale), try English→French
  if (hasLatinScript(trimmed) && fromLang !== "fr") {
    const result = tryReverseTranslate(trimmed, enToFr, false);
    if (result) return result;
  }

  // Fallback: try both maps if nothing matched yet
  if (!hasArabicScript(trimmed) && fromLang === "ar") {
    return tryReverseTranslate(trimmed, arToFr, true);
  }

  return null;
}

// French contractions: d', l', n', s', qu', j', c' → split before translation
const contractionMap: Record<string, { en: string; ar: string }> = {
  "d'": { en: "of ", ar: "من " },
  "l'": { en: "the ", ar: "" },
  "n'": { en: "not ", ar: "لا " },
  "s'": { en: "", ar: "" },
  "qu'": { en: "that ", ar: "أن " },
  "j'": { en: "", ar: "" },
  "c'": { en: "it ", ar: "" },
};

/**
 * Translate a French tariff description to the target language
 * Uses phrase-first then word-by-word replacement
 * Handles French contractions (d', l', n', etc.)
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

    // Handle French contractions: d'autres → "of" + "others"
    for (const [contraction, translations] of Object.entries(contractionMap)) {
      if (trimmed.toLowerCase().startsWith(contraction)) {
        const remainder = trimmed.slice(contraction.length);
        const remainderTranslation = words[remainder]?.[lang] || words[remainder.toLowerCase()]?.[lang];
        if (remainderTranslation) {
          return part.replace(trimmed, translations[lang] + remainderTranslation);
        }
        // Even if remainder isn't in dictionary, translate the contraction part
        if (translations[lang]) {
          return part.replace(trimmed, translations[lang] + remainder);
        }
      }
    }

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
