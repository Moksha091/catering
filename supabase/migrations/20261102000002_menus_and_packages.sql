-- Migration: Menus and Packages Schema with RLS
-- Description: Creates menus, menu_categories, menu_items, packages, and package_items tables.

-- 1. Menus Table
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  menu_type TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_menus_business_id ON public.menus(business_id);
CREATE INDEX IF NOT EXISTS idx_menus_business_status ON public.menus(business_id, status);

-- 2. Menu Categories Table
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_menu_id ON public.menu_categories(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_order ON public.menu_categories(menu_id, display_order);

-- 3. Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_path TEXT,
  dietary_type TEXT NOT NULL DEFAULT 'unspecified' CHECK (dietary_type IN ('veg', 'non_veg', 'vegan', 'egg', 'other', 'unspecified')),
  price_type TEXT NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'per_person', 'market_rate', 'quote_required', 'hidden')),
  price_paise BIGINT CHECK (price_paise >= 0),
  unit_label TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON public.menu_items(category_id, display_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_business_id ON public.menu_items(business_id);

-- 4. Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_path TEXT,
  pricing_type TEXT NOT NULL DEFAULT 'per_person' CHECK (pricing_type IN ('fixed', 'per_person', 'starting_from', 'quote_required')),
  price_paise BIGINT CHECK (price_paise >= 0),
  minimum_guests INTEGER CHECK (minimum_guests > 0),
  maximum_guests INTEGER CHECK (maximum_guests IS NULL OR minimum_guests IS NULL OR maximum_guests >= minimum_guests),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_packages_business_id ON public.packages(business_id);
CREATE INDEX IF NOT EXISTS idx_packages_business_published ON public.packages(business_id, is_published);

-- 5. Package Items Table
CREATE TABLE IF NOT EXISTS public.package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name_snapshot TEXT NOT NULL,
  quantity_or_description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_package_items_package_id ON public.package_items(package_id);

-- 6. Enable Row Level Security
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_items ENABLE ROW LEVEL SECURITY;

-- Helper policy for tenant members across all menu & package tables
CREATE POLICY "Tenant members can manage menus"
  ON public.menus FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = menus.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

CREATE POLICY "Public can view published menus"
  ON public.menus FOR SELECT
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = menus.business_id
        AND b.published = TRUE
        AND b.status = 'active'
    )
  );

CREATE POLICY "Tenant members can manage menu categories"
  ON public.menu_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = menu_categories.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

CREATE POLICY "Public can view categories of published menus"
  ON public.menu_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.menus m
      JOIN public.businesses b ON b.id = m.business_id
      WHERE m.id = menu_categories.menu_id
        AND m.status = 'published'
        AND b.published = TRUE
        AND b.status = 'active'
    )
  );

CREATE POLICY "Tenant members can manage menu items"
  ON public.menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = menu_items.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

CREATE POLICY "Public can view items of published menus"
  ON public.menu_items FOR SELECT
  USING (
    is_available = TRUE AND
    EXISTS (
      SELECT 1 FROM public.menu_categories c
      JOIN public.menus m ON m.id = c.menu_id
      JOIN public.businesses b ON b.id = m.business_id
      WHERE c.id = menu_items.category_id
        AND m.status = 'published'
        AND b.published = TRUE
        AND b.status = 'active'
    )
  );

CREATE POLICY "Tenant members can manage packages"
  ON public.packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = packages.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

CREATE POLICY "Public can view published packages"
  ON public.packages FOR SELECT
  USING (
    is_published = TRUE AND
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = packages.business_id
        AND b.published = TRUE
        AND b.status = 'active'
    )
  );

CREATE POLICY "Tenant members can manage package items"
  ON public.package_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = package_items.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

CREATE POLICY "Public can view package items of published packages"
  ON public.package_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      JOIN public.businesses b ON b.id = p.business_id
      WHERE p.id = package_items.package_id
        AND p.is_published = TRUE
        AND b.published = TRUE
        AND b.status = 'active'
    )
  );
