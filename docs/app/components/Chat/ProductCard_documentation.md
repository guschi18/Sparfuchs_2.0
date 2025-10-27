<!-- Source: app/components/Chat/ProductCard.tsx -->

# ProductCard Documentation

## Architektur & Zweck
- **Zweck**: Wiederverwendbare UI-/Feature-Komponente
- Client-Komponente (`"use client"`)
- **Styling**: Vollbreite (`w-full`) für optimale Grid-Integration (2-Spalten-Layout)


## Dependencies & Integration
- Externe Pakete: @heroui/react


## Kritische Datenstrukturen
- Interface: ProductData

```typescript
export interface ProductData {
    name: string;
    price: string;
    market: string;
    dateRange: string;
    id: string;
}
```

- Interface: ProductCardProps

```typescript
interface ProductCardProps {
    product: ProductData;
}
```




## Error Handling
- Keine explizite Fehlerbehandlung erkennbar.


## Performance Considerations
- Keine auffälligen Performance-Muster.

