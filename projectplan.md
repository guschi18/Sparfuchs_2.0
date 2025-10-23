# SparFuchs KI-Integration mit OpenRouter – Projektplan

<analysis>
Dieser Plan beschreibt die minimal-invasive Re-Implementierung der Chat-KI über OpenRouter. Fokus: Einfachheit, robuste Ergebnisqualität, kein Over-Engineering. Wir entfernen komplexe Intent-Pipelines und nutzen klare semantische Prompts [[memory:5223658]] [[memory:5223633]].
</analysis>

## Ziele
- KI versteht Benutzeranfragen und liefert relevante Angebote als Text + Produktkarten.
- Datenquelle ist lokal (`Angebote/latest/Angebote.txt` 
- Antworten sind strikt auf vorhandene Daten beschränkt (keine Halluzinationen).
- Streaming-Antworten kompatibel mit bestehender UI (`ChatMessage` erwartet `PRODUCT_CARD: {...}`).

## Architektur (einfach und erweiterbar)
- API: `app/api/chat/route.ts` (Node runtime).
- KI-Client: `lib/ai/openrouter.ts` (Aufruf `https://openrouter.ai/api/v1/chat/completions`, Streaming; Modell: `google/gemini-2.5-flash`).
- Datenzugriff: `lib/data/offers.ts` (Parser, Normalisierung, Suche).
- UI: Weiterverwendung bestehender Komponenten – keine Änderungen nötig.

## Datenformat
- **Quelle**: JSONL-Format in `Angebote/latest/Angebote.txt` .
- **Schema** (alle Felder aus tatsächlichen Daten):
  ```json
  {
    "supermarket": "<string>",           // Aldi, Lidl, Rewe, Edeka, Penny
    "brand": "<string|null>",            // Markenname
    "product_name": "<string>",          // Produktname
    "variant": "<string|null>",          // Variante/Geschmacksrichtung
    "pack_size": "<string|null>",        // z.B. "750 g", "1 L"
    "unit": "<string|null>",             // g, ml, Stück, etc.
    "pack_count": "<int|null>",          // Anzahl im Paket
    "price": <float>,                    // Aktionspreis in EUR
    "currency": "EUR",                   // Immer EUR
    "promo_type": "<string|null>",       // discount, app_price, Aktion, etc.
    "compare_price": "<string|null>",    // z.B. "1 kg = 2.39"
    "uvp": "<float|null>",               // Unverbindliche Preisempfehlung
    "discount_pct": "<int|null>",        // Rabatt in %
    "valid_from": "YYYY-MM-DD",          // Gültig ab
    "valid_to": "YYYY-MM-DD",            // Gültig bis
    "special_validity": "<string|null>", // Besondere Gültigkeitshinweise
    "notes": "<string|null>"             // z.B. "Begrenzte Verfügbarkeit"
  }
  ```


## API-Design
- Request: 
  ```json
  { 
    "message": "günstige Milch", 
    "selectedMarkets": ["Aldi","Rewe"],  // Nur in diesen Märkten suchen
    "useSemanticSearch": true 
  }
  ```
  **Wichtig**: `selectedMarkets` sind die vom User aktiv ausgewählten Supermärkte (Frontend-Buttons). 
  - Wenn **alle** Märkte ausgewählt: Suche über alle 5 Märkte (Aldi, Lidl, Rewe, Edeka, Penny)
  - Wenn **nur einzelne** ausgewählt (z.B. nur Aldi + Rewe): Suche **nur** in diesen beiden
  - Die KI soll **ausschließlich** Produkte aus den `selectedMarkets` zurückgeben

- Streaming Response (SSE-Linien): 
  - `data: {"content":"Text..."}` 
  - `data: {"content":"PRODUCT_CARD: {JSON}"}`
  - Abschluss: `data: {"done": true}`

## Prompting (Kernprinzipien)
- System Prompt (Kernaussagen):
  - „Nutze ausschließlich die bereitgestellten Angebotsdaten (vollständiges Schema mit brand, variant, pack_size, uvp, discount_pct, etc.)." 
  - „**WICHTIG**: Nutze NUR Produkte aus folgenden Supermärkten: [selectedMarkets]. Ignoriere alle anderen Märkte komplett!"
  - „Keine Produkte erfinden; wenn nichts passt, kurz sagen, dass nichts gefunden wurde."
  - „Bei Treffern: ergänze hilfreiche Textantwort in Deutsch (nutze discount_pct, uvp, notes für Kontext); für jedes Produkt eine Zeile `PRODUCT_CARD: {...}` .
  - „Nutze dein Wissen über Lebensmittel für semantische Interpretation (z.B. 'Milch' findet auch 'H-Milch', 'Bio-Milch')."
- **Markt-Filter**: Server filtert Daten VOR dem KI-Aufruf nach `selectedMarkets` → KI sieht nur relevante Märkte
- Minimalistische Semantik statt komplizierter Intent-Erkennung [[memory:5223658]] [[memory:5223633]].

## Implementierung – ToDo-Liste
- [ ] 0. Voraussetzungen
  - [ ] `OPENROUTER_API_KEY` in `.env.local` setzen
  - [ ]  `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_TITLE` (für Headers)
  - [ ] `Angebote/latest/Angebote.txt` ist bereits befüllt 
- [ ] 1. `lib/ai/openrouter.ts`
  - [ ] Wrapper für Chat Completions (Streaming, Headers: Authorization, Referer, X-Title)
  - [ ] Standardmodell auf `google/gemini-2.5-flash` setzen
- [ ] 2. `lib/data/offers.ts`
  - [ ] Parser: JSONL -> vollständiges `Offer` Interface (alle 17 Felder aus Schema)
  - [ ] Suche-Funktion:
    1. **Markt-Filter**: Filtere Angebote nach `supermarket` ∈ `selectedMarkets` (case-insensitive)
    2. **Keyword-Matching**: Suche in `product_name`, `brand`, `variant`
    3. **Normalisierung**: lowercase, trim, Unicode-Hyphen → '-', doppelte Spaces entfernen
    4. **Synonyme (klein, erweiterbar)**: z. B. "coca-cola" ≈ ["coca cola", "coke"]
  - [ ] Hilfsfunktion: `toProductCard()` – konvertiert vollständiges Offer zu vereinfachtem UI-Format
    - Markt normalisieren auf {Aldi, Lidl, Rewe, Edeka, Penny}
    - `dateRange` im Format "DD.MM. - DD.MM.YYYY"
- [ ] 3. `app/api/chat/route.ts`
  - [ ] `runtime = 'nodejs'` setzen (FS-Zugriff)
  - [ ] Request validieren (message, selectedMarkets erforderlich)
  - [ ] Daten laden und nach `selectedMarkets` filtern (nur diese Supermärkte berücksichtigen!)
  - [ ] Keyword-Suche in gefilterten Daten → Top N Kandidaten
  - [ ] Kontext-Aufbereitung: vollständige Offer-Daten (inkl. `uvp`, `discount_pct`, `notes`) an KI
  - [ ] System-Prompt ergänzen: "Nutze NUR Produkte aus folgenden Märkten: [selectedMarkets]"
  - [ ] OpenRouter-Aufruf mit System-Prompt + Kontext
  - [ ] Server erzeugt `PRODUCT_CARD:`-Zeilen aus den gefilterten Treffern (validiert gegen Datenbestand); KI liefert nur Begleittext
  - [ ] Streaming an Frontend: Server streamt KI-Text + `PRODUCT_CARD:` (serverseitig erzeugt)
  - [ ] Fehlerfälle: 
    - Keine selectedMarkets → "Bitte wähle mindestens einen Supermarkt aus"
    - Ungültige Märkte im Request → still ignorieren, nur Schnittmenge {Aldi,Lidl,Rewe,Edeka,Penny} nutzen
    - Keine Treffer in selectedMarkets → "Leider keine Angebote in den ausgewählten Märkten gefunden"
- [ ] 4. Qualität
  - [ ] Unit-Tests für Parser + Suche
  - [ ] Smoke-Test für API (einfacher Query-Flow)
  - [ ] Performanz: lazy loading + Caching (Datei-Hash, in-memory Cache in Dev)
- [ ] 5. Dokumentation
  - [ ] `docs/` kurz ergänzen (API, Datenformat, Env)
  - [ ] Review-Abschnitt unten ausfüllen

## Phasen / Meilensteine
- P1: Basis läuft (Parsing, Suche, OpenRouter-Streaming, UI zeigt Karten)
- P2: Härtung
  - Server-seitige Card-Validierung: Nur IDs aus Datenbestand zulassen; JSON serverseitig erzeugen (optional)
  - Rate Limiting, Timeouts, bessere Fehlermeldungen
- P3: Relevanz
  - Optionale Embeddings/Semantic Search, Ranking-Tuning
  - Tests/Analytics für Klick-Through und Nutzerzufriedenheit


## Beispiel: KI-Antwort mit vollständigen Daten

### Beispiel 1: Alle Märkte ausgewählt
**User-Query**: "günstige Milch unter 2 Euro"  
**selectedMarkets**: ["Aldi", "Lidl", "Rewe", "Edeka", "Penny"]

**KI-Antwort** (nutzt discount_pct, uvp, notes):
```
Ich habe 3 günstige Milch-Angebote für dich gefunden:

PRODUCT_CARD: {"id":"penny-milk-1","name":"Weihenstephan H-Milch 3,5%","price":"0.99","market":"PENNY","dateRange":"20.10. - 25.10.2025"}

PRODUCT_CARD: {"id":"aldi-milk-2","name":"Milram Frische Vollmilch","price":"1.29","market":"Aldi","dateRange":"20.10. - 26.10.2025"}

PRODUCT_CARD: {"id":"lidl-milk-3","name":"Milbona Bio-Milch 3,8%","price":"1.49","market":"Lidl","dateRange":"20.10. - 26.10.2025"}

Die Weihenstephan H-Milch bei Penny ist mit 45% Rabatt das beste Angebot (UVP 1.79€). Achtung: Begrenzte Verfügbarkeit!
```

### Beispiel 2: Nur Aldi + Rewe ausgewählt
**User-Query**: "günstige Milch unter 2 Euro"  
**selectedMarkets**: ["Aldi", "Rewe"]

**KI-Antwort** (zeigt NUR Aldi + Rewe):
```
Ich habe 2 Milch-Angebote in deinen ausgewählten Märkten (Aldi, Rewe) gefunden:

PRODUCT_CARD: {"id":"aldi-milk-1","name":"Milram Frische Vollmilch","price":"1.29","market":"Aldi","dateRange":"20.10. - 26.10.2025"}

PRODUCT_CARD: {"id":"rewe-milk-1","name":"Weide-Milch 3,8%","price":"1.69","market":"Rewe","dateRange":"20.10. - 26.10.2025"}

Hinweis: Bei Aldi sparst du 20% (UVP 1.59€).
```
**Wichtig**: Keine Penny/Lidl/Edeka-Produkte, obwohl dort eventuell günstigere Angebote existieren!

## Offene Fragen
- Gewünschte maximale Anzahl Produktkarten pro Antwort? So wievle wie in unseren Daten vorhanden sind. 
- Sollen wir UVP und Rabatt auch in der ProductCard-UI anzeigen? (Aktuell nur name, price, market, dateRange) Ja


## Akzeptanzkriterien
- Eine einfache Query („Milch unter 2€") liefert in <3s:
  - Hilfreiche Textantwort mit Kontext (nutzt discount_pct, uvp, notes)
  - ≥3 korrekte `PRODUCT_CARD`-Zeilen aus echten Daten (Angebote/latest/Angebote.txt)
- **Markt-Filter funktioniert korrekt**:
  - Alle Märkte ausgewählt → Ergebnisse aus allen 5 Märkten
  - Nur Aldi + Rewe ausgewählt → **NUR** Aldi + Rewe Produkte (keine anderen!)
  - Keine Märkte ausgewählt → Fehlermeldung
- KI nutzt vollständige Datenfelder für intelligente Antworten (z.B. "45% Rabatt", "UVP 3.49€")
- Keine Karten, wenn keine passenden Daten → klare Meldung.
- Semantische Suche funktioniert (z.B. "Joghurt" findet auch "Fruchtjoghurt", "Naturjoghurt")
- Fehler werden deutsch und freundlich kommuniziert.

## Nützliche Referenzen
- OpenRouter Quickstart: https://openrouter.ai/docs/quickstart

## Review
- Wird nach Umsetzung ausgefüllt: Änderungen, Learnings, nächste Schritte.