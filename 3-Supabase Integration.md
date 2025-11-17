# Projektplan: Supabase Integration

## 🎯 Ziel
Integration von Supabase für Authentication, Datenbank-Persistierung (Shopping List) und Subscription Management - mit LocalStorage als Fallback für nicht-eingeloggte User.

## 📋 Übersicht
- **Features**: Authentication (Login/Register) + Database (Shopping List) + Subscription Management
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Fallback**: LocalStorage für nicht-eingeloggte User
- **Migration**: Automatische Übernahme von LocalStorage-Daten beim ersten Login
- **Status**: ⏳ Planung

---

## ✅ Todo-Liste

### Phase 1: Supabase Setup & Konfiguration
- [ ] Supabase Projekt erstellen (https://supabase.com)
- [ ] NPM Packages installieren (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`)
- [ ] Environment Variables konfigurieren (`.env.local`)
- [ ] Supabase Client erstellen (`lib/supabase/client.ts`)
- [ ] Supabase Server Client für SSR erstellen (`lib/supabase/server.ts`)

### Phase 2: Database Schema & RLS
- [ ] `shopping_list_items` Table erstellen
- [ ] `user_subscriptions` Table erstellen
- [ ] Row Level Security (RLS) Policies definieren
- [ ] Database Migrations dokumentieren
- [ ] Indexes für Performance optimieren

### Phase 3: Authentication System
- [ ] Auth Types & Interfaces (`types/auth.ts`)
- [ ] Auth Context & Provider (`lib/contexts/AuthContext.tsx`)
- [ ] `useAuth` Hook (`lib/hooks/useAuth.ts`)
- [ ] Login-Komponente (`app/components/Auth/LoginModal.tsx`)
- [ ] Register-Komponente (`app/components/Auth/RegisterModal.tsx`)
- [ ] User-Menü im Header (`app/components/Layout/UserMenu.tsx`)
- [ ] Protected Routes Middleware (optional)

### Phase 4: Shopping List mit Supabase
- [ ] `useShoppingList` erweitern für Supabase-Sync
- [ ] Realtime Subscriptions für Shopping List
- [ ] Migration: LocalStorage → Supabase beim ersten Login
- [ ] Conflict Resolution (Offline/Online Sync)
- [ ] Optimistic Updates implementieren

### Phase 5: Subscription Management
- [ ] `subscriptions` Database Schema
- [ ] Subscription Tiers definieren (Free, Premium)
- [ ] Feature-Flags System (`lib/utils/featureFlags.ts`)
- [ ] PayPal Integration vorbereiten (API Routes)
- [ ] Subscription Status UI-Komponente

### Phase 6: Testing & Dokumentation
- [ ] Unit Tests für Supabase Hooks
- [ ] Integration Tests für Auth Flow
- [ ] E2E Tests für Shopping List Sync
- [ ] Dokumentation erstellen (`docs/lib/supabase/`)
- [ ] CLAUDE.md aktualisieren
- [ ] Migration Guide für User

---

## 🏗️ Technische Architektur

### 1. Supabase Setup

#### NPM Packages
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

#### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Server-only
```

#### Supabase Client (`lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 2. Database Schema

#### `shopping_list_items` Table
```sql
CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  market TEXT NOT NULL,
  date_range TEXT NOT NULL,
  brand TEXT,
  checked BOOLEAN DEFAULT false,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shopping list"
  ON shopping_list_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
  ON shopping_list_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON shopping_list_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON shopping_list_items FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_shopping_list_user_id ON shopping_list_items(user_id);
CREATE INDEX idx_shopping_list_added_at ON shopping_list_items(added_at DESC);
```

#### `user_subscriptions` Table
```sql
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'past_due');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium');

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  tier subscription_tier DEFAULT 'free',
  status subscription_status DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### 3. Authentication System

#### Auth Context (`lib/contexts/AuthContext.tsx`)
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Methods: signUp, signIn, signOut...
}
```

#### useAuth Hook (`lib/hooks/useAuth.ts`)
```typescript
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### 4. Shopping List mit Supabase

#### Extended `useShoppingList` Hook
```typescript
export function useShoppingList() {
  const { user } = useAuth()
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [loading, setLoading] = useState(false)

  // Load from Supabase if logged in, else from LocalStorage
  useEffect(() => {
    if (user) {
      loadFromSupabase()
      subscribeToChanges() // Realtime sync
    } else {
      loadFromLocalStorage()
    }
  }, [user])

  // Migrate LocalStorage → Supabase on first login
  const migrateLocalStorageToSupabase = async () => {
    const localItems = getLocalStorageItems()
    if (localItems.length > 0 && user) {
      await bulkInsertToSupabase(localItems)
      clearLocalStorage()
    }
  }

  // CRUD Operations mit Optimistic Updates
  const addItem = async (product: ProductData) => {
    // Optimistic update
    setItems(prev => [...prev, newItem])

    if (user) {
      await supabase.from('shopping_list_items').insert(newItem)
    } else {
      saveToLocalStorage(items)
    }
  }
}
```

### 5. Subscription Management

#### Feature Flags (`lib/utils/featureFlags.ts`)
```typescript
export const FEATURES = {
  UNLIMITED_SHOPPING_LIST: 'unlimited_shopping_list',
  ADVANCED_FILTERS: 'advanced_filters',
  EXPORT_PDF: 'export_pdf',
  PRICE_ALERTS: 'price_alerts'
} as const

export function hasFeature(
  subscription: UserSubscription | null,
  feature: keyof typeof FEATURES
): boolean {
  if (!subscription || subscription.tier === 'free') {
    return FREE_FEATURES.includes(feature)
  }
  return true
}
```

---

## 📐 UI/UX Changes

### Header mit User Menu
```
┌──────────────────────────────────────────────────────────┐
│  🛒 SparFuchs.de       📝 Einkaufsliste (3)   👤 Max M.  │
└──────────────────────────────────────────────────────────┘
                                                    ↓
                                          ┌─────────────────┐
                                          │ Mein Profil     │
                                          │ Premium         │
                                          │ Abmelden        │
                                          └─────────────────┘
```

### Login/Register Modal
- Einfaches Modal mit Email/Password
- "Oder mit Google anmelden" (OAuth)
- "Passwort vergessen?" Link
- Wechsel zwischen Login/Register

### Subscription Badge
- "Free" oder "Premium" Badge im User-Menü
- "Upgrade" Button für Free User
- Feature-Limitations mit Tooltips

---

## 📦 Neue Dateistruktur

```
/
├── lib/
│   ├── supabase/
│   │   ├── client.ts (Browser Client)
│   │   ├── server.ts (Server Client für SSR)
│   │   └── migrations/ (SQL Migrations)
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts (neu)
│   │   ├── useShoppingList.ts (erweitert)
│   │   └── useSubscription.ts (neu)
│   └── utils/
│       └── featureFlags.ts (neu)
├── app/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginModal.tsx (neu)
│   │   │   ├── RegisterModal.tsx (neu)
│   │   │   └── UserMenu.tsx (neu)
│   │   └── Subscription/
│   │       ├── UpgradeButton.tsx (neu)
│   │       └── FeatureLock.tsx (neu)
│   ├── api/
│   │   ├── auth/ (Auth Callbacks)
│   │   └── subscriptions/ (Webhook für PayPal)
│   └── layout.tsx (AuthProvider wrap)
├── types/
│   ├── auth.ts (neu)
│   └── subscription.ts (neu)
└── docs/
    └── lib/supabase/ (neu)
```

---

## 🔧 Implementierungsdetails

### LocalStorage → Supabase Migration
1. User loggt sich zum ersten Mal ein
2. Check: Hat User LocalStorage-Daten?
3. Wenn ja: Bulk Insert in Supabase
4. Nach erfolgreicher Migration: LocalStorage leeren
5. Flag setzen: "migration_completed"

### Realtime Sync
```typescript
const subscription = supabase
  .channel('shopping_list_changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'shopping_list_items' },
    (payload) => {
      // Update local state
    }
  )
  .subscribe()
```

### Optimistic Updates
- Sofortige UI-Änderung
- Supabase-Call im Hintergrund
- Bei Fehler: Rollback + Toast-Benachrichtigung

### Offline Support
- LocalStorage als Cache
- Queue für pending writes
- Sync beim Reconnect

---

## 🚀 Rollout-Strategie

### Phase 1: Foundation (Woche 1)
- [ ] Supabase Setup
- [ ] Database Schema
- [ ] Basic Auth (Email/Password)

### Phase 2: Shopping List Integration (Woche 2)
- [ ] Shopping List → Supabase
- [ ] Migration Logic
- [ ] Realtime Sync

### Phase 3: Subscription System (Woche 3)
- [ ] Subscription Management
- [ ] Feature Flags
- [ ] PayPal Vorbereitung

### Phase 4: Polish & Testing (Woche 4)
- [ ] E2E Tests
- [ ] Dokumentation
- [ ] Performance Optimierung

---

## ⚠️ Wichtige Hinweise

1. **Security First**: Alle DB-Zugriffe über RLS geschützt
2. **No Breaking Changes**: LocalStorage bleibt als Fallback
3. **Progressive Enhancement**: Neue Features opt-in
4. **Data Privacy**: DSGVO-konform, klare User-Kommunikation
5. **Performance**: Optimistic Updates, Caching, Indexes

---

## 📊 Aufwandsschätzung

| Phase | Aufwand | Komplexität |
|-------|---------|-------------|
| Phase 1: Supabase Setup | 3-4h | Mittel |
| Phase 2: Database Schema | 2-3h | Mittel |
| Phase 3: Authentication | 6-8h | Hoch |
| Phase 4: Shopping List Integration | 8-10h | Hoch |
| Phase 5: Subscription Management | 4-6h | Mittel |
| Phase 6: Testing & Docs | 4-6h | Mittel |
| **Gesamt** | **27-37h** | **Hoch** |

---

## 📋 BRIEF PLAN (gemäß CLAUDE.md)

1. **Supabase Setup**: Projekt + Client + Environment Variables
2. **Database Schema**: Tables + RLS Policies + Indexes
3. **Authentication**: Auth Context + Login/Register UI + User Menu
4. **Shopping List Migration**: Supabase Sync + LocalStorage Fallback + Realtime
5. **Subscription System**: Database Schema + Feature Flags + PayPal Vorbereitung

---

## ✅ Definition of Done

- [ ] Supabase Projekt läuft & erreichbar
- [ ] User kann sich registrieren & einloggen
- [ ] Shopping List wird in Supabase gespeichert (wenn eingeloggt)
- [ ] LocalStorage funktioniert als Fallback (nicht eingeloggt)
- [ ] Migration von LocalStorage → Supabase funktioniert
- [ ] Subscription Status wird angezeigt
- [ ] Feature Flags funktionieren
- [ ] Alle Tests bestehen
- [ ] Dokumentation vollständig
- [ ] DSGVO-konform (Datenschutzerklärung aktualisiert)

---

## 🎬 Nächste Schritte

1. ⏳ Plan mit Nutzer besprechen & freigeben lassen
2. ⏳ Supabase Projekt erstellen (User-Aktion erforderlich)
3. ⏳ Phase 1 starten: Setup & Konfiguration
4. ⏳ Phase 2: Database Schema
5. ⏳ Phase 3: Authentication System
6. ⏳ Phase 4: Shopping List Integration
7. ⏳ Phase 5: Subscription Management
8. ⏳ Phase 6: Testing & Dokumentation

---

**Erstellt am**: 2025-11-08
**Status**: ⏳ Warte auf Freigabe
**Nächster Review**: Nach Phase 1
**Geschätzter Zeitaufwand**: 27-37 Stunden
