# ProductCard UI Verbesserung - Bessere Produktinformationen

## Ziel
Nutzer sollen alle relevanten Produktdaten auf einen Blick sehen können, um bessere Kaufentscheidungen zu treffen.

## Aktuelle Probleme
1. **Brand zu klein**: `text-xs` macht die Marke schwer erkennbar
2. **Fehlende Detailinformationen**: `variant`, `pack_size`, `unit` werden aktuell in `name` zusammengebaut statt separat angezeigt
3. **Irrelevante Notes**: Alle notes werden angezeigt, auch wenn sie nichts mit App-Preisen zu tun haben

## Analyse der aktuellen Implementierung

### Datenfluss
1. **Offer Interface** (`types/index.ts:24-42`) - Enthält alle Felder: variant, pack_size, unit
2. **toProductCard** (`lib/data/offers.ts:255-285`) - Baut variant + pack_size in name ein (Zeile 263-268)
3. **ProductData Interface** (`ProductCard.tsx:5-15`) - Fehlen: variant, pack_size, unit
4. **UI Rendering** (`ProductCard.tsx:34-88`) - Zeigt nur zusammengebauten name an

### Problem im Detail
In `lib/data/offers.ts:261-268`:
```typescript
let name = offer.product_name;
if (offer.variant) {
  name += ` - ${offer.variant}`;
}
if (offer.pack_size) {
  name += ` (${offer.pack_size})`;
}
```
→ Diese Informationen gehen als separate Felder verloren!

## Lösungsansatz

### Phase 1: Type-Definitionen erweitern
- [ ] `ProductData` Interface in `app/components/Chat/ProductCard.tsx:5-15` erweitern um:
  - `variant?: string;`
  - `pack_size?: string;`
  - `unit?: string;`
- [ ] `ProductCard` Interface in `types/index.ts:45-55` entsprechend erweitern

### Phase 2: Data-Transformation anpassen
- [ ] `toProductCard` Funktion in `lib/data/offers.ts:255-285` überarbeiten:
  - `name` soll NUR `offer.product_name` enthalten (keine Konkatenation)
  - `variant` als separates Feld zurückgeben
  - `pack_size` als separates Feld zurückgeben
  - `unit` als separates Feld zurückgeben

### Phase 3: UI-Komponente verbessern
- [ ] **Brand vergrößern**: Zeile 39 von `text-xs` auf `text-sm font-semibold` ändern
- [ ] **Produktname**: Bleibt in Zeile 43-45 (bereits gut)
- [ ] **Neue Produktdetails-Zeile hinzufügen** (nach Name, vor Divider):
  - Wenn `variant` vorhanden: anzeigen
  - Wenn `pack_size` vorhanden: anzeigen
  - Wenn `unit` vorhanden: anzeigen
  - Format: `variant • pack_size • unit` (mit Bullet-Points trennen)
- [ ] **Notes-Filter implementieren** (Zeile 80-85):
  - Nur anzeigen wenn `notes` "app" enthält (case-insensitive)
  - Regex: `/app/i.test(product.notes)`

### Phase 4: Visuelle Prüfung mit Chrome DevTools
- [ ] Milch-Beispiel testen (aktuelle Anfrage)
- [ ] Verschiedene Produkttypen prüfen:
  - Produkte MIT variant/pack_size/unit
  - Produkte OHNE diese Felder
  - Produkte mit App-Preis-Notes vs. andere Notes
- [ ] Mobile Responsiveness prüfen
- [ ] Screenshot vor/nach Vergleich

## Betroffene Dateien

1. **`types/index.ts`** (Zeile 45-55)
   - ProductCard Interface erweitern

2. **`lib/data/offers.ts`** (Zeile 255-285)
   - toProductCard Funktion überarbeiten
   - Name-Konkatenation entfernen
   - Separate Felder zurückgeben

3. **`app/components/Chat/ProductCard.tsx`**
   - ProductData Interface erweitern (Zeile 5-15)
   - Brand vergrößern (Zeile 39)
   - Produktdetails-Sektion hinzufügen (nach Zeile 46)
   - Notes-Filter implementieren (Zeile 80)

## Erwartetes Ergebnis

### Vorher
```
┌─────────────────────────────┐
│ BÄRENMARKE                  │ ← zu klein!
│ Frische Milch - 3.8/1.8...  │ ← alles zusammen
│                             │
│ 1.19 €        [Lidl]        │
│ ...                         │
└─────────────────────────────┘
```

### Nachher
```
┌─────────────────────────────┐
│ Bärenmarke                  │ ← größer & besser lesbar!
│ Frische Milch               │ ← nur Produktname
│ 3.8/1.8% Fett • 1L          │ ← Details separat!
│                             │
│ 1.19 €        [Lidl]        │
│ ...                         │
└─────────────────────────────┘
```

## Risiken & Überlegungen

1. **Breaking Changes**: Die API-Response ändert sich → Frontend muss angepasst werden
2. **Backwards Compatibility**: Alte Daten könnten fehlerhafte Darstellung haben
3. **Leerzeichen**: Was wenn alle neuen Felder leer sind? → Keine zusätzliche Zeile anzeigen
4. **Performance**: Kein Impact erwartet (nur UI-Rendering)

## Review-Kriterien

- [ ] Brand ist deutlich besser lesbar
- [ ] variant, pack_size, unit werden separat und klar angezeigt (wenn vorhanden)
- [ ] notes werden nur bei App-Preisen angezeigt
- [ ] Layout ist auf Mobile + Desktop gut lesbar
- [ ] Keine Konsolenfehler
- [ ] TypeScript-Typen sind korrekt
- [ ] Bestehende Funktionalität bleibt erhalten
