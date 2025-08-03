# Projektplan - KI-Suchoptimierung für 100% korrekte Produktsuche

## Problem
Die KI-Suche von Produkten ist oftmals nicht optimal bis falsch:
- "Butter" findet "Buttergebäck" statt Streichfett
- "Milch" findet Joghurt statt Trinkmilch  
- "Fleisch" findet Geschirrspülmittel statt echte Fleischprodukte

## Ziel
100% korrekte Produktsuche ohne zusätzliche Token-Kosten durch intelligente Kategorie-Filterung.

## Lösungsansatz - Kostengünstiger statischer Plan

### 1. Erweiterte Query-Preprocessing (Lokal) ⏸️
- [ ] Statische Intent-Detection-Regeln erstellen
- [ ] Query-Intent-Mapping für häufige Suchanfragen:
  - "Butter" → Kategorien: "Butter/Margarine", "Milchprodukte/Fette"
  - "Milch" → Kategorien: "Milchprodukte/Getränke", "Getränke"  
  - "Fleisch" → Kategorien: "Fleisch (*)"
  - Weitere häufige Begriffe ergänzen
- [ ] Intent-Detection Service implementieren

### 2. Verbesserte Kategorie-Filterung in ProductDataService ⏸️
- [ ] ProductDataService um Kategorie-Prefiltering erweitern
- [ ] Suchraum vor KI-Analyse reduzieren (978 → ~50-100 Produkte)
- [ ] Kategorie-basierte Suche implementieren
- [ ] Tests für Kategorie-Filterung

### 3. Optimierte Semantic Search Prompts ⏸️
- [ ] Bestehende KI-Prompts um Kategorie-Kontext erweitern
- [ ] "Suche [PRODUKT] in Kategorien: [RELEVANTE_KATEGORIEN]" 
- [ ] Kategorie-spezifische Suchlogik in semantic-search.ts
- [ ] Token-Anzahl konstant halten, Qualität verbessern

### 4. Statische Ausschluss-Listen ⏸️
- [ ] JSON-Konfiguration für Kategorie-Ausschlüsse erstellen:
  - Bei Butter-Suche: NIEMALS "Backwaren (Gebäck)"
  - Bei Milch-Suche: NIEMALS "Joghurt", "Desserts", "Speisequark"
  - Bei Fleisch-Suche: NIEMALS "Haushaltsartikel", "Fisch"
- [ ] Ausschluss-Logik in Suchprozess integrieren

### 5. Validierung & Tests ⏸️
- [ ] Testfälle für problematische Queries erstellen
- [ ] Regression-Tests: Butter, Milch, Fleisch
- [ ] Performance-Tests (Suchgeschwindigkeit)
- [ ] Ergebnis-Qualität messen

## Erfolgskriterien
- ✅ "Butter" findet nur Streichfett-Produkte
- ✅ "Milch" findet nur Trinkmilch
- ✅ "Fleisch" findet nur echte Fleischprodukte  
- ✅ Keine zusätzlichen Token-Kosten
- ✅ Performance bleibt gleich oder besser

## Technische Details
- **Keine zusätzlichen KI-Calls**: Arbeitet mit bestehender Token-Anzahl
- **Statische Konfiguration**: Wartbar über JSON-Files
- **Backward-kompatibel**: Fallback auf traditionelle Suche
- **Skalierbar**: Neue Intent-Regeln einfach hinzufügbar

## Next Steps
Plan geschrieben - bereit für Umsetzung! 🚀