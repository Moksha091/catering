-- Migration: Enquiries, Quotes, Bookings, Service Areas, and Audit Logs
-- Description: Complete schema and RLS policies for Enquiries, Quotes, Bookings, and Audit Logs.

-- 1. Service Areas Table
CREATE TABLE IF NOT EXISTS public.service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  locality TEXT,
  postal_code TEXT,
  travel_fee_paise BIGINT NOT NULL DEFAULT 0 CHECK (travel_fee_paise >= 0),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_service_areas_business_id ON public.service_areas(business_id);

-- 2. Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  event_type TEXT,
  event_date DATE,
  start_time TIME,
  end_time TIME,
  guest_count INTEGER CHECK (guest_count IS NULL OR guest_count > 0),
  venue_address TEXT,
  city TEXT,
  selected_package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  budget_min_paise BIGINT CHECK (budget_min_paise IS NULL OR budget_min_paise >= 0),
  budget_max_paise BIGINT CHECK (budget_max_paise IS NULL OR budget_max_paise >= 0),
  customer_notes TEXT,
  source TEXT NOT NULL DEFAULT 'storefront' CHECK (source IN ('storefront', 'whatsapp', 'marketplace', 'manual', 'other')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quote_sent', 'converted', 'declined', 'closed')),
  internal_notes TEXT,
  follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_enquiries_business_id ON public.enquiries(business_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_business_status_created ON public.enquiries(business_id, status, created_at DESC);

-- 3. Quotes Table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  public_token_hash TEXT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise >= 0),
  discount_paise BIGINT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  tax_paise BIGINT NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
  additional_charges_paise BIGINT NOT NULL DEFAULT 0 CHECK (additional_charges_paise >= 0),
  total_paise BIGINT NOT NULL CHECK (total_paise >= 0),
  deposit_paise BIGINT NOT NULL DEFAULT 0 CHECK (deposit_paise >= 0),
  notes TEXT,
  valid_until TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired', 'superseded')),
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (enquiry_id, version)
);

CREATE INDEX IF NOT EXISTS idx_quotes_business_id ON public.quotes(business_id);
CREATE INDEX IF NOT EXISTS idx_quotes_token_hash ON public.quotes(public_token_hash);
CREATE INDEX IF NOT EXISTS idx_quotes_enquiry_id ON public.quotes(enquiry_id);

-- 4. Quote Items Table
CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
  unit TEXT,
  unit_price_paise BIGINT NOT NULL CHECK (unit_price_paise >= 0),
  line_total_paise BIGINT NOT NULL CHECK (line_total_paise >= 0),
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON public.quote_items(quote_id);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  booking_reference TEXT NOT NULL UNIQUE,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  guest_count INTEGER CHECK (guest_count IS NULL OR guest_count > 0),
  venue_address TEXT,
  agreed_total_paise BIGINT NOT NULL CHECK (agreed_total_paise >= 0),
  deposit_due_paise BIGINT NOT NULL DEFAULT 0 CHECK (deposit_due_paise >= 0),
  balance_due_paise BIGINT NOT NULL DEFAULT 0 CHECK (balance_due_paise >= 0),
  status TEXT NOT NULL DEFAULT 'pending_confirmation' CHECK (status IN ('pending_confirmation', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  cancellation_reason TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_bookings_business_date ON public.bookings(business_id, event_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_business_id ON public.audit_logs(business_id, created_at DESC);

-- 7. Enable Row Level Security
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. Policies
-- Service areas: Public read for published active businesses; tenant manage
CREATE POLICY "Public can view published service areas"
  ON public.service_areas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = service_areas.business_id
        AND b.published = TRUE
        AND b.status = 'active'
    )
  );

CREATE POLICY "Tenant members can manage service areas"
  ON public.service_areas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = service_areas.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

-- Enquiries: Anyone can INSERT public enquiry; strictly tenant members can SELECT/UPDATE
CREATE POLICY "Public can insert enquiries"
  ON public.enquiries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = enquiries.business_id
        AND b.published = TRUE
        AND b.status = 'active'
    )
  );

CREATE POLICY "Tenant members can manage enquiries"
  ON public.enquiries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = enquiries.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

-- Quotes: Strictly tenant members via direct DB.
CREATE POLICY "Tenant members can manage quotes"
  ON public.quotes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = quotes.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

CREATE POLICY "Tenant members can manage quote items"
  ON public.quote_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = quote_items.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

-- Bookings: Strictly tenant members
CREATE POLICY "Tenant members can manage bookings"
  ON public.bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = bookings.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

-- Audit logs: Tenant members can view their audit logs; insert via server
CREATE POLICY "Tenant members can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = audit_logs.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

CREATE POLICY "Tenant members can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = audit_logs.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

