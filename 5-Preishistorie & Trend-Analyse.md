# Implementierungsplan: Preishistorie & Trend-Analyse

## Überblick

Implementierung einer Preisverlaufs-Visualisierung für SparFuchs-Angebote mit Chart.js. Nutzer können historische Preise der letzten 4-12 Wochen sehen und erhalten "Bester Preis in X Wochen"-Badges.

**Kern-Prinzipien:**
- ✅ Minimal Code Changes (PRIORITY #1)
- ✅ Bestehende Patterns nutzen (JSONL, TypeScript, HeroUI)
- ✅ Keine großen Architektur-Änderungen
- ✅ Einfachheit über Komplexität

---

## Design-Entscheidungen (User Approved)

| Aspekt | Entscheidung | Begründung |
|--------|-------------|------------|
| **Chart Library** | Chart.js + react-chartjs-2 | ~200KB, TypeScript Support, wie im Future-Plan erwähnt |
| **Product Matching** | Getrennt tracken | Verschiedene Packungsgrößen = separate Historie (genauer) |
| **UI Position** | Expandable in ProductCard | Im Chat-Flow, smooth Framer Motion Animation |
| **Saisonale Analyse** | Phase 2 (später) | Fokus auf Basis-Features erst |

---

## Architektur

### 1. Datenstruktur (JSONL-basiert)

**Storage Location:**
```
/storage/price-history/price-history.v1.jsonl
```

**Format:**
```typescript
// Jede Zeile = Ein PriceHistoryRecord
{
  "product_key": "lidl|milch|weihenstephan|1l",  // Normalisiert: market|product|brand|size
  "supermarket": "Lidl",
  "product_name": "Milch",
  "brand": "Weihenstephan",
  "size": "1L",
  "price": 1.19,
  "recordedAt": "2025-11-24T00:00:00.000Z",      // ISO timestamp
  "valid_from": "2025-11-24",
  "valid_to": "2025-11-29"
}
```

**In-Memory Cache:**
```typescript
Map<product_key, PriceHistoryRecord[]>
// Beispiel: "lidl|milch|weihenstephan|1l" -> [12 weeks of records]
```

### 2. Product Matching Strategy

**Schlüssel-Generierung:**
```typescript
function generateProductKey(offer: Offer): string {
  const market = normalizeText(offer.supermarket);        // "lidl"
  const product = normalizeText(offer.product_name);      // "milch"
  const brand = normalizeText(offer.brand || 'eigenmarke'); // "weihenstephan"
  const size = normalizeText(offer.size || '');           // "1l"

  return `${market}|${product}|${brand}|${size}`;
}
```

**Warum getrennt tracken:**
- Milch 1L vs 500ml = unterschiedliche Preisdynamik
- Genauere Trend-Erkennung
- Nutzer vergleichen konkrete Packungsgrößen

### 3. Trend-Berechnung

```typescript
interface PriceTrend {
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  weeksSinceLowest: number;      // Für "Bester Preis in X Wochen" Badge
  trend: 'rising' | 'falling' | 'stable';
  history: PricePoint[];          // Für Chart.js
}

interface PricePoint {
  date: string;      // "2025-11-24"
  price: number;     // 1.19
}
```

**Trend-Logik:**
```typescript
function calculateTrend(history: PriceHistoryRecord[]): PriceTrend {
  // 1. Sortiere nach Datum (neueste zuletzt)
  // 2. Finde min/max/avg Preis
  // 3. Berechne Wochen seit niedrigstem Preis
  // 4. Trend: Vergleiche letzte 2 Wochen mit Durchschnitt
  //    - Falling: Aktuell < Durchschnitt - 5%
  //    - Rising: Aktuell > Durchschnitt + 5%
  //    - Stable: Innerhalb ±5%
}
```

### 4. UI Integration

**ProductCard Erweiterung:**
```tsx
// Vor Expansion (Standard)
┌─────────────────────────────────────┐
│  📅 24.11. - 29.11.2025  [+]        │
├─────────────────────────────────────┤
│  WEIHENSTEPHAN                      │
│  Frische Vollmilch 3,5%             │
│  1L                                 │
├─────────────────────────────────────┤
│         1.19 €                      │
│  ✅ Bester Preis in 8 Wochen        │  <- Neu: Badge wenn lowestPrice
│  📊 Preisverlauf anzeigen ▼         │  <- Neu: Toggle
└─────────────────────────────────────┘

// Nach Expansion (Framer Motion smooth)
┌─────────────────────────────────────┐
│  📅 24.11. - 29.11.2025  [+]        │
├─────────────────────────────────────┤
│  WEIHENSTEPHAN                      │
│  Frische Vollmilch 3,5%             │
│  1L                                 │
├─────────────────────────────────────┤
│         1.19 €                      │
│  ✅ Bester Preis in 8 Wochen        │
│  📊 Preisverlauf anzeigen ▲         │
│                                     │
│  ┌───────────────────────────────┐ │  <- Neu: Chart.js Line Chart
│  │  Preisverlauf (12 Wochen)     │ │
│  │                               │ │
│  │  €1.49  ┌──┐                 │ │
│  │         │  └──┐              │ │
│  │  €1.29     └──┼──┐           │ │
│  │                └──●  <- Jetzt│ │
│  │  €1.09                        │ │
│  │  ─────────────────────────────│ │
│  │  Okt  Nov  Dez  Jan           │ │
│  │                               │ │
│  │  Ø 1.35€ | Min 1.19€ | Max 1.49€ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Chart.js Konfiguration:**
```typescript
{
  type: 'line',
  data: {
    labels: ['24.11', '01.12', '08.12', '15.12', ...],  // Wöchentliche Labels
    datasets: [{
      label: 'Preis (€)',
      data: [1.49, 1.39, 1.29, 1.19, ...],
      borderColor: 'var(--sparfuchs-success)',  // Grün #28A745
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      tension: 0.3,  // Smooth curves
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  }
}
```

---

## Implementierungs-Schritte

### Phase 1: Daten-Fundament (2-3 Stunden)

#### 1.1 Typen erweitern
**Datei:** `types/index.ts`

**Änderungen:**
```typescript
// Neu hinzufügen am Ende der Datei
export interface PriceHistoryRecord {
  product_key: string;
  supermarket: string;
  product_name: string;
  brand: string | null;
  size: string | null;
  price: number;
  recordedAt: string;     // ISO timestamp
  valid_from: string;
  valid_to: string;
}

export interface PriceTrend {
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  weeksSinceLowest: number;
  trend: 'rising' | 'falling' | 'stable';
  history: PricePoint[];
}

export interface PricePoint {
  date: string;
  price: number;
}

// ProductCard interface erweitern (bestehende Zeile 46-56)
export interface ProductCard {
  id: string;
  name: string;
  price: string;
  market: string;
  dateRange: string;
  brand?: string;
  variant?: string;
  pack_size?: string;
  notes?: string;
  priceTrend?: PriceTrend;  // <- NEU: Optional, nur wenn Historie verfügbar
}
```

**Lines Modified:** ~15 neue Zeilen

---

#### 1.2 Price History Loader erstellen
**Neue Datei:** `lib/data/priceHistory.ts`

**Pattern:** Analog zu `lib/data/offers.ts` (JSONL-Loading)

**Hauptfunktionen:**
```typescript
// 1. Load price history from JSONL
export function loadPriceHistory(): Map<string, PriceHistoryRecord[]>

// 2. Generate product key from offer
export function generateProductKey(offer: Offer): string

// 3. Get price trend for a specific product
export function getPriceTrend(
  productKey: string,
  currentPrice: number
): PriceTrend | null

// 4. In-memory cache (lazy load on first request)
let priceHistoryCache: Map<string, PriceHistoryRecord[]> | null = null;
```

**Implementierung:** ~120 Zeilen (ähnlich wie `offers.ts`)

---

#### 1.3 Build Script erstellen
**Neue Datei:** `scripts/price-history/build-price-history.ts`

**Pattern:** Analog zu `scripts/embedding/build-offer-index.ts` (OHNE API-Calls)

**Logik:**
1. Lese alle Archive aus `/Angebote/Archiv/`
2. Parse jede Woche-Datei (JSONL)
3. Für jedes Offer:
   - Generiere `product_key`
   - Erstelle `PriceHistoryRecord`
   - Dedupliziere (gleicher Key + Datum = nur 1 Eintrag)
4. Schreibe in `/storage/price-history/price-history.v1.jsonl`

**Storage Directory erstellen:**
```bash
mkdir -p storage/price-history
```

**npm Script hinzufügen:**
```json
// In package.json
"scripts": {
  "price-history:build": "tsx scripts/price-history/build-price-history.ts"
}
```

**Implementierung:** ~150 Zeilen

---

### Phase 2: API Integration (1 Stunde)

#### 2.1 Chat API erweitern
**Datei:** `app/api/chat/route.ts`

**Änderung:** Minimal (~10 Zeilen)

**Wo:** In der Funktion, die `toProductCard()` aufruft

**Vorher:**
```typescript
const productCard = toProductCard(offer);
```

**Nachher:**
```typescript
const productCard = toProductCard(offer);

// Anreichern mit Preisverlauf (falls verfügbar)
const productKey = generateProductKey(offer);
const priceTrend = getPriceTrend(productKey, offer.price || 0);
if (priceTrend) {
  productCard.priceTrend = priceTrend;
}
```

**Import hinzufügen:**
```typescript
import { generateProductKey, getPriceTrend } from '@/lib/data/priceHistory';
```

**Lines Modified:** ~15 Zeilen

---

### Phase 3: UI Components (3-4 Stunden)

#### 3.1 Price History Chart Component
**Neue Datei:** `app/components/Chat/PriceHistoryChart.tsx`

**Props:**
```typescript
interface PriceHistoryChartProps {
  priceTrend: PriceTrend;
  productName: string;
}
```

**Funktionalität:**
- Chart.js Line Chart
- Responsive Container (200px height)
- Brand colors (--sparfuchs-success)
- Statistiken: Ø / Min / Max
- Keine Animation beim Laden (bessere Performance)

**Dependencies (Chart.js):**
```typescript
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js';

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);
```

**Implementierung:** ~80 Zeilen

---

#### 3.2 ProductCard erweitern
**Datei:** `app/components/Chat/ProductCard.tsx`

**Änderungen:** ~40 Zeilen hinzufügen

**Neue Imports:**
```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PriceHistoryChart } from './PriceHistoryChart';
```

**State hinzufügen:**
```typescript
const [showPriceHistory, setShowPriceHistory] = useState(false);
```

**UI-Elemente nach Preis-Zeile (line 88-96):**

1. **"Bester Preis" Badge:**
```tsx
{product.priceTrend && product.priceTrend.weeksSinceLowest === 0 && (
  <div className="mt-1 text-sm text-green-600 font-semibold">
    ✅ Bester Preis in {product.priceTrend.history.length} Wochen
  </div>
)}
```

2. **Toggle Button:**
```tsx
{product.priceTrend && (
  <button
    onClick={(e) => {
      e.stopPropagation();  // Verhindere Card-Click
      setShowPriceHistory(!showPriceHistory);
    }}
    className="mt-2 text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1"
  >
    📊 Preisverlauf anzeigen {showPriceHistory ? '▲' : '▼'}
  </button>
)}
```

3. **Expandable Chart Section (Framer Motion):**
```tsx
<AnimatePresence>
  {showPriceHistory && product.priceTrend && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 150 }}
      className="mt-3 overflow-hidden"
    >
      <PriceHistoryChart
        priceTrend={product.priceTrend}
        productName={product.name}
      />
    </motion.div>
  )}
</AnimatePresence>
```

**Lines Modified:** ~40 Zeilen

---

#### 3.3 Dependencies hinzufügen
**Datei:** `package.json`

**Neue Dependencies:**
```json
"dependencies": {
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0"
}
```

**Installation:**
```bash
npm install chart.js react-chartjs-2
```

**Bundle Size Impact:** ~200KB uncompressed (~60KB gzipped)

---

### Phase 4: Dokumentation & Testing (2 Stunden)

#### 4.1 Dokumentation erstellen
**Neue Dateien:**
- `docs/lib/data/priceHistory_documentation.md` (API-Referenz)
- `docs/app/components/Chat/PriceHistoryChart_documentation.md` (Component Docs)

**Update:**
- `README.md` (Feature-Beschreibung)
- `docs/dependency-docs.md` (Chart.js hinzufügen)

#### 4.2 Tests schreiben
**Neue Datei:** `lib/data/__tests__/priceHistory.test.ts`

**Test Cases:**
```typescript
describe('Price History', () => {
  test('generateProductKey normalizes correctly', () => {
    // Test: "LIDL|MILCH|Weihenstephan|1L" -> "lidl|milch|weihenstephan|1l"
  });

  test('getPriceTrend calculates correctly', () => {
    // Test: Lowest/Highest/Average/Trend detection
  });

  test('handles missing history gracefully', () => {
    // Test: Returns null wenn keine Historie
  });
});
```

**Ausführen:**
```bash
npm run test
```

---

### Phase 5: Wartung & Updates (1 Stunde)

#### 5.1 Wöchentlicher Update-Script
**Neue Datei:** `scripts/price-history/update-price-history.ts`

**Logik:**
1. Lese aktuelles `Angebote/latest/Angebote.txt`
2. Generiere `PriceHistoryRecord[]` mit aktuellem Datum
3. Lade bestehende `price-history.v1.jsonl`
4. Merge neue Records (dedupliziere)
5. Schreibe zurück

**npm Script:**
```json
"price-history:update": "tsx scripts/price-history/update-price-history.ts"
```

**Workflow:**
```bash
# Jede Woche nach Angebote-Update
npm run price-history:update
```

#### 5.2 Automatisierung (Optional)
**GitHub Action oder Cron:**
```yaml
# .github/workflows/update-price-history.yml
name: Update Price History
on:
  schedule:
    - cron: '0 2 * * 1'  # Jeden Montag 2 Uhr
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run price-history:update
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "chore: update price history"
```

---

## Kritische Dateien

### Neue Dateien (5):
1. `lib/data/priceHistory.ts` (~120 Zeilen)
2. `scripts/price-history/build-price-history.ts` (~150 Zeilen)
3. `scripts/price-history/update-price-history.ts` (~100 Zeilen)
4. `app/components/Chat/PriceHistoryChart.tsx` (~80 Zeilen)
5. `storage/price-history/price-history.v1.jsonl` (generiert)

### Modifizierte Dateien (3):
1. `types/index.ts` (~15 neue Zeilen)
2. `app/components/Chat/ProductCard.tsx` (~40 neue Zeilen)
3. `app/api/chat/route.ts` (~15 neue Zeilen)
4. `package.json` (2 Dependencies)

**Total Impact:** ~450 neue Zeilen + 70 Zeilen Änderungen

---

## Testing-Strategie

### Unit Tests
```bash
npm run test -- priceHistory.test.ts
```

**Coverage:**
- `generateProductKey()` - Normalisierung
- `getPriceTrend()` - Trend-Berechnung
- `loadPriceHistory()` - JSONL-Loading

### Integration Tests
```bash
npm run dev
```

**Manual Testing:**
1. Build price history: `npm run price-history:build`
2. Starte App: `npm run dev`
3. Frage nach bekanntem Produkt (z.B. "Milch von Lidl")
4. Prüfe ob Chart angezeigt wird
5. Teste Expand/Collapse Animation
6. Prüfe "Bester Preis" Badge

### Performance Tests
- Bundle Size: `npm run build:analyze`
- Load Time: Chrome DevTools Network Tab
- Chart Render: Chrome DevTools Performance Tab

**Akzeptanzkriterien:**
- Build Size < 500KB zusätzlich
- Initial Load < 3s
- Chart Expand < 300ms

---

## Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Chart.js Bundle zu groß | Niedrig | Mittel | Tree-shaking, lazy loading, nur nötige Module importieren |
| Produkt-Matching fehlt | Mittel | Hoch | Getrennte Keys für verschiedene Größen, Brand fallback auf "eigenmarke" |
| Archiv-Daten inkonsistent | Mittel | Mittel | Validierung beim Build, Fehler-Logging, graceful fallback |
| Performance bei 1000+ Records | Niedrig | Mittel | In-memory cache, nur letzten 12 Wochen, Pagination optional |
| Framer Motion Konflikte | Niedrig | Niedrig | Bereits im Projekt, bewährte Patterns nutzen |

---

## Performance-Optimierung

### 1. Lazy Loading
```typescript
// Chart.js nur laden wenn expandiert
const PriceHistoryChart = lazy(() => import('./PriceHistoryChart'));
```

### 2. Memoization
```typescript
// Trend-Berechnung cachen
const priceTrend = useMemo(
  () => getPriceTrend(productKey, currentPrice),
  [productKey, currentPrice]
);
```

### 3. Data Limiting
- Nur letzte 12 Wochen anzeigen (nicht alle Historie)
- Wöchentliche Aggregation (nicht täglich)

### 4. Bundle Optimization
```typescript
// Nur benötigte Chart.js Komponenten importieren
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js';
// NICHT: import Chart from 'chart.js/auto';
```

---

## Deployment Checklist

- [ ] Dependencies installiert: `npm install chart.js react-chartjs-2`
- [ ] Types erweitert in `types/index.ts`
- [ ] Price History Loader erstellt: `lib/data/priceHistory.ts`
- [ ] Build Script erstellt: `scripts/price-history/build-price-history.ts`
- [ ] Update Script erstellt: `scripts/price-history/update-price-history.ts`
- [ ] Chart Component erstellt: `app/components/Chat/PriceHistoryChart.tsx`
- [ ] ProductCard erweitert mit Expansion
- [ ] Chat API erweitert mit Trend-Daten
- [ ] Storage Verzeichnis erstellt: `storage/price-history/`
- [ ] Initial Build ausgeführt: `npm run price-history:build`
- [ ] Tests geschrieben und grün: `npm run test`
- [ ] Build erfolgreich: `npm run build`
- [ ] Dokumentation aktualisiert
- [ ] `docs/dependency-docs.md` erweitert (Chart.js)
- [ ] Manual Testing durchgeführt
- [ ] Performance Check (Bundle Size)

---

## Beispiel-Workflow (End-to-End)

### 1. Initiales Setup
```bash
# Dependencies installieren
npm install chart.js react-chartjs-2

# Storage erstellen
mkdir -p storage/price-history

# Historische Daten bauen (einmalig)
npm run price-history:build
```

### 2. Entwicklung
```bash
# Dev Server starten
npm run dev

# In anderem Terminal: Tests im Watch Mode
npm run test:watch
```

### 3. Wöchentliche Updates
```bash
# Nach neuem Angebote-Import
npm run price-history:update

# Optional: Neu bauen falls Archiv erweitert
npm run price-history:build
```

### 4. Deployment
```bash
# Production Build
npm run build

# Bundle Size prüfen
npm run build:analyze

# Deploy (z.B. Vercel)
vercel deploy
```

---

## Nächste Schritte (Phase 2 - Später)

### Saisonale Muster-Erkennung (aus Future-Plan)
- KI-basierte Analyse: "Erdbeeren im Juni am günstigsten"
- Requires: Mindestens 1 Jahr historische Daten
- ML-Modell oder OpenRouter API für Trend-Vorhersage
- UI: Badge "🌟 Saisonales Tief" oder "⚠️ Saisonal teurer"

### Weitere Features (Optional)
- Email-Benachrichtigungen bei Preis-Drops
- Export als CSV/PDF
- Vergleich mehrerer Produkte
- Preis-Alarm Schwellenwerte

---

## Zusammenfassung

**Was wird implementiert:**
- ✅ Graphische Darstellung von Preisentwicklungen (4-12 Wochen)
- ✅ "Bester Preis in X Wochen"-Badge
- ✅ Historische Daten in JSONL speichern
- ✅ Chart.js Integration

**Was NICHT in Phase 1:**
- ❌ Saisonale Muster-Erkennung (→ Phase 2)
- ❌ Push-Benachrichtigungen (→ separates Feature)
- ❌ Preisalarm (→ separates Feature)

**Aufwand:**
- Entwicklung: ~7-10 Stunden
- Bundle Impact: ~200KB (~60KB gzipped)
- Code Impact: ~520 Zeilen (450 neu + 70 modifiziert)

**Erfolgsmetriken:**
- Build erfolgreich
- Tests grün (>80% Coverage)
- Bundle Size < +500KB
- Chart rendert < 300ms
- User Feedback positiv
