# Architecture & Product Decision Records

## ADR-001: Next.js App Router & Modular Monolith
- **Date:** 2026-11-02
- **Decision:** Scaffold the application as a single modular Next.js App Router project using TypeScript strict mode.
- **Context:** Minimizes operational complexity for MVP while retaining full SSR, streaming, Server Actions, and easy deployment to Vercel.

## ADR-002: Integer Paise for Monetary Amounts
- **Date:** 2026-11-02
- **Decision:** Store all INR amounts as 64-bit integer paise (100 paise = ₹1.00) in database columns named `*_paise`.
- **Context:** Eliminates floating-point rounding errors and ensures exact reconciliation.

## ADR-003: WhatsApp Integration via Click-to-Chat (`wa.me`)
- **Date:** 2026-11-02
- **Decision:** Utilize standard WhatsApp click-to-chat links (`wa.me/<number>?text=...`) instead of an automated third-party WhatsApp Business API for the MVP.
- **Context:** Zero external API subscription costs, no risk of bot bans, familiar UX for small Indian catering businesses and customers.

## ADR-004: Next.js `middleware.ts` for Session & Route Protection
- **Date:** 2026-11-02
- **Decision:** Use standard Next.js `middleware.ts` with `@supabase/ssr` to refresh auth cookies and enforce route guards.
- **Context:** Aligns with official Next.js App Router conventions referenced in the spec.

## ADR-005: SHA-256 Hashed Public Quote Tokens
- **Date:** 2026-11-02
- **Decision:** Store SHA-256 hashes of customer quote access tokens in the database rather than plaintext tokens.
- **Context:** Mitigates risk of token leakage in the event of database backup exposure while providing fast indexed lookups.
