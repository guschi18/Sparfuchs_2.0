<!-- Source: types/index.ts -->

# index Documentation

## Architektur & Zweck
- **Zweck**: Typdefinitionen und Schnittstellen



## Kritische Datenstrukturen
- Interface: Market

```typescript
// Core types for SparFuchs application
export interface Market {
    id: string;
    name: string;
    enabled: boolean;
}
```

- Interface: ChatMessage

```typescript
export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    isStreaming?: boolean;
}
```

- Interface: AppState

```typescript
export interface AppState {
    selectedMarkets: Market[];
    recipeMode: boolean;
    chatHistory: ChatMessage[];
    isLoading: boolean;
}
```




## Error Handling
- Keine explizite Fehlerbehandlung erkennbar.


## Performance Considerations
- Keine auffälligen Performance-Muster.

