<!-- Source: app/page.tsx -->

# page Documentation

## Architektur & Zweck
- **Zweck**: Next.js App Router Page-Komponente (Seiten-UI & Interaktionen)
- Client-Komponente (`"use client"`).
- Verarbeitet Streaming-Antworten (Reader-API).


## Dependencies & Integration
- Externe Pakete: framer-motion, react
- Interne Module:
  - Chat: ./components/Chat/ChatInput, ./components/Chat/ChatMessage, ./components/Chat/ProductCard
  - Layout: ./components/Layout/Footer, ./components/Layout/Header
  - UI: ./components/UI/CentralInput, ./components/UI/MarketToggles, ./components/UI/WelcomeMessages, ./components/UI/ShoppingListPanel, ./components/UI/Toast
  - Hooks: @/lib/hooks/useShoppingList, @/lib/hooks/useToast
- API-Aufrufe: /api/chat


## Kritische Datenstrukturen
- Interface: Message

```typescript
interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    isStreaming?: boolean;
}
```



## Geschäftslogik
- **State Management**:
  - `selectedMarkets`: Default-Reihenfolge `['Lidl', 'Aldi', 'Edeka', 'Penny', 'Rewe']`
  - `chatStarted`, `isLoading`, `isClient`: UI-Zustandsverwaltung
  - `isPanelOpen`, `hideCompleted`: Shopping List Panel State
- **Custom Hooks**:
  - `useShoppingList`: items, totalPrice, itemCount, addItem, removeItem, toggleCheck, clearList, isInList
  - `useToast`: toasts, dismissToast, success, error (Toast-Benachrichtigungen)
- **Props-Weitergabe**:
  - `selectedMarkets` → ChatMessage für Markt-Sortierung
  - Shopping List Props → Header (count, onOpen, isOpen)
  - Shopping List Props → ChatMessage → ProductCard (onAddToList, isInList)
- **Handler**:
  - Chat: handleUpdateMarkets, handleStartChat, handleSendMessage, handleResetChat
  - Shopping List: handleAddToList, handleOpenPanel, handleClosePanel, handleClearList, handleToggleHideCompleted
- **Hooks**: useState(6), useEffect(2), useShoppingList(1), useToast(1)


## Shopping List Integration
- **Features**:
  - Einkaufsliste mit LocalStorage-Persistenz (useShoppingList Hook)
  - Slide-in Panel von rechts (ShoppingListPanel Component)
  - "Zur Liste" Button in ProductCards (AddToListButton Component)
  - Toast-Benachrichtigungen bei Add/Clear Actions (success/error Toasts)
  - "Erledigte ausblenden" Filter im Panel
- **Flow**:
  1. User klickt "+ Liste" Button auf ProductCard
  2. handleAddToList() triggert addItem() (useShoppingList)
  3. Success-Toast erscheint (bottom-right)
  4. Item-Count Badge in Header aktualisiert sich
  5. User kann Panel über Header-Button öffnen
  6. Items können gecheckt, entfernt oder versteckt werden
- **Component Hierarchy**: page → Header + ShoppingListPanel + ChatMessage → ProductCard → AddToListButton

## Error Handling
- Try/Catch um Netzwerk-/Streaminglogik mit Nutzerfreundlicher Fallback-Message
- Shopping List: Duplicate-Check in addItem() (gibt false zurück)
- Toast Error bei bereits existierendem Produkt

## Performance Considerations
- Chunkweises UI-Update aus Streaming-Daten
- Shopping List: useMemo für totalPrice/itemCount, useCallback für Handler
- Debounced LocalStorage Writes (300ms) zur Vermeidung exzessiver I/O
