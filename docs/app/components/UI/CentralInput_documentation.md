<!-- Source: app/components/UI/CentralInput.tsx -->

# CentralInput Documentation

## Architektur & Zweck
- **Zweck**: Wiederverwendbare UI-/Feature-Komponente
- Client-Komponente (`"use client"`).


## Dependencies & Integration
- Externe Pakete: framer-motion, react
- Interne Module: ./InputTip


## Kritische Datenstrukturen
- Interface: CentralInputProps

```typescript
interface CentralInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}
```



## Geschäftslogik
- State: input
- Handler: handleSubmit, handleKeyPress
- Hooks: useState(1)


## Error Handling
- Keine explizite Fehlerbehandlung erkennbar.


## Performance Considerations
- Keine auffälligen Performance-Muster.

