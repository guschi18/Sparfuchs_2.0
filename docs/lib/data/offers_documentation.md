<!-- Source: lib/data/offers.ts -->

# offers.ts Documentation

## Architektur & Zweck
- **Zweck**: Core-Datenmodul für Angebots-Verwaltung
- **Runtime**: Node.js (Server-Side Only)
- **Hauptverantwortung**: Laden und Transformieren von Supermarkt-Angeboten
- **Integration**: Wird von `scripts/embedding/build-offer-index.ts` verwendet, um den Such-Index zu erstellen.

## Dependencies & Integration
- **Node.js Built-ins**: `fs` (readFileSync), `path` (join)
- **Type Imports**: `@/types` (Offer, ProductCard)
- **Daten-Quelle**: `Angebote/latest/Angebote.txt` (JSONL-Format, ~1574 Angebote)

## Kritische Datenstrukturen

### MARKET_NORMALIZATION (Zeile 6-26)
**Zweck**: Einheitliche Supermarkt-Namen-Normalisierung

```typescript
const MARKET_NORMALIZATION: Record<string, string> = {
  'ALDI': 'Aldi',
  'ALDI NORD': 'Aldi',
  'LIDL': 'Lidl',
  // ... 19 Varianten
}
```

**Fallback**: Capitalized First Letter (Zeile 132)


## Geschäftslogik

### 1. Daten-Loading: `loadOffers()` (Zeile 31-66)
**Input**: JSONL-Datei (`Angebote/latest/Angebote.txt`)
**Output**: `Offer[]`
**Robustheit**:
- Überspringt leere Zeilen, Markdown-Blöcke, Trennlinien
- Überspringt non-JSON Zeilen (nur Zeilen mit `{` am Anfang)
- Silent fail bei Parse-Errors (einzelne Zeilen)
- Returns `[]` bei Dateifehler

### 2. Text-Normalisierung: `normalizeText()` (Zeile 75-81)
**Pipeline**:
1. Lowercase
2. Trim whitespace
3. Unicode-Hyphens → `-` (U+2010 bis U+2015)
4. Doppelte Spaces → Single Space

**Use Cases**: ID-Generierung, Normalisierung für Embeddings

### 3. Datum-Formatierung (Zeile 86-111)
- `formatDate()`: `YYYY-MM-DD` → `DD.MM.`
- `createDateRange()`: Generiert User-freundliche Datumsstrings
  - `"DD.MM. - DD.MM.YYYY"` (both dates)
  - `"ab DD.MM."` (only validFrom)
  - `"bis DD.MM.YYYY"` (only validTo)
  - `"Gültigkeit unbekannt"` (fallback)

### 4. Transformation: `toProductCard()` (Zeile 138-164)
**Mappings**:
- `id`: Generiert aus `supermarket-product_name-price` (normalized, kebab-case)
- `name`: Zusammengebaut aus `product_name` + `variant` + `pack_size`
- `price`:
  - Valid number → `"X.XX"` (2 decimals)
  - Invalid → `"Tagesaktueller Preis - Im Markt erfragen"`
- `market`: Normalisiert via `normalizeMarketName()`
- `notes`: Pass-through (optional)

## Error Handling
- **File Not Found**: Returns `[]` (Zeile 64)
- **JSON Parse Error**: Silent skip (Zeile 55-58)
- **Invalid Dates**: Fallback strings (Zeile 110)
- **Invalid Prices**: Fallback text (Zeile 158)
- **Unknown Markets**: Capitalized fallback (Zeile 132)


## Performance Considerations
- **File I/O**: Synchrones Laden (~5-10ms bei SSD)
- **Optimization**: `loadOffers` sollte nur beim Build/Index-Erstellung aufgerufen werden, nicht zur Runtime (dafür gibt es den Embedding-Index).


## Related Documentation
- **Semantic Search**: `docs/lib/search/semantic_documentation.md` (Neue Such-Logik)
- **Type Definitions**: `docs/types/index_documentation.md`


## Change History
- **2025-11**: Legacy Synonym-System & Such-Logik entfernt (Moved to Semantic Search)
- **2025-11**: `toProductCard` vereinfacht (UVP/Discount entfernt)
- **2025-11**: Initial creation of documentation
