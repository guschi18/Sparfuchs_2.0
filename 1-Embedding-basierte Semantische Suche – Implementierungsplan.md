# Embedding-basierte Semantische Suche – Implementierungsplan

## 🎯 Projektziel

Implementierung eines Embedding-basierten semantischen Suchsystems für SparFuchs, um die aktuellen Limitierungen des Synonym-basierten Systems zu überwinden.

### Warum?
**Aktuelle Probleme:**
- Manuelle Pflege von 121 Kategorien & ~240 Brand-Synonymen (nur 26.9% Coverage)
- Generische Queries ("Gemüse", "Frühstücksideen") fallen durch
- Keine semantische Nähe ("Bio-Apfel" ≠ "Apfel" ohne explizites Synonym)
- KI-Halluzinationen bei leeren Treffersets

**Lösung:**
- Embedding-basierte Suche mit `text-embedding-3-large` (3.072 Dimensionen)
- Automatische semantische Ähnlichkeit ohne manuelle Synonyme
- LRU-Cache für häufige Queries (~80% API-Call-Reduktion)
- Shadow Mode für sichere Migration

---

## 📊 Technische Spezifikation

### Architektur-Komponenten

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BATCH-INDEX-BUILD (Wöchentlich)                          │
│    scripts/embedding/build-offer-index.ts                    │
│    → Lädt Angebote → Erstellt Embeddings → Speichert JSON   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. STORAGE                                                   │
│    storage/embeddings/offers.v1.json (~19 MB)               │
│    { id, market, vector: Float32[], metadata }              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. RUNTIME-RETRIEVAL                                         │
│    lib/search/semantic.ts                                    │
│    → loadOfferIndex() → semanticSearch() → ProductCard[]    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. QUERY-CACHE (LRU, 1000 Einträge)                         │
│    lib/search/embedding-cache.ts                             │
│    → Spart ~80% API-Calls für häufige Queries               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. API-INTEGRATION                                           │
│    app/api/chat/route.ts                                     │
│    → Primary: semanticSearch() → Fallback: findOffers()     │
└─────────────────────────────────────────────────────────────┘
```

### Embedding-Template
```typescript
// Strukturiertes Template (ohne notes für Token-Effizienz)
`${product_name} | Marke: ${brand || 'Eigenmarke'} | ${variant || ''} | ${pack_size || ''}`.trim()
```

### Kosine-Similarity & Ranking
- **Top-N**: 50 Produkte (konfigurierbar via `SEMANTIC_TOP_N`)
- **Min Score**: 0.38 (konfigurierbar via `MIN_COSINE_SCORE`)
- **Market-Filter**: VOR Cosine-Berechnung (Performance!)

---

## 💰 Kosten & Performance

### Korrigierte Kostenkalkulation
**Embedding-Modell**: `text-embedding-3-large` @ $0.13/1M Tokens

| Vorgang                    | Tokens    | Kosten      | Frequenz     |
|----------------------------|-----------|-------------|--------------|
| Initial Batch-Build        | 320k      | **$0.042**  | Einmalig     |
| Wöchentlicher Refresh (10%)| 32k       | **$0.004**  | Wöchentlich  |
| Query-Embeddings (15k/Mo)  | 2.25M     | **$0.30**   | Monatlich    |
| **GESAMT**                 |           | **~$0.35/Mo** |            |

### Performance-Erwartung
- **Aktuell** (Synonym-basiert): ~5-10 ms (komplett lokal)
- **Neu** (Embedding-basiert):
  - Query-Embedding API Call: 200-500 ms (OpenRouter)
  - Cosine Search (lokal): <5 ms
  - **LRU-Cache-Hit**: ~5 ms (wie aktuell!)
  - **Total ohne Cache**: ~205-505 ms
  - **Total mit Cache (~80% Hit-Rate)**: ~50-100 ms average

---

## 📋 Implementierungs-ToDos

### Phase 1: Setup & Infrastruktur ✅
- [ ] **1.1** Ordner `storage/embeddings/` anlegen
- [ ] **1.2** `.env.local` erweitern:
  ```env
  EMBEDDING_PROVIDER=openrouter
  EMBEDDING_MODEL=text-embedding-3-large
  EMBEDDING_API_KEY=<your-key>
  ```
- [ ] **1.3** `lib/utils/constants.ts` ergänzen:
  ```typescript
  export const SEMANTIC_SEARCH_CONFIG = {
    TOP_N: 50,
    MIN_SCORE: 0.38,
    CACHE_SIZE: 1000,
  } as const;
  ```

### Phase 2: Batch-Index-Build 🔨
- [ ] **2.1** `scripts/embedding/build-offer-index.ts` erstellen:
  - `loadOffers()` aus `lib/data/offers.ts` nutzen
  - Embedding-Template implementieren
  - Rate Limiting (max. 100 Requests/Min)
  - Progress Logging (`1/1574 processed...`)
  - Speichern als `storage/embeddings/offers.v1.json`
- [ ] **2.2** `scripts/embedding/refresh-index.ts` erstellen:
  - Lädt alten Index
  - Vergleicht mit aktuellen Angeboten
  - Re-Embeddet nur neue/geänderte Angebote
  - Merged & speichert
- [ ] **2.3** `package.json` Scripts ergänzen:
  ```json
  "scripts": {
    "embeddings:build": "tsx scripts/embedding/build-offer-index.ts",
    "embeddings:refresh": "tsx scripts/embedding/refresh-index.ts"
  }
  ```
- [ ] **2.4** Ersten Index-Build durchführen (`npm run embeddings:build`)
- [ ] **2.5** `offers.v1.json` manuell via Git pushen

### Phase 3: Query-Embedding-Cache 🚀
- [ ] **3.1** `lib/search/embedding-cache.ts` erstellen:
  - LRU-Cache Implementierung (1000 Einträge)
  - `getQueryEmbedding(query: string): Promise<Float32Array>`
  - Cache-Hit/Miss Tracking
- [ ] **3.2** OpenRouter Embedding-Client erstellen:
  - `lib/ai/embeddings.ts`
  - `createEmbedding(text: string): Promise<number[]>`
  - Error Handling & Retry-Logik

### Phase 4: Semantic Search Runtime 🔍
- [ ] **4.1** `lib/search/cosine.ts` erstellen:
  - `cosineSimilarity(vecA: Float32Array, vecB: Float32Array): number`
  - `findTopN(queryVec, vectors[], topN): ScoredResult[]`
- [ ] **4.2** `lib/search/semantic.ts` erstellen:
  - `loadOfferIndex(): OfferIndex` (lädt JSON, cached in Memory)
  - `semanticSearch(query, markets, topN): Promise<ProductCard[]>`
  - Market-Filter VOR Cosine-Berechnung
  - Score-Threshold anwenden (`MIN_SCORE`)
- [ ] **4.3** Type Definitions in `types/index.ts` ergänzen:
  ```typescript
  export interface OfferEmbedding {
    id: string;
    market: string;
    vector: number[];
    metadata: Offer;
  }
  ```

### Phase 5: API-Integration mit Shadow Mode 📡
- [ ] **5.1** `app/api/chat/route.ts` erweitern:
  - Try-Catch um `semanticSearch()` mit Fallback zu `findOffers()`
  - Shadow Mode: Parallel beide Systeme aufrufen
  - Metriken loggen:
    ```typescript
    {
      timestamp: Date,
      query: string,
      semanticResults: number,
      synonymResults: number,
      semanticScoreAvg: number,
      semanticLatencyMs: number,
      usedFallback: boolean
    }
    ```
  - In `logs/semantic-search.jsonl` schreiben
- [ ] **5.2** Feature Flag in `.env.local`:
  ```env
  USE_SEMANTIC_SEARCH=true  # Einfaches An/Aus-Schalten
  ```
- [ ] **5.3** Logging-Analyse-Script:
  - `scripts/analyze-semantic-logs.ts`
  - Berechnet: Avg Score, Hit Rate, Latenz P95, Fallback Rate

### Phase 6: Testing & Validierung ✅
- [ ] **6.1** Test-Set aus `logs/search-queries.jsonl` extrahieren (100 Queries)
- [ ] **6.2** Benchmark-Script erstellen:
  - `scripts/benchmark-search.ts`
  - Vergleicht Semantic vs. Synonym (Precision@5, Recall@10)
- [ ] **6.3** Shadow Mode 1-2 Wochen laufen lassen
- [ ] **6.4** Qualitäts-Metriken auswerten:
  - ✅ Semantic Hit Rate ≥90%
  - ✅ Avg Score ≥0.38
  - ✅ Latenz P95 <600ms (mit Cache)
- [ ] **6.5** Go/No-Go-Entscheidung basierend auf Metriken

### Phase 7: Rollout & Cleanup 🚢
- [ ] **7.1** Shadow Mode deaktivieren (nur Primary Search)
- [ ] **7.2** Monitoring für 1 Monat
- [ ] **7.3** Nach 3 Monaten: Synonym-System entfernen
  - `SYNONYMS` Dictionary aus `lib/data/offers.ts` löschen
  - `expandWithSynonyms()` Funktion entfernen
  - `findOffers()` komplett durch `semanticSearch()` ersetzen
- [ ] **7.4** Wöchentlicher Refresh automatisieren (GitHub Action oder Cronjob)

---

## 🔧 Deployment-Strategie

### Index-Update-Workflow
```bash
# Lokal (jeden Montag):
npm run embeddings:refresh

# Generiert: storage/embeddings/offers.v1.json
git add storage/embeddings/offers.v1.json
git commit -m "chore: update embeddings index (weekly refresh)"
git push

# Vercel/Next.js deployt automatisch
```

### Git-Konfiguration
```gitignore
# .gitignore – offers.v1.json NICHT ignorieren!
# (Datei wird manuell gepusht)
storage/embeddings/*.tmp
logs/semantic-search.jsonl
```

---

## 📈 Monitoring & Success Metrics

### Key Performance Indicators (KPIs)
| Metrik                  | Target         | Aktuell (Synonym) |
|-------------------------|----------------|-------------------|
| Coverage Rate           | ≥90%           | 26.9%            |
| Avg Semantic Score      | ≥0.40          | N/A              |
| Query Latency P95       | <600ms         | ~10ms            |
| API Error Rate          | <1%            | N/A              |
| Cache Hit Rate          | ≥80%           | N/A              |
| Fallback Rate           | <5%            | N/A              |

### Logging-Format
```jsonl
{"timestamp":"2025-11-16T10:23:45Z","query":"milch","semanticResults":23,"synonymResults":18,"semanticScoreAvg":0.62,"latencyMs":234,"cacheHit":false}
{"timestamp":"2025-11-16T10:24:12Z","query":"milch","semanticResults":23,"synonymResults":18,"semanticScoreAvg":0.62,"latencyMs":6,"cacheHit":true}
```

---

## 🚨 Risiken & Mitigations

| Risiko                           | Wahrscheinlichkeit | Mitigation                                    |
|----------------------------------|-------------------|-----------------------------------------------|
| Embedding API Ausfall            | Niedrig           | ~~Fallback zu Synonym-System~~  (Erstmal unrelevant) |
| Schlechte Semantic Search Quality| Mittel            | Shadow Mode + 100-Query-Benchmark             |
| Hohe Latenz (>1s)                | Niedrig           | LRU-Cache reduziert auf ~50-100ms average     |
| Index veraltet (>1 Woche)        | Hoch              | Automatisierter Refresh (GitHub Action)       |
| Token-Kosten explodieren         | Sehr niedrig      | Cache + ~$0.35/Mo Budget-Alarm                |

---

## 📚 Ressourcen & Dependencies

### Neue Dependencies
```json
{
  "dependencies": {
    "lru-cache": "^11.0.0"  // Für Query-Embedding-Cache
  },
  "devDependencies": {
    "tsx": "^4.19.2"  // Für Script-Ausführung (bereits vorhanden)
  }
}
```

### API-Keys & Credentials
```env
# .env.local (bereits vorhanden)
OPENROUTER_API_KEY=sk-or-...

# Neue Variablen:
EMBEDDING_PROVIDER=openrouter
EMBEDDING_MODEL=text-embedding-3-large
USE_SEMANTIC_SEARCH=true
```

---

## 🎯 Nächste Schritte

1. ✅ **Phase 1-2**: Setup & Batch-Index-Build (Woche 1)
2. ✅ **Phase 3-4**: Cache & Runtime-Search (Woche 2)
3. ✅ **Phase 5**: API-Integration mit Shadow Mode (Woche 3)
4. ✅ **Phase 6**: Testing & Validierung (Woche 4-5)
5. ✅ **Phase 7**: Rollout & Cleanup (Monat 2-4)

**Aktueller Status**: 🟡 Planung abgeschlossen, Start Implementation

**Nächster Meilenstein**: Phase 1 (Setup & Infrastruktur)

---

## 📝 Changelog

| Datum      | Änderung                                           | Status      |
|------------|----------------------------------------------------|-------------|
| 2025-11-16 | Initial Plan erstellt (Embedding Retrieval)        | ✅ Fertig   |
| 2025-11-16 | Plan überarbeitet: Pure Semantic + LRU-Cache       | ✅ Fertig   |
| TBD        | Phase 1: Setup abgeschlossen                       | 🟡 Pending  |

---

**Letzte Aktualisierung**: 2025-11-16
**Verantwortlich**: Development Team
**Reviewer**: TBD
