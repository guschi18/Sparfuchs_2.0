<!-- Source: lib/ai/openrouter.ts -->

# openrouter.ts Documentation

## Architektur & Zweck
- **Zweck**: OpenRouter AI Client für Chat Completions mit Streaming-Unterstützung
- **Runtime**: Server-Side Only (Node.js)
- **Integration**: Ersetzt frühere KI-Implementierung, wird von `/api/chat` genutzt
- **External API**: OpenRouter (https://openrouter.ai)
- **Default Model**: `google/gemini-2.5-flash-lite`


## Dependencies & Integration
- **External API**: OpenRouter Chat Completions (`https://openrouter.ai/api/v1/chat/completions`)
- **Node.js Built-ins**: Fetch API, TextDecoder
- **Environment Variables**:
  - `OPENROUTER_API_KEY` (Required) - API-Key für OpenRouter
  - `NEXT_PUBLIC_APP_URL` (Optional) - App-URL für HTTP-Referer Header
  - `NEXT_PUBLIC_APP_TITLE` (Optional) - App-Titel für X-Title Header
- **Usage**: Wird von `app/api/chat/route.ts` verwendet (Zeile 136-144)


## Kritische Datenstrukturen

### ChatMessage Interface (Zeile 8-11)
```typescript
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

**Purpose**: Einzelne Chat-Nachricht für OpenRouter API

### ChatCompletionOptions Interface (Zeile 13-19)
```typescript
export interface ChatCompletionOptions {
  model?: string;           // Default: google/gemini-2.5-flash-lite
  messages: ChatMessage[];  // Required: Conversation history
  temperature?: number;     // Default: 0.7 (0.0-1.0)
  max_tokens?: number;      // Default: 6000
  stream?: boolean;         // Default: false
}
```

**Purpose**: Konfigurations-Optionen für API-Aufruf


## Geschäftslogik

### 1. API-Aufruf: `createChatCompletion()` (Zeile 27-64)

**Signatur:**
```typescript
async function createChatCompletion(
  options: ChatCompletionOptions,
  onChunk?: (chunk: string) => void
): Promise<Response>
```

**Workflow:**
1. **Validierung**: Prüft ob `OPENROUTER_API_KEY` gesetzt ist (Zeile 31-34)
2. **Environment**: Lädt `NEXT_PUBLIC_APP_URL` und `NEXT_PUBLIC_APP_TITLE` (Zeile 36-37)
3. **API-Request**: POST zu OpenRouter mit Headers (Zeile 39-54)
   - `Authorization: Bearer ${apiKey}`
   - `HTTP-Referer: ${appUrl}` (für OpenRouter-Analytics)
   - `X-Title: ${appTitle}` (für OpenRouter-Dashboard)
4. **Error-Handling**: Wirft Error bei HTTP-Fehler (Zeile 56-61)
5. **Return**: Gibt `Response` zurück (für Streaming oder direktes Parsen)

**Parameter-Defaults:**
- `model`: `"google/gemini-2.5-flash-lite"` (Zeile 48)
- `temperature`: `0.7` (Zeile 50)
- `max_tokens`: `6000` (Zeile 51)
- `stream`: `false` (Zeile 52)

**Error Cases:**
- **Missing API Key**: `"OPENROUTER_API_KEY ist nicht gesetzt"` (Zeile 33)
- **HTTP Error**: `"OpenRouter API Fehler: {status} - {errorData}"` (Zeile 58-60)

---

### 2. SSE-Parsing: `parseStreamingResponse()` (Zeile 71-116)

**Signatur:**
```typescript
async function parseStreamingResponse(
  response: Response,
  onChunk: (content: string) => void
): Promise<void>
```

**Zweck**: Parst Server-Sent Events (SSE) Stream von OpenRouter in Echtzeit

**Workflow:**
1. **Reader Setup**: Erstellt `ReadableStreamReader` vom Response Body (Zeile 75-78)
2. **Buffer Management**: Verwaltet Buffer für unvollständige Zeilen (Zeile 80-81)
3. **Stream Loop**: Liest Chunks bis `done === true` (Zeile 84-112)
4. **Line Splitting**: Split per `\n`, behalte letzte unvollständige Zeile (Zeile 88-92)
5. **SSE Parsing**: Verarbeitet Zeilen mit `data: ` Prefix (Zeile 94-111)
   - Überspringt leere Zeilen und `[DONE]` Marker (Zeile 95)
   - Entfernt `"data: "` Prefix (Zeile 99)
   - Parst JSON (Zeile 100)
   - Extrahiert `choices[0].delta.content` (Zeile 103)
   - Ruft `onChunk(content)` Callback auf (Zeile 105)
6. **Cleanup**: Released Reader-Lock im `finally` Block (Zeile 113-115)

**Robustheit:**
- **Try-Catch**: Parse-Errors werden geloggt, crashen aber nicht den Stream (Zeile 98-109)
- **Finally**: Reader wird immer released (Zeile 113-115)
- **Buffer**: Verhindert Verlust von unvollständigen Zeilen (Zeile 92)

**OpenRouter SSE Format:**
```json
data: {"id":"gen-123","choices":[{"delta":{"content":"Hallo"}}]}
data: {"id":"gen-123","choices":[{"delta":{"content":" Welt"}}]}
data: [DONE]
```


## Error Handling

### Kritische Fehler (Throw):
1. **Missing API Key** (Zeile 33): `throw new Error('OPENROUTER_API_KEY ist nicht gesetzt')`
2. **HTTP Error** (Zeile 58-60): `throw new Error('OpenRouter API Fehler: ...')`
3. **No Response Body** (Zeile 77): `throw new Error('Response body ist nicht lesbar')`

### Nicht-kritische Fehler (Console.error):
1. **SSE Parse Error** (Zeile 108): Einzelne fehlerhafte Zeilen werden übersprungen

**Error-Daten-Format:**
```typescript
{
  status: number;           // HTTP Status Code
  errorData: {              // Von OpenRouter API
    error?: {
      message?: string;
      type?: string;
      code?: string;
    }
  }
}
```


## Security Considerations

### ✅ Best Practices:
- **API-Key**: Wird nur via Environment Variable geladen (nie hardcoded)
- **Server-Side Only**: Keine Client-Exposition (keine `NEXT_PUBLIC_` für API-Key)
- **HTTPS**: OpenRouter API-URL ist HTTPS
- **Error-Sanitization**: Error-Messages enthalten keine sensiblen Daten

### 🔒 Headers für OpenRouter:
- **HTTP-Referer**: Identifiziert App-Quelle für OpenRouter-Analytics
- **X-Title**: App-Name für OpenRouter-Dashboard
- **Authorization**: API-Key als Bearer Token

### ⚠️ Potential Risks:
- **Rate Limiting**: OpenRouter hat Rate-Limits (keine Handling im Code)
- **Cost Management**: Keine Token-Zählung oder Budget-Checks
- **Input Validation**: Keine Sanitization von User-Input (sollte in API-Route erfolgen)


## Performance Considerations

### 🚀 Optimierungen:
- **Streaming**: Ermöglicht progressive UI-Updates (bessere UX)
  - User sieht Antwort in Echtzeit (word-by-word)
  - Keine Wartezeit auf vollständige Response
- **Buffer Management**: Effiziente Handhabung unvollständiger SSE-Zeilen
- **TextDecoder**: Streaming-Option verhindert Memory-Overhead

### ⚙️ Performance-Metriken (geschätzt):
```
API Round-Trip:        ~500-2000ms  (abhängig von Model & Latenz)
Streaming First Byte:  ~200-500ms   (TTFB)
Parse per Chunk:       <1ms         (JSON.parse + callback)
Buffer Overhead:       ~1-5KB       (unvollständige Zeilen)
```

### 📊 Model-Spezifika:
- **google/gemini-2.5-flash-lite**:
  - Schnellstes Gemini-Model
  - Optimiert für Latenz (< 1s TTFB)
  - Max Tokens: 8192 (Context) + 8192 (Output)

### ⚠️ Bottlenecks:
- **Network Latency**: Hauptfaktor (OpenRouter → Google Cloud)
- **Token Generation**: ~50-100 tokens/sec (Model-abhängig)
- **Fetch API**: Synchron (blockiert Event Loop bei Fehler-Handling)


## Integration Beispiele

### Verwendung in API-Route:
```typescript
// app/api/chat/route.ts
import { createChatCompletion, parseStreamingResponse } from '@/lib/ai/openrouter';

export async function POST(request: NextRequest) {
  const { message, selectedMarkets } = await request.json();

  // API-Aufruf mit Streaming
  const aiResponse = await createChatCompletion({
    model: 'google/gemini-2.5-flash-lite',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    temperature: 0.7,
    stream: true,
  });

  // SSE-Stream zurück an Client
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      await parseStreamingResponse(aiResponse, (chunk) => {
        const data = JSON.stringify({ content: chunk });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

### Non-Streaming Verwendung:
```typescript
const response = await createChatCompletion({
  model: 'google/gemini-2.5-flash-lite',
  messages: [
    { role: 'user', content: 'Was ist 2+2?' },
  ],
  stream: false, // Kein Streaming
});

const data = await response.json();
const answer = data.choices[0].message.content;
console.log(answer); // "4"
```


## Testing-Empfehlungen

### Unit Tests:
```typescript
import { createChatCompletion, parseStreamingResponse } from '@/lib/ai/openrouter';

describe('createChatCompletion', () => {
  it('should throw error when API key is missing', async () => {
    delete process.env.OPENROUTER_API_KEY;
    await expect(createChatCompletion({ messages: [] }))
      .rejects.toThrow('OPENROUTER_API_KEY ist nicht gesetzt');
  });

  it('should use default model when not specified', async () => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    );

    await createChatCompletion({ messages: [] });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('google/gemini-2.5-flash-lite')
      })
    );
  });
});

describe('parseStreamingResponse', () => {
  it('should parse SSE chunks correctly', async () => {
    const mockChunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
      'data: {"choices":[{"delta":{"content":" World"}}]}\n',
      'data: [DONE]\n'
    ];

    const mockReader = {
      read: jest.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(mockChunks[0]) })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(mockChunks[1]) })
        .mockResolvedValueOnce({ done: true }),
      releaseLock: jest.fn()
    };

    const mockResponse = {
      body: { getReader: () => mockReader }
    };

    const chunks: string[] = [];
    await parseStreamingResponse(mockResponse as any, (chunk) => {
      chunks.push(chunk);
    });

    expect(chunks).toEqual(['Hello', ' World']);
  });
});
```

### Integration Tests:
```typescript
describe('OpenRouter Integration', () => {
  it('should complete full chat flow', async () => {
    const response = await createChatCompletion({
      messages: [{ role: 'user', content: 'Hi' }],
      stream: true,
    });

    const chunks: string[] = [];
    await parseStreamingResponse(response, (chunk) => {
      chunks.push(chunk);
    });

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join('')).toBeTruthy();
  }, 10000); // 10s Timeout für API-Calls
});
```

### Mocking für Tests:
```typescript
// __mocks__/lib/ai/openrouter.ts
export const createChatCompletion = jest.fn(() =>
  Promise.resolve({
    ok: true,
    body: {
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Mock"}}]}\n')
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }
  })
);
```


## Environment Setup

### Required Variables:
```bash
# .env.local
OPENROUTER_API_KEY=sk-or-v1-... # Von https://openrouter.ai/keys
NEXT_PUBLIC_APP_URL=https://sparfuchs.de
NEXT_PUBLIC_APP_TITLE=SparFuchs
```

### Development:
```bash
# Get API Key
1. Registriere auf https://openrouter.ai
2. Erstelle API Key unter Keys
3. Füge in .env.local ein

# Test
npm run dev
# Teste Chat-Feature im Browser
```


## Troubleshooting

### Problem: "OPENROUTER_API_KEY ist nicht gesetzt"
**Lösung**: Setze Environment Variable in `.env.local`

### Problem: "OpenRouter API Fehler: 401"
**Lösung**: Ungültiger API-Key, generiere neuen Key auf OpenRouter

### Problem: "OpenRouter API Fehler: 429"
**Lösung**: Rate Limit erreicht, warte oder upgrade Plan

### Problem: Streaming funktioniert nicht
**Lösung**:
1. Prüfe `stream: true` in Options
2. Prüfe ob Response Body existiert
3. Prüfe Browser DevTools für SSE-Fehler

### Problem: Chunks kommen verzögert
**Lösung**:
- Normale Latenz bei Gemini-Models (~50-100ms/Chunk)
- Prüfe Network-Latenz zu OpenRouter


## Related Documentation
- **API Route**: `docs/app/api/chat/route_documentation.md`
- **Environment**: `docs/lib/utils/env_documentation.md`
- **Type Definitions**: `docs/types/index_documentation.md`
- **OpenRouter API**: https://openrouter.ai/docs
- **Gemini Models**: https://openrouter.ai/google


## Change History
- **2025-11**: Initial creation (Ersetzte frühere KI-Integration)
- **2025-11**: Dokumentation erstellt


## Future Considerations
- [ ] **Rate Limiting**: Client-seitige Rate-Limit-Handhabung
- [ ] **Retry Logic**: Exponential Backoff bei API-Fehlern
- [ ] **Cost Tracking**: Token-Usage-Monitoring
- [ ] **Model Selection**: Dynamische Model-Auswahl basierend auf Query
- [ ] **Caching**: Response-Caching für identische Queries
- [ ] **Timeout**: Configurable Request-Timeout
- [ ] **Error Recovery**: Graceful Degradation bei API-Ausfällen
