# useShoppingList Hook Documentation

## Architektur & Zweck
**Zweck**: Custom React Hook für Shopping List State Management mit LocalStorage-Persistenz
**Pattern**: Hook mit optimierten Berechnungen (useMemo, useCallback) und debounced Storage
**Kritische Entscheidung**: Optimistic Updates + 300ms debounced LocalStorage writes für Performance

## Dependencies & Integration
- **React Hooks**: useState, useEffect, useMemo, useCallback, useRef
- **Types**: ShoppingListItem, ProductCard aus `@/types`
- **Storage Service**: shoppingListStorage aus `@/lib/utils/localStorage`
- **Debounce**: 300ms delay für Storage-Writes zur Vermeidung exzessiver I/O

## Kritische Datenstrukturen
```typescript
interface UseShoppingListReturn {
  items: ShoppingListItem[];           // Aktuelle Liste
  totalPrice: number;                  // Berechnet mit useMemo
  itemCount: number;                   // Berechnet mit useMemo
  isLoaded: boolean;                   // SSR-safe initialization
  isUsingFallback: boolean;            // LocalStorage availability check

  // CRUD Operations
  addItem: (product: ProductCard) => boolean;
  removeItem: (itemId: string) => void;
  toggleCheck: (itemId: string) => void;
  clearList: () => void;
  isInList: (productId: string) => boolean;
}
```

## Geschäftslogik
- **Price Parsing**: Konvertiert String-Preise (z.B. "2,49") zu numerischen Werten
- **Duplicate Check**: addItem() gibt false zurück wenn Produkt bereits in Liste
- **Optimistic Updates**: State wird sofort aktualisiert, Storage async geschrieben
- **SSR-Safety**: isLoaded flag verhindert hydration mismatches

## Error Handling
- Try-catch bei LocalStorage load (Mount)
- Fallback zu leerem Array bei Fehler
- Storage Service handhabt QuotaExceeded automatisch

## Performance Considerations
- **useMemo**: totalPrice und itemCount nur bei items-Änderung neu berechnet
- **useCallback**: Alle Handler stabilisiert für Child-Component-Optimierung
- **Debouncing**: 300ms Verzögerung verhindert excessive Storage-Writes
- **Cleanup**: Debounce-Timer wird bei unmount gecleant

## Integration Points
- **ProductCard → ShoppingListItem**: productToListItem() Transformation
- **LocalStorage**: Automatisches Laden bei Mount, Speichern bei Änderungen
- **page.tsx**: Zentrale State-Verwaltung für gesamte App
