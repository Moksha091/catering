# Catering Platform

A WhatsApp-first catering storefront SaaS with structured enquiries, quotations, and online booking management, built for small, local, family-run catering businesses in India.

## Tech Stack

- **Framework:** Next.js (App Router, Server Components & Server Actions)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS, Radix UI primitives, Lucide Icons
- **Forms & Validation:** React Hook Form + Zod
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Row Level Security, Storage)
- **Testing:** Vitest, React Testing Library, Playwright
- **Package Manager:** pnpm

## Architecture & Conventions

- **Multi-Tenant Isolation:** All business data is scoped by `business_id` enforced both via server-side session checks and PostgreSQL Row Level Security (RLS).
- **Financial Calculations:** All monetary calculations use integer paise (1 INR = 100 paise) to prevent floating-point discrepancies.
- **WhatsApp Click-to-Chat:** Direct prefilled `wa.me` links for seamless customer enquiry follow-up.
- **Public Storefront:** Dynamic server-rendered `/c/[slug]` with strict filtering of published content only.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm` or `corepack enable pnpm`)

### Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   cd catering
   ```

2. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project credentials.

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Run database migrations:
   ```bash
   pnpm db:migrate
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Quality Scripts

- `pnpm dev`: Start Next.js development server
- `pnpm build`: Production build with type checking
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint checks
- `pnpm format:check`: Check code formatting
- `pnpm format`: Format files with Prettier
- `pnpm test`: Run unit and integration tests with Vitest
- `pnpm test:watch`: Run tests in watch mode
- `pnpm test:e2e`: Run Playwright end-to-end tests

## Documentation

- [Product Scope & User Journeys](docs/PRODUCT.md)
- [Architecture & Trust Boundaries](docs/ARCHITECTURE.md)
- [Data Model & Database Schema](docs/DATA_MODEL.md)
- [Security & Tenant Isolation](docs/SECURITY.md)
- [Architecture Decision Records](docs/DECISIONS.md)

