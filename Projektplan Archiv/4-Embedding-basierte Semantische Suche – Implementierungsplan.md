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
- Direct Switch (Harter Schnitt) auf das neue System

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
│    → Only: semanticSearch() (Direct Switch)                 │
└─────────────────────────────────────────────────────────────┘
```

### Embedding-Template
```typescript
// Strukturiertes Template (mit notes für bessere semantische Trefferquote, z.B. "Vegan", "Ursprung")
`${product_name} | Marke: ${brand || 'Eigenmarke'} | ${variant || ''} | ${size || ''} | ${notes || ''}`.trim()
```

### Kosine-Similarity & Ranking
- **Top-N**: 100 Produkte (konfigurierbar via `SEMANTIC_TOP_N`)
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
- [x] **1.1** Ordner `storage/embeddings/` anlegen
- [x] **1.2** `.env.local` erweitern:
  ```env
  EMBEDDING_PROVIDER=openrouter
  EMBEDDING_MODEL=text-embedding-3-large
  EMBEDDING_API_KEY=<your-key>
  ```
- [x] **1.3** `lib/utils/constants.ts` ergänzen:
  ```typescript
  export const SEMANTIC_SEARCH_CONFIG = {
    TOP_N: 100,
    MIN_SCORE: 0.38,
    CACHE_SIZE: 1000,
  } as const;
  ```

### Phase 2: Batch-Index-Build 🔨
- [x] **2.1** `scripts/embedding/build-offer-index.ts` erstellen:
  - `loadOffers()` aus `lib/data/offers.ts` nutzen
  - **ID-Generierung**: Deterministischer Hash aus (Name + Markt + Preis) für React-Keys
  - Embedding-Template implementieren
  - Rate Limiting (max. 100 Requests/Min)
  - Progress Logging (`1/1574 processed...`)
  - Speichern als `storage/embeddings/offers.v1.json`
- [x] **2.2** `scripts/embedding/refresh-index.ts` erstellen:
  - Lädt alten Index
  - Vergleicht mit aktuellen Angeboten
  - Re-Embeddet nur neue/geänderte Angebote
  - Merged & speichert
- [x] **2.3** `package.json` Scripts ergänzen:
  ```json
  "scripts": {
    "embeddings:build": "tsx scripts/embedding/build-offer-index.ts",
    "embeddings:refresh": "tsx scripts/embedding/refresh-index.ts"
  }
  ```
- [x] **2.4** Ersten Index-Build durchführen (`npm run embeddings:build`)
- [ ] **2.5** `offers.v1.json` manuell via Git pushen

### Phase 3: Query-Embedding-Cache 🚀
- [x] **3.1** `lib/search/embedding-cache.ts` erstellen:
  - LRU-Cache Implementierung (1000 Einträge)
  - `getQueryEmbedding(query: string): Promise<Float32Array>`
  - Cache-Hit/Miss Tracking
- [x] **3.2** OpenRouter Embedding-Client erstellen:
  - `lib/ai/embeddings.ts`
  - `createEmbedding(text: string): Promise<number[]>`
  - Error Handling & Retry-Logik

### Phase 4: Semantic Search Runtime 🔍
- [x] **4.1** `lib/search/cosine.ts` erstellen:
  - `cosineSimilarity(vecA: Float32Array, vecB: Float32Array): number`
  - `findTopN(queryVec, vectors[], topN): ScoredResult[]`
- [x] **4.2** `lib/search/semantic.ts` erstellen:
  - `loadOfferIndex(): OfferIndex` (lädt JSON, cached in Memory)
  - `semanticSearch(query, markets, topN): Promise<ProductCard[]>`
  - Market-Filter VOR Cosine-Berechnung
  - Score-Threshold anwenden (`MIN_SCORE`)
- [x] **4.3** Type Definitions in `types/index.ts` ergänzen:
  ```typescript
  export interface OfferEmbedding {
    id: string;
    market: string;
    vector: number[];
    metadata: Offer;
  }
  ```

### Phase 5: API-Integration & UI-Anpassung 📡
- [x] **5.1** `app/components/Chat/ProductCard.tsx` anpassen:
  - `uvp` und `discount_pct` aus Interface entfernen (nicht mehr in Daten vorhanden)
  - `dateRange` aus `valid_from` + `valid_to` berechnen
  - `id` wird für React-Keys und "Add to List" benötigt (kommt aus Embedding-Index)
- [x] **5.2** `app/api/chat/route.ts` aktualisieren:
  - `semanticSearch()` als alleinige Suchmethode implementieren
  - **Context Injection**: Die Top-N semantischen Treffer in den System-Prompt laden
  - **AI-Filtering**: Gemini anweisen, passende Produkte auszuwählen
- [x] **5.3** Logging für Monitoring:
  - Metriken loggen (Score, Latenz) in `logs/semantic-search.jsonl`
  - Einfaches Monitoring der API-Latenz

### Phase 6: Cleanup Legacy System 🧹
- [x] **6.1** `lib/data/offers.ts` bereinigen:
  - `SYNONYMS` Dictionary und Interfaces löschen
  - `expandWithSynonyms()` Funktion entfernen
  - `findOffers()` Funktion entfernen
- [x] **6.2** `scripts/Synonyms/` Ordner löschen:
  - Das alte Synonym-Management-System wird vollständig entfernt

### Phase 7: Testing & Validierung ✅
- [x] **7.1** Manuelle Tests:
  - Prüfen, ob "Milch" Ergebnisse liefert (Semantisch)
  - Prüfen, ob Market-Filter greift (z.B. nur "Aldi")
- [x] **7.2** Performance Check:
  - Latenzzeit prüfen (sollte < 2s sein für Search + LLM)
  - Caching verifizieren (2. Anfrage sollte < 100ms sein)
- [ ] **7.3** Deployment & Automatisierung
  - Wöchentlichen Refresh-Workflow einrichten

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


