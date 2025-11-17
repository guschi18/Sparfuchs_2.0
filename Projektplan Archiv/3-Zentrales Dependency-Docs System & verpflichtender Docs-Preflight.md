# Plan: Zentrales Dependency-Docs System & verpflichtender Docs-Preflight

## Kontext & Ziel
Wir stellen sicher, dass vor jeder Implementierung die aktuellsten offiziellen Dokumentationen der Kern-Dependencies konsultiert werden. Dazu erstellen wir eine zentrale, versionierte Übersicht mit Links und verankern einen verbindlichen „Docs-Preflight“ im Entwickler-Workflow (in `CLAUDE.md`).

## Scope (gemäß Auswahl)
- Speicherort der Übersicht: `docs/dependency-docs.md`
- Abdeckung zunächst nur der Kern-Dependencies:
  - Next.js (^14.2.18)
  - React (^18.3.1)
  - Tailwind CSS (^3.3.6)
  - HeroUI / @heroui/react (^2.6.14)
  - Framer Motion (^12.23.12)
  - OpenRouter (google/gemini-2.5-flash-lite) – API-Dokumentation
  - Jest (^29.7.0)
  - ESLint (^8.57.1)

Quelle der Versionen: `package.json` (Stand jetzt). OpenRouter ist Integrations-Docs (kein NPM-Paket hier).

## Deliverables
1. Neue Datei `docs/dependency-docs.md` (strukturierte Link-Übersicht inkl. Versionen, Migrations/Changelog, Kurznotizen).
2. Ergänzung von `CLAUDE.md`:
   - Verbindlicher „Docs-Preflight“ vor jedem Coding:
     - Betroffene Dependencies identifizieren
     - Eintrag in `docs/dependency-docs.md` öffnen
     - Verlinkte offizielle Docs/Migrations prüfen
     - Bei Versionssprüngen: Migration-Guide lesen und relevante Notizen ergänzen
   - „Projekt-Doku und verlinkte offizielle Docs haben Vorrang vor Modellwissen“.
3. Aufnahme der neuen Datei in die Dokumentations-Referenzen (optional kurzer Hinweis in `CLAUDE.md`-Docs-Map).

## Struktur von `docs/dependency-docs.md`
Für jede Dependency:
- Name
- Aktuelle Version (aus `package.json`)
- Offizielle Docs-URL
- Migration/Changelog-Links (falls relevant)
- Kurznotizen (z. B. „App Router aktiv“, „Breaking Changes ab v14“)

Vorgeschlagene Links (bei Anlage final prüfen):
- Next.js (^14.2.18)
  - Docs: https://nextjs.org/docs
  - Upgrading: https://nextjs.org/docs/app/building-your-application/upgrading
- React (^18.3.1)
  - Docs: https://react.dev/learn
- Tailwind CSS (^3.3.6)
  - Docs: https://tailwindcss.com/docs
- HeroUI / @heroui/react (^2.6.14)
  - Docs: https://www.heroui.com/docs
- Framer Motion (^12.23.12)
  - Docs: https://www.framer.com/motion/
- OpenRouter (Gemini 2.5 Flash Lite)
  - Docs: https://openrouter.ai/docs
- Jest (^29.7.0)
  - Docs: https://jestjs.io/docs
- ESLint (^8.57.1)
  - Docs: https://eslint.org/docs/latest/

## Workflow-Änderung (CLAUDE.md)
Vor Schritt „Implementierung“ wird ein fixer Schritt „0. Docs-Preflight“ ergänzt:
1) Betroffene Dependencies bestimmen  
2) `docs/dependency-docs.md` öffnen  
3) Verlinkte Docs/Migrations prüfen  
4) Bei Versionsdifferenzen: Datei aktualisieren (Version, Links, Notizen)

Klarstellung: Offizielle Docs > Modellwissen, immer.

## Akzeptanzkriterien
- `docs/dependency-docs.md` existiert mit allen oben gelisteten Kern-Dependencies, korrekten Versionen, Docs-Links und optionalen Notizen.
- `CLAUDE.md` enthält den verbindlichen Docs-Preflight und den Vorrang-Hinweis.
- Die neue Datei ist in der Doku-Referenz auffindbar.
- Bei Versionssprüngen sind Migration-Guides Pflichtlektüre, relevante Notizen werden ergänzt.

## ToDos
- [x] `docs/dependency-docs.md` anlegen (Struktur + Einträge für Kern-Dependencies)
- [x] Versionen aus `package.json` übernehmen
- [x] Offizielle Docs-/Migration-Links verifizieren und eintragen
- [x] `CLAUDE.md`: „Docs-Preflight" + „Docs > Modellwissen" ergänzen
- [x] `CLAUDE.md`-Docs-Map um `dependency-docs.md` erweitern
- [x] Review 

## Risiken & Gegenmaßnahmen
- Risiko: Links veralten → Gegenmaßnahme: Bei Updates/Merge-Requests Versions-/Link-Check als Review-Punkt.
- Risiko: Zusätzlicher Pflegeaufwand → Gegenmaßnahme: Minimalistische Struktur, nur Kern-Dependencies, klare Verantwortlichkeit.
- Risiko: Übersehen von Migrationshinweisen → Gegenmaßnahme: Pflichtschritt „Docs-Preflight“ vor Implementierung.

## Aufwand
- Umsetzung: ~30–45 Minuten (Erstanlage + `CLAUDE.md`-Ergänzung)
- Laufende Pflege: Minuten pro Dependency-Update

---

## ✅ Review & Abschluss

### Implementierte Änderungen (2025-11-16)

#### 1. Neue Datei: `docs/dependency-docs.md`
- **Erstellt**: Zentrale Dependency-Referenz mit 8 Kern-Dependencies
- **Inhalt**:
  - Vollständige Übersicht: Next.js, React, Tailwind CSS, HeroUI, Framer Motion, OpenRouter, Jest, ESLint
  - Aktuelle Versionen aus `package.json` (Stand: 2025-11-16)
  - Offizielle Docs-Links + Migration Guides + Changelog-URLs
  - Kurznotizen zu wichtigen Features/Breaking Changes
  - Wartungs-Workflow für Dependency-Updates
  - Review-Checkliste für Updates
- **Zweck**: Single Source of Truth für alle Dependency-Informationen

#### 2. CLAUDE.md Erweiterungen
**a) Neuer Abschnitt "0. Docs-Preflight"** (vor Standard Workflow)
- Verpflichtender Check vor jeder Implementierung
- 4-Schritte-Prozess: Dependencies identifizieren → `dependency-docs.md` öffnen → Offizielle Docs prüfen → Migration-Guides bei Updates
- Praktische Beispiele (React Components, Styling, Testing, API-Integration)
- **Kernbotschaft**: "Offizielle Dokumentation hat IMMER Vorrang vor Modellwissen!"

**b) Documentation Reference Map erweitert**
- Neuer Abschnitt "📚 Dependency Documentation" eingefügt (nach Type Definitions)
- Kurzbeschreibung mit Versions-Übersicht
- Hinweis auf verpflichtenden Docs-Preflight

### Erreichte Akzeptanzkriterien ✅
- ✅ `docs/dependency-docs.md` existiert mit allen 8 Kern-Dependencies
- ✅ Korrekte Versionen aus `package.json` übernommen
- ✅ Offizielle Docs-Links + Migration-Guides verifiziert und eingetragen
- ✅ `CLAUDE.md` enthält verbindlichen Docs-Preflight-Schritt
- ✅ Vorrang-Hinweis "Docs > Modellwissen" prominent platziert
- ✅ `dependency-docs.md` in Documentation Reference Map integriert
- ✅ Wartungs-Workflow für Dependency-Updates dokumentiert

### Qualitätssicherung
- **Strukturqualität**: Klare, konsistente Markdown-Struktur in `dependency-docs.md`
- **Vollständigkeit**: Alle 8 geplanten Dependencies dokumentiert
- **Verlinkung**: Direkte Links zu offiziellen Quellen (NextJS, React, Tailwind, etc.)
- **Integration**: Nahtlose Einbindung in bestehende CLAUDE.md-Struktur
- **Wartbarkeit**: Minimalistische Struktur, klare Update-Anweisungen

### Nutzen für das Projekt
1. **Verhindert veraltete Pattern**: Entwickler arbeiten mit aktuellen Best Practices
2. **Reduziert Debugging-Zeit**: Korrekte Implementierung von Anfang an
3. **Zentrale Referenz**: Keine Zeitverschwendung durch Suchen von Docs
4. **Versionskontrolle**: Klare Übersicht über eingesetzte Versionen
5. **Migration-Safety**: Breaking Changes werden frühzeitig erkannt

### Nächste Schritte (Optional)
- [ ] Monatlicher Dependency-Check als Kalendererinnerung einrichten
- [ ] Bei jedem `npm update`: `dependency-docs.md` aktualisieren
- [ ] Link-Checker für automatische Validierung der URLs (optional)

### Zeitaufwand (Tatsächlich)
- **Planung**: ~10 Minuten
- **Umsetzung**: ~35 Minuten
- **Review & Dokumentation**: ~10 Minuten
- **Gesamt**: ~55 Minuten (leicht über Schätzung von 30-45 Min)

**Status**: ✅ Abgeschlossen
**Implementiert von**: Claude Code (10x Senior Developer Mode)
**Datum**: 2025-11-16

---

## 🔄 Update: Explizite Versions-Regeln (2025-11-16)

### Problemstellung
Nach initialer Implementierung wurde festgestellt, dass **nicht ausreichend klar** war, dass die KI:
- Docs für die **aktuell verwendeten Versionen** (aus `package.json`) nutzen soll
- **NICHT** auf neueste Versionen upgraden darf

**Risiko**: Die allgemeinen Docs-Links (z.B. `nextjs.org/docs`) zeigen standardmäßig die neueste Version, nicht die aktuell verwendete Version.

### Implementierte Verbesserungen

#### 1. `docs/dependency-docs.md` - Kritischer Versions-Hinweis
**Position**: Zeile 15-18 (direkt nach "Offizielle Dokumentation hat immer Vorrang")

**Inhalt**:
```markdown
⚠️ **KRITISCH - Versions-Regel**:
- **NIEMALS Dependencies upgraden** ohne explizite Anweisung des Entwicklers!
- Nutze **IMMER die Docs zur Version aus `package.json`**, NICHT zur neuesten Version!
- Falls die Docs-Website standardmäßig die neueste Version zeigt: Version-Picker nutzen oder nach der richtigen Version suchen.
```

#### 2. `CLAUDE.md` - Versions-Regel im Docs-Preflight
**Position**: Zeile 38-41 (im Abschnitt "0. Docs-Preflight", nach Beispielen)

**Inhalt**:
```markdown
⚠️ **KRITISCH - Versions-Regel**:
- Nutze Dokumentation zur **AKTUELL installierten Version** (siehe `package.json`)
- **NIEMALS Dependencies upgraden** ohne explizite Anweisung des Entwicklers
- Falls Docs die neueste Version zeigen: Version-Picker nutzen oder nach richtiger Version suchen
```

### Erreichte Verbesserungen ✅
- ✅ **Unmissverständliche Anweisung**: Upgrade-Verbot prominent und mehrfach platziert
- ✅ **Versions-Klarheit**: Explizite Anweisung zur Nutzung der aktuell installierten Versionen
- ✅ **Praktische Hilfe**: Hinweis auf Version-Picker bei Docs-Websites
- ✅ **Doppelte Absicherung**: Regel sowohl in `dependency-docs.md` als auch in `CLAUDE.md`

### Nutzen
1. **Verhindert ungewollte Upgrades**: KI wird niemals Dependencies upgraden ohne Anweisung
2. **Korrekte API-Nutzung**: KI nutzt Docs zur tatsächlich installierten Version
3. **Vermeidet Breaking Changes**: Keine Nutzung von Features aus neueren Versionen
4. **Klarheit für Entwickler**: Eindeutige Regel, leicht nachvollziehbar

### Zeitaufwand
- **Analyse & Planung**: ~10 Minuten
- **Umsetzung**: ~5 Minuten
- **Dokumentation**: ~5 Minuten
- **Gesamt**: ~20 Minuten

**Status Update**: ✅ Abgeschlossen & Dokumentiert
**Datum**: 2025-11-16


