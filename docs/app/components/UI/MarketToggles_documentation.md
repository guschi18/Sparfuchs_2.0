<!-- Source: app/components/UI/MarketToggles.tsx -->

# MarketToggles Documentation

## Architektur & Zweck
- **Zweck**: Wiederverwendbare UI-/Feature-Komponente
- Client-Komponente (`"use client"`).


## Dependencies & Integration
- Externe Pakete: framer-motion


## Kritische Datenstrukturen
- Interface: MarketTogglesProps

```typescript
interface MarketTogglesProps {
    selectedMarkets: string[];
    onMarketChange: (markets: string[]) => void;
}
```




## Error Handling
- Keine explizite Fehlerbehandlung erkennbar.


## Performance Considerations
- Keine auffälligen Performance-Muster.

