<!-- Source: lib/search/semantic.ts, lib/search/cosine.ts -->

# semantic.ts & cosine.ts Documentation

## Architektur & Zweck
- **Zweck**: Implementierung der semantischen Suche mittels Vektor-Embeddings
- **Runtime**: Node.js (Server-Side Only)
- **Hauptverantwortung**:
  - Laden des Vektor-Index (`offers.v1.json`)
  - Generierung von Query-Embeddings
  - Berechnung der Cosine Similarity
  - Ranking und Filterung der Ergebnisse
- **Integration**: Wird von `/api/chat/route.ts` verwendet

## Dependencies & Integration
- **Internal Modules**:
  - `lib/ai/embeddings.ts`: Für Query-Embeddings
  - `lib/data/offers.ts`: Für `toProductCard`, `normalizeText`
  - `lib/utils/constants.ts`: Konfiguration (`TOP_N`, `MIN_SCORE`)
- **Data Source**: `storage/embeddings/offers.v1.json` (Generierter Index)

## Kritische Datenstrukturen

### OfferEmbedding Interface
```typescript
interface OfferEmbedding {
  id: string;
  market: string;
  vector: number[]; // im Index
  // Runtime: Float32Array
  metadata: Offer;
}
```

### In-Memory Cache
- `offerIndexCache`: Globaler Cache für den geladenen Index
- **Größe**: ~100MB (bei ~1600 Angeboten mit 3072-dim Vektoren)
- **Typ**: `OfferEmbedding[]` (mit `Float32Array` Vektoren)

## Geschäftslogik

### 1. Index Loading: `loadOfferIndex()`
- **Lazy Loading**: Lädt Index beim ersten Aufruf
- **Caching**: Speichert Ergebnis in `offerIndexCache`
- **Optimierung**: Konvertiert Vektoren zu `Float32Array` für schnellere Berechnungen
- **Fehlerbehandlung**: Gibt `[]` zurück, wenn Datei fehlt

### 2. Semantic Search: `semanticSearch()`
**Signatur**:
```typescript
async function semanticSearch(
  query: string,
  selectedMarkets: string[] = [],
  topN: number = TOP_N
): Promise<ProductCard[]>
```

**Pipeline**:
1. **Load Index**: Stellt sicher, dass Index geladen ist
2. **Pre-Filter**: Filtert Kandidaten basierend auf `selectedMarkets` (String-Match)
3. **Embedding**: Generiert Vektor für `query` via OpenRouter API
4. **Similarity Search**: Findet Top-N Matches mittels Cosine Similarity
5. **Transform**: Konvertiert Ergebnisse zu `ProductCard[]`

### 3. Cosine Similarity: `cosineSimilarity()` & `findTopN()`
- **Algorithmus**: Standard Cosine Similarity (Dot Product / (NormA * NormB))
- **Optimierung**:
  - Verwendet `Float32Array` für Performance
  - Sortiert alle Kandidaten (schnell genug für < 10k Items)
- **Output**: `ScoredResult<T>[]` (Item + Score)

## Performance Considerations
- **Index Load**: Einmalig ~100ms (File I/O + Parsing)
- **Search Latency**:
  - Embedding API: ~200-500ms (Extern)
  - Vector Search: < 10ms (Lokal, CPU)
- **Memory**: ~100MB RAM dauerhaft belegt (für Index)

## Error Handling
- **Index Missing**: Loggt Warning, returned `[]`
- **API Error**: Loggt Error, returned `[]` (Graceful Degradation)
- **Vector Mismatch**: Wirft Error bei ungleichen Dimensionen

## Related Documentation
- **Offers Data**: `docs/lib/data/offers_documentation.md`
- **Embeddings Client**: `docs/lib/ai/openrouter_documentation.md`
