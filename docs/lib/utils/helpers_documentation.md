<!-- Source: lib/utils/helpers.ts -->

# helpers Documentation

## Architektur & Zweck
- **Zweck**: Hilfs-/Infrastrukturmodul (Business-/Utility-Logik)

## Wichtige Funktionen

### isAppPrice
```typescript
export function isAppPrice(notes: string | null | undefined): boolean
```
- **Zweck**: Prüft ob ein Produkt einen App-Preis hat (nur mit Supermarkt-App verfügbar)
- **Erkennung**: Sucht case-insensitiv nach "app-preis" im notes-Feld
- **Verwendung**: ProductCard, ShoppingListPanel für App-Preis-Kennzeichnung


## Error Handling
- Keine explizite Fehlerbehandlung erkennbar.


## Performance Considerations
- Keine auffälligen Performance-Muster.

