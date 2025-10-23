<!-- Source: app/components/Chat/ChatContainer.tsx -->

# ChatContainer Documentation

## Architektur & Zweck
- **Zweck**: Wiederverwendbare UI-/Feature-Komponente
- Client-Komponente (`"use client"`).


## Dependencies & Integration
- Externe Pakete: react
- Interne Module: ../../../lib/hooks/useChatHistory, ../../../lib/hooks/useFormValidation, ../../../lib/hooks/useInputHandling, ../../../lib/hooks/useRealTimeUpdates, ./ChatInput, ./ChatMessage


## Kritische Datenstrukturen
- Interface: Message

```typescript
export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}
```

- Interface: ChatContainerProps

```typescript
interface ChatContainerProps {
    selectedMarkets: string[];
    sessionId: string;
    onResetChat?: () => void;
    initialMessage?: string;
}
```



## Geschäftslogik
- Handler: handleSendMessage
- Hooks: useEffect(2)


## Error Handling
- Try/Catch um Netzwerk-/Streaminglogik mit Nutzerfreundlicher Fallback-Message.


## Performance Considerations
- Keine auffälligen Performance-Muster.

