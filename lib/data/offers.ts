import { readFileSync } from 'fs';
import { join } from 'path';
import type { Offer, ProductCard } from '@/types';

// Synonyme für bessere Suchergebnisse
export const SYNONYMS: Record<string, string[]> = {
  "adventskalender": ["kalender", "schokoladenkalender", "weihnachtskalender"],
  "alkohol": ["bier", "likör", "rum", "schnaps", "sekt", "spirituosen", "wein", "whisky", "wodka"],
  "almighurt": ["almighurt"],
  "apfel": ["braeburn", "elstar", "kanzi", "rote äpfel", "äpfel"],
  "aufschnitt": ["bratenaufschnitt", "deluxe", "dulano", "edeka genussmomente", "finesse", "geflügelwurst", "gutfried", "herta", "käseaufschnitt", "rügenwalder", "rügenwalder mühle", "salami", "schinken", "wiltmann", "wurst", "wurstaufschnitt"],
  "baby-musikspielzeug": ["baby-musikspielzeug"],
  "backartikel": ["backmischung", "backzutaten", "haselnüsse", "hefe", "kuvertüre", "mandeln", "mehl", "nüsse", "streusel", "vanillinzucker", "zucker"],
  "backmischung": ["belbake", "dr oetker", "kuchenzauber", "puda"],
  "backwaren": ["baguette", "brot", "brötchen", "croissant", "gebäck", "kuchen", "muffin", "strudel", "toast", "torte", "waffeln"],
  "backzutaten": ["belbake", "diamant", "puda"],
  "banane": ["bananen", "bio-bananen"],
  "batterien longlife power": ["batterien longlife power"],
  "bier": ["beck s", "bitburger", "corona", "einbecker", "helles", "jever", "krombacher", "perlenbacher", "pils", "veltins", "warsteiner", "weizen", "weißbier"],
  "blumen": ["amaryllis", "chrysanthemen", "heidekraut", "orchidee", "pflanzen", "rosen"],
  "bonbons": ["storck"],
  "brot": ["das pure", "knäckebrot", "sandwichbrot", "toast", "vollkornbrot", "weißbrot"],
  "brotaufstrich": ["erdnussbutter", "gelee", "honig", "hummus", "konfitüre", "lemon curd", "marmelade", "nuss-nougat-creme", "nutella", "pistaziencreme"],
  "brötchen": ["aufbackbrötchen", "brunch mix", "coppenrath wiese", "laugenbrötchen", "schrippe", "semmel", "unsere goldstücke", "weizenbrötchen"],
  "burger": ["beef burger", "burger patties", "butcher s by penny", "cheeseburger", "chicken burger", "hamburger", "veganer burger"],
  "butter": ["arla", "arla finello", "deutsche markenbutter", "kerrygold", "markenbutter", "milbona", "rahmbutter", "süßrahmbutter", "weihenstephan"],
  "butterkekse": ["bahlsen"],
  "cerealien": ["nestl"],
  "chicken nuggets xxl": ["chicken", "geflügel", "hähnchennuggets", "nuggets"],
  "chips": ["crunchips", "erdnussflips", "frit-sticks", "funny-frisch", "hey clay", "kartoffelchips", "lay s", "layenberger", "lays", "lorenz", "monster munch", "play-doh", "pommels", "pringles", "saltletts", "stapelchips", "tortillas"],
  "cola": ["coca-cola", "coke", "dr. pepper", "pepsi", "schwip schwap"],
  "cornflakes": ["nestl"],
  "dessert": ["danon", "danone", "eis", "grand dessert", "götterspeise", "joghurt", "milsani", "monte", "mousse", "müller", "pudding", "zott"],
  "duschgel": ["duschbad", "körperpflege", "shower gel"],
  "eier": ["bioland", "naturgut", "naturgut bio", "rewe bio"],
  "eis": ["ben & jerry's", "eiscreme", "eiskonfekt", "langnese", "magnum", "mövenpick", "nuii", "stieleis"],
  "energydrink": ["booster", "energy", "monster", "red bull", "rockstar"],
  "erdnüsse": ["lorenz", "ültje"],
  "essiggurken": ["kühne"],
  "wc": ["toilette"],
  "feinkost": ["edeka genussmomente"],
  "fertiggericht": ["5-minuten-terrine", "baguette", "chili con carne", "eintopf", "maultaschen", "pfannengericht", "pizza", "ravioli", "spaghetteria", "suppe", "tiefkühlgericht"],
  "fisch": ["backfisch", "fischerstolz", "fischerstolz bio", "fischstäbchen", "garnelen", "golden seafood", "gourmet", "lachs", "muscheln", "rotbarsch", "schlemmerfilet", "seelachs", "thunfisch"],
  "fix soße": ["bratensauce", "sauce"],
  "fleisch": ["bauern gut", "bauerngut", "braten", "butcher s by penny", "ente", "geschnetzeltes", "gourmet", "gulasch", "hackfleisch", "hähnchen", "kasseler", "lamm", "meine metzgerei", "metzgerfrisch", "metzgerfrisch premium", "mühlenhof", "naturgut", "naturgut bio", "pute", "rewe regional", "rind", "rouladen", "schnitzel", "schwein", "steak"],
  "frischkäse": ["bresso", "buko", "exquisa", "frischkäsezubereitung", "kräuterquark", "milbona", "miree", "philadelphia"],
  "gebäck": ["bahlsen"],
  "geflügel": ["gourmet", "mühlenhof"],
  "gemüse": ["bioland", "blumenkohl", "bohnen", "bonduelle", "brokkoli", "champignons", "frosta", "gurke", "gurken", "kartoffeln", "kürbis", "mais", "marktliebe", "naturgut", "naturgut bio", "paprika", "rewe bio", "rewe regional", "rosenkohl", "rotkohl", "salat", "sauerkraut", "spinat", "tomaten", "zwiebeln"],
  "getränk": ["eistee", "haferdrink", "limonade", "milchshake", "nektar", "saft", "schorle", "smoothie", "wasser"],
  "gewürze": ["gewürzmischung", "just spices", "knorr", "kräuter", "maggi", "pfeffer", "salz"],
  "grünkohl": ["grünkohl", "kohl"],
  "hackfleisch": ["gemischtes hack", "hack", "mett", "metzgerfrisch", "metzgerfrisch premium", "rinderhack", "schweinehack", "tartar"],
  "hähnchen": ["chicken nuggets", "chicken wings", "geflügel", "huhn", "hähnchenbrust", "hähnchenschenkel", "pute"],
  "joghurt": ["actimel", "danon", "danone", "fruchtjoghurt", "fruchtzwerge", "joghurt mit der ecke", "jogurt", "landliebe", "milbona", "milprima", "milsani", "müller", "naturjoghurt", "skyr", "yogurt", "yopro", "zott"],
  "kaffee": ["cappuccino", "coffeeb", "dallmayr", "espresso", "filterkaffee", "jacobs", "kaffeebohnen", "kapseln", "latte macchiato", "lavazza", "löslicher kaffee", "melitta", "nescafé", "pads", "senseo", "starbucks", "tchibo"],
  "kartoffelprodukte": ["best moments", "chips", "frites", "kartoffeln", "kartoffelpuffer", "kartoffelsalat", "knödel", "kroketten", "pfanni", "pommes", "rösti"],
  "katzenfutter": ["felix", "hundefutter", "katzennahrung", "leckerli", "lucky cat", "lucky dog", "nassfutter", "pedigree", "purina", "sheba", "trockenfutter", "whiskas"],
  "kekse": ["bahlsen", "butterkekse", "cookies", "leibniz", "mikado", "oreo", "prinzenrolle", "spekulatius"],
  "ketchup": ["heinz"],
  "kiwi": ["zespri"],
  "knödel": ["best moments", "pfanni"],
  "konfitüre": ["bonne maman", "schwartau", "zentis"],
  "konserven": ["bonduelle", "edeka", "gut günstig", "kühne", "rewe beste wahl"],
  "kuchen": ["apfelstrudel", "berliner", "bienenstich", "blechkuchen", "brownie", "coppenrath wiese", "donauwelle", "donut", "dr oetker", "kuchenzauber", "muffin", "pancakes", "schwarzwälderkirsch", "torte"],
  "käse": ["arla", "arla finello", "bergkäse", "camembert", "cheddar", "deluxe", "edeka", "edeka genussmomente", "emmentaler", "feta", "frischkäse", "gouda", "grünländer", "gut günstig", "hirtenkäse", "kaese", "leerdammer", "limburger", "milbona", "mozzarella", "penny", "reibekäse", "rewe beste wahl", "schnittkäse", "weichkäse"],
  "limonade": ["7up", "bionade", "fanta", "granini die limo", "limo", "schwip schwap", "sprite"],
  "margarine": ["becel", "halbfettmargarine", "lätta", "pflanzenmargarine", "rama", "sanella"],
  "marmelade": ["bonne maman", "schwartau", "zentis"],
  "meeresfrüchte": ["fischerstolz", "fischerstolz bio", "golden seafood"],
  "milch": ["arla", "frische milch", "arla finello", "bio-milch", "bioland", "bärenmarke", "edeka", "fettarme milch", "frischmilch", "gut günstig", "h-milch", "laktosefreie vollmilch", "laktosefreie h-vollmilch", "landliebe", "milbona", "milprima", "milsani", "müller", "naturgut", "naturgut bio", "penny", "rewe beste wahl", "rewe bio", "rewe regional", "vollmilch", "haltbare milch"],
  "minis": ["minis"],
  "müsli": ["cerealien", "cornflakes", "haferflocken", "knuspermüsli", "kölln", "lion cereals", "nestl", "smarties cereals", "vitalis"],
  "müsliriegel": ["corny"],
  "nektar": ["solevita"],
  "nudeln": ["3 glocken", "barilla", "birkel", "delverde", "fusilli", "gnocchi", "pasta", "penne", "spaghetti", "teigwaren"],
  "nüsse": ["alesto", "cashews", "erdnüsse", "haselnüsse", "mandeln", "nussmischung", "pistazien", "walnüsse", "ültje"],
  "obst": ["ananas", "bananen", "beeren", "bioland", "birnen", "erdbeeren", "granatapfel", "heidelbeeren", "kiwi", "mandarinen", "mango", "marktliebe", "naturgut", "naturgut bio", "orangen", "rewe bio", "rewe regional", "tafeltrauben", "trauben", "zespri", "äpfel"],
  "pasta": ["delverde"],
  "patties": ["butcher s by penny"],
  "pesto": ["pesto-sauce"],
  "pils": ["beck s", "einbecker", "perlenbacher", "warsteiner"],
  "pilsner": ["pilsner"],
  "pizza": ["big pizza", "die backfrische", "dr oetker", "gustavo gusto", "piccolinis", "pinsa", "steinofenpizza", "tiefkühlpizza", "wagner"],
  "pralinen": ["choceur", "favorina", "trumpf"],
  "pudding": ["dessert", "dr oetker", "ehrmann", "grand dessert", "götterspeise", "high protein pudding", "landliebe", "milsani", "monte", "mousse", "müller"],
  "puderzucker": ["puda"],
  "quark": ["milbona", "milprima", "zott"],
  "reis": ["basmatireis", "ben's original", "express reis", "langkornreis", "milchreis", "risottoreis"],
  "riegel": ["corny", "kinder", "mars"],
  "rotkohl": ["kühne"],
  "rum": ["captain morgan", "havana club"],
  "saft": ["apfelsaft", "fruchtsaft", "granini", "hohes c", "multivitaminsaft", "nektar", "orangensaft", "solevita", "valensina"],
  "sahne": ["milbona", "zott"],
  "salami": ["chorizo", "mettwurst", "peperonisalami"],
  "sauce": ["heinz"],
  "schinken": ["deluxe", "dulano"],
  "schnitzel": ["metzgerfrisch"],
  "schokolade": ["choceur", "daim", "favorina", "ferrero", "kinder", "kinder schokolade", "lindt", "m&m's", "mars", "merci", "milka", "pralinen", "ritter sport", "schogetten", "schokoriegel", "storck", "tafelschokolade", "toffifee", "tony's chocolonely", "trumpf"],
  "sekt": ["champagner", "freixenet", "mm extra", "prosecco", "rotkäppchen", "söhnlein brillant"],
  "senf": ["dijon-senf", "maille", "mostrich"],
  "shampoo": ["gliss kur", "haarpflege", "haarwäsche", "schauma"],
  "smoothie": ["true fruits"],
  "snacks": ["alesto", "chef select", "chips", "duplo", "fruchtgummi", "funny-frisch", "gummibärchen", "hanuta", "haribo", "katjes", "knoppers", "lorenz", "nüsse", "pick up", "riegel", "salzstangen", "trolli"],
  "soße": ["bratensauce", "sauce"],
  "spinat": ["blattspinat", "der mit dem blubb", "iglo", "rahmspinat"],
  "spirituosen": ["absolut", "bacardi", "captain morgan", "chantré", "gin", "gorbatschow", "havana club", "jack daniel's", "jim beam", "jägermeister", "likör", "metaxa", "rum", "schnaps", "smirnoff", "whisky", "wodka"],
  "stapelchips": ["hey clay", "lay s", "layenberger", "play-doh"],
  "suppe": ["brühe", "dosensuppe", "eintopf", "erasco", "knorr", "maggi", "tütensuppe"],
  "süßigkeiten": ["bonbons", "choceur", "favorina", "fritt", "gummibärchen", "kekse", "kinder", "lakritz", "maoam", "pralinen", "riegel", "schokolade", "storck"],
  "tee": ["cupper", "früchtetee", "grüntee", "kräutertee", "meßmer", "schwarztee", "teebeutel", "teekanne"],
  "thermo-jeggings": ["thermo-jeggings"],
  "thermo-leggings": ["thermo-leggings"],
  "tiefkühlgericht": ["best moments", "chef select", "frosta"],
  "tomaten": ["cherrytomaten", "rispentomaten", "romatomaten"],
  "torte": ["coppenrath wiese"],
  "vanille": ["belbake"],
  "vegetarisch": ["rügenwalder", "rügenwalder mühle"],
  "vodka": ["wodka"],
  "waschmittel": ["ariel", "colorwaschmittel", "coral", "flüssigwaschmittel", "lenor", "omo", "persil", "perwoll", "pods", "vollwaschmittel", "waschpulver"],
  "wasser": ["gerolsteiner", "mineralwasser", "sprudelwasser", "stilles wasser", "volvic"],
  "wein": ["glühwein", "rosé", "rotwein", "weinfreunde", "weingut deiß", "weißwein"],
  "whisky": ["jim beam"],
  "wurst": ["aufschnitt", "bauern gut", "bauerngut", "bockwurst", "bratwurst", "deluxe", "dulano", "edeka", "edeka genussmomente", "fleischwurst", "gut günstig", "gutfried", "herta", "leberkäse", "leberwurst", "meica", "meine metzgerei", "mettwurst", "metzgerfrisch", "metzgerfrisch premium", "mortadella", "mühlenhof", "naturgut bio", "penny", "rewe beste wahl", "rügenwalder", "rügenwalder mühle", "salami", "schinken", "wiener", "wiltmann"],
  "würstchen": ["meica"],
  "zahncreme": ["zahncrème", "zahnpasta"],
  "zucker": ["diamant"],
  "öl": ["frittieröl", "mazola", "olivenöl", "rapsöl", "solvel", "sonnenblumenöl", "speiseöl", "thomy"]
};;;

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
function formatDate(dateString?: string | null): string {
  if (typeof dateString !== 'string' || !dateString.includes('-')) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.`;
}

/**
 * Erstellt einen DateRange-String im Format "DD.MM. - DD.MM.YYYY"
 */
function createDateRange(validFrom?: string | null, validTo?: string | null): string {
  const hasFrom = typeof validFrom === 'string' && validFrom.includes('-');
  const hasTo = typeof validTo === 'string' && validTo.includes('-');

  if (hasFrom && hasTo) {
    const fromFormatted = formatDate(validFrom);
    const [year, month, day] = (validTo as string).split('-');
    const toFormatted = `${day}.${month}.${year}`;
    return `${fromFormatted} - ${toFormatted}`;
  }
  if (hasFrom) return `ab ${formatDate(validFrom)}`;
  if (hasTo) {
    const [year, month, day] = (validTo as string).split('-');
    return `bis ${day}.${month}.${year}`;
  }
  return 'Gültigkeit unbekannt';
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
    price: (typeof offer.price === 'number' && Number.isFinite(offer.price) && offer.price > 0)
      ? offer.price.toFixed(2)
      : 'Tagesaktueller Preis - Im Markt erfragen',
    market: normalizeMarketName(offer.supermarket),
    dateRange: createDateRange(offer.valid_from, offer.valid_to),
    brand: offer.brand || undefined,
    uvp: (typeof offer.uvp === 'number' && Number.isFinite(offer.uvp))
      ? offer.uvp.toFixed(2)
      : (typeof (offer as any).uvp === 'string'
          ? (() => { const n = parseFloat((offer as any).uvp); return Number.isFinite(n) ? n.toFixed(2) : undefined; })()
          : undefined),
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

  // 4. Sortiere: Angebote mit gültigem Preis zuerst, danach ohne Preis
  const sortedResults = [...searchResults].sort((a, b) => {
    const aHasPrice = typeof a.price === 'number' && Number.isFinite(a.price) && a.price > 0;
    const bHasPrice = typeof b.price === 'number' && Number.isFinite(b.price) && b.price > 0;
    if (aHasPrice === bHasPrice) return 0;
    return aHasPrice ? -1 : 1;
  });

  // 5. Konvertiere zu ProductCards
  return sortedResults.map(toProductCard);
}
