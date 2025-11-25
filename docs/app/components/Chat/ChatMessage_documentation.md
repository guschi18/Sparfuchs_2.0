<!-- Source: app/components/Chat/ChatMessage.tsx -->

# ChatMessage Documentation

## Architektur & Zweck
- **Zweck**: Wiederverwendbare UI-/Feature-Komponente mit Streaming-Support und Loading-Animation
- Client-Komponente (`"use client"`).
- **LoadingDots Component**: Interne Sub-Komponente für animierte "Modell..." Anzeige während Streaming


## Dependencies & Integration
- Interne Module: ./ProductCard
- **Props-Weitergabe**: Erhält `selectedMarkets` von `page.tsx` für Sortierung und `isStreaming` für Loading-State


## Kritische Datenstrukturen
- Interface: ChatMessageProps

```typescript
interface ChatMessageProps {
    message: Message & { isStreaming?: boolean };  // Erweitert mit Streaming-Flag
    selectedMarkets: string[];  // Array der ausgewählten Supermärkte in gewünschter Reihenfolge
    onAddToList?: (product: ProductData) => void;
    isInList?: (productId: string) => boolean;
}
```


## Geschäftslogik
- **Streaming-Handling**:
  - Bei `isStreaming: true` und vorhandenen `PRODUCT_CARD:` wird nur `__LOADING_INDICATOR__` gerendert
  - Loading-Indikator zeigt "Modell..." mit animierten Punkten (CSS keyframe Animation)
  - Text-Content wird während Produkt-Streaming ausgeblendet
- **Markt-Gruppierung**: Produkte werden nach Supermarkt gruppiert (`productsByMarket` Objekt)
- **Markt-Sortierung**: Supermärkte werden nach der Reihenfolge in `selectedMarkets` sortiert
  - Sortierung erfolgt via `Array.indexOf()` für jedes Markt-Paar
  - Märkte nicht in `selectedMarkets` werden ans Ende sortiert (Index -1 → Fallback)
  - Garantiert konsistente Reihenfolge bei jeder Darstellung
- **Layout-Rendering**:
  - Desktop: 2-spaltiges Grid (`grid-cols-1 md:grid-cols-2`)
  - Mobile: 1-spaltig für bessere Lesbarkeit
- **Visuelle Struktur**: H3-Überschriften pro Markt mit `border-b-2 border-gray-300` Unterstrich
- **Container-Breite**: 95% für KI-Antworten, 80% für User-Nachrichten
- **Message-Styling**:
  - User-Messages: Beige-Hintergrund `rgba(232, 224, 208, 0.6)`, 2px Border `#999999`, Text `#1a1a1a` mit fontWeight 600
  - Assistant-Messages: Weißer Hintergrund, schwarzer fetter Text für Einleitungen
  - Assistant-Text: `text-black font-bold` nur für Assistant-Nachrichten, User-Messages erben Farbe vom Container


## Error Handling
- Try/Catch um Netzwerk-/Streaminglogik mit Nutzerfreundlicher Fallback-Message.


## Performance Considerations
- Effiziente Gruppierung durch Object.entries() Loop
- Minimale Re-Renders durch gezielte Key-Verwendung (`market-${key}-${marketIdx}`)
- Sortierung erfolgt nur einmal pro Render-Zyklus
- **LoadingDots Animation**: CSS-basiert (keyframe), keine JavaScript-Animation für bessere Performance
