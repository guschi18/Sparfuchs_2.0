## Embedding Retrieval Research

### Ist-Zustand & Schwachstellen
- `findOffers` erweitert Nutzerbegriffe ausschließlich über das `SYNONYMS`-Dictionary und durchsucht anschließend nur `product_name`, `brand` und `variant`. ```242:256:lib/data/offers.ts
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
    return searchTerms.some(term => searchableText.includes(term));
  });
}
```
- Der Chat-Endpoint reicht lediglich die gefilterten ProductCards an die KI durch; fehlen passende Treffer in Schritt 1, kann das Modell nichts befüllen. ```16:50:app/api/chat/route.ts
function createSystemPrompt(selectedMarkets: string[], products: ProductCard[]): string {
  const productsJson = JSON.stringify(products, null, 2);
  return `... Nutze AUSSCHLIESSLICH die folgenden Angebotsdaten ...`;
}
```
- Folge: Jede Sucherweiterung erfordert manuelle Pflege, generische Anfragen („Gemüse“, „Frühstücksideen“) fallen durch, und Halluzinationen treten auf, wenn die KI trotz leerem Treffer-Set antworten soll.

### Modell- und Indexoptionen
- **Embedding-Modell (fix gewählt)**  
  - OpenRouter `text-embedding-3-large` (3.072 Dimensionen, hohe Präzision für komplexe Produktbeschreibungen, akzeptable Kosten für ~1.6k Angebote + wenige Queries).  
  - Vorteil: konsistenter Vektorraum für Produkte & Queries, keine weitere Modellentscheidung nötig; Nachteil: höherer Preis als Small-Variante, wird bewusst akzeptiert.
- **Vectorstores / Indexe (optional)**  
  - *FAISS* (In-Memory, beste Kontrolle, <5 ms für 2 k Vektoren, benötigt Node native addon via `faiss-node` oder Service).  
  - *Qdrant/Weaviate* (Managed oder Self-host, HTTP API, unterstützt filters wie Markt).  
  - Für 1.5 k Angebote genügt ein einfacher In-Memory Index; bei Bedarf später auf einen externen Vectorstore wechseln.
- **Speicherformat**  
  - `storage/embeddings/offers.v1.json` (Array aus `{ id, market, vector: Float32[] }`, ~19 MB bei 1.6 k Angeboten).  
  - Utility `lib/search/cosine.ts` kapselt Cosine Similarity auf Basis dieser JSON-Datei; späterer Wechsel auf FAISS oder Qdrant möglich, aber nicht nötig.

### Prototyp-Architektur
1. **Batch-Index-Build**  
   - Neues Skript `scripts/embedding/build-offer-index.ts`: lädt Angebote, baut pro Eintrag einen Klartext (`brand + product + variant + notes`), holt Embedding, speichert `id`, `market`, `vector`, `metadata`.  
   - Ergänzendes Skript `scripts/embedding/refresh-index.ts` für wöchentliche Angebotsupdates (differenzielle Re-Embeddings).
2. **Laufzeit-Retrieval**  
   - Neues Modul `lib/search/semantic.ts` mit Funktionen:  
     - `loadOfferIndex()` – liest `storage/embeddings/offers.v1.json`, mappt auf Float32Arrays und hält sie in Memory.  
     - `semanticSearch(query, selectedMarkets, topN)` – erzeugt Query-Embedding, filtert nach Markt, berechnet Cosine Score, liefert `Offer[]`.
3. **API-Integration**  
   - In `app/api/chat/route.ts` Branch hinzufügen:  
     1) versuche `semanticSearch`;  
     2) fallback auf `findOffers` (Synonyme) falls Score < Schwelle oder Index leer;  
     3) optional Combi-Modus (Schnittmenge + Vereinigungsstrategie).  
   - Parameter wie `SEMANTIC_TOP_N`, `MIN_SCORE` in `lib/utils/constants.ts`.
4. **Konfiguration**  
   - `.env.local`: `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL`, `EMBEDDING_API_KEY`.  
   - Feature Flag `USE_SEMANTIC_SEARCH_DEFAULT=true` für sanfte Migration.

### Kosten & Performance (Richtwerte)
- **Batch-Build**: 1.6 k Angebote × ca. 200 Tokens ≈ 0.064 M Tokens → rund 1.3 $ pro Komplettlauf (text-embedding-3-large). Laufzeit ~1 Min bei parallelem Fetch.
- **Refresh pro Woche**: erfahrungsgemäß <10 % neue Angebote → <=0.15 $.
- **Query**: 1 Embedding-Call (<=0.01 $ bei 150 Tokens) + lokaler Cosine-Vergleich (<5 ms).  
- Monitoring: Counter für Embedding-API-Tokens, Warnung bei >80 % des Monatsbudgets.

### Pilot, Migration & Monitoring
1. **Datenaufbereitung**: Einmaligen Index-Build triggern, Resultat versionieren (`storage/embeddings/offers.v1.json`).  
2. **Qualitäts-Benchmark**:  
   - Query-Log (`logs/search-queries.jsonl`) als Testset verwenden, Precision@k vs. heutiges System messen.  
   - Mind. 20 repräsentative Nutzerfragen manuell bewerten.  
3. **Shadow Mode**:  
   - API berechnet semantische Treffer parallel, logged Score & Trefferanzahl, zeigt aber noch Synonym-Ergebnis an.  
4. **Rollout**:  
   - Aktivieren sobald Shadow-Statistiken ≥90 % Deckung zeigen *und* Median-Score ≥0.38 über 500 Queries liegt; Synonym-Liste auf Kernbegriffe einfrieren, aber als Fallback behalten (max. 3 Monate Übergangszeit).  
5. **Monitoring**:  
   - Neue Logfelder (`semanticScoreAvg`, `semanticHitRate`).  
   - Alarm, wenn Score-Median < Threshold (z. B. weil Embedding-Key fehlt).  
6. **Wartung & Ownership**:  
   - Automation: GitHub Action `embeddings-refresh.yml` (läuft jeden Montag 06:00, ruft `npm run embeddings:refresh`).  
   - Owner: Data Ops (Lisa) verantwortet Logs & Modelle, dev-team reviewt Upgrades halbjährlich.  
   - Bei Störungen kann sofort auf `findOffers` zurückgeschaltet werden (Feature Flag).

### Datenschutz & Compliance
- Embedding-Text enthält nur Produktdaten (keine personenbezogenen Informationen). Trotzdem sicherstellen, dass Notizen keine sensiblen Kundendaten enthalten; andernfalls vor dem Embedding filtern.

### Nächste Schritte – ToDos
1. **Index-Build vorbereiten**
   - Skripte `scripts/embedding/build-offer-index.ts` + `refresh-index.ts` anlegen.
   - Utility `lib/search/cosine.ts` schreiben (Cosine + JSON-Lader).
2. **Konfiguration & Storage**
   - `.env.local` um `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL=text-embedding-3-large`, `EMBEDDING_API_KEY` erweitern.
   - Ordner `storage/embeddings/` anlegen, erste Version `offers.v1.json` generieren.
3. **Runtime-Retrieval**
   - Modul `lib/search/semantic.ts` implementieren (`loadOfferIndex`, `semanticSearch`).
   - Tests für Score-Berechnung + Marktfilter.
4. **API-Integration & Feature Flags**
   - `app/api/chat/route.ts` um semantischen Branch + Fallback erweitern.
   - Flags `USE_SEMANTIC_SEARCH_DEFAULT`, `SEMANTIC_TOP_N`, `MIN_SCORE` in `lib/utils/constants.ts`.
5. **Shadow Mode + Monitoring**
   - Logging für `semanticScoreAvg`, `semanticHitRate` ergänzen.
   - GitHub Action `embeddings-refresh.yml` einrichten (montags 06:00).
6. **QA & Rollout**
   - Queries aus `logs/search-queries.jsonl` als Benchmark laufen lassen, KPIs festhalten.
   - Rollout freigeben, sobald Shadow-Metriken erfüllt sind (≥90 % Deckung, Median ≥0.38).
   - Synonym-Fallback nach max. 3 Monaten evaluieren und ggf. deaktivieren.
