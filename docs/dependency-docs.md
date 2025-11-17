# Dependency Documentation Reference

Diese Datei bietet eine zentrale, versionierte Übersicht aller Kern-Dependencies des SparFuchs-Projekts mit Links zu offiziellen Dokumentationen, Migration Guides und wichtigen Hinweisen.

## Zweck & Nutzung

**Vor jeder Implementierung** (Docs-Preflight):
1. Betroffene Dependencies identifizieren
2. Entsprechende Einträge unten prüfen
3. Verlinkte offizielle Docs/Migrations konsultieren
4. Bei Versionssprüngen: Migration-Guide lesen, relevante Notizen ergänzen

**Wichtig**: Offizielle Dokumentation hat **immer Vorrang** vor Modellwissen!

⚠️ **KRITISCH - Versions-Regel**:
- **NIEMALS Dependencies upgraden** ohne explizite Anweisung des Entwicklers!
- Nutze **IMMER die Docs zur Version aus `package.json`**, NICHT zur neuesten Version!
- Falls die Docs-Website standardmäßig die neueste Version zeigt: Version-Picker nutzen oder nach der richtigen Version suchen.

---

## Kern-Dependencies

### 1. Next.js
- **Aktuelle Version**: ^14.2.18
- **Offizielle Docs**: https://nextjs.org/docs
- **Upgrade Guide**: https://nextjs.org/docs/app/building-your-application/upgrading
- **Changelog**: https://github.com/vercel/next.js/releases
- **Wichtige Hinweise**:
  - App Router aktiv (nicht Pages Router)
  - Server Components als Standard
  - Breaking Changes ab v14: Metadata API, Image Optimization
  - Streaming & Suspense Support

### 2. React
- **Aktuelle Version**: ^18.3.1
- **Offizielle Docs**: https://react.dev/learn
- **API Reference**: https://react.dev/reference/react
- **Changelog**: https://github.com/facebook/react/blob/main/CHANGELOG.md
- **Wichtige Hinweise**:
  - React 18 Features: Concurrent Rendering, Automatic Batching
  - Suspense für Data Fetching
  - Server Components Kompatibilität (mit Next.js 14)

### 3. Tailwind CSS
- **Aktuelle Version**: ^3.3.6
- **Offizielle Docs**: https://tailwindcss.com/docs
- **Upgrade Guide**: https://tailwindcss.com/docs/upgrade-guide
- **Changelog**: https://github.com/tailwindlabs/tailwindcss/blob/master/CHANGELOG.md
- **Wichtige Hinweise**:
  - JIT (Just-In-Time) Compiler aktiv
  - Arbitrary values unterstützt (z.B. `w-[137px]`)
  - PostCSS Plugin konfiguriert
  - Custom Theme in `tailwind.config.ts`

### 4. HeroUI
- **Aktuelle Version**: ^2.6.14 (@heroui/react)
- **Offizielle Docs**: https://www.heroui.com/docs
- **Components**: https://www.heroui.com/docs/components/button
- **Changelog**: https://www.heroui.com/docs/guide/upgrade-to-v2
- **Wichtige Hinweise**:
  - Basiert auf React Aria & Tailwind CSS
  - Theme-System mit CSS Variables
  - Framer Motion Integration für Animationen
  - Accessibility-first Design

### 5. Framer Motion
- **Aktuelle Version**: ^12.23.12
- **Offizielle Docs**: https://www.framer.com/motion/
- **API Reference**: https://www.framer.com/motion/component/
- **Migration Guide**: https://www.framer.com/motion/guide-upgrade/
- **Wichtige Hinweise**:
  - Layout Animations mit `layout` prop
  - Spring-basierte Animationen (Standard-Config im Projekt)
  - AnimatePresence für Exit-Animationen
  - Gesture Support (drag, tap, hover)

### 6. OpenRouter API
- **API Model**: google/gemini-2.5-flash-lite
- **Offizielle Docs**: https://openrouter.ai/docs
- **API Reference**: https://openrouter.ai/docs/api-reference
- **Models**: https://openrouter.ai/models
- **Wichtige Hinweise**:
  - Streaming Completions via Server-Sent Events (SSE)
  - Environment Variable: `OPENROUTER_API_KEY` erforderlich
  - Rate Limits beachten
  - Model-spezifische Parameter in `/lib/ai/openrouter.ts`

### 7. Jest
- **Aktuelle Version**: ^29.7.0
- **Offizielle Docs**: https://jestjs.io/docs/getting-started
- **Configuration**: https://jestjs.io/docs/configuration
- **API Reference**: https://jestjs.io/docs/api
- **Wichtige Hinweise**:
  - jsdom Test Environment für React Testing Library
  - TypeScript Support via ts-jest
  - Coverage-Reports in `coverage/` Ordner
  - Watch Mode für TDD: `npm run test:watch`

### 8. ESLint
- **Aktuelle Version**: ^8.57.1
- **Offizielle Docs**: https://eslint.org/docs/latest/
- **Rules Reference**: https://eslint.org/docs/latest/rules/
- **Migration Guide**: https://eslint.org/docs/latest/use/migrate-to-8.0.0
- **Wichtige Hinweise**:
  - `eslint-config-next` für Next.js Best Practices
  - Flat Config (ESLint 9+) noch nicht aktiv (v8)
  - TypeScript-aware Linting
  - Pre-commit Hook Integration möglich

---

## Weitere Dependencies (Optional)

### CSV-Parse
- **Aktuelle Version**: ^6.1.0
- **Offizielle Docs**: https://csv.js.org/parse/
- **API**: https://csv.js.org/parse/api/
- **Wichtige Hinweise**:
  - Für Angebote-Datenverarbeitung (`Angebote/`)
  - Stream-basiertes Parsing
  - Delimiter-Konfiguration

---

## Wartung & Updates

### Versionscheck
```bash
npm outdated
```

### Dependency Update Workflow
1. Version in `package.json` prüfen
2. Changelog der neuen Version lesen
3. Migration Guide konsultieren (falls Major-Update)
4. Diese Datei (`dependency-docs.md`) aktualisieren:
   - Neue Version eintragen
   - Breaking Changes notieren
   - Neue Links hinzufügen
5. Tests ausführen: `npm run test`
6. Build testen: `npm run build`

### Review-Punkte bei Updates
- [ ] Versionen in `dependency-docs.md` aktualisiert?
- [ ] Migration-Guides gelesen?
- [ ] Breaking Changes dokumentiert?
- [ ] Tests grün?
- [ ] Build erfolgreich?

---

**Letzte Aktualisierung**: 2025-11-16
**Maintainer**: SparFuchs Team
