import { readFileSync } from 'fs';
import { join } from 'path';
import type { Offer, ProductCard } from '@/types';

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
  // Erstelle eine eindeutige ID aus supermarket + product_name + variant + size + price
  const id = normalizeText(
    `${offer.supermarket}-${offer.product_name}-${offer.variant || ''}-${offer.size || ''}-${offer.price}`
  ).replace(/\s+/g, '-');

  return {
    id,
    name: offer.product_name,
    price: (typeof offer.price === 'number' && Number.isFinite(offer.price) && offer.price > 0)
      ? offer.price.toFixed(2)
      : 'Tagesaktueller Preis - Im Markt erfragen',
    market: normalizeMarketName(offer.supermarket),
    dateRange: createDateRange(offer.valid_from, offer.valid_to),
    brand: offer.brand || undefined,
    variant: offer.variant || undefined,
    pack_size: offer.size || undefined,
    notes: offer.notes || undefined,
  };
}
