-- Migration: Harden the handle_new_user trigger to use INSERT ... ON CONFLICT DO UPDATE
-- This ensures the profile row is always created even if a previous attempt failed,
-- and handles edge cases like email-confirmation signups.

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
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      phone     = COALESCE(EXCLUDED.phone,     public.profiles.phone),
      updated_at = timezone('utc'::text, now());
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log and swallow so the auth signup is never blocked by a profile insert failure
  RAISE WARNING 'handle_new_user: failed to upsert profile for user %. SQLSTATE: %. SQLERRM: %',
    new.id, SQLSTATE, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

