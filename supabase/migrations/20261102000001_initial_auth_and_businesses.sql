-- Migration: Initial Auth and Multi-Tenancy Schema
-- Description: Creates profiles, businesses, and business_members tables with Row Level Security.

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to create profile upon auth.users creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_path TEXT,
  cover_image_path TEXT,
  phone TEXT,
  whatsapp_phone TEXT,
  email TEXT,
  address_text TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country_code TEXT NOT NULL DEFAULT 'IN',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);

-- 3. Business Members Table
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'staff')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (business_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_business ON public.business_members(business_id);

-- 4. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

-- 5. Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. Business Members Policies
CREATE POLICY "Active members can view business memberships"
  ON public.business_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

CREATE POLICY "Owners can manage business members"
  ON public.business_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
        AND bm.status = 'active'
    )
  );

-- 7. Businesses Policies
-- Public read for published active storefronts
CREATE POLICY "Public can view published businesses"
  ON public.businesses FOR SELECT
  USING (published = TRUE AND status = 'active');

-- Business members can view their businesses (published or unpublished)
CREATE POLICY "Members can view their business"
  ON public.businesses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = businesses.id
        AND bm.user_id = auth.uid()
        AND bm.status = 'active'
    )
  );

-- Users can insert a business where they are designated as owner
CREATE POLICY "Authenticated users can create business"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their business
CREATE POLICY "Owners can update business"
  ON public.businesses FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = businesses.id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
        AND bm.status = 'active'
    )
  );

