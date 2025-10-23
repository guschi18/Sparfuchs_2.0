<!-- Source: app/components/Error/UIErrorBoundary.tsx -->

# UIErrorBoundary Documentation

## Architektur & Zweck
- **Zweck**: Wiederverwendbare UI-/Feature-Komponente
- Client-Komponente (`"use client"`).


## Dependencies & Integration
- Externe Pakete: react
- Interne Module: ./ErrorBoundary


## Kritische Datenstrukturen
- Interface: UIErrorBoundaryProps

```typescript
interface UIErrorBoundaryProps {
    children: ReactNode;
    componentName?: string;
}
```




## Error Handling
- Keine explizite Fehlerbehandlung erkennbar.


## Performance Considerations
- Keine auffälligen Performance-Muster.

