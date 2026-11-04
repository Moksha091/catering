-- Migration: Full Database Resilience & RLS Policy Fixes
-- Description:
-- 1. Idempotent handle_new_user trigger (creates profiles automatically on auth.users insert)
-- 2. ensure_own_profile RPC function (allows authenticated users to self-heal their profile)
-- 3. Business & Business Members RLS policy repairs (allows owners to view and insert initial membership)
-- 4. Automatic handle_new_business trigger (adds owner to business_members automatically)
-- 5. Package items public read policy for storefront
-- 6. Immediate backfill for any existing auth.users missing profiles and businesses missing members

-- 1. Hardened handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
    SET
      full_name  = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      phone      = COALESCE(EXCLUDED.phone,     public.profiles.phone),
      updated_at = timezone('utc'::text, now());
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. ensure_own_profile RPC function (SECURITY DEFINER, no service-role key needed)
CREATE OR REPLACE FUNCTION public.ensure_own_profile(
  p_full_name TEXT DEFAULT NULL,
  p_phone     TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    auth.uid(),
    p_full_name,
    p_phone
  )
  ON CONFLICT (id) DO UPDATE
    SET
      full_name  = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      phone      = COALESCE(EXCLUDED.phone,     public.profiles.phone),
      updated_at = timezone('utc'::text, now());
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_own_profile(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_own_profile(TEXT, TEXT) TO authenticated;

-- 3. Ensure business owners can ALWAYS view their own businesses via SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'businesses'
      AND policyname = 'Owners can view own businesses'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Owners can view own businesses"
        ON public.businesses FOR SELECT
        USING (owner_id = auth.uid());
    $policy$;
  END IF;
END;
$$;

-- 4. Allow business creators to insert initial owner membership in business_members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'business_members'
      AND policyname = 'Owners can insert initial membership'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Owners can insert initial membership"
        ON public.business_members FOR INSERT
        WITH CHECK (
          user_id = auth.uid() AND
          EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = business_members.business_id
              AND b.owner_id = auth.uid()
          )
        );
    $policy$;
  END IF;
END;
$$;

-- 5. Trigger: automatically create owner membership on new business creation
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.business_members (business_id, user_id, role, status)
  VALUES (new.id, new.owner_id, 'owner', 'active')
  ON CONFLICT (business_id, user_id) DO NOTHING;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_business failed for business %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_business_created ON public.businesses;
CREATE TRIGGER on_business_created
  AFTER INSERT ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_business();

-- 6. Ensure package_items has public read policy for published storefronts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'package_items'
      AND policyname = 'Public can view package items for published businesses'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Public can view package items for published businesses"
        ON public.package_items FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.packages pk
            JOIN public.businesses b ON b.id = pk.business_id
            WHERE pk.id = package_items.package_id
              AND pk.is_published = TRUE
              AND b.published = TRUE
              AND b.status = 'active'
          )
        );
    $policy$;
  END IF;
END;
$$;

-- 7. BACKFILL: Ensure all existing auth.users have profile rows
INSERT INTO public.profiles (id, full_name, phone)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'Catering Partner'),
  raw_user_meta_data->>'phone'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 8. BACKFILL: Ensure all existing businesses have their owner in business_members
INSERT INTO public.business_members (business_id, user_id, role, status)
SELECT
  id,
  owner_id,
  'owner',
  'active'
FROM public.businesses
ON CONFLICT (business_id, user_id) DO NOTHING;
