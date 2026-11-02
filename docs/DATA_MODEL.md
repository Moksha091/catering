# Data Model & Schema Specification

All entity IDs are UUID primary keys (`gen_random_uuid()`). Currency amounts are stored as 64-bit integer paise (`BIGINT`). Timestamps are stored in UTC (`TIMESTAMPTZ`).

## 1. Tables Overview

### Profiles (`profiles`)
- `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- `full_name TEXT`
- `phone TEXT`
- `created_at TIMESTAMPTZ DEFAULT NOW()`
- `updated_at TIMESTAMPTZ DEFAULT NOW()`

### Businesses (`businesses`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `owner_id UUID REFERENCES profiles(id)`
- `name TEXT NOT NULL`
- `slug TEXT NOT NULL UNIQUE`
- `description TEXT`
- `logo_path TEXT`
- `cover_image_path TEXT`
- `phone TEXT`
- `whatsapp_phone TEXT`
- `email TEXT`
- `address_text TEXT`
- `city TEXT`
- `state TEXT`
- `postal_code TEXT`
- `country_code TEXT DEFAULT 'IN'`
- `timezone TEXT DEFAULT 'Asia/Kolkata'`
- `published BOOLEAN DEFAULT FALSE`
- `status TEXT DEFAULT 'active'` CHECK (`status IN ('active', 'suspended', 'deleted')`)
- `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`

### Business Members (`business_members`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `role TEXT NOT NULL DEFAULT 'owner'` CHECK (`role IN ('owner', 'staff')`)
- `status TEXT NOT NULL DEFAULT 'active'` CHECK (`status IN ('invited', 'active', 'removed')`)
- UNIQUE (`business_id`, `user_id`)

### Menus (`menus`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `name TEXT NOT NULL`
- `description TEXT`
- `menu_type TEXT`
- `status TEXT DEFAULT 'draft'` CHECK (`status IN ('draft', 'published', 'archived')`)
- `display_order INTEGER DEFAULT 0`
- `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`

### Menu Categories (`menu_categories`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE`
- `name TEXT NOT NULL`
- `description TEXT`
- `display_order INTEGER DEFAULT 0`

### Menu Items (`menu_items`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE`
- `name TEXT NOT NULL`
- `description TEXT`
- `image_path TEXT`
- `dietary_type TEXT DEFAULT 'unspecified'` CHECK (`dietary_type IN ('veg', 'non_veg', 'vegan', 'egg', 'other', 'unspecified')`)
- `price_type TEXT DEFAULT 'fixed'` CHECK (`price_type IN ('fixed', 'per_person', 'market_rate', 'quote_required', 'hidden')`)
- `price_paise BIGINT CHECK (price_paise >= 0)`
- `unit_label TEXT`
- `is_available BOOLEAN DEFAULT TRUE`
- `display_order INTEGER DEFAULT 0`
- `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`

### Packages (`packages`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `name TEXT NOT NULL`
- `description TEXT`
- `image_path TEXT`
- `pricing_type TEXT DEFAULT 'per_person'` CHECK (`pricing_type IN ('fixed', 'per_person', 'starting_from', 'quote_required')`)
- `price_paise BIGINT CHECK (price_paise >= 0)`
- `minimum_guests INTEGER CHECK (minimum_guests > 0)`
- `maximum_guests INTEGER CHECK (maximum_guests >= minimum_guests)`
- `is_published BOOLEAN DEFAULT FALSE`
- `display_order INTEGER DEFAULT 0`
- `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`

### Package Items (`package_items`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE`
- `menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL`
- `item_name_snapshot TEXT NOT NULL`
- `quantity_or_description TEXT`
- `display_order INTEGER DEFAULT 0`

### Service Areas (`service_areas`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `city TEXT NOT NULL`
- `locality TEXT`
- `postal_code TEXT`
- `travel_fee_paise BIGINT DEFAULT 0 CHECK (travel_fee_paise >= 0)`
- `notes TEXT`

### Enquiries (`enquiries`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `customer_name TEXT NOT NULL`
- `customer_phone TEXT NOT NULL`
- `customer_email TEXT`
- `event_type TEXT`
- `event_date DATE`
- `start_time TIME`
- `end_time TIME`
- `guest_count INTEGER CHECK (guest_count > 0)`
- `venue_address TEXT`
- `city TEXT`
- `selected_package_id UUID REFERENCES packages(id) ON DELETE SET NULL`
- `budget_min_paise BIGINT CHECK (budget_min_paise >= 0)`
- `budget_max_paise BIGINT CHECK (budget_max_paise >= budget_min_paise)`
- `customer_notes TEXT`
- `source TEXT DEFAULT 'storefront'` CHECK (`source IN ('storefront', 'whatsapp', 'marketplace', 'manual', 'other')`)
- `status TEXT DEFAULT 'new'` CHECK (`status IN ('new', 'contacted', 'quote_sent', 'converted', 'declined', 'closed')`)
- `internal_notes TEXT`
- `follow_up_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`

### Quotes (`quotes`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE`
- `version INTEGER NOT NULL DEFAULT 1`
- `public_token_hash TEXT NOT NULL`
- `currency CHAR(3) DEFAULT 'INR'`
- `subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise >= 0)`
- `discount_paise BIGINT DEFAULT 0 CHECK (discount_paise >= 0)`
- `tax_paise BIGINT DEFAULT 0 CHECK (tax_paise >= 0)`
- `additional_charges_paise BIGINT DEFAULT 0 CHECK (additional_charges_paise >= 0)`
- `total_paise BIGINT NOT NULL CHECK (total_paise >= 0)`
- `deposit_paise BIGINT DEFAULT 0 CHECK (deposit_paise >= 0)`
- `notes TEXT`
- `valid_until TIMESTAMPTZ`
- `status TEXT DEFAULT 'draft'` CHECK (`status IN ('draft', 'sent', 'accepted', 'declined', 'expired', 'superseded')`)
- `sent_at TIMESTAMPTZ`, `accepted_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`
- UNIQUE (`enquiry_id`, `version`)

### Quote Items (`quote_items`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE`
- `description TEXT NOT NULL`
- `quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0)`
- `unit TEXT`
- `unit_price_paise BIGINT NOT NULL CHECK (unit_price_paise >= 0)`
- `line_total_paise BIGINT NOT NULL CHECK (line_total_paise >= 0)`
- `display_order INTEGER DEFAULT 0`

### Bookings (`bookings`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL`
- `quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL`
- `booking_reference TEXT NOT NULL UNIQUE`
- `event_date DATE NOT NULL`
- `start_time TIME`
- `end_time TIME`
- `guest_count INTEGER CHECK (guest_count > 0)`
- `venue_address TEXT`
- `agreed_total_paise BIGINT NOT NULL CHECK (agreed_total_paise >= 0)`
- `deposit_due_paise BIGINT DEFAULT 0 CHECK (deposit_due_paise >= 0)`
- `balance_due_paise BIGINT DEFAULT 0 CHECK (balance_due_paise >= 0)`
- `status TEXT DEFAULT 'pending_confirmation'` CHECK (`status IN ('pending_confirmation', 'confirmed', 'in_progress', 'completed', 'cancelled')`)
- `cancellation_reason TEXT`
- `confirmed_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`

### Audit Logs (`audit_logs`)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE`
- `actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL`
- `action TEXT NOT NULL`
- `entity_type TEXT NOT NULL`
- `entity_id UUID`
- `metadata JSONB`
- `created_at TIMESTAMPTZ DEFAULT NOW()`

