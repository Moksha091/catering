# Product Scope & User Journeys

## 1. Product Vision & Problem

Local catering businesses in India repeatedly field repetitive questions across phone calls and WhatsApp:
- Menus and package inclusions
- Per-person vs. fixed pricing
- Veg / non-veg dietary options
- Minimum guest count and service localities
- Date availability and custom adjustments

Information is scattered across photo galleries, PDFs, chat histories, and memory. The platform provides every caterer with a digital storefront and an operational dashboard to receive structured enquiries, generate versioned quotations, and manage confirmed bookings.

## 2. Core User Personas

### 1. Caterer (Business Owner / Staff)
- Non-technical business owners needing rapid menu and package publication.
- Need to track enquiries without losing details across chat threads.
- Need to generate clear quotes with deposit and balance amounts.

### 2. Customer (Event Organizer)
- Frictionless browsing without an account.
- Clear pricing transparency: fixed price, per-person, starting from, or quote required.
- Easy enquiry submission and WhatsApp continuation.

### 3. Platform Administrator
- High-level business management, abuse prevention, and platform health.
- Cannot casually access private customer data without authorization.

## 3. Scope & Milestones

- **Milestone 0:** Repository inspection, guidance documents, architecture planning.
- **Milestone 1:** App foundation, TypeScript strict mode, Tailwind CSS, Supabase setup, environment validation, base UI shell.
- **Milestone 2:** Auth & multi-tenancy: sign-up, profile, business onboarding, business membership, Supabase RLS.
- **Milestone 3:** Menu & package management: menus, categories, items, pricing types, dietary tags, packages with item snapshots.
- **Milestone 4:** Public storefront (`/c/[slug]`): SEO metadata, mobile-first design, WhatsApp CTA (`wa.me`), sharing.
- **Milestone 5:** Enquiries & dashboard: public form with rate limiting, dashboard kanban/status transitions, internal notes.
- **Milestone 6:** Quotes & bookings: immutable versioned quotes, cryptographically secure share tokens (`/quote/[token]`), accept/decline actions, booking confirmation with conflict warnings.
- **Milestone 7:** Pilot readiness: responsive & accessibility validation, demo seeds, policies, error handling.

## 4. WhatsApp Integration Behaviour
- Format WhatsApp numbers into E.164 / normalized international format.
- Generate direct `wa.me/<number>?text=<encoded_text>` links.
- Include enquiry reference, event date, guest count, and selected package in prefilled text.
- No automated scraping or unofficial automation; manual click-to-chat ensures user trust and reliability.

