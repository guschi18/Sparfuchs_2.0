<!-- Source: app/api/chat/route.ts -->

# route.ts Documentation

## Architektur & Zweck
- **Zweck**: API-Endpoint für den Chat-Bot
- **Route**: `POST /api/chat`
- **Runtime**: Edge / Node.js (abhängig von Config, aktuell Node.js für File I/O)
- **Hauptverantwortung**:
  - Validierung der User-Anfrage
  - Semantische Suche nach Angeboten (`semanticSearch`)
  - Generierung der AI-Antwort via OpenRouter (`createChatCompletion`)
  - Streaming der Antwort an den Client

## Dependencies & Integration
- **Internal Modules**:
  - `lib/search/semantic.ts`: Für die Produktsuche
  - `lib/ai/openrouter.ts`: Für die AI-Generierung
  - `lib/search/logger.ts`: Für das Logging von Suchanfragen
- **External API**: OpenRouter

## Geschäftslogik

### Workflow
1. **Request Parsing**: Extrahiert `message` und `selectedMarkets` aus dem Body.
2. **Validierung**: Prüft ob `message` vorhanden ist.
3. **Semantic Search**:
   - Ruft `semanticSearch(message, validSelectedMarkets)` auf.
   - Findet relevante Produkte basierend auf Embeddings.
4. **System Prompt Construction**:
   - Baut einen Prompt, der die gefundenen Produkte als Kontext enthält.
   - Instruiert die AI, nur basierend auf diesen Produkten zu antworten.
5. **AI Generation**:
   - Ruft `createChatCompletion` mit dem System-Prompt und der User-Message auf.
   - Streamt die Antwort zurück zum Client.

### Logging
- Loggt Metadaten jeder semantischen Suche (Query, Markets, ResultCount, Latency) via `logSemanticSearch`.

## Error Handling
- **Invalid Request**: 400 Bad Request
- **Search Error**: Loggt Fehler, fährt mit leerer Produktliste fort (Graceful Degradation)
- **AI Error**: 500 Internal Server Error (wird an Client weitergegeben)

## Performance Considerations
- **Search Latency**: Abhängig von Embedding-API (~200-500ms) + Vektor-Suche (<10ms).
- **Streaming**: Ermöglicht schnelle TTFB (Time To First Byte) für den User.

## Related Documentation
- **Semantic Search**: `docs/lib/search/semantic_documentation.md`
- **OpenRouter**: `docs/lib/ai/openrouter_documentation.md`
