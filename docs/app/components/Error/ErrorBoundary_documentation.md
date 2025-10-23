<!-- Source: app/components/Error/ErrorBoundary.tsx -->

# ErrorBoundary Documentation

## Architektur & Zweck
- **Zweck**: Wiederverwendbare UI-/Feature-Komponente
- Client-Komponente (`"use client"`).


## Dependencies & Integration
- Externe Pakete: react


## Kritische Datenstrukturen
- Interface: Props

```typescript
interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

- Interface: State

```typescript
interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}
```

- Klasse: ErrorBoundary extends Component<Props, State>



## Error Handling
- Keine explizite Fehlerbehandlung erkennbar.


## Performance Considerations
- Keine auffälligen Performance-Muster.

