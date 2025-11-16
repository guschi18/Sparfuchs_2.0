<!-- Source: app/components/Chat/ChatMessage.tsx -->

# ChatMessage Documentation

## Architektur & Zweck
- **Zweck**: Wiederverwendbare UI-/Feature-Komponente
- Client-Komponente (`"use client"`).


## Dependencies & Integration
- Interne Module: ./ChatContainer, ./ProductCard
- **Props-Weitergabe**: Erhält `selectedMarkets` von `page.tsx` für Sortierung


## Kritische Datenstrukturen
- Interface: ChatMessageProps

```typescript
interface ChatMessageProps {
    message: Message;
    selectedMarkets: string[];  // Array der ausgewählten Supermärkte in gewünschter Reihenfolge
}
```


## Geschäftslogik
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


## Error Handling
- Try/Catch um Netzwerk-/Streaminglogik mit Nutzerfreundlicher Fallback-Message.


## Performance Considerations
- Effiziente Gruppierung durch Object.entries() Loop
- Minimale Re-Renders durch gezielte Key-Verwendung (`market-${key}-${marketIdx}`)
- Sortierung erfolgt nur einmal pro Render-Zyklus
