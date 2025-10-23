<!-- Source: lib/hooks/useFormValidation.ts -->

# useFormValidation Documentation

## Architektur & Zweck
- **Zweck**: Hilfs-/Infrastrukturmodul (Business-/Utility-Logik)
- Client-Komponente (`"use client"`).


## Dependencies & Integration
- Externe Pakete: react


## Kritische Datenstrukturen
- Interface: ValidationRule

```typescript
export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minWords?: number;
    maxWords?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
}
```

- Interface: ValidationError

```typescript
export interface ValidationError {
    field: string;
    message: string;
    type: string;
}
```

- Interface: FormField

```typescript
export interface FormField {
    value: string;
    touched: boolean;
    errors: ValidationError[];
    isValid: boolean;
}
```



## Geschäftslogik
- Hooks: useMemo(4), useCallback(9)


## Error Handling
- Keine explizite Fehlerbehandlung erkennbar.


## Performance Considerations
- Memoization/Callbacks vorhanden.

