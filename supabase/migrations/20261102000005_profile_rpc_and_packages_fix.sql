-- Migration: Add profile-ensure RPC and fix package_items policies
-- This creates a SECURITY DEFINER function that lets an authenticated user
-- create/update their own profile row without needing the service-role key.
-- Safe: auth.uid() is enforced inside the function.

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

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.ensure_own_profile(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_own_profile(TEXT, TEXT) TO authenticated;

-- Ensure package_items has a permissive public read policy for published packages
-- (business_id is present on package_items so we can safely join)
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
        )
    $policy$;
  END IF;
END;
$$;
