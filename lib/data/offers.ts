import { readFileSync } from 'fs';
import { join } from 'path';
import type { Offer, ProductCard } from '@/types';

// Synonyme für bessere Suchergebnisse
const SYNONYMS: Record<string, string[]> = {
  "adventskalender": ["weihnachtskalender", "kalender", "schokoladenkalender"],
  "alkohol": ["spirituosen", "schnaps", "bier", "wein", "sekt", "likör", "wodka", "whisky", "rum"],
  "apfel": ["äpfel", "rote äpfel", "elstar", "braeburn", "kanzi"],
  "aufschnitt": ["wurst", "schinken", "salami", "wurstaufschnitt", "käseaufschnitt", "bratenaufschnitt", "finesse", "geflügelwurst"],
  "backartikel": ["backzutaten", "vanillinzucker", "hefe", "mehl", "zucker", "kuvertüre", "streusel", "backmischung", "nüsse", "mandeln", "haselnüsse"],
  "backwaren": ["brot", "brötchen", "toast", "kuchen", "torte", "muffin", "croissant", "baguette", "waffeln", "strudel", "gebäck"],
  "banane": ["bananen", "bio-bananen"],
  "bier": ["pils", "weißbier", "helles", "weizen", "corona", "bitburger", "krombacher", "veltins", "jever"],
  "blumen": ["pflanzen", "rosen", "orchidee", "chrysanthemen", "amaryllis", "heidekraut"],
  "brot": ["toast", "weißbrot", "vollkornbrot", "sandwichbrot", "knäckebrot", "das pure"],
  "brotaufstrich": ["marmelade", "konfitüre", "gelee", "honig", "nuss-nougat-creme", "nutella", "pistaziencreme", "lemon curd", "erdnussbutter", "hummus"],
  "brötchen": ["weizenbrötchen", "semmel", "schrippe", "aufbackbrötchen", "unsere goldstücke", "brunch mix", "laugenbrötchen"],
  "burger": ["hamburger", "cheeseburger", "beef burger", "chicken burger", "veganer burger", "burger patties"],
  "butter": ["markenbutter", "deutsche markenbutter", "süßrahmbutter", "rahmbutter", "kerrygold", "weihenstephan"],
  "chips": ["kartoffelchips", "stapelchips", "pringles", "crunchips", "lays", "pommels", "monster munch", "frit-sticks", "saltletts", "erdnussflips", "tortillas"],
  "cola": ["coca-cola", "coke", "pepsi", "schwip schwap", "dr. pepper"],
  "dessert": ["pudding", "mousse", "götterspeise", "eis", "joghurt", "grand dessert", "monte"],
  "eis": ["eiscreme", "magnum", "eiskonfekt", "stieleis", "nuii", "mövenpick", "langnese", "ben & jerry's"],
  "energydrink": ["energy", "red bull", "monster", "booster", "rockstar"],
  "fertiggericht": ["5-minuten-terrine", "spaghetteria", "ravioli", "maultaschen", "pfannengericht", "tiefkühlgericht", "chili con carne", "eintopf", "suppe", "pizza", "baguette"],
  "fisch": ["lachs", "seelachs", "rotbarsch", "fischstäbchen", "schlemmerfilet", "backfisch", "garnelen", "muscheln", "thunfisch"],
  "fleisch": ["hackfleisch", "gulasch", "braten", "rouladen", "schnitzel", "steak", "geschnetzeltes", "kasseler", "hähnchen", "pute", "schwein", "rind", "ente", "lamm"],
  "frischkäse": ["philadelphia", "bresso", "miree", "exquisa", "frischkäsezubereitung", "kräuterquark", "buko"],
  "gemüse": ["tomaten", "gurken", "paprika", "zwiebeln", "kartoffeln", "kürbis", "champignons", "spinat", "rosenkohl", "blumenkohl", "brokkoli", "sauerkraut", "rotkohl", "bohnen", "mais", "salat"],
  "getränk": ["saft", "nektar", "limonade", "eistee", "wasser", "schorle", "haferdrink", "milchshake", "smoothie"],
  "gewürze": ["salz", "pfeffer", "kräuter", "gewürzmischung", "just spices", "maggi", "knorr"],
  "hackfleisch": ["mett", "rinderhack", "schweinehack", "gemischtes hack", "tartar", "hack"],
  "hähnchen": ["huhn", "hähnchenbrust", "hähnchenschenkel", "chicken wings", "chicken nuggets", "geflügel", "pute"],
  "joghurt": ["jogurt", "yogurt", "fruchtjoghurt", "naturjoghurt", "joghurt mit der ecke", "skyr", "actimel", "yopro", "fruchtzwerge"],
  "kaffee": ["kaffeebohnen", "filterkaffee", "pads", "kapseln", "löslicher kaffee", "espresso", "cappuccino", "latte macchiato", "dallmayr", "melitta", "lavazza", "jacobs", "senseo", "starbucks", "nescafé"],
  "kartoffelprodukte": ["kartoffeln", "pommes", "frites", "kroketten", "kartoffelpuffer", "rösti", "chips", "kartoffelsalat", "knödel"],
  "käse": ["kaese", "gouda", "emmentaler", "mozzarella", "cheddar", "feta", "camembert", "frischkäse", "reibekäse", "schnittkäse", "weichkäse", "hirtenkäse", "leerdammer", "grünländer", "bergkäse", "limburger"],
  "kekse": ["cookies", "butterkekse", "spekulatius", "oreo", "leibniz", "mikado", "prinzenrolle"],
  "kuchen": ["torte", "muffin", "donut", "berliner", "blechkuchen", "apfelstrudel", "donauwelle", "bienenstich", "schwarzwälderkirsch", "brownie", "pancakes"],
  "limonade": ["limo", "fanta", "sprite", "7up", "schwip schwap", "granini die limo", "bionade"],
  "margarine": ["halbfettmargarine", "pflanzenmargarine", "lätta", "rama", "sanella", "becel"],
  "milch": ["h-milch", "frischmilch", "vollmilch", "fettarme milch", "bio-milch", "laktosefreie milch", "bärenmarke"],
  "müsli": ["cerealien", "cornflakes", "haferflocken", "knuspermüsli", "vitalis", "kölln", "lion cereals", "smarties cereals"],
  "nudeln": ["pasta", "spaghetti", "penne", "fusilli", "teigwaren", "barilla", "birkel", "3 glocken", "gnocchi"],
  "nüsse": ["erdnüsse", "walnüsse", "haselnüsse", "mandeln", "cashews", "pistazien", "nussmischung"],
  "obst": ["äpfel", "bananen", "orangen", "mandarinen", "birnen", "trauben", "kiwi", "mango", "beeren", "erdbeeren", "heidelbeeren", "ananas", "granatapfel"],
  "öl": ["sonnenblumenöl", "rapsöl", "olivenöl", "frittieröl", "speiseöl", "thomy", "solvel", "mazola"],
  "pizza": ["tiefkühlpizza", "steinofenpizza", "die backfrische", "big pizza", "piccolinis", "gustavo gusto", "wagner", "pinsa"],
  "pudding": ["dessert", "mousse", "götterspeise", "grand dessert", "monte", "high protein pudding", "ehrmann"],
  "reis": ["langkornreis", "basmatireis", "risottoreis", "milchreis", "express reis", "ben's original"],
  "saft": ["orangensaft", "apfelsaft", "multivitaminsaft", "fruchtsaft", "nektar", "hohes c", "granini", "valensina"],
  "salami": ["peperonisalami", "chorizo", "mettwurst"],
  "schokolade": ["tafelschokolade", "pralinen", "schokoriegel", "milka", "lindt", "ritter sport", "tony's chocolonely", "kinder schokolade", "ferrero", "toffifee", "m&m's", "daim", "merci"],
  "sekt": ["prosecco", "champagner", "freixenet", "rotkäppchen", "söhnlein brillant", "mm extra"],
  "senf": ["mostrich", "dijon-senf", "maille"],
  "shampoo": ["haarpflege", "haarwäsche", "schauma", "gliss kur"],
  "snacks": ["riegel", "knoppers", "hanuta", "duplo", "pick up", "fruchtgummi", "gummibärchen", "haribo", "trolli", "katjes", "chips", "salzstangen", "nüsse"],
  "spinat": ["rahmspinat", "blattspinat", "iglo", "der mit dem blubb"],
  "spirituosen": ["schnaps", "wodka", "whisky", "likör", "rum", "gin", "jägermeister", "bacardi", "jack daniel's", "gorbatschow", "smirnoff", "absolut", "chantré", "metaxa"],
  "suppe": ["eintopf", "brühe", "tütensuppe", "dosensuppe", "knorr", "maggi", "erasco"],
  "süßigkeiten": ["bonbons", "schokolade", "gummibärchen", "lakritz", "pralinen", "kekse", "riegel", "maoam", "fritt"],
  "tee": ["schwarztee", "kräutertee", "früchtetee", "grüntee", "teebeutel", "teekanne", "cupper", "meßmer"],
  "tiernahrung": ["hundefutter", "katzenfutter", "leckerli", "trockenfutter", "nassfutter", "pedigree", "whiskas", "felix", "lucky dog", "lucky cat", "purina"],
  "tomaten": ["rispentomaten", "cherrytomaten", "romatomaten"],
  "waschmittel": ["vollwaschmittel", "colorwaschmittel", "waschpulver", "flüssigwaschmittel", "pods", "ariel", "persil", "lenor", "perwoll", "omo", "coral"],
  "wasser": ["mineralwasser", "stilles wasser", "sprudelwasser", "gerolsteiner", "volvic"],
  "wein": ["rotwein", "weißwein", "rosé", "glühwein"],
  "wurst": ["salami", "schinken", "wiener", "bockwurst", "fleischwurst", "leberkäse", "aufschnitt", "bratwurst", "mettwurst", "mortadella", "leberwurst"]
};

// Normalisiert Supermärkte auf einheitliches Format
const MARKET_NORMALIZATION: Record<string, string> = {
  'PENNY': 'Penny',
  'penny': 'Penny',
  'ALDI': 'Aldi',
  'aldi': 'Aldi',
  'ALDI NORD': 'Aldi',
  'ALDI Nord': 'Aldi',
  'aldi nord': 'Aldi',
  'ALDI SÜD': 'Aldi',
  'ALDI Süd': 'Aldi',
  'aldi süd': 'Aldi',
  'ALDI FOTO': 'Aldi',
  'ALDI REISEN': 'Aldi',
  'ALDI TALK': 'Aldi',
  'LIDL': 'Lidl',
  'lidl': 'Lidl',
  'REWE': 'Rewe',
  'rewe': 'Rewe',
  'EDEKA': 'Edeka',
  'edeka': 'Edeka',
};

/**
 * Lädt und parst Angebote aus der JSONL-Datei
 */
export function loadOffers(): Offer[] {
  try {
    const filePath = join(process.cwd(), 'Angebote', 'latest', 'Angebote.txt');
    const fileContent = readFileSync(filePath, 'utf-8');

    const offers: Offer[] = [];
    const lines = fileContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Überspringe leere Zeilen, Markdown-Code-Blöcke und Trennlinien
      if (!line || line.startsWith('#') || line.startsWith('```') || line.startsWith('---') || line.startsWith('***') || line === '-----') {
        continue;
      }

      // Überspringe Zeilen, die offensichtlich kein JSON sind
      if (!line.startsWith('{')) {
        continue;
      }

      try {
        const offer = JSON.parse(line) as Offer;
        offers.push(offer);
      } catch (parseError) {
        // Silent fail - nur wichtige Fehler loggen
        // console.error(`Fehler beim Parsen von Zeile ${i + 1}:`, parseError);
      }
    }

    return offers;
  } catch (error) {
    console.error('Fehler beim Laden der Angebote:', error);
    return [];
  }
}

/**
 * Normalisiert einen Text für die Suche
 * - Lowercase
 * - Trim
 * - Unicode-Hyphen → '-'
 * - Doppelte Spaces entfernen
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u2010-\u2015]/g, '-') // Unicode-Hyphens
    .replace(/\s+/g, ' '); // Doppelte Spaces
}

/**
 * Erweitert einen Suchbegriff um Synonyme
 */
function expandWithSynonyms(term: string): string[] {
  const normalized = normalizeText(term);
  const terms = [normalized];

  // Prüfe Synonyme
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (normalized.includes(key) || synonyms.some(syn => normalized.includes(syn))) {
      terms.push(key, ...synonyms);
    }
  }

  return [...new Set(terms)]; // Duplikate entfernen
}

/**
 * Filtert Angebote nach ausgewählten Supermärkten
 */
export function filterByMarkets(offers: Offer[], selectedMarkets: string[]): Offer[] {
  const normalizedMarkets = selectedMarkets.map(m => normalizeText(m));

  return offers.filter(offer => {
    const offerMarket = normalizeText(offer.supermarket);
    return normalizedMarkets.some(market => offerMarket === market);
  });
}

/**
 * Sucht nach Keywords in Angeboten
 * Sucht in: product_name, brand, variant
 */
export function searchOffers(offers: Offer[], query: string): Offer[] {
  const searchTerms = expandWithSynonyms(query);

  return offers.filter(offer => {
    const searchableText = normalizeText(
      [
        offer.product_name,
        offer.brand || '',
        offer.variant || '',
      ].join(' ')
    );

    // Ein Treffer in einem der erweiterten Suchbegriffe reicht
    return searchTerms.some(term => searchableText.includes(term));
  });
}

/**
 * Formatiert ein Datum von YYYY-MM-DD zu DD.MM.
 */
function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.`;
}

/**
 * Erstellt einen DateRange-String im Format "DD.MM. - DD.MM.YYYY"
 */
function createDateRange(validFrom: string, validTo: string): string {
  const fromFormatted = formatDate(validFrom);
  const [year, month, day] = validTo.split('-');
  const toFormatted = `${day}.${month}.${year}`;

  return `${fromFormatted} - ${toFormatted}`;
}

/**
 * Normalisiert Supermarkt-Namen auf UI-Format
 * Versucht zuerst exakte Übereinstimmung, dann case-insensitive
 */
function normalizeMarketName(market: string): string {
  // Exakte Übereinstimmung
  if (MARKET_NORMALIZATION[market]) {
    return MARKET_NORMALIZATION[market];
  }

  // Case-insensitive Suche
  const marketLower = market.toLowerCase();
  for (const [key, value] of Object.entries(MARKET_NORMALIZATION)) {
    if (key.toLowerCase() === marketLower) {
      return value;
    }
  }

  // Fallback: Capitalized
  return market.charAt(0).toUpperCase() + market.slice(1).toLowerCase();
}

/**
 * Konvertiert ein Offer zu einem ProductCard
 */
export function toProductCard(offer: Offer): ProductCard {
  // Erstelle eine eindeutige ID aus supermarket + product_name + price
  const id = normalizeText(
    `${offer.supermarket}-${offer.product_name}-${offer.price}`
  ).replace(/\s+/g, '-');

  // Baue den Produktnamen zusammen
  let name = offer.product_name;
  if (offer.variant) {
    name += ` - ${offer.variant}`;
  }
  if (offer.pack_size) {
    name += ` (${offer.pack_size})`;
  }

  return {
    id,
    name,
    price: offer.price.toFixed(2),
    market: normalizeMarketName(offer.supermarket),
    dateRange: createDateRange(offer.valid_from, offer.valid_to),
    brand: offer.brand || undefined,
    uvp: offer.uvp ? offer.uvp.toFixed(2) : undefined,
    discount_pct: offer.discount_pct || undefined,
    notes: offer.notes || undefined,
  };
}

/**
 * Hauptfunktion: Lädt, filtert und sucht Angebote
 * @param selectedMarkets - Array der ausgewählten Supermärkte
 * @param query - Suchbegriff
 * @returns Array von ProductCards
 */
export function findOffers(
  selectedMarkets: string[],
  query: string
): ProductCard[] {
  // 1. Lade alle Angebote
  const allOffers = loadOffers();

  // 2. Filtere nach ausgewählten Märkten
  const marketFiltered = filterByMarkets(allOffers, selectedMarkets);

  // 3. Suche nach Keywords
  const searchResults = searchOffers(marketFiltered, query);

  // 4. Konvertiere zu ProductCards
  return searchResults.map(toProductCard);
}
