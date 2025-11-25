<!-- Source: app/components/Chat/ChatInput.tsx -->

# ChatInput Documentation

## Architektur & Zweck
- **Zweck**: Wiederverwendbare UI-/Feature-Komponente
- Client-Komponente (`"use client"`).


## Dependencies & Integration
- Externe Pakete: react
- Interne Module: ../UI/InputTip


## Kritische Datenstrukturen
- Interface: ChatInputProps

```typescript
interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}
```



## Geschäftslogik
- State: localInput
- Handler: handleSubmit, handleKeyPress
- Hooks: useState(1)


## Error Handling
- Keine explizite Fehlerbehandlung erkennbar.


## Performance Considerations
- Keine auffälligen Performance-Muster.

