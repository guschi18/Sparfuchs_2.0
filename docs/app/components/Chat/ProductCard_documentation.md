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
- **isAppPrice**: Imported aus `@/lib/utils/helpers` für App-Preis-Erkennung
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
    variant?: string;      // Optional: Variante (z.B. "Scharf")
    pack_size?: string;    // Optional: Packungsgröße (z.B. "500g")
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
- **Layout**:
  - Top Row: Date Range + AddToListButton (rechtsbündig)
  - CardHeader: Brand (falls vorhanden) + Title (zentriert)
- **Shopping List Integration**:
  - AddToListButton in der oberen Datums-Zeile
  - Conditional Rendering: Nur wenn onAddToList übergeben
  - handleAddToList Wrapper für product-Weitergabe
- **Anzeige-Elemente**:
  - Produktname & Brand (falls vorhanden)
  - Preis (prominent in grün)
  - App-Preis-Kennzeichnung (📱 *App-Preis) unterhalb des Preises, falls notes "App-Preis" enthält
  - Größe & Variante (als Badges)
  - Gültigkeitsdatum mit Kalender-Emoji
  - Hinweise (falls vorhanden)


## Error Handling
- Keine explizite Fehlerbehandlung erkennbar.


## Performance Considerations
- Minimale DOM-Struktur durch Entfernung des Markt-Badges
- Keine dynamischen Styling-Berechnungen mehr notwendig
