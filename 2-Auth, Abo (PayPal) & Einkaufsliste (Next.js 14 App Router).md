### Projektplan – Auth, Abo (PayPal) & Einkaufsliste (Next.js 14 App Router)

- **Empfehlung**: Lemon Squeezy (mit PayPal) + Supabase (Auth + Postgres + RLS)
- **Ziele**: Login-Pflicht, Abo-Paywall, persönliche Einkaufslisten (pro Nutzer isoliert)
- **Erfolgskriterien**: 
  - Nur eingeloggte Nutzer sehen/verwenden die App
  - Abo-Status steuert Zugriff (CTA statt Features, wenn inaktiv)
  - Einkaufslisten strikt nutzerbezogen über RLS
- **Zeitrahmen MVP**: 1–2 Tage

### Brief Plan (max. 5)
- **Supabase**: Auth (Email/Magic Link), DB-Tabellen, RLS-Policies
- **Abo**: Lemon Squeezy Checkout/Portal (PayPal aktiv), Webhook → `subscriptions.status`
- **Gating**: Middleware-Route-Schutz + Feature-Gating nach Abo-Status
- **Einkaufsliste**: CRUD mit Supabase (RLS erzwingt Eigentümerzugriff)
- **Qualität**: Minimal-Tests, Logging, kurze Doku

### TODO (Checkliste)
- [ ] Supabase-Projekt (EU) anlegen; `.env.local` setzen: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LEMONSQUEEZY_SIGNING_SECRET`, `NEXT_PUBLIC_LS_STORE_ID`
- [ ] Pakete: `@supabase/supabase-js`
- [ ] DB-Schema (Tabellen)
  - `profiles(id uuid pk = auth.uid, email, plan, subscription_status)`
  - `subscriptions(id, user_id, provider='lemonsqueezy', status, plan, current_period_end)`
  - `shopping_lists(id, user_id, name, created_at)`
  - `shopping_list_items(id, list_id, title, qty, note, done)`
- [ ] RLS-Policies
  - `profiles`: Nutzer liest/ändert nur `id = auth.uid()`
  - `subscriptions`: `user_id = auth.uid()`
  - `shopping_lists`: `user_id = auth.uid()`
  - `shopping_list_items`: Join-basiert auf eigene `shopping_lists`
- [ ] Auth-Flow
  - Login/Logout (Email/Magic Link), Session im App Router (Server-Komponenten)
  - Header-CTA: Login/Logout/Account
- [ ] Route-Schutz
  - `app/middleware.ts`: Default geschützt; erlauben: `/login`, `/api/lemonsqueezy/webhook`
  - Serverseitiges Feature-Gating: nur bei `subscription_status in ('active','trialing')`
- [ ] Lemon Squeezy
  - Produkt/Preis anlegen, PayPal aktivieren, Checkout-Link/Variant-ID notieren
  - Webhook-Route `app/api/lemonsqueezy/webhook/route.ts`: Signatur prüfen, `subscriptions` und `profiles.subscription_status` aktualisieren
  - Customer-Portal-Link in Account-Seite integrieren
- [ ] Einkaufsliste (MVP)
  - Seiten: Übersicht, Liste-Details
  - Aktionen: Liste anlegen/löschen, Items hinzufügen/abhaken/löschen
  - Zugriff ausschließlich via Supabase (RLS erzwingt Eigentum)
- [ ] Gating in UI
  - Ohne Abo: CTA “Abo abschließen” (Checkout-Link)
  - Mit Abo: Features freigeschaltet
- [ ] Tests & Monitoring
  - Unit: Abo-Status-Mapper (Webhook → DB)
  - Smoke: Login, Checkout-CTA sichtbar, Liste CRUD
  - Log: Webhook-Erfolge/Fehler
- [ ] Doku
  - Kurzbeschreibung der Env-Variablen, Deploy-Schritte, Support-Playbook (Webhook-Replay)

### Milestones
- **M1 (Auth+DB)**: Supabase, Schema, RLS, Login (0.5–1 Tag)
- **M2 (Abo)**: LS-Produkt, Checkout, Webhook-Sync, Gating (0.5–1 Tag)
- **M3 (Einkaufsliste)**: CRUD + UI, Smoke-Tests (0.5 Tag)

### Risiken & Maßnahmen
- **Webhook-Zuverlässigkeit**: Retry/Replay testen; idempotente Updates
- **PayPal-Verfügbarkeit**: In Lemon Squeezy-Store aktivieren; Fallback-CTA
- **RLS-Fehler**: Policies zuerst nur READ, dann WRITE stufenweise aktivieren

### Offene Fragen
- Pläne/Preise (Monat/Jahr, Trial?)
- Welche App-Bereiche sind frei vs. Abo-pflichtig?
- Login-Variante (Passwort vs. Magic Link vs. OAuth)?

### Review (auszufüllen nach Umsetzung)
- Änderungen, Lessons Learned, nächste **Schritte**