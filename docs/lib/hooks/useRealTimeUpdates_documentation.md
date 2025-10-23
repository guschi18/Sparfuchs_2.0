<!-- Source: lib/hooks/useRealTimeUpdates.ts -->

# useRealTimeUpdates Documentation

## Architektur & Zweck
- **Zweck**: Hilfs-/Infrastrukturmodul (Business-/Utility-Logik)
- Client-Komponente (`"use client"`).
- Verarbeitet Streaming-Antworten (Reader-API).


## Dependencies & Integration
- Externe Pakete: react


## Kritische Datenstrukturen
- Interface: RealtimeState

```typescript
export interface RealtimeState {
    isConnected: boolean;
    isStreaming: boolean;
    hasError: boolean;
    errorMessage: string;
    lastUpdateTime: Date | null;
}
```

- Interface: StreamChunk

```typescript
export interface StreamChunk {
    content?: string;
    warning?: string;
    done?: boolean;
    error?: string;
}
```



## Geschäftslogik
- Hooks: useEffect(1), useCallback(5)


## Error Handling
- Try/Catch um Netzwerk-/Streaminglogik mit Nutzerfreundlicher Fallback-Message.


## Performance Considerations
- Chunkweises UI-Update aus Streaming-Daten.
- Memoization/Callbacks vorhanden.

