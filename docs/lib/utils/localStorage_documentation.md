# localStorage Service Documentation

## Architektur & Zweck
**Zweck**: Production-ready LocalStorage wrapper mit SSR-Safety und Error Handling
**Pattern**: Singleton Service mit In-Memory Fallback
**Kritische Entscheidung**: Graceful Degradation bei unavailable Storage (Private Mode, SSR)

## Dependencies & Integration
- **Types**: ShoppingListItem aus `@/types`
- **Browser API**: window.localStorage (mit SSR-Check)
- **Fallback**: Custom MemoryStorage class für Storage-unavailable Szenarien

## Kritische Datenstrukturen
```typescript
class StorageService {
  private storage: Storage | MemoryStorage;
  private isAvailable: boolean;

  // Type-safe Generic Methods
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): void;
  clear(): void;
}

// Shopping List specific API
export const shoppingListStorage = {
  get(): ShoppingListItem[];
  set(items: ShoppingListItem[]): boolean;
  clear(): void;
  addItem(item: ShoppingListItem): boolean;
  removeItem(itemId: string): boolean;
  updateItem(itemId: string, updates: Partial<ShoppingListItem>): boolean;
}
```

## Geschäftslogik
- **Availability Check**: Test-Write bei Initialization (SSR-safe)
- **JSON Serialization**: Automatisches Serialize/Deserialize mit Type-Safety
- **Singleton Pattern**: Einmalige Instanz-Erstellung für konsistente State

## Error Handling
- **QuotaExceededError**: Logged, gibt false zurück (keine Exception)
- **SecurityError**: Graceful Fallback zu MemoryStorage
- **Parse Errors**: Try-catch bei getItem, gibt null zurück
- **SSR-Safety**: typeof window Check verhindert Server-Side Errors

## Storage Keys
```typescript
export const STORAGE_KEYS = {
  SHOPPING_LIST: 'sparfuchs_shopping_list',
} as const;
```

## Performance Considerations
- **Singleton**: Eine Service-Instanz für gesamte App
- **Batch Operations**: shoppingListStorage bietet optimierte Bulk-Methods
- **Memory Fallback**: Performant bei unavailable LocalStorage

## Integration Points
- **useShoppingList**: Hauptnutzer des shoppingListStorage
- **Next.js**: SSR-compatible durch window-Check
- **Private Browsing**: Funktioniert dank MemoryStorage Fallback
