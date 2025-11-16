<!-- Source: app/components/Chat/ProductCard.tsx -->

# ProductCard Documentation

## Architektur & Zweck
- **Zweck**: Wiederverwendbare UI-/Feature-Komponente
- Client-Komponente (`"use client"`)
- **Styling**: Vollbreite (`w-full`) für optimale Grid-Integration (2-Spalten-Layout)
- **Markt-Anzeige**: Kein redundanter Markt-Badge (Markt wird durch Gruppierungs-Überschrift in ChatMessage angezeigt)


## Dependencies & Integration
- Externe Pakete: @heroui/react
- **AddToListButton**: Imported aus `./AddToListButton` (siehe docs)
- **Verwendung**: Ausschließlich in ChatMessage.tsx innerhalb markt-gruppierter Sektionen
- **Shopping List**: Props werden von page.tsx über ChatMessage weitergegeben


## Kritische Datenstrukturen
- Interface: ProductData

```typescript
export interface ProductData {
    name: string;
    price: string;
    market: string;        // Für Gruppierung verwendet, nicht angezeigt
    dateRange: string;
    id: string;
    brand?: string;        // Optional: Markenname
    uvp?: string;          // Optional: Unverbindliche Preisempfehlung
    discount_pct?: number; // Optional: Rabattprozentsatz
    notes?: string;        // Optional: Zusätzliche Hinweise
}
```

- Interface: ProductCardProps

```typescript
interface ProductCardProps {
    product: ProductData;
    onAddToList?: (product: ProductData) => void;  // Shopping List Handler
    isInList?: boolean;                             // Bereits in Liste?
}
```


## Geschäftslogik
- **Layout**: CardHeader mit flex justify-between für Brand/Title + AddToListButton
- **Shopping List Integration**:
  - AddToListButton im CardHeader (rechts oben)
  - Conditional Rendering: Nur wenn onAddToList übergeben
  - handleAddToList Wrapper für product-Weitergabe
- **Anzeige-Elemente**:
  - Produktname & Brand (falls vorhanden)
  - Preis (prominent in orange)
  - UVP & Rabatt-Badge (falls vorhanden)
  - Gültigkeitsdatum mit Kalender-Emoji
  - Hinweise (falls vorhanden)


## Error Handling
- Keine explizite Fehlerbehandlung erkennbar.


## Performance Considerations
- Minimale DOM-Struktur durch Entfernung des Markt-Badges
- Keine dynamischen Styling-Berechnungen mehr notwendig
