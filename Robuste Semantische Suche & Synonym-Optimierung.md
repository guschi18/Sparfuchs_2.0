# Projektplan: Robuste Semantische Suche & Synonym-Optimierung

## 🔍 PROBLEMANALYSE

##1

### Akutes Problem: Gurke wird nicht gefunden
**Ursache identifiziert:** Das Gurken-Angebot (Zeile 1606) hat `"price": null` mit `"promo_type": "TAGESAKTUELLER PREIS"`.

In `lib/data/offers.ts` Zeile 307-309 werden alle Angebote ohne gültigen Preis herausgefiltert:
```typescript
const pricedResults = searchResults.filter(offer =>
  typeof offer.price === 'number' && Number.isFinite(offer.price) && offer.price > 0
);
```

**Ergebnis:** Die Suche nach "Gurke" funktioniert technisch korrekt, aber das Produkt wird wegen fehlendem Preis entfernt.

##2

### Systematisches Problem: SYNONYMS-Robustheit
**Aktuelle Situation:**
- 63 Synonym-Kategorien in `SYNONYMS` Dictionary
- Manuelle Pflege erforderlich
- Keine automatische Analyse neuer Angebote
- Keine Abdeckungsprüfung gegen aktuelle Angebote
- Wöchentlich wechselnde Produkte werden nicht automatisch erfasst

**Risiken:**
- Neue Produktnamen werden nicht gefunden
- Saisonale Produkte fehlen in SYNONYMS
- Marken-Varianten werden übersehen
- Schreibvarianten (Umlaute, Bindestriche) nicht vollständig abgedeckt

---

## 📋 LÖSUNGSANSATZ

### Phase 1: Sofortmaßnahme - Preis-Filter anpassen ✅ PRIO 1
**Ziel:** Produkte mit `price: null` sollen angezeigt werden (Option C: Mit Hinweis, aber ohne Preisvergleich)

**Maßnahmen:**
1. Anpassung in `lib/data/offers.ts`:
   - Filter in `findOffers()` anpassen: Produkte ohne Preis NICHT mehr entfernen
   - Stattdessen: Sortierung ändern (Produkte mit Preis zuerst, ohne Preis am Ende)
   
2. Anpassung in `toProductCard()`:
   - Fallback für `price: null` → `"Tagesaktueller Preis - Im Markt erfragen"`
   
   
3. Frontend-Anpassung (falls nötig):
   - ProductCard soll "Tagespreis" speziell darstellen
   - Ohne Preisvergleich-Funktion für diese Produkte

**Implementierungsdetails:**
- Produkte ohne Preis: `price: "Tagesaktueller Preis - Im Markt erfragen"` in ProductCard
- Sortierung: `offers.sort((a, b) => (a.price ? 0 : 1) - (b.price ? 0 : 1))`
   
**Zeitaufwand:** ~30 Min
**Komplexität:** Niedrig

---

### Phase 2: Synonym-Analyzer Script erstellen ✅ PRIO 2
**Ziel:** Automatische Analyse der Angebote.txt für SYNONYMS-Optimierung

**Script-Funktionen:**
1. **Produkt-Extraktion:**
   - Alle `product_name` und `brand` aus Angebote.txt extrahieren
   - Deduplizierung
   - Normalisierung (lowercase, trim)
   
2. **Coverage-Analyse:**
   - Abgleich: Welche Produktnamen und Brand sind in SYNONYMS abgedeckt?
   - Identifikation fehlender Begriffe
   - Kategorisierung nach Häufigkeit
   
3. **Synonym-Vorschläge:**
   - Ähnliche Begriffe clustern (z.B. "Gurke"/"Gurken"/"Salatgurke")
   - Kategorievorschläge basierend auf Semantik
   - KI-gestützte Kategorisierung
   
4. **Report-Generierung:**
   - Markdown-Report mit:
     - Coverage-Rate (X% der Produkte abgedeckt)
     - Top 50 nicht abgedeckte Produkte
     - Vorschläge für neue SYNONYMS-Einträge
     - Warnungen bei kritischen Lücken

**Output:**
```
scripts/
  ├── analyze-synonyms.ts      # Haupt-Script
  └── synonym-report.md         # Generierter Report
```

**Zeitaufwand:** ~2-3 Stunden
**Komplexität:** Mittel

---

### Phase 3: Automatisches Synonym-Update System ✅ PRIO 3
**Ziel:** Wöchentlicher Prozess zur SYNONYMS-Verbesserung (Option A: Vorschläge mit manueller Freigabe)

**Workflow:**
1. **Wöchentliche Ausführung:**
   ```bash
   npm run analyze:synonyms      # Analyse + KI-Kategorisierung
   npm run generate:suggestions  # Generiert Vorschläge
   ```
   
2. **Automatische Aktionen:**
   - Neue Produktnamen und Brand erfassen
   - Häufigkeits-Analyse über Zeit
   - Delta-Report: Was ist neu diese Woche?
   
3. **KI-Integration mit OpenRouter:** ✅ **AKTIVIERT**
   - Model: `google/gemini-2.5-flash-lite`
   - Funktion: Semantische Kategorisierung neuer Begriffe
   - Batch-Verarbeitung (max. 50 Begriffe pro Request)
   - Kosten: ~0.10-0.50€ pro Durchlauf
   - Prompt: "Kategorisiere folgende Lebensmittel-Begriffe..."
   
4. **Review-Prozess (Manuell):** ✅ **GEWÄHLT**
   - Script generiert `synonym-suggestions.json`
   - Enthält KI-Vorschläge mit Confidence-Score
   - Manuelle Review durch Nutzer
   - Manuelle Übernahme in `lib/data/offers.ts` (SYNONYMS)
   - Kein automatisches Update des Produktivcodes!

**Output:**
```
scripts/
  ├── analyze-synonyms.ts           # Haupt-Analyse
  ├── generate-suggestions.ts       # KI-Integration
  └── reports/
      ├── synonym-report-2025-11-02.md
      ├── synonym-suggestions.json   # ✅ Für manuelle Review
      └── synonym-history.json       # Historische Änderungen
```

**Sicherheit:**
- Keine automatischen Code-Änderungen
- Alle Vorschläge sind transparent und nachvollziehbar
- Versionierung der Historischen Daten

**Zeitaufwand:** ~3-4 Stunden
**Komplexität:** Mittel-Hoch


## 🎯 IMPLEMENTIERUNGSPLAN

### Sprint 1: Sofortmaßnahmen (Tag 1)
- [x] **Task 1.1:** Preis-Filter in `offers.ts` anpassen (Null-Preise zulassen, Ergebnisse nach Preis vorhanden → zuerst)
- [x] **Task 1.2:** `toProductCard()` für `price: null` erweitern
- [x] **Task 1.3:** Test: "Gurke" bei Aldi finden
- [x] **Task 1.4:** Weitere Produkte mit `price: null` prüfen

**Erfolgskriterium:** Gurke wird im Frontend angezeigt

---

### Sprint 2: Synonym-Analyzer (Tag 2-3)
- [x] **Task 2.1:** TypeScript Script erstellen: `scripts/analyze-synonyms.ts`
- [x] **Task 2.2:** `Angebote/latest/Angebote.txt` parsen → `product_name` + `brand` extrahieren (normalisiert)
- [x] **Task 2.3:** `SYNONYMS` aus `lib/data/offers.ts` exportieren und im Script nutzen
- [x] **Task 2.4:** Coverage-Analyse (Produkt + Brand) gegen `SYNONYMS`
- [x] **Task 2.5:** OpenRouter-Kategorisierung für nicht abgedeckte Begriffe (Kategorie + Confidence)
- [x] **Task 2.6:** Report-Generator (`synonym-report.md`): Coverage, Top-Lücken, KI-Vorschläge
- [x] **Task 2.7:** NPM Script hinzufügen: `npm run analyze:synonyms` und ersten Report erzeugen

**Erfolgskriterium:** Report zeigt Coverage-Rate und Top-Lücken

---

### Sprint 3: Wöchentlicher Update-Prozess (Tag 4-5)
- [ ] **Task 3.1:** `scripts/generate-suggestions.ts` erstellen (Vorschlagsdatei generieren)
- [ ] **Task 3.2:** Delta-Analyse (Neue Begriffe vs. `reports/synonym-history.json`)
- [ ] **Task 3.3:** OpenRouter-Batching + Caching/Rate-Limiting für Kategorisierung
- [ ] **Task 3.4:** `reports/synonym-suggestions.json` schreiben (Mapping + Confidence)
- [ ] **Task 3.5:** `reports/synonym-history.json` fortschreiben (Versionierung)
- [ ] **Task 3.6:** Review-Workflow dokumentieren (manuelle Übernahme in `offers.ts`)
- [ ] **Task 3.7:** Wöchentlicher Probedurchlauf mit aktuellen Angeboten

**Erfolgskriterium:** Wöchentlicher Prozess dokumentiert und getestet

---


## 📊 TECHNISCHE DETAILS

### Script-Architektur: analyze-synonyms.ts

```typescript
// Struktur des Analyze-Scripts

interface ProductAnalysis {
  productName: string;
  count: number;
  markets: string[];
  isCovered: boolean;
  matchedSynonym?: string;
  similarProducts?: string[];
}

interface SynonymReport {
  totalProducts: number;
  uniqueProducts: number;
  coveredProducts: number;
  coverageRate: number;
  uncoveredProducts: ProductAnalysis[];
  suggestions: SynonymSuggestion[];
}

// Hauptfunktionen:
// 1. extractProducts(angeboteTxt): Product[]
// 2. checkCoverage(products, synonyms): Coverage
// 3. generateSuggestions(uncovered): Suggestion[]
// 4. createReport(analysis): Markdown
```

### Datenfluss
```
Angebote.txt 
    ↓
[Extract Products] 
    ↓
[Normalize & Deduplicate]
    ↓
[Check against SYNONYMS]
    ↓
[Identify Gaps]
    ↓
[Generate Suggestions]
    ↓
[Create Report]
    ↓
synonym-report.md
```

---

## 🔧 KONFIGURATION

### NPM Scripts hinzufügen (package.json)
```json
{
  "scripts": {
    "analyze:synonyms": "tsx scripts/analyze-synonyms.ts",
    "generate:suggestions": "tsx scripts/generate-suggestions.ts",
    "synonyms:report": "tsx scripts/analyze-synonyms.ts --report-only"
  }
}
```

### Dependencies
- `tsx` - bereits vorhanden ✅
- `@/lib/ai/openrouter` - bereits vorhanden für KI-Integration ✅
- Optional: `natural` - NLP für Stemming/Levenshtein
- Optional: `fast-levenshtein` - Ähnlichkeitsanalyse


## 🎯 ZUSAMMENFASSUNG

**Hauptziele:**
1. ✅ Sofort-Fix: Produkte ohne Preis anzeigen (Gurken-Problem)
2. ✅ Analyse-Tool: Automatische SYNONYMS-Coverage-Prüfung
3. ✅ Wöchentlicher Prozess: Kontinuierliche Verbesserung der SYNONYMS

**Langfristiger Nutzen:**
- 95%+ Coverage-Rate
- Automatisierung spart ~4h/Woche
- Bessere Nutzererfahrung
- Skalierbar für zukünftige Features


### Workflow-Diagramm

```
Wöchentlich:
  Angebote.txt (neu)
       ↓
  [analyze-synonyms.ts]
       ↓
  Extraktion + Coverage-Check
       ↓
  Neue/fehlende Begriffe identifiziert
       ↓
  [generate-suggestions.ts]
       ↓
  OpenRouter KI-Kategorisierung
       ↓
  synonym-suggestions.json
       ↓
  📋 MANUELLE REVIEW (Du)
       ↓
  Manuelle Integration in offers.ts
       ↓
  ✅ SYNONYMS verbessert
```



## Review – 2025-11-02

- Phase 1 abgeschlossen: Preisfilter und Fallback „Tagesaktueller Preis - Im Markt erfragen“ aktiv (Test mit „Gurke“ erfolgreich).
- Phase 2 abgeschlossen: `scripts/analyze-synonyms.ts` erstellt, Coverage-Analyse & Report `scripts/synonym-report.md` generiert, KI-Fallback integriert (überspringt ohne API-Key).
- Paket-Script `npm run analyze:synonyms` ergänzt, `SYNONYMS` exportiert für Wiederverwendung in Auswertung.
- Nächster Schritt: Sprint 3 vorbereiten (Delta-Workflow, KI-Suggestions persistieren, manuelle Review).

