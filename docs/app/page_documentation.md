<!-- Source: app/page.tsx -->

# page Documentation

## Architektur & Zweck
- **Zweck**: Next.js App Router Page-Komponente (Seiten-UI & Interaktionen)
- Client-Komponente (`"use client"`).
- Verarbeitet Streaming-Antworten (Reader-API).


## Dependencies & Integration
- Externe Pakete: framer-motion, react
- Interne Module: ./components/Chat/ChatInput, ./components/Chat/ChatMessage, ./components/Layout/Footer, ./components/Layout/Header, ./components/UI/CentralInput, ./components/UI/MarketToggles, ./components/UI/WelcomeMessages
- API-Aufrufe: /api/chat


## Kritische Datenstrukturen
- Interface: Message

```typescript
interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}
```



## Geschäftslogik
- State: selectedMarkets, chatStarted, isLoading, isClient
- Handler: handleUpdateMarkets, handleStartChat, handleSendMessage, handleResetChat
- Hooks: useState(4), useEffect(2)


## Error Handling
- Try/Catch um Netzwerk-/Streaminglogik mit Nutzerfreundlicher Fallback-Message.


## Performance Considerations
- Chunkweises UI-Update aus Streaming-Daten.

