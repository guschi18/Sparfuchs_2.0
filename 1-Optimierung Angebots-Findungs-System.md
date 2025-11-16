# Projektplan: Optimierung Angebots-Findungs-System

**Ziel:** Vereinfachtes, aber leistungsfähiges System mit hoher Trefferquote für Produktsuche  
**Langfristig:** Vorbereitung für Rezept-Integration (Chefkoch API)  
**Datum:** 2025-11-04

---

## 🎯 Hauptziele

1. **Hohe Trefferquote:** Alle relevanten Produkte finden
2. **Keine False Positives:** Nur passende Produkte zeigen
3. **Vereinfachung:** Komplexität reduzieren, Code wartbar halten
4. **Skalierbar:** System vorbereiten für spätere Rezept-Integration
5. **Konsistentes Layout:** Antworten immer gleich strukturiert

---

## 📊 IST-Analyse

### ✅ Was funktioniert bereits gut

- `findOffers()` mit Synonym-Erweiterung funktioniert grundsätzlich
- Produktdaten-Struktur in `Angebote.txt` ist vorhanden
- Frontend Produkt-Karten-Display funktioniert
- Markt-Filter arbeitet zuverlässig

### ❌ Aktuelle Probleme

1. **AI-Halluzinationen:** AI erfindet Produkte die nicht existieren
2. **Inkonsistentes Layout:** Jede Antwort sieht anders aus
3. **Komplexes System:** Zu viele Schichten (Intent-Detection, etc.)
4. **Unvollständige Synonyme:** Nicht alle Produktkategorien abgedeckt
5. **False Positives:** "Milch" findet "Milchschokolade"

---

## 🏗️ Neue Architektur: 3-Schichten-System

```
┌────────────────────────────────────────────────────┐
│  LAYER 1: AI Intelligence                          │
│  ─────────────────────────────────────────────     │
│  Input:  User-Anfrage                              │
│  Output: Strukturiertes JSON                       │
│  {                                                  │
│    "intent": "simple_search",                      │
│    "searchTerms": ["milch", "h-milch"],           │
│    "filters": {                                    │
│      "maxPrice": 2.0,                             │
│      "attributes": ["günstig", "bio"]             │
│    }                                               │
│  }                                                 │
└────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────┐
│  LAYER 2: Search Engine (Pure Code)               │
│  ─────────────────────────────────────────────     │
│  - findOffers() mit verbesserter Logik            │
│  - Erweiterte Synonym-Erweiterung                 │
│  - Smart Filtering (keine False Positives)        │
│  - Relevanz-Scoring                               │
│  - Sortierung & Ranking                           │
└────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────┐
│  LAYER 3: Response Generator (Pure Code)          │
│  ─────────────────────────────────────────────     │
│  - Template-basierte Antworten                    │
│  - Konsistentes Layout                            │
│  - Gruppierung nach Kategorien/Märkten            │
│  - Statistiken (Ø Preis, beste Angebote)         │
└────────────────────────────────────────────────────┘
```

---

## 📝 Todo-Liste

### Phase 1: Search Engine Optimierung (Priorität: HOCH)

- [x] **1.1** Analyse der aktuellen Synonym-Abdeckung ✅ **ABGESCHLOSSEN**
  - ✅ Script erstellt: `scripts/Synonyms/analyze-coverage.ts`
  - ✅ Analysiert: 1574 Angebote, 2299 einzigartige Begriffe
  - ✅ Coverage: 21% (483 abgedeckt, 1816 unabgedeckt)
  - ✅ Reports generiert: `coverage-report.md` + `coverage-analysis.json`
  - **Key Finding:** Eigenmarken (esmara, milbona, etc.) sind größtes Gap

- [x] **1.2** Automatische Kategorie-Erfassung & Synonym-Generierung ✅ **ABGESCHLOSSEN**
  - ✅ Script erstellt: `generate-synonyms.ts` + `integrate-synonyms.ts`
  - ✅ 495 Brands + 933 Produkte aus CSVs analysiert
  - ✅ 32 Food-Brands gemapped zu Produktkategorien
  - ✅ 8 neue Produkt-Synonyme generiert
  - ✅ Integration in lib/data/offers.ts erfolgreich
  - **Ergebnis:** 63 → 98 Kategorien (+35), Coverage: 21% → 24% (+3%)
  
- [x] **1.2b** AI-Enhanced Coverage Analysis & Smart Brand Mapping ✅ **ABGESCHLOSSEN**
  - ✅ Scripts erstellt: `ai-analyze-coverage.ts`, `smart-brand-mapper.ts`, `integrate-smart-mappings.ts`
  - ✅ Intelligente Analyse mit regelbasierter KI-Logik
  - ✅ 83 Top-Brands gemappt (Best Moments, Naturgut Bio, Dr. Oetker, etc.)
  - ✅ Umfassendes Mapping von Discounter-Eigenmarken & bekannten Marken
  - ✅ 140 Brand-Synonyme zu 56 Kategorien hinzugefügt
  - ✅ Non-Food-Filter verbessert (Elektronik, Kleidung, Textilien, etc.)
  - **Ergebnis:** 98 → 121 Kategorien (+23), Coverage: 24% → 26.9% (+2.9%)

- [ ] **1.3** False-Positive Prevention
  - Implementiere "Exact Match First" Strategie
  - Blacklist für bekannte False Positives (z.B. "Milch" ≠ "Milchschokolade")
  - Context-Aware Filtering (Kategorie-Kontext beachten)

- [ ] **1.4** Relevanz-Scoring System
  - Score-Berechnung: Exact Match (100) > Brand Match (80) > Synonym Match (60)
  - Sortierung nach Relevanz + Preis
  - Deduplizierung ähnlicher Produkte

- [ ] **1.5** Fuzzy-Matching & Fallback-System
  - Implementiere Fuzzy-Search für Tippfehler (z.B. "Milsh" → "Milch")
  - Levenshtein-Distance oder ähnlicher Algorithmus
  - Fallback: Wenn keine exakte Treffer, versuche ähnliche Begriffe
  - Confidence-Score: Zeige User "Meintest du X?" bei unsicheren Matches

- [ ] **1.6** Testing & Validierung
  - Test-Suite mit 50+ typischen User-Anfragen (inkl. Edge Cases)
  - Trefferquote messen (Precision & Recall)
  - Benchmark: >90% Precision, >85% Recall
  - Test Coverage: Top 100 Kategorien + 20 Long-Tail Produkte

### Phase 2: AI-Integration mit strukturiertem Output (Priorität: MITTEL)

- [ ] **2.1** AI-Prompt für strukturierte Ausgabe
  - System-Prompt umschreiben: JSON-Output erzwingen
  - Schema-Definition für AI-Response
  - Beispiele im Prompt (Few-Shot Learning)

- [ ] **2.2** Intent-Detection vereinfachen
  - Nur 3 Intents: `simple_search`, `comparison`, `recipe` (später)
  - AI extrahiert Suchbegriffe + Filter aus User-Anfrage
  - Keine komplexe Intent-Hierarchie

- [ ] **2.3** AI-Response Validation
  - JSON-Schema Validierung
  - Fallback bei Parse-Errors
  - Logging für fehlgeschlagene Responses

### Phase 3: Response Generator (Priorität: MITTEL)

- [ ] **3.1** Template-System erstellen
  - Templates für: Keine Treffer, 1-5 Treffer, 5+ Treffer
  - Gruppierung: Nach Markt, nach Kategorie, nach Preis
  - Statistiken: Durchschnittspreis, Beste Ersparnis

- [ ] **3.2** Layout-Komponenten
  - `ProductGrid`: Standard-Darstellung aller Produkte
  - `ProductGrouped`: Gruppiert nach Kategorie
  - `PriceComparison`: Vergleichsansicht

- [ ] **3.3** Konsistente Antwort-Struktur
  ```typescript
  interface ChatResponse {
    message: string;              // Template-generiert
    products: ProductCard[];      // Gefiltert & sortiert
    stats: {
      total: number;
      avgPrice: number;
      bestDeal: ProductCard;
    };
    grouping?: "market" | "category" | "none";
  }
  ```

### Phase 4: Vorbereitung Rezept-Integration (Priorität: NIEDRIG)

- [ ] **4.1** Datenstruktur für Rezepte
  - Type-Definition: `Recipe`, `Ingredient`, `RecipeResponse`
  - Mock-Daten für Testing erstellen

- [ ] **4.2** Multi-Search Logik
  - Funktion: `findOffersForIngredients(ingredients: string[])`
  - Gruppierung der Ergebnisse nach Zutat
  - Preisoptimierung über Märkte hinweg

- [ ] **4.3** Chefkoch API Research
  - API-Dokumentation studieren
  - Authentication-Flow verstehen
  - Rate-Limits & Kosten klären

- [ ] **4.4** Rezept-Template Design
  - UI-Mockup für Rezept-Ansicht
  - Einkaufsliste-Generator
  - Markt-Empfehlung basierend auf Gesamtpreis

---

## 🔬 Detailplan: Phase 1.2 - Automatische Kategorie-Erfassung

### Ziel: 200-300 Kategorien aus 1700 Angeboten extrahieren

**Script-Flow:**
```typescript
1. Lade alle Angebote aus Angebote.txt
2. Extrahiere Basis-Begriffe:
   - "Bio H-Milch 3,5%" → "milch"
   - "Kerrygold Original Irische Butter" → "butter", "kerrygold"
   - "Haribo Goldbären 200g" → "haribo", "goldbären", "gummibärchen"

3. Gruppiere ähnliche Produkte:
   - Alle mit "milch" → Kategorie "Milch"
   - Alle mit "butter" → Kategorie "Butter"
   
4. Zähle Häufigkeit pro Kategorie

5. Generiere Synonym-Vorschläge mit AI:
   - Prompt: "Gib mir 10 Synonyme für 'Milch' im Kontext Supermarkt"
   - Output: ["h-milch", "frischmilch", "vollmilch", ...]

6. Export:
   - categories-report.json (alle Kategorien mit Häufigkeit)
   - synonym-suggestions.json (AI-generierte Synonyme)
   - manual-review-top100.csv (für manuelle Optimierung)
```

**NLP-Techniken:**
- Tokenisierung (Wörter aufteilen)
- Stop-Words entfernen ("der", "die", "das", "mit", "aus")
- Stemming (Grundform finden: "Äpfel" → "Apfel")
- Brand-Detection (Großgeschriebene Wörter als Marken erkennen)

---

## 🔬 Detailplan: Phase 1.3 - False-Positive Prevention

### Problem-Beispiele
```
User: "Milch"
❌ Findet: Milchschokolade, Milchbrötchen, Kokosmilch
✅ Soll finden: H-Milch, Frischmilch, Vollmilch

User: "Butter"  
❌ Findet: Butterkekse, Erdnussbutter
✅ Soll finden: Markenbutter, Süßrahmbutter

User: "Käse"
❌ Findet: Käsekuchen, Käsespätzle
✅ Soll finden: Gouda, Emmentaler, Schnittkäse
```

### Lösungsansatz: Context-Aware Filtering

```typescript
// Kategorie-Kontext definieren
const CATEGORY_CONTEXT = {
  "milch": {
    include: ["h-milch", "frischmilch", "vollmilch", "fettarme milch"],
    exclude: ["schokolade", "kakao", "pudding", "kekse", "brötchen"],
    productCategories: ["Molkereiprodukte", "Getränke"]
  },
  "butter": {
    include: ["markenbutter", "süßrahmbutter", "kerrygold"],
    exclude: ["keks", "cookie", "erdnuss", "mandel"],
    productCategories: ["Molkereiprodukte", "Brotaufstriche"]
  }
};

function smartFilter(products: Offer[], searchTerm: string): Offer[] {
  const context = CATEGORY_CONTEXT[searchTerm.toLowerCase()];
  
  if (!context) {
    return products; // Normale Suche
  }
  
  return products.filter(product => {
    const name = product.product_name.toLowerCase();
    
    // Ausschluss-Begriffe checken
    const hasExcluded = context.exclude.some(term => name.includes(term));
    if (hasExcluded) return false;
    
    // Include-Begriffe bevorzugen
    const hasIncluded = context.include.some(term => name.includes(term));
    const hasSearchTerm = name.includes(searchTerm);
    
    return hasIncluded || hasSearchTerm;
  });
}
```

---

## 📈 Erfolgsmetriken

### Quantitative Metriken
- **Precision:** >90% (nur relevante Produkte)
- **Recall:** >85% (alle relevanten Produkte gefunden)
- **Response Time:** <500ms (ohne AI), <2s (mit AI)
- **False Positive Rate:** <5%
- **Kategorie-Abdeckung:** 95%+ aller Produkte haben passende Synonyme

### Qualitative Metriken
- Layout ist in 100% der Fälle konsistent
- User kann Intent immer nachvollziehen
- Keine halluzinierten Produkte

### Kategorie-Abdeckungs-Ziele
```
Top 100 Kategorien:  manuell optimiert (→ 80% aller User-Anfragen)
Next 150 Kategorien: automatisch generiert (→ 15% aller User-Anfragen)  
Long Tail + Fuzzy:   Fallback-System (→ 5% aller User-Anfragen)

= 100% Anfragen abgedeckt
```

---

## 🚀 Implementierungs-Reihenfolge

1. **Start:** Phase 1.1 - 1.2 (Analyse & Automatische Kategorie-Erfassung)
2. **Dann:** Phase 1.3 - 1.4 (False-Positive Prevention & Scoring)
3. **Danach:** Phase 1.5 - 1.6 (Fuzzy-Matching & Testing)
4. **Parallel möglich:** Phase 3.1 - 3.2 (Templates)
5. **Später:** Phase 2 (AI-Integration mit strukturiertem Output)
6. **Zukunft:** Phase 4 (Rezepte)

---

## 💡 Technische Entscheidungen

### AI-Modell
- **Aktuell:** `google/gemini-2.5-flash-lite`
- **Vorteil:** Schnell, günstig, gutes Deutsch
- **Für JSON-Output:** Ideal mit klarem Schema

### Datenbank
- **Aktuell:** File-based (Angebote.txt)
- **Zukunft:** Optional SQLite/PostgreSQL für Rezepte
- **Entscheidung:** Erst bei >10.000 Produkten nötig

### Caching
- **Simple In-Memory Cache** für findOffers()
- TTL: 1 Stunde (Angebote ändern sich selten)
- Invalidierung: Bei neuem Angebote.txt Upload

---

## 📋 Review-Checkliste (Am Ende)

- [ ] Kategorie-Abdeckung: 95%+ aller 1700 Angebote haben Synonyme
- [ ] Trefferquote >90% bei 50+ Test-Anfragen
- [ ] Keine False Positives bei häufigen Begriffen (Milch, Butter, Käse)
- [ ] Fuzzy-Matching funktioniert für Tippfehler
- [ ] Top 100 Kategorien manuell optimiert
- [ ] Layout ist konsistent
- [ ] Code ist vereinfacht (weniger Komplexität)
- [ ] System ist bereit für Rezept-Integration
- [ ] Dokumentation ist aktuell
- [ ] Tests sind geschrieben

---

## 🔄 Nächste Schritte

1. **Plan Review:** User validiert diesen Plan
2. **Start Phase 1.1:** Synonym-Analyse Script schreiben
3. **Iterativ arbeiten:** Task für Task abhaken
4. **Regelmäßiges Testing:** Nach jedem Task testen

---

**Status:** ⏳ Warte auf Freigabe  
**Nächster Task:** Phase 1.1 - Synonym-Analyse

