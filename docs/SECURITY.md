# Security & Tenant Isolation

## 1. Multi-Tenant Row Level Security (RLS)

All tenant-owned tables enforce PostgreSQL RLS. The authoritative isolation predicate is:
```sql
EXISTS (
  SELECT 1 FROM business_members bm
  WHERE bm.business_id = target_table.business_id
    AND bm.user_id = auth.uid()
    AND bm.status = 'active'
)
```

### Public vs. Authenticated Policies
- **`businesses`**: Public `SELECT` allowed ONLY if `published = true AND status = 'active'`. Updates and deletes strictly restricted to active business owners/members.
- **`menus`, `menu_categories`, `menu_items`, `packages`, `package_items`**: Public `SELECT` allowed ONLY if the parent business is published AND the item/package itself is published (`status = 'published'` or `is_published = true`).
- **`enquiries`**: Anonymous users can `INSERT` via public endpoint (subject to rate limiting), but have NO `SELECT` rights. Only authenticated active business members can read or update enquiries for their own business.
- **`quotes`, `quote_items`**: Anonymous access via direct database is DISABLED. Public quote inspection is facilitated via a server-side route handler validating the cryptographic token hash (`public_token_hash`).
- **`bookings`**: Completely private to active business members.

## 2. Public Form Abuse Prevention
- Rate limit `/api/public/businesses/[slug]/enquiries` using client IP and slug windowing.
- Reject requests with payload lengths exceeding safety thresholds.
- Do not disclose whether customer contact numbers already exist in the database.
- Sanitize and HTML-escape all user inputs before dashboard display to prevent XSS.

## 3. Cryptographic Quote Tokens
- Generated using 32 cryptographically secure random bytes (`crypto.randomBytes(32).toString('hex')`).
- Hashed using SHA-256 before database storage (`public_token_hash`).
- Checked for expiration against `valid_until` timestamp.
- Acceptance and decline mutations are idempotent and wrapped in transactions.

## 4. Financial Calculations & State Transitions
- All currency stored in integer paise (`BIGINT`).
- Zero reliance on client-submitted prices or totals.
- Booking status transitions follow strict valid paths:
  `pending_confirmation` -> `confirmed` -> `in_progress` -> `completed`
  Any state -> `cancelled` (with required cancellation reason).
- Once a quote is sent, its version is locked; edits generate an incremented version.
