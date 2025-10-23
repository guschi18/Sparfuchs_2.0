<!-- Source: lib/hooks/useSessionState.ts -->

# useSessionState Documentation

## Architektur & Zweck
- **Zweck**: Hilfs-/Infrastrukturmodul (Business-/Utility-Logik)
- Client-Komponente (`"use client"`).


## Dependencies & Integration
- Externe Pakete: react


## Kritische Datenstrukturen
- Interface: SessionState

```typescript
export interface SessionState {
    sessionId: string;
    selectedMarkets: string[];
    chatStarted: boolean;
    preferences: {
        autoScroll: boolean;
        showTimestamps: boolean;
        compactMode: boolean;
    };
}
```



## Geschäftslogik
- State: isLoaded
- Hooks: useState(1), useEffect(1)


## Error Handling
- Try/Catch um Netzwerk-/Streaminglogik mit Nutzerfreundlicher Fallback-Message.


## Performance Considerations
- Keine auffälligen Performance-Muster.

