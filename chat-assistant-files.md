# Chat Assistant Output - File Übersicht

Diese Datei enthält alle identifizierten Files, die mit dem Chat Output vom Assistenten in der SparFuchs-Anwendung zu tun haben.

## 🎨 Frontend Components

### ChatMessage.tsx
**Pfad:** `app/components/Chat/ChatMessage.tsx`
**Funktion:** Hauptkomponente für die Darstellung von Chat-Nachrichten (User & Assistant)
- Rendert einzelne Nachrichten mit unterschiedlichen Styles für User/Assistant
- Implementiert SparFuchs Brand-Design mit orangen/grauen Farben
- Zeigt Zeitstempel für jede Nachricht an
- Unterstützt whitespace-pre-wrap für korrekte Zeilenumbrüche

### ChatContainer.tsx
**Pfad:** `app/components/Chat/ChatContainer.tsx`
**Funktion:** Container-Komponente die das gesamte Chat-Interface verwaltet
- Verwaltet Chat-State und Message-Historie
- Integriert alle Custom Hooks (useChatHistory, useRealTimeUpdates, etc.)
- Implementiert Streaming-Logik für Assistant-Antworten
- Enthält Loading-States und Error-Handling
- Bietet Chat-Reset Funktionalität

### ChatInput.tsx
**Pfad:** `app/components/Chat/ChatInput.tsx`
**Funktion:** Input-Komponente für Benutzereingaben
- Auto-resize Textarea
- Input-Validierung und Character-Count
- Send-Button mit Disable-State während Streaming
- Keyboard-Shortcuts (Enter zum Senden)

## 🚀 Backend API

### Chat Route
**Pfad:** `app/api/chat/route.ts`
**Funktion:** Haupt-API Route die die Streaming-Antworten vom Assistant generiert
- Implementiert Server-Sent Events (SSE) für Real-time Streaming
- Integriert OpenRouter Client für AI-Kommunikation
- Verwendet ContextGenerator für intelligente Prompts
- Implementiert Hallucination Detection
- Error-Handling mit deutschen Fehlermeldungen
- Unterstützt verschiedene AI-Modelle (Grok, Claude, GPT, etc.)

## 🎣 React Hooks

### useRealTimeUpdates.ts
**Pfad:** `lib/hooks/useRealTimeUpdates.ts`
**Funktion:** Hook für Streaming und Real-time Updates vom Assistant
- Verwaltet WebSocket-ähnliche Streaming-Verbindungen
- Implementiert Retry-Logik mit exponential backoff
- Connection-Status Tracking
- Timeout-Handling (60 Sekunden)
- AbortController für Stream-Cancellation

### useChatHistory.ts
**Pfad:** `lib/hooks/useChatHistory.ts`
**Funktion:** Hook für Chat-Historie Verwaltung
- LocalStorage-basierte Persistierung der Chat-Nachrichten
- Session-basierte Nachrichtenverwaltung
- Unterstützt bis zu 100 gespeicherte Nachrichten
- CRUD Operationen für Messages
- Export-Funktionalität für Chat-Historie
- Cross-Session Message-Zugriff

## 🤖 AI Services

### OpenRouter Client
**Pfad:** `lib/ai/openrouter-client.ts`
**Funktion:** OpenRouter Client für AI-Kommunikation
- Connection Pooling für effiziente Client-Verwaltung
- Multi-Model Support (6+ Modelle)
- Vercel-optimierte Timeout-Behandlung (55s)
- Streaming und Non-Streaming Completions
- Error-Handling mit automatischen Fallback-Modellen

### Context Generator
**Pfad:** `lib/ai/context.ts`
**Funktion:** Context Generator für intelligente AI-Prompts
- Generiert produktspezifische Kontexte aus JSON-Daten
- Market-spezifische Filterung (Aldi, Lidl, Rewe, Edeka, Penny)
- Semantic Search Integration
- Recipe-Mode Unterstützung
- Deutsche Prompts und Anweisungen

### Hallucination Detection
**Pfad:** `lib/ai/hallucination-detection.ts`
**Funktion:** Validierung der Assistant-Antworten gegen echte Produktdaten
- Überprüft Antworten gegen 978 reale Produkte
- Erkennt erfundene Produktnamen oder Preise
- Stille Validierung ohne User-Störung
- Logging für Monitoring-Zwecke

## 📋 Support Files

### Type Definitions
**Pfad:** `types/index.ts`
**Funktion:** TypeScript Definitionen für Messages und Chat-Strukturen
- Message Interface (User/Assistant)
- Chat-State Definitionen
- API Request/Response Types
- Market und Product Types

### Error Boundary
**Pfad:** `app/components/Error/ChatErrorBoundary.tsx`
**Funktion:** Error Boundary für Chat-Fehler
- React Error Boundary für Chat-Komponenten
- Graceful Error-Handling ohne App-Crash
- User-freundliche Fehlermeldungen
- Error-Recovery Mechanismen

## 🔄 Data Flow

```
User Input → ChatInput → ChatContainer → API Route (/api/chat)
                                            ↓
API Route → OpenRouter Client → AI Model → Streaming Response
                                            ↓
Streaming Response → useRealTimeUpdates → ChatContainer → ChatMessage
                                            ↓
ChatMessage → useChatHistory → LocalStorage Persistence
```

## 📁 File-Abhängigkeiten

### Wichtigste Files für Assistant-Output:
1. **ChatMessage.tsx** - Darstellung der Assistant-Nachrichten
2. **route.ts** - Streaming API für Assistant-Antworten  
3. **useRealTimeUpdates.ts** - Real-time Streaming-Verarbeitung
4. **useChatHistory.ts** - Speicherung der Assistant-Antworten
5. **openrouter-client.ts** - AI-Kommunikation Backend

### Zusätzliche Support-Files:
- **context.ts** - Intelligente Prompt-Generierung
- **hallucination-detection.ts** - Antwort-Qualitätssicherung
- **ChatContainer.tsx** - Orchestrierung aller Komponenten
- **types/index.ts** - TypeScript Support

## 🛠️ Technische Details

- **Streaming:** Server-Sent Events (SSE) für Real-time Updates
- **Persistierung:** LocalStorage für Chat-Historie
- **AI-Provider:** OpenRouter mit 6+ Modellen
- **Error-Handling:** Mehrstufige Fallback-Mechanismen
- **Performance:** In-Memory Caching und Connection Pooling
- **Sprache:** Vollständig deutscher Support
- **Design:** SparFuchs Brand-Colors mit Streamlit-inspiriertem Design