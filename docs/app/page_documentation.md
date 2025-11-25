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
  - UI: ./components/UI/CentralInput, ./components/UI/MarketToggles, ./components/UI/WelcomeMessages, ./components/UI/ShoppingListPanel, ./components/UI/WishlistPanel, ./components/UI/Toast
  - Hooks: @/lib/hooks/useShoppingList, @/lib/hooks/useWishlist, @/lib/hooks/useToast
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
  - `isWishlistOpen`: Wishlist Panel State
- **Custom Hooks**:
  - `useShoppingList`: items, totalPrice, itemCount, addItem, removeItem, toggleCheck, clearList, isInList
  - `useWishlist`: items, itemCount, addItem, removeItem, clearList (Merkzettel)
  - `useToast`: toasts, dismissToast, success, error (Toast-Benachrichtigungen)
- **Props-Weitergabe**:
  - `selectedMarkets` → ChatMessage für Markt-Sortierung
  - Shopping List Props → Header (count, onOpen, isOpen)
  - Wishlist Props → Header (count, onOpen, isOpen)
  - Shopping List Props → ChatMessage → ProductCard (onAddToList, isInList)
- **Handler**:
  - Chat: handleUpdateMarkets, handleStartChat, handleSendMessage, handleResetChat
  - Shopping List: handleAddToList, handleOpenPanel, handleClosePanel, handleClearList, handleToggleHideCompleted
  - Wishlist: handleOpenWishlist, handleCloseWishlist, handleSearchWishlistItem
- **Hooks**: useState(7), useEffect(2), useShoppingList(1), useWishlist(1), useToast(1)


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

## Wishlist Integration (Merkzettel)
- **Features**:
  - Merkzettel mit LocalStorage-Persistenz (useWishlist Hook)
  - Slide-in Panel von links (WishlistPanel Component)
  - Eingabefeld für manuelle Produktbegriffe
  - "Angebote suchen" Button pro Eintrag triggert Chat-Suche
  - **MarketToggles synchron mit Main Page** (shared selectedMarkets State)
- **Flow**:
  1. User öffnet Merkzettel über Header-Button (links)
  2. User kann Märkte auswählen (synchronisiert mit Hauptseite)
  3. User gibt Produktbegriff ein (z.B. "Käse") und klickt "+"
  4. Begriff wird als Karte gespeichert
  5. User klickt "Angebote suchen" auf der Karte
  6. handleSearchWishlistItem() schließt Panel und sendet Begriff an Chat
  7. Chat zeigt Angebote nur für ausgewählte Märkte an
- **Component Hierarchy**: page → Header + WishlistPanel (mit MarketToggles)

## Error Handling
- Try/Catch um Netzwerk-/Streaminglogik mit Nutzerfreundlicher Fallback-Message
- Shopping List: Duplicate-Check in addItem() (gibt false zurück)
- Toast Error bei bereits existierendem Produkt

## Performance Considerations
- Chunkweises UI-Update aus Streaming-Daten
- Shopping List: useMemo für totalPrice/itemCount, useCallback für Handler
- Debounced LocalStorage Writes (300ms) zur Vermeidung exzessiver I/O
