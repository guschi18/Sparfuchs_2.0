<!-- Source: lib/data/offers.ts -->

# offers.ts Documentation

## Architektur & Zweck
- **Zweck**: Core-Datenmodul für Angebots-Verwaltung und Produktsuche
- **Runtime**: Node.js (Server-Side Only)
- **Hauptverantwortung**: Laden, Filtern, Suchen und Transformieren von Supermarkt-Angeboten
- **Integration**: Wird von `/api/chat/route.ts` verwendet für KI-basierte Produktsuche


## Dependencies & Integration
- **Node.js Built-ins**: `fs` (readFileSync), `path` (join)
- **Type Imports**: `@/types` (Offer, ProductCard)
- **Daten-Quelle**: `Angebote/latest/Angebote.txt` (JSONL-Format, ~1574 Angebote)
- **Externe Integration**:
  - Query-Logging System (`scripts/Queries/query-logger.ts`)
  - Synonym Management System (`scripts/Synonyms/`)


## Kritische Datenstrukturen

### SYNONYMS Dictionary (Zeile 6-129)
**Zweck**: Semantische Suche durch Kategorie-zu-Synonym-Mapping

```typescript
export const SYNONYMS: Record<string, string[]> = {
  "milch": ["arla", "frische milch", "h-milch", "vollmilch", ...],
  "joghurt": ["danone", "müller", "fruchtjoghurt", "skyr", ...],
  // ... 121 Kategorien mit ~240 Brand-Synonymen
}
```

**Management**:
- Manuell gepflegt + automatisch generiert via `scripts/Synonyms/`
- Wöchentliches Update-Workflow empfohlen
- Aktuelle Coverage: 26.9% (619/2299 Begriffe)

### MARKET_NORMALIZATION (Zeile 132-152)
**Zweck**: Einheitliche Supermarkt-Namen-Normalisierung

```typescript
const MARKET_NORMALIZATION: Record<string, string> = {
  'ALDI': 'Aldi',
  'ALDI NORD': 'Aldi',
  'LIDL': 'Lidl',
  // ... 12 Varianten
}
```

**Fallback**: Capitalized First Letter (Zeile 308)


## Geschäftslogik

### 1. Daten-Loading: `loadOffers()` (Zeile 157-192)
**Input**: JSONL-Datei (`Angebote/latest/Angebote.txt`)
**Output**: `Offer[]`
**Robustheit**:
- Überspringt leere Zeilen, Markdown-Blöcke, Trennlinien
- Überspringt non-JSON Zeilen (nur Zeilen mit `{` am Anfang)
- Silent fail bei Parse-Errors (einzelne Zeilen)
- Returns `[]` bei Dateifehler

### 2. Text-Normalisierung: `normalizeText()` (Zeile 201-207)
**Pipeline**:
1. Lowercase
2. Trim whitespace
3. Unicode-Hyphens → `-` (U+2010 bis U+2015)
4. Doppelte Spaces → Single Space

**Use Cases**: Vergleiche, Suche, ID-Generierung

### 3. Synonym-Expansion: `expandWithSynonyms()` (Zeile 212-224)
**Algorithmus**:
```
Input: "milch"
→ normalized: "milch"
→ SYNONYMS lookup: ["arla", "h-milch", "vollmilch", ...]
→ Output: ["milch", "arla", "h-milch", "vollmilch", ...]
```

**Performance**: Set-Deduplizierung am Ende

### 4. Markt-Filterung: `filterByMarkets()` (Zeile 229-236)
**Logik**: Normalisierte String-Equality zwischen `offer.supermarket` und `selectedMarkets`

### 5. Produkt-Suche: `searchOffers()` (Zeile 242-257)
**Suchfelder**:
- `product_name` (required)
- `brand` (optional)
- `variant` (optional)

**Matching**: ANY expanded synonym match in concatenated search text

### 6. Datum-Formatierung (Zeile 262-287)
- `formatDate()`: `YYYY-MM-DD` → `DD.MM.`
- `createDateRange()`: Generiert User-freundliche Datumsstrings
  - `"DD.MM. - DD.MM.YYYY"` (both dates)
  - `"ab DD.MM."` (only validFrom)
  - `"bis DD.MM.YYYY"` (only validTo)
  - `"Gültigkeit unbekannt"` (fallback)

### 7. Transformation: `toProductCard()` (Zeile 314-346)
**Mappings**:
- `id`: Generiert aus `supermarket-product_name-price` (normalized, kebab-case)
- `name`: Zusammengebaut aus `product_name` + `variant` + `pack_size`
- `price`:
  - Valid number → `"X.XX"` (2 decimals)
  - Invalid → `"Tagesaktueller Preis - Im Markt erfragen"`
- `market`: Normalisiert via `normalizeMarketName()`
- `uvp`: String oder Number → String mit 2 Decimals
- `discount_pct`, `notes`: Pass-through (optional)

### 8. Hauptfunktion: `findOffers()` (Zeile 354-377)
**Pipeline**:
1. Load all offers (`loadOffers()`)
2. Filter by markets (`filterByMarkets()`)
3. Search by query (`searchOffers()`)
4. **Sort**: Price-availability first
   - Offers with valid price (> 0) → Top
   - Offers without price → Bottom
5. Transform to ProductCards (`toProductCard()`)

**Return**: `ProductCard[]`


## Error Handling
- **File Not Found**: Returns `[]` (Zeile 189)
- **JSON Parse Error**: Silent skip (Zeile 181-184)
- **Invalid Dates**: Fallback strings (Zeile 286)
- **Invalid Prices**: Fallback text (Zeile 334)
- **Unknown Markets**: Capitalized fallback (Zeile 308)


## Performance Considerations

### 🚀 Optimierungen:
- **Lazy Loading**: Offers nur bei Bedarf geladen (kein globaler Cache)
- **Set-Deduplizierung**: Bei Synonym-Expansion (Zeile 223)
- **Short-circuit**: Filter-Chain stoppt bei leeren Ergebnissen
- **String Normalization**: Einmalig pro Operation

### ⚠️ Bekannte Bottlenecks:
- **File I/O**: ~1574 Angebote pro Request (synchron)
  - **Impact**: ~5-10ms bei SSD
  - **Mitigation**: Möglich via LRU-Cache oder In-Memory Store
- **Synonym Expansion**: O(n*m) - n=Kategorien, m=Synonyme pro Kategorie
  - **Impact**: ~2-3ms bei 121 Kategorien
  - **Mitigation**: Bereits Set-optimiert
- **Sort**: O(n log n) - n=Ergebnisse
  - **Impact**: Vernachlässigbar (<1ms bei <1000 Ergebnissen)

### 📊 Performance-Metriken (geschätzt):
```
loadOffers():          5-10ms   (File I/O)
filterByMarkets():     1-2ms    (Array.filter)
searchOffers():        3-5ms    (Synonym expansion + search)
Sort:                  <1ms     (Small result sets)
toProductCard():       1-2ms    (Mapping)
────────────────────────────────────
Total (findOffers):    10-20ms
```


## Externe Systeme & Workflows

### 1. Query-Logging System (`scripts/Queries/`)
**Integration**: Via `app/api/chat/route.ts` (Zeile 97)
```typescript
logQuery(message, matchingProducts.length, validSelectedMarkets);
```

**Purpose**: Tracken von User-Suchen für Synonym-Optimierung
**Workflow**: Wöchentliche Analyse → Synonym-Updates

### 2. Synonym Management System (`scripts/Synonyms/`)
**Pipeline**:
```
Weekly Offers Update
  ↓
Coverage Analysis (analyze-coverage.ts)
  ↓
CSV Reports (generate-csv-reports.ts)
  ↓
Brand Mapping (smart-brand-mapper.ts)
  ↓
Integration (integrate-smart-mappings.ts)
  ↓
Updated SYNONYMS in offers.ts ✨
```

**Aktuelle Metriken**:
- 121 Kategorien
- ~240 Brand-Synonyme
- 26.9% Coverage (619/2299 unique terms)
- 83 gemappte Top-Brands

**Files**:
- Input: `data/input/uncovered-brands.csv`
- Output: `data/output/smart-brand-mappings.json`
- Integration: Auto-Merge in offers.ts


## Maintenance & Updates

### Wöchentlicher Workflow (EMPFOHLEN):
```bash
# 1. Neue Angebote in Angebote/latest/Angebote.txt platzieren

# 2. Coverage analysieren
cd scripts/Synonyms
npx tsx 1-production/analyze-coverage.ts

# 3. CSV-Reports generieren
npx tsx 1-production/generate-csv-reports.ts

# 4. Brands semi-automatisch mappen (5-10 Min)
npx tsx 1-production/semi-auto-brand-mapper.ts

# 5. Alle Mappings generieren
npx tsx 1-production/smart-brand-mapper.ts

# 6. In offers.ts integrieren
npx tsx 1-production/integrate-smart-mappings.ts

# 7. Coverage validieren
npx tsx 1-production/analyze-coverage.ts
```

**Ergebnis**: Coverage steigt automatisch Woche für Woche! 📈

### Query-Log-Analyse:
```bash
# Nach 1-2 Wochen User-Nutzung
npm run analyze:queries

# Review: logs/query-analysis.json
# → Identifiziere häufige Queries ohne Ergebnisse
# → Erweitere SYNONYMS entsprechend
```


## Security & Privacy
- ✅ Keine User-Daten in SYNONYMS
- ✅ Keine persönlichen Informationen geloggt
- ✅ Query-Logs: Nur Suchtext + Metadaten (keine IPs, User-IDs)
- ✅ Server-Side Only (keine Client-Exposition)


## Testing-Empfehlungen
```typescript
// Unit Tests
describe('normalizeText', () => {
  it('should normalize unicode hyphens', () => {
    expect(normalizeText('Coca‐Cola')).toBe('coca-cola');
  });
});

describe('expandWithSynonyms', () => {
  it('should include base term and synonyms', () => {
    const terms = expandWithSynonyms('milch');
    expect(terms).toContain('milch');
    expect(terms).toContain('h-milch');
  });
});

// Integration Tests
describe('findOffers', () => {
  it('should return sorted results with price first', () => {
    const results = findOffers(['Aldi'], 'milch');
    expect(results[0].price).not.toBe('Tagesaktueller Preis');
  });
});
```


## Related Documentation
- **API Integration**: `docs/app/api/chat/route_documentation.md`
- **Type Definitions**: `docs/types/index_documentation.md`
- **Query-Logging**: `scripts/Queries/README.md`
- **Synonym-Management**: `scripts/Synonyms/README.md`
- **Weekly Workflow**: `scripts/Synonyms/WEEKLY-WORKFLOW.md`


## Change History
- **2025-11**: Initial creation of documentation
- **2025-11**: Synonym Management System integriert (Phase 1.2b, 26.9% Coverage)
- **2025-11**: Query-Logging System hinzugefügt
- **2025-10**: Milch-Synonyme erweitert (Zeile 71)


## Future Considerations
- [ ] **LRU-Cache** für loadOffers() (Performance)
- [ ] **Async File I/O** für bessere Skalierung
- [ ] **Fuzzy Search** für Tippfehler-Toleranz
- [ ] **Phase 1.3**: False-Positive Prevention
- [ ] **Phase 2**: AI-Integration für komplexe Queries
- [ ] **Phase 3**: Rezept-Integration (Chefkoch API)
