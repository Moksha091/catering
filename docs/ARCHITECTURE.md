# Architecture & Trust Boundaries

## 1. System Overview

The application is structured as a TypeScript-first Next.js App Router modular monolith backed by Supabase PostgreSQL, Supabase Auth, and Supabase Storage.

```
┌────────────────────────────────────────────────────────┐
│                   Next.js App Router                   │
├──────────────────────────┬─────────────────────────────┤
│   Public Storefront      │    Authenticated Dashboard  │
│   - /c/[slug]            │    - /dashboard/*           │
│   - /quote/[token]       │    - Server Actions         │
│   - Route Handlers       │    - Session Middleware     │
└─────────────┬────────────┴──────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌──────────────────────────┐ ┌───────────────────────────┐
│  Server-Side Services    │ │  Authorization & RLS     │
│  - Input validation (Zod)│ │  - Active membership check│
│  - Financial calculation │ │  - Tenant scope isolation │
│  - Audit logging         │ │  - Service-role isolation │
└─────────────┬────────────┘ └────────────┬──────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
               ┌───────────────────────────┐
               │    Supabase PostgreSQL    │
               │    - RLS Policies         │
               │    - Integer Paise Money  │
               │    - Storage Buckets      │
               └───────────────────────────┘
```

## 2. Directory Structure

```text
catering/
├── docs/                 # Product, Architecture, Data Model, Security, Decisions
├── public/               # Static assets (images, icons)
├── supabase/             # Migrations, seed scripts, config
├── src/
│   ├── app/              # Next.js App Router routes
│   │   ├── (auth)/       # Sign-in, sign-up, OTP
│   │   ├── (dashboard)/  # Authenticated caterer dashboard
│   │   ├── c/[slug]/     # Public caterer storefront
│   │   ├── quote/[token]/# Public secure quote acceptance
│   │   └── api/          # Route handlers, webhooks
│   ├── components/       # Shared UI components (Radix / Tailwind)
│   ├── features/         # Feature domain logic & components
│   │   ├── auth/
│   │   ├── businesses/
│   │   ├── menus/
│   │   ├── packages/
│   │   ├── storefront/
│   │   ├── enquiries/
│   │   ├── quotes/
│   │   └── bookings/
│   ├── lib/              # Client/server Supabase instances, Zod validators, utils
│   ├── server/           # Server-only services, repositories, policies
│   └── types/            # Database and domain TypeScript definitions
└── tests/
    ├── unit/             # Logic, calculations, validations
    ├── integration/      # Server actions, queries, RLS policies
    └── e2e/              # Playwright browser journeys
```

## 3. Trust Boundaries & Principles

1. **Untrusted Client Inputs:**
   - Any data coming from client forms, search params, route params, or server action arguments is treated as untrusted.
   - All mutations validate schema with Zod on the server.
   - Client-supplied `business_id`, `owner_id`, `role`, prices, or booking statuses are never trusted.
2. **Authoritative Membership:**
   - Active business membership is resolved server-side from `auth.uid()` via `business_members` table.
   - The verified `business_id` is passed downstream to service queries.
3. **Database RLS as Second Layer:**
   - Even if an application check fails, PostgreSQL Row Level Security enforces that tenant data cannot be queried or updated across businesses.
4. **Service-Role Key Protection:**
   - `SUPABASE_SERVICE_ROLE_KEY` is strictly server-only and excluded from any client bundles.

