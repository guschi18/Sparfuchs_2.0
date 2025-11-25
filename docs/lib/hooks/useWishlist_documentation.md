# useWishlist Hook Documentation

## Architektur & Zweck
**Zweck**: Custom Hook für Merkzettel-Verwaltung (Wunschliste für Produktbegriffe)
**Pattern**: State Management Hook mit LocalStorage-Persistenz
**Kritische Entscheidung**: Debounced Storage Writes (300ms) zur Performance-Optimierung

## Dependencies & Integration
- **Types**: `WishlistItem` aus `@/types`
- **Storage**: `wishlistStorage` aus `@/lib/utils/localStorage`
- **Parent**: `app/page.tsx` als Consumer

## Kritische Datenstrukturen
```typescript
interface WishlistItem {
  id: string;          // Unique identifier
  name: string;        // Produktbegriff (z.B. "Käse")
  addedAt: number;     // Timestamp
}

interface UseWishlistReturn {
  items: WishlistItem[];
  itemCount: number;
  isLoaded: boolean;
  isUsingFallback: boolean;
  addItem: (name: string) => boolean;
  removeItem: (itemId: string) => void;
  clearList: () => void;
  hasItem: (name: string) => boolean;
}
```

## Geschäftslogik
- **addItem**: Trim + Lowercase-Duplikatprüfung, generiert unique ID
- **removeItem**: Filter + debounced Storage Write
- **clearList**: Sofortige Storage-Löschung (kein Debounce)
- **hasItem**: Case-insensitive Existenzprüfung

## Error Handling
- **Storage Load Errors**: Try-catch, Fallback zu leerem Array
- **Storage Write Errors**: Logged via console.error
- **SSR-Safety**: isLoaded State verhindert Hydration Mismatch

## Performance Considerations
- **Debouncing**: 300ms Delay für Storage Writes
- **useMemo**: itemCount Berechnung
- **useCallback**: Alle Handler memoized
- **Cleanup**: Timer-Cleanup bei Unmount

