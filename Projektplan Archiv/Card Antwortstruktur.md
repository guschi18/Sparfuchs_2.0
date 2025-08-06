# Project Plan: Card Antwortstruktur wie im Screenshot implementieren

## Ziel
Die exakte Struktur aus dem Screenshot umsetzen: Einleitungstext � "Hier sind die aktuellen Angebote:" � Product Cards mit individuellen Beschreibungstexten

## Haupt�nderungen in `/lib/ai/context.ts`

### 1. System-Prompt erweitern (Zeile 40-46)
- Klare Anweisung fuer Einleitungstext
- Verpflichtender Uebergangstext "Hier sind die aktuellen Angebote:"
- Anweisung fuer individuellen Beschreibungstext nach jeder Product Card

### 2. Beispiel-Template verbessern (Zeile 45)
- Vollstaendiges Template mit allen Strukturelementen
- Klare Vorgabe: Text -> Uebergang -> Card -> Beschreibung -> Card -> Beschreibung...

### 3. Kontext-Generierung anpassen (Zeile 164)
- Bessere Anweisungen fuer die gewuenschte Struktur
- Explizite Vorgabe fuer Beschreibungstexte nach jeder Product Card

## Ergebnis
KI-Antworten folgen exakt der Struktur aus dem Screenshot mit individuellen Beschreibungstexten fuer jede Product Card.