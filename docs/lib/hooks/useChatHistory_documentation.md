<!-- Source: lib/hooks/useChatHistory.ts -->

# useChatHistory Documentation

## Architektur & Zweck
- **Zweck**: Hilfs-/Infrastrukturmodul (Business-/Utility-Logik)
- Client-Komponente (`"use client"`).


## Dependencies & Integration
- Externe Pakete: react


## Kritische Datenstrukturen
- Interface: ChatMessage

```typescript
export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    warning?: string;
    sessionId: string;
}
```

- Interface: ChatHistory

```typescript
export interface ChatHistory {
    messages: ChatMessage[];
    totalMessages: number;
    currentSessionMessages: number;
}
```



## Geschäftslogik
- State: isLoaded
- Hooks: useState(1), useEffect(1), useCallback(8)


## Error Handling
- Try/Catch um Netzwerk-/Streaminglogik mit Nutzerfreundlicher Fallback-Message.


## Performance Considerations
- Memoization/Callbacks vorhanden.

