# Catering Platform

## Product Requirements, Technical Architecture, and Codex Build Instructions

**Document type:** Product + engineering implementation brief\
**Product direction:** WhatsApp-first catering storefront SaaS, with
enquiries and online booking, designed to evolve into a local catering
marketplace.\
**Initial market:** Small, local, family-run catering businesses in
India.\
**Primary users:** Caterers (business owners and staff) and customers
planning events.\
**Build approach:** Responsive web application, modular monolith,
multi-tenant PostgreSQL database.

------------------------------------------------------------------------

# 1. Instructions for Codex

Treat this document as the source of truth for product scope and
implementation decisions.

## 1.1 How to work

1.  Inspect the existing repository before changing anything. Identify
    framework, package manager, conventions, existing components, tests,
    environment configuration, and deployment setup.
2.  If the repository is empty, scaffold the application using the stack
    in this document.
3.  Do not replace existing working architecture without explaining why
    and obtaining approval.
4.  Implement in small, coherent milestones. After each milestone:
    -   run formatting and linting;
    -   run type checking;
    -   run relevant tests;
    -   fix failures before proceeding;
    -   summarize changed files and any outstanding decisions.
5.  Do not claim a feature works unless it has been implemented and
    tested.
6.  Do not use mock data in production paths. Seed/demo data must be
    clearly separated from real user data.
7.  Prefer simple, maintainable solutions over premature abstraction or
    microservices.
8.  Never commit secrets, service-role keys, payment credentials,
    private customer data, or real production environment files.
9.  When requirements are ambiguous, choose the simplest safe behaviour
    and document the assumption in `docs/DECISIONS.md`.
10. Keep this document updated when an approved architectural decision
    changes.

## 1.2 Required repository guidance

Create and maintain: - `README.md`: setup, scripts, environment
variables, migrations, deployment. - `AGENTS.md`: concise
repository-specific instructions for Codex and future contributors. -
`docs/PRODUCT.md`: product scope and user journeys. -
`docs/ARCHITECTURE.md`: architecture and trust boundaries. -
`docs/DATA_MODEL.md`: schema and relationships. - `docs/DECISIONS.md`:
dated architecture/product decisions. - `.env.example`: variable names
only, with safe placeholder values. - Database migrations checked into
version control.

Do not create all application code in one giant file. Use
feature-oriented modules.

------------------------------------------------------------------------

# 2. Product Vision

## 2.1 Problem

Small catering businesses repeatedly answer the same questions over
phone calls and messaging apps: - What menus do you offer? - What is the
price per person? - What is included in a package? - Do you provide
vegetarian and non-vegetarian options? - What is your minimum guest
count? - Do you serve this location? - Are you available on a particular
date? - Can you customize the menu?

Information is scattered across photos, PDFs, WhatsApp messages, and
memory. Updating a price or menu means repeating the update to many
customers.

## 2.2 Solution

Give every caterer a simple digital storefront and an easy management
dashboard.

A caterer can: 1. Create a business profile. 2. Add menus, categories,
dishes, packages, pricing, photos, and service areas. 3. Publish a
unique public URL. 4. Share the link through WhatsApp, Instagram, QR
codes, or direct messages. 5. Receive structured enquiries and booking
requests. 6. Prepare quotations and track confirmed bookings.

Customers can browse without creating an account. They can submit an
enquiry, request a custom quote, or request an online booking for a
clearly priced package.

## 2.3 Positioning

**"Your catering business, menu, and bookings in one shareable link."**

The first release is a caterer tool, not a marketplace. A public
discovery marketplace is a later growth channel after the platform has
useful supply and repeat usage.

## 2.4 Product principles

-   Mobile-first: caterers and customers will often use phones.
-   Low learning curve: a non-technical business owner should be able to
    publish a basic menu in approximately ten minutes.
-   WhatsApp-friendly: sharing and follow-up should fit existing
    behaviour.
-   Transparent pricing: distinguish fixed prices, starting prices, and
    quote-only services.
-   No forced customer account: browsing and submitting an enquiry
    should be frictionless.
-   Trustworthy booking status: an enquiry is not a confirmed booking.
-   Tenant isolation: one business must never access another business's
    private data.
-   Progressive complexity: advanced features should not block basic
    publishing.

------------------------------------------------------------------------

# 3. Users, Roles, and Permissions

## 3.1 Roles

### Platform administrator

-   View and manage platform-level business accounts.
-   Suspend or reactivate businesses for policy or abuse reasons.
-   Review reported content.
-   View platform-level metrics.
-   Cannot casually inspect private customer information. Any privileged
    access must be limited, authorized, and auditable.

### Business owner

-   Owns one or more business profiles.
-   Manages business details, menus, packages, service areas, staff,
    enquiries, quotes, bookings, and subscription.
-   Invites staff if that feature is enabled.

### Business staff

-   Access only the business they are assigned to.
-   Permissions should be granular in a later release. For MVP, use
    owner and staff roles with a clear permission check.

### Customer

-   No account required for public browsing or enquiry submission.
-   Supplies contact and event details when submitting an enquiry.
-   Can follow a secure booking/quote link if customer self-service is
    implemented later.

## 3.2 Authorization rules

-   Every private business-owned record must include `business_id`.
-   A logged-in user can only read or mutate records belonging to a
    business where they have an active membership.
-   Do not trust `business_id`, `owner_id`, `price`, `total`, `role`, or
    `status` supplied by the browser.
-   Resolve business membership and permissions on the server.
-   Enforce tenant isolation in both server-side queries and PostgreSQL
    Row Level Security (RLS).
-   Public endpoints may read only published storefront data and must
    never expose private enquiries, customer phone numbers, quotes,
    payments, or internal notes.
-   Use server-side validation for every mutation.

------------------------------------------------------------------------

# 4. Scope and Release Plan

## 4.1 MVP: must-have

### Authentication and onboarding

-   Sign up and sign in using email OTP or passwordless email; phone OTP
    can be added when a suitable provider is selected.
-   Create a business profile.
-   Business name, unique slug, description, phone/WhatsApp number,
    address or service area, cuisine tags, logo, cover image.
-   Draft and published states.
-   Basic onboarding progress indicator.

### Menu management

-   Multiple menus per business, such as Wedding Menu, Vegetarian Menu,
    Corporate Lunch, Snacks, or Festival Menu.
-   Categories within a menu.
-   Menu items with name, description, optional image, dietary label,
    price where applicable, display order, and availability.
-   Item pricing must support:
    -   fixed item price;
    -   price per person;
    -   market/variable price;
    -   quote required;
    -   hidden price / contact for price.
-   Mark items unavailable without deleting them.
-   Reorder categories and items.
-   Draft and publish changes.
-   Duplicate a menu or package.

### Packages

-   Package name, description, image, inclusions, exclusions, minimum
    guests, maximum guests (optional), pricing mode, price per person or
    fixed price, add-ons, and quote-required flag.
-   Pricing must support "starting from" and custom quote.
-   Clearly explain what is included, such as food only, serving staff,
    vessels, transport, setup, or cleanup.

### Public storefront

-   Public route such as `/c/[slug]`.
-   Business name, logo, cover image, location/service area,
    description, cuisines, menus, packages, contact and WhatsApp CTA.
-   Mobile-responsive design.
-   Only published businesses and published content are visible.
-   SEO metadata and Open Graph metadata.
-   Share button using Web Share API where supported, with copy-link
    fallback.
-   QR code can be added after core sharing works.

### Enquiries

-   Public form with customer name, phone, event type, date,
    venue/locality, guest count, selected menu/package, budget
    (optional), and notes.
-   Validate phone format but do not assume every valid number is
    reachable.
-   Consent/notice explaining that the caterer will contact the customer
    about the enquiry.
-   Save enquiry to database.
-   Show success state with enquiry reference.
-   Optional WhatsApp continuation link after successful submission.
-   Caterer dashboard list with filters and statuses.
-   Statuses: `new`, `contacted`, `quote_sent`, `converted`, `declined`,
    `closed`.
-   Internal notes and follow-up date.

### Quotes

-   Create a quote from an enquiry.
-   Quote line items with descriptions, quantities, unit prices, and
    totals.
-   Optional delivery, staffing, equipment, taxes, discounts, and notes.
-   Quote validity date.
-   Versioning: edits create a new version or preserve history. Never
    silently alter a quote already sent.
-   Customer-facing share link must use an unguessable token, expire
    where appropriate, and expose only that quote.
-   Customer can accept or decline if online acceptance is included.
-   Quote acceptance must re-check availability before creating a
    confirmed booking.

### Bookings

-   Booking record linked to enquiry and accepted quote.
-   Booking statuses: `pending_confirmation`, `confirmed`,
    `in_progress`, `completed`, `cancelled`.
-   Date, event time, venue, guest count, agreed amount, deposit amount,
    balance amount, special instructions.
-   Do not confirm a booking merely because a customer submitted an
    enquiry.
-   Prevent date/time conflicts only where the caterer has configured
    availability/capacity rules. For MVP, allow manual confirmation and
    warn about overlapping bookings.
-   Record cancellation reason and actor.

### Dashboard

-   Overview cards: new enquiries, upcoming bookings, quotes awaiting
    response, recent activity.
-   Enquiry and booking lists.
-   Quick actions: view, contact, create quote, update status.
-   Empty states with clear next steps.

### Platform administration

-   Basic admin-only business list and account status.
-   Report/suspend functionality can be minimal in MVP.
-   Admin access must be protected separately from normal business
    membership.

## 4.2 Phase 2

-   Online booking deposits and payment collection.
-   Payment webhooks and reconciliation.
-   Availability calendar with blocked dates and capacity.
-   PDF quotation and invoice generation.
-   Customer CRM and repeat customer history.
-   Staff accounts and role permissions.
-   Custom domain or branded URL.
-   Analytics: storefront visits, WhatsApp clicks, enquiry conversion.
-   Automated transactional notifications.
-   Subscription billing and feature limits.

## 4.3 Phase 3: marketplace

-   Public search and discovery by city, locality, cuisine, event type,
    guest count, and budget.
-   Verified profiles and review moderation.
-   Compare and shortlist caterers.
-   Featured listings and qualified leads.
-   Marketplace attribution and commission tracking.
-   Search engine landing pages by city and category.

Do not implement marketplace search, ratings, or commission
infrastructure before the storefront and enquiry workflow are validated.

## 4.4 Explicitly out of scope for MVP

-   Native iOS or Android applications.
-   Microservices.
-   Complex food inventory, procurement, recipes, or kitchen production
    planning.
-   Delivery fleet management.
-   Payroll and accounting.
-   AI menu generation.
-   Automated dynamic pricing.
-   Public reviews and ratings.
-   Multi-currency support.
-   Complex tax filing or accounting compliance.
-   Automatic booking confirmation without caterer acceptance.

------------------------------------------------------------------------

# 5. Core User Journeys

## 5.1 Caterer onboarding

1.  User signs up.
2.  User creates a business.
3.  User enters business name, contact details, service area, and
    description.
4.  System generates a unique slug.
5.  User adds a first menu.
6.  User adds categories and items.
7.  User optionally creates packages.
8.  User previews the storefront.
9.  User publishes.
10. System displays a shareable URL and WhatsApp share action.

Keep onboarding progressive. The caterer should be able to publish with
the minimum required fields and complete optional profile information
later.

## 5.2 Customer browsing

1.  Customer opens public URL.
2.  Customer sees business identity and service area.
3.  Customer browses menu categories and packages.
4.  Customer sees price type clearly:
    -   fixed price;
    -   per-person price;
    -   starting price;
    -   quote required.
5.  Customer chooses "Request a quote" or "Request booking".
6.  Customer submits event details.
7.  System creates an enquiry and displays a reference.
8.  Customer can optionally continue to WhatsApp.

## 5.3 Caterer enquiry handling

1.  Caterer receives an in-app notification or sees a new dashboard
    entry.
2.  Caterer reviews event date, guest count, venue, selected package,
    and notes.
3.  Caterer contacts the customer if needed.
4.  Caterer creates and sends a quote.
5.  Customer accepts or declines the quote, or confirms manually with
    the caterer.
6.  Caterer verifies date and operational capacity.
7.  Caterer confirms booking.
8.  Booking is tracked through completion or cancellation.

## 5.4 WhatsApp behaviour

-   Store a business WhatsApp number in normalized international format.
-   Generate a `wa.me` link with URL-encoded message text.
-   Message should include storefront URL or enquiry reference and
    selected package.
-   Do not imply that WhatsApp messages are delivered or read by the
    platform.
-   Initial MVP uses click-to-chat, not automated WhatsApp Business API
    messaging.
-   Add official WhatsApp Business Platform integration only after
    checking opt-in, template, provider, and policy requirements.

Example prefilled message:

> Hi, I found your catering menu on \[platform\]. I'm planning a \[event
> type\] on \[date\] for approximately \[guest count\] guests in
> \[location\]. I'd like to know more about \[package/menu\]. My enquiry
> reference is \[reference\].

------------------------------------------------------------------------

# 6. UX and Design Requirements

## 6.1 Visual direction

Create a polished, warm, trustworthy product. Avoid generic enterprise
admin styling and avoid making the customer storefront look like a
spreadsheet.

### Storefront

-   Food photography should be prominent but optimized.
-   Clear business name and service area.
-   Clear section hierarchy: About, Packages, Menus, Service Areas,
    Enquire.
-   Sticky or easily accessible enquiry CTA on mobile.
-   Pricing labels must be unambiguous.
-   Use readable typography and generous spacing.
-   Do not invent ratings, reviews, certifications, or verification
    badges.

### Caterer dashboard

-   Simple sidebar/navigation on desktop.
-   Mobile navigation that remains usable on small screens.
-   Dashboard should prioritize new enquiries and upcoming bookings.
-   Use plain language, not technical terminology.
-   Forms should be divided into short sections.
-   Autosave drafts where feasible.
-   Destructive actions require confirmation.
-   Provide useful empty, loading, success, and error states.

## 6.2 Accessibility and responsiveness

-   Semantic HTML.
-   Keyboard-accessible controls.
-   Visible focus indicators.
-   Form labels and useful validation messages.
-   Appropriate color contrast.
-   Alt text for meaningful images.
-   Do not rely on color alone for status.
-   Test at 360px mobile width, tablet, and desktop.
-   Support reduced motion.
-   Avoid layout shifts from images; set dimensions/aspect ratios.

## 6.3 Copy and localization

-   Use simple English in MVP.
-   Design database and UI so Indian languages can be added later.
-   Display currency as INR (`₹`) and use `en-IN` formatting initially.
-   Store timestamps in UTC and display in the business/customer
    relevant timezone. Default initial market timezone: `Asia/Kolkata`.
-   Treat phone numbers as strings, not numeric values.
-   Never assume every caterer uses the same date, time, or menu
    terminology.

------------------------------------------------------------------------

# 7. Recommended Technical Stack

Use a TypeScript-first modular monolith.

  -----------------------------------------------------------------------
  Layer                   Technology              Use
  ----------------------- ----------------------- -----------------------
  Framework               Next.js App Router      Application, public
                                                  pages, dashboard,
                                                  server rendering

  Language                TypeScript strict mode  Type safety

  UI                      React                   Components and
                                                  interactions

  Styling                 Tailwind CSS            Responsive design
                                                  system

  Components              shadcn/ui + Radix       Accessible UI
                          primitives where useful primitives

  Forms                   React Hook Form + Zod   Form state and
                                                  validation

  Database                Supabase PostgreSQL     Relational data

  Authentication          Supabase Auth           User identity and
                                                  sessions

  Authorization           PostgreSQL RLS +        Multi-tenant isolation
                          server-side checks      

  File storage            Supabase Storage        Logos and menu images

  Hosting                 Vercel                  Next.js deployment

  Payments (Phase 2)      Razorpay                INR payment collection

  Email (later)           Resend or equivalent    Transactional email

  Monitoring              Sentry or equivalent    Errors and performance

  Testing                 Vitest + Testing        Unit, component, and
                          Library + Playwright    end-to-end tests

  Package manager         pnpm                    Dependency management
  -----------------------------------------------------------------------

Use current stable compatible releases when creating the project. Do not
hardcode outdated version numbers from this document. Check official
documentation and lock the selected versions in the package manager
lockfile.

## 7.1 Architecture style

-   Start with one Next.js application.
-   Use feature-oriented modules.
-   Use server components for read-heavy pages where suitable.
-   Use client components only for interactive UI.
-   Use server actions or route handlers for mutations and external
    callbacks.
-   Centralize business logic in service modules, not in UI components.
-   Centralize validation schemas.
-   Use database migrations in version control.
-   Avoid direct database writes from untrusted browser code.
-   Keep payment and webhook processing server-side.
-   Add a background job system only when real workload requires it.

## 7.2 Suggested project structure

``` text
catering-platform/
├── AGENTS.md
├── README.md
├── .env.example
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── proxy.ts  # Use the request interception convention supported by the selected Next.js version
├── public/
│   ├── images/
│   └── icons/
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── SECURITY.md
│   └── DECISIONS.md
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── page.tsx
│   │   │       ├── business/
│   │   │       ├── menus/
│   │   │       ├── packages/
│   │   │       ├── enquiries/
│   │   │       ├── quotes/
│   │   │       ├── bookings/
│   │   │       └── settings/
│   │   ├── c/
│   │   │   └── [slug]/
│   │   ├── quote/
│   │   │   └── [token]/
│   │   ├── api/
│   │   │   └── webhooks/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── shared/
│   ├── features/
│   │   ├── auth/
│   │   ├── businesses/
│   │   ├── menus/
│   │   ├── packages/
│   │   ├── storefront/
│   │   ├── enquiries/
│   │   ├── quotes/
│   │   ├── bookings/
│   │   └── subscriptions/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── auth/
│   │   ├── validation/
│   │   ├── formatting/
│   │   ├── security/
│   │   └── utils/
│   ├── server/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── policies/
│   └── types/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   └── seed.sql
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

Adapt the structure if the existing repository already has a sound
convention.

------------------------------------------------------------------------

# 8. Database Design

Use PostgreSQL with UUID primary keys. Include `created_at` and
`updated_at` timestamps on mutable entities. Use foreign keys, unique
constraints, check constraints, and indexes.

The schema below is a logical starting point. Codex should turn it into
reviewed SQL migrations and generated TypeScript database types.

## 8.1 Core tables

### `profiles`

-   `id UUID PRIMARY KEY REFERENCES auth.users(id)`
-   `full_name TEXT`
-   `phone TEXT`
-   `created_at TIMESTAMPTZ`
-   `updated_at TIMESTAMPTZ`

### `businesses`

-   `id UUID PRIMARY KEY`
-   `owner_id UUID REFERENCES profiles(id)`
-   `name TEXT NOT NULL`
-   `slug TEXT NOT NULL UNIQUE`
-   `description TEXT`
-   `logo_path TEXT`
-   `cover_image_path TEXT`
-   `phone TEXT`
-   `whatsapp_phone TEXT`
-   `email TEXT`
-   `address_text TEXT`
-   `city TEXT`
-   `state TEXT`
-   `postal_code TEXT`
-   `country_code TEXT DEFAULT 'IN'`
-   `timezone TEXT DEFAULT 'Asia/Kolkata'`
-   `published BOOLEAN DEFAULT FALSE`
-   `status TEXT` (`active`, `suspended`, `deleted`)
-   `created_at`, `updated_at`

### `business_members`

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `user_id UUID REFERENCES profiles(id)`
-   `role TEXT` (`owner`, `staff`)
-   `status TEXT` (`invited`, `active`, `removed`)
-   Unique constraint on `(business_id, user_id)`

### `menus`

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `name TEXT NOT NULL`
-   `description TEXT`
-   `menu_type TEXT`
-   `status TEXT` (`draft`, `published`, `archived`)
-   `display_order INTEGER DEFAULT 0`
-   `created_at`, `updated_at`

### `menu_categories`

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `menu_id UUID REFERENCES menus(id)`
-   `name TEXT NOT NULL`
-   `description TEXT`
-   `display_order INTEGER DEFAULT 0`

### `menu_items`

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `category_id UUID REFERENCES menu_categories(id)`
-   `name TEXT NOT NULL`
-   `description TEXT`
-   `image_path TEXT`
-   `dietary_type TEXT` (`veg`, `non_veg`, `vegan`, `egg`, `other`,
    `unspecified`)
-   `price_type TEXT` (`fixed`, `per_person`, `market_rate`,
    `quote_required`, `hidden`)
-   `price_paise BIGINT`
-   `unit_label TEXT`
-   `is_available BOOLEAN DEFAULT TRUE`
-   `display_order INTEGER DEFAULT 0`
-   `created_at`, `updated_at`

### `packages`

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `name TEXT NOT NULL`
-   `description TEXT`
-   `image_path TEXT`
-   `pricing_type TEXT` (`fixed`, `per_person`, `starting_from`,
    `quote_required`)
-   `price_paise BIGINT`
-   `minimum_guests INTEGER`
-   `maximum_guests INTEGER`
-   `is_published BOOLEAN DEFAULT FALSE`
-   `display_order INTEGER DEFAULT 0`
-   `created_at`, `updated_at`

### `package_items`

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `package_id UUID REFERENCES packages(id)`
-   `menu_item_id UUID REFERENCES menu_items(id)` nullable
-   `item_name_snapshot TEXT`
-   `quantity_or_description TEXT`
-   `display_order INTEGER DEFAULT 0`

Snapshot item name/description so package presentation does not
unexpectedly change if a menu item is renamed.

### `service_areas`

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `city TEXT`
-   `locality TEXT`
-   `postal_code TEXT`
-   `travel_fee_paise BIGINT`
-   `notes TEXT`

### `enquiries`

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `customer_name TEXT NOT NULL`
-   `customer_phone TEXT NOT NULL`
-   `customer_email TEXT`
-   `event_type TEXT`
-   `event_date DATE`
-   `start_time TIME`
-   `end_time TIME`
-   `guest_count INTEGER`
-   `venue_address TEXT`
-   `city TEXT`
-   `selected_package_id UUID REFERENCES packages(id)` nullable
-   `budget_min_paise BIGINT`
-   `budget_max_paise BIGINT`
-   `customer_notes TEXT`
-   `source TEXT` (`storefront`, `whatsapp`, `marketplace`, `manual`,
    `other`)
-   `status TEXT` (`new`, `contacted`, `quote_sent`, `converted`,
    `declined`, `closed`)
-   `internal_notes TEXT`
-   `follow_up_at TIMESTAMPTZ`
-   `created_at`, `updated_at`

### `quotes`

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `enquiry_id UUID REFERENCES enquiries(id)`
-   `version INTEGER NOT NULL`
-   `public_token_hash TEXT`
-   `currency CHAR(3) DEFAULT 'INR'`
-   `subtotal_paise BIGINT NOT NULL`
-   `discount_paise BIGINT DEFAULT 0`
-   `tax_paise BIGINT DEFAULT 0`
-   `additional_charges_paise BIGINT DEFAULT 0`
-   `total_paise BIGINT NOT NULL`
-   `deposit_paise BIGINT DEFAULT 0`
-   `notes TEXT`
-   `valid_until TIMESTAMPTZ`
-   `status TEXT` (`draft`, `sent`, `accepted`, `declined`, `expired`,
    `superseded`)
-   `sent_at TIMESTAMPTZ`
-   `accepted_at TIMESTAMPTZ`
-   `created_at`, `updated_at`
-   Unique constraint on `(enquiry_id, version)`

### `quote_items`

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `quote_id UUID REFERENCES quotes(id)`
-   `description TEXT NOT NULL`
-   `quantity NUMERIC(12,2) NOT NULL`
-   `unit TEXT`
-   `unit_price_paise BIGINT NOT NULL`
-   `line_total_paise BIGINT NOT NULL`
-   `display_order INTEGER DEFAULT 0`

### `bookings`

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `enquiry_id UUID REFERENCES enquiries(id)`
-   `quote_id UUID REFERENCES quotes(id)`
-   `booking_reference TEXT`
-   `event_date DATE NOT NULL`
-   `start_time TIME`
-   `end_time TIME`
-   `guest_count INTEGER`
-   `venue_address TEXT`
-   `agreed_total_paise BIGINT NOT NULL`
-   `deposit_due_paise BIGINT DEFAULT 0`
-   `balance_due_paise BIGINT DEFAULT 0`
-   `status TEXT` (`pending_confirmation`, `confirmed`, `in_progress`,
    `completed`, `cancelled`)
-   `cancellation_reason TEXT`
-   `confirmed_at TIMESTAMPTZ`
-   `created_at`, `updated_at`

### `payments` (Phase 2)

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `booking_id UUID REFERENCES bookings(id)`
-   `provider TEXT`
-   `provider_order_id TEXT`
-   `provider_payment_id TEXT`
-   `amount_paise BIGINT NOT NULL`
-   `currency CHAR(3) DEFAULT 'INR'`
-   `status TEXT` (`created`, `pending`, `succeeded`, `failed`,
    `refunded`)
-   `idempotency_key TEXT UNIQUE`
-   `created_at`, `updated_at`

### `subscriptions` (Phase 2)

-   `id UUID PRIMARY KEY`
-   `business_id UUID REFERENCES businesses(id)`
-   `plan_code TEXT`
-   `provider TEXT`
-   `provider_subscription_id TEXT`
-   `status TEXT`
-   `current_period_start TIMESTAMPTZ`
-   `current_period_end TIMESTAMPTZ`
-   `created_at`, `updated_at`

### `audit_logs`

-   `id UUID PRIMARY KEY`
-   `business_id UUID`
-   `actor_user_id UUID`
-   `action TEXT NOT NULL`
-   `entity_type TEXT NOT NULL`
-   `entity_id UUID`
-   `metadata JSONB`
-   `created_at TIMESTAMPTZ`

Do not put passwords, authentication tokens, full payment credentials,
or unnecessary sensitive data in audit metadata.

## 8.2 Database constraints and indexes

At minimum: - Unique index on `businesses.slug`. - Index on every
frequently filtered `business_id`. - Index on
`(business_id, status, created_at)` for enquiries. - Index on
`(business_id, event_date, status)` for bookings. - Index on
`(menu_id, display_order)` for categories. - Index on
`(category_id, display_order)` for menu items. - Check `guest_count > 0`
when present. - Check all monetary values are non-negative where
appropriate. - Check `maximum_guests >= minimum_guests` when both
exist. - Use foreign keys and appropriate delete behaviour. Prefer
archive/soft-delete for important business records. - Use transactions
when creating quotes, accepting quotes, confirming bookings, or
recording payment state.

## 8.3 Money and pricing rules

-   Store all currency amounts as integer paise.
-   Format INR only at the presentation layer.
-   Do not use JavaScript floating-point arithmetic for authoritative
    totals.
-   Validate all line items and totals on the server.
-   Never accept a customer-submitted total as authoritative.
-   Recalculate totals from trusted database records and validated quote
    inputs.
-   Preserve quote and booking snapshots after acceptance.
-   Clearly identify whether a price is per person, per item, fixed,
    starting from, or quote-only.

------------------------------------------------------------------------

# 9. API and Server Action Design

Use server actions for authenticated dashboard mutations where
appropriate. Use route handlers for public APIs, webhooks, and
integrations. Keep validation and business rules in service functions.

Suggested service boundaries:

``` text
BusinessService
  createBusiness()
  updateBusiness()
  publishBusiness()
  getPublicBusinessBySlug()

MenuService
  createMenu()
  updateMenu()
  reorderCategories()
  createMenuItem()
  updateMenuItem()
  publishMenu()

PackageService
  createPackage()
  updatePackage()
  publishPackage()

EnquiryService
  createPublicEnquiry()
  listBusinessEnquiries()
  updateEnquiryStatus()
  addInternalNote()

QuoteService
  createDraftQuote()
  sendQuote()
  getPublicQuote()
  acceptQuote()
  declineQuote()

BookingService
  confirmBooking()
  cancelBooking()
  updateBookingStatus()
  listUpcomingBookings()
```

## 9.1 Public endpoints

Illustrative route structure:

``` text
GET  /api/public/businesses/[slug]
POST /api/public/businesses/[slug]/enquiries
GET  /api/public/quotes/[token]
POST /api/public/quotes/[token]/accept
POST /api/public/quotes/[token]/decline
```

Do not expose private business records in public response objects. Use
explicit response DTOs rather than serializing database rows.

## 9.2 Authenticated operations

Illustrative server operations:

``` text
createBusiness
updateBusinessProfile
publishBusiness
createMenu
updateMenu
createMenuCategory
createMenuItem
updateMenuItem
createPackage
updatePackage
listEnquiries
updateEnquiryStatus
createQuote
sendQuote
confirmBooking
cancelBooking
```

Every operation must: 1. Authenticate the user. 2. Resolve active
business membership. 3. Authorize the requested action. 4. Validate
input with Zod. 5. Execute the operation with tenant constraints. 6.
Return a typed, safe response. 7. Record an audit event for important
changes.

------------------------------------------------------------------------

# 10. Security and Privacy

Security is a release requirement, not a later enhancement.

## 10.1 Supabase security

-   Enable RLS on all business-owned tables.
-   Write explicit `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies
    as needed.
-   Scope policies through active business membership.
-   Public anonymous access should be limited to published storefront
    content.
-   Never expose the Supabase service-role key in client-side bundles.
-   Use server-only modules for privileged database operations.
-   Do not assume hiding a UI button is authorization.
-   Test that user A cannot access user B's business data by changing
    IDs in requests.

## 10.2 Public form abuse

-   Validate input on server.
-   Add rate limiting to public enquiry submission.
-   Add bot protection when abuse becomes measurable.
-   Set reasonable length limits on free-text fields.
-   Escape/render user-generated content safely.
-   Avoid leaking whether a particular customer phone or email exists.
-   Avoid collecting information that is not necessary to fulfil the
    enquiry.

## 10.3 Quote links

-   Use cryptographically random tokens.
-   Store token hashes rather than raw tokens where practical.
-   Use expiration dates.
-   Rate-limit token access.
-   Expose only the quote and limited business details.
-   Do not expose internal notes or unrelated customer records.
-   Make acceptance idempotent and transactional.

## 10.4 Payment security (Phase 2)

-   Use a supported payment gateway checkout.
-   Never store card numbers, CVV, UPI PINs, or bank credentials.
-   Verify webhook signatures on the server.
-   Verify payment state from trusted gateway events/API, not browser
    redirects.
-   Make webhook handling idempotent.
-   Reconcile payment status with provider records.
-   Never mark an order paid based only on a client callback.

## 10.5 Privacy and compliance

-   Publish a privacy policy and terms before public launch.
-   Explain why customer contact details are collected and how they are
    used.
-   Define retention and deletion procedures.
-   Provide a way to request correction or deletion where legally
    required.
-   Restrict staff access to customer information.
-   Review applicable Indian privacy, consumer, tax, and payment
    requirements with qualified professionals before commercial launch.

------------------------------------------------------------------------

# 11. Integrations

## MVP

-   WhatsApp click-to-chat using `wa.me`.
-   Web Share API with clipboard fallback.
-   Email authentication provider.
-   Image storage.
-   Basic application error monitoring.

## Phase 2

-   Razorpay checkout and webhook handling.
-   Transactional email.
-   Official WhatsApp Business Platform provider if automated messaging
    is justified.
-   PDF generation for quotations and invoices.
-   Subscription billing.

Do not build direct unofficial WhatsApp automation or browser scraping.
Use supported, authorized integrations.

------------------------------------------------------------------------

# 12. Testing Strategy

## Unit tests

-   Price calculations.
-   Per-person package estimates.
-   Discount and additional charge calculations.
-   Quote versioning.
-   Booking state transitions.
-   Slug validation.
-   Phone and form validation.
-   Authorization policy helpers.

## Integration tests

-   Business creation.
-   Menu creation and publishing.
-   Public storefront reads.
-   Public enquiry creation.
-   Quote creation and acceptance.
-   Booking confirmation.
-   RLS tenant isolation.
-   Unauthorized access attempts.

## End-to-end tests

At minimum, automate these scenarios:

1.  New caterer signs up and creates a business.
2.  Caterer creates a menu, category, and menu item.
3.  Caterer creates a package and publishes storefront.
4.  Anonymous customer opens storefront.
5.  Customer submits an enquiry.
6.  Caterer sees enquiry in dashboard.
7.  Caterer creates and sends a quote.
8.  Customer opens quote link and accepts.
9.  Caterer confirms booking.
10. A second business user cannot access the first business's private
    records.
11. Unpublished menu items do not appear publicly.
12. Invalid or expired quote tokens cannot be accepted.

## Quality gates

Before merging or deploying: - TypeScript passes. - ESLint passes. -
Formatting passes. - Unit and integration tests pass. - Critical
Playwright journeys pass. - No secrets are committed. - No high-severity
dependency or security issue is knowingly ignored. - Responsive checks
pass on mobile and desktop.

------------------------------------------------------------------------

# 13. Deployment and Environments

Use separate development, staging, and production environments.

## Environment variables

Create `.env.example` with names such as:

``` bash
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Phase 2 only
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Optional
RESEND_API_KEY=
SENTRY_DSN=
```

Rules: - `NEXT_PUBLIC_*` variables are public by definition. Only put
safe public values there. - Service-role keys and payment secrets must
be server-only. - Never commit `.env.local`. - Validate required
environment variables at startup. - Use separate credentials and
projects for staging and production. - Configure database backups and
test restoration. - Run migrations through a controlled deployment
process. - Do not run destructive production migrations automatically
without review.

## Deployment checklist

-   Configure production domain and HTTPS.
-   Configure Supabase redirect URLs and authentication settings.
-   Configure storage buckets and policies.
-   Configure RLS.
-   Configure application environment variables.
-   Configure error monitoring.
-   Test public storefront and enquiry flow.
-   Test tenant isolation.
-   Configure database backups.
-   Publish terms and privacy policy.
-   Verify analytics does not capture unnecessary personal data.

------------------------------------------------------------------------

# 14. Analytics and Product Success Metrics

Track product behaviour without collecting unnecessary personal data.

## Activation

-   Number of caterers who create a business.
-   Percentage who publish a storefront.
-   Time from signup to first published menu.
-   Percentage who share their storefront.

## Engagement

-   Weekly active caterers.
-   Menus updated per active caterer.
-   Storefront visits.
-   WhatsApp CTA clicks.
-   Enquiry form starts and completions.

## Business value

-   Enquiries per published caterer.
-   Quote conversion rate.
-   Confirmed bookings per caterer.
-   Time from enquiry to first response, where measurable.
-   Repeat customer enquiries.
-   Caterer retention.
-   Free-to-paid conversion.

## Initial validation targets

Treat these as hypotheses, not promises: - 5--10 pilot caterers. - Most
pilot caterers can publish a basic storefront without developer
assistance. - At least some caterers share the page with real customers
in their first week. - Customers can submit an enquiry in under two
minutes. - Caterers report fewer repetitive menu/pricing
conversations. - A subset of active caterers expresses willingness to
pay for continued use.

The strongest early signal is not registrations. It is caterers
repeatedly sharing their storefront and receiving useful enquiries
through it.

------------------------------------------------------------------------

# 15. Build Milestones for Codex

Implement these milestones in order. Do not attempt the whole product in
one pass.

## Milestone 0: Repository inspection and plan

-   Inspect repository and identify current state.
-   Report proposed architecture and any conflicts with existing code.
-   Create or update `AGENTS.md`, `README.md`, and `docs/` files.
-   Confirm package manager and development scripts.
-   Do not start a large implementation until the plan is clear.

**Acceptance:** clear repository map, architecture plan, environment
template, and documented assumptions.

## Milestone 1: App foundation

-   Scaffold or adapt Next.js App Router.
-   Configure TypeScript strict mode, Tailwind, UI primitives, linting,
    formatting, and tests.
-   Set up Supabase clients for browser and server use correctly.
-   Add environment validation.
-   Add base layout, navigation, responsive shell, and error/loading
    states.

**Acceptance:** app starts locally, checks pass, and no secrets are
exposed.

## Milestone 2: Authentication and multi-tenancy

-   Implement sign-up, sign-in, sign-out, session handling.
-   Create profile and business onboarding.
-   Add business membership model.
-   Add RLS migrations and policies.
-   Add tenant-isolation tests.

**Acceptance:** a user can create a business and cannot read or modify
another business's private data.

## Milestone 3: Menu and package management

-   Implement menus, categories, menu items, image upload, ordering, and
    availability.
-   Implement packages and package inclusions.
-   Add draft/published states.
-   Add validation and tests.

**Acceptance:** caterer can create and publish a menu and package
without developer intervention.

## Milestone 4: Public storefront

-   Implement public route by slug.
-   Render only published business data.
-   Add mobile layout, SEO metadata, share/copy actions, and WhatsApp
    CTA.
-   Add public visibility tests.

**Acceptance:** an anonymous customer can open and browse a published
storefront on mobile.

## Milestone 5: Enquiries and dashboard

-   Implement public enquiry form and server validation.
-   Add rate limiting and abuse controls.
-   Implement dashboard enquiry list and status transitions.
-   Add internal notes and follow-up date.
-   Add tests.

**Acceptance:** customer enquiry appears only in the correct caterer's
dashboard.

## Milestone 6: Quotes and bookings

-   Implement quote editor and immutable/versioned sent quotes.
-   Implement secure customer quote links.
-   Implement accept/decline.
-   Implement booking confirmation and cancellation.
-   Add transactional and idempotency safeguards.

**Acceptance:** a customer can accept a valid quote and the caterer can
confirm a booking without price or state inconsistencies.

## Milestone 7: Pilot readiness

-   Complete responsive and accessibility checks.
-   Add monitoring and safe error reporting.
-   Add seed/demo business clearly marked as demo.
-   Prepare privacy policy and terms placeholders for legal review.
-   Deploy staging and test with pilot caterers.
-   Fix usability issues before adding more features.

**Acceptance:** the end-to-end pilot flow works reliably with real users
and isolated business data.

## Later milestones

-   Payment collection and webhook processing.
-   Subscription plans and feature gating.
-   Availability calendar.
-   Marketplace discovery and reviews.

------------------------------------------------------------------------

# 16. Codex Working Rules

Add these rules to `AGENTS.md`:

``` md
# Project Instructions

- Read the root README and relevant docs before making changes.
- Follow the product and architecture requirements in this repository.
- Use TypeScript strict mode. Avoid `any`; explain unavoidable exceptions.
- Keep components small and feature-oriented.
- Put business logic in server-side services, not React components.
- Validate all external input with Zod on the server.
- Enforce business membership and tenant scope on every private operation.
- Maintain PostgreSQL RLS policies for all tenant-owned tables.
- Never expose service-role keys or payment secrets to the client.
- Use integer paise for INR calculations.
- Never trust client-provided totals, roles, ownership, or booking status.
- Preserve sent quote versions and accepted booking snapshots.
- Use accessible, responsive UI patterns.
- Include loading, empty, success, and error states.
- Add tests for new business logic and authorization-sensitive changes.
- Run lint, typecheck, and relevant tests before finishing.
- Update docs and migrations when architecture or schema changes.
- Do not add dependencies unless they solve a real requirement.
- Do not implement out-of-scope features without explicit approval.
```

------------------------------------------------------------------------

# 17. Initial Prompt to Give Codex

Use this as the first task after placing this file in the repository
root as `PRODUCT_BUILD_SPEC.md`.

``` text
Read PRODUCT_BUILD_SPEC.md completely.

First inspect the existing repository. Do not immediately generate the entire application.

Your first response must:
1. Summarize the existing repository structure and technology.
2. Identify what already exists and what is missing.
3. Propose an implementation plan mapped to the milestones in PRODUCT_BUILD_SPEC.md.
4. Identify any conflicts between the current repository and the specification.
5. List environment variables and external accounts that will be required.
6. Identify security-sensitive areas, especially Supabase RLS, tenant isolation,
   public enquiry submission, quote tokens, and booking state transitions.
7. Recommend the first milestone to implement.

If the repository is empty, propose the scaffold and then implement Milestone 1
only after presenting the plan.

Follow the specification as the source of truth. Work incrementally, run checks,
write tests, and document decisions. Do not invent integrations, credentials,
or successful test results.
```

## 18. Final Product Direction

The product should grow in this order:

1.  **Digital menu:** eliminate repeated menu and pricing explanations.
2.  **Digital storefront:** give each caterer a professional shareable
    presence.
3.  **Enquiry management:** organize incoming customer requirements.
4.  **Quotes and bookings:** turn enquiries into trackable business.
5.  **Payments and subscriptions:** monetize the workflow.
6.  **Marketplace:** help new customers discover caterers.

The MVP succeeds when a family-run caterer can create a menu, share one
link with a customer, receive a structured enquiry, and manage the
resulting booking without needing to explain their entire service over
another phone call.
