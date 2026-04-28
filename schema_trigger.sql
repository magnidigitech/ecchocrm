-- ==========================================
-- SUPABASE AUTH TRIGGER FOR MULTI-TENANT SIGNUP
-- ==========================================
-- This trigger automatically provisions a new tenant and user profile
-- when a user signs up through the /signup form.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- 1. Check if this is a brand new tenant signup
  IF new.raw_user_meta_data->>'is_new_tenant' = 'true' THEN
    
    -- Insert into tenants table and get the ID
    INSERT INTO public.tenants (name, subdomain)
    VALUES (
      new.raw_user_meta_data->>'tenant_name',
      new.raw_user_meta_data->>'tenant_subdomain'
    )
    RETURNING id INTO new_tenant_id;

    -- Insert into users table linked to the new tenant
    INSERT INTO public.users (id, tenant_id, email, first_name, last_name, role)
    VALUES (
      new.id,
      new_tenant_id,
      new.email,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      'superadmin'
    );
  
  ELSE
    -- 2. This is an invited user (e.g., counselor or student)
    -- The inviting admin should have passed the tenant_id in metadata
    INSERT INTO public.users (id, tenant_id, email, first_name, last_name, role)
    VALUES (
      new.id,
      CAST(new.raw_user_meta_data->>'tenant_id' AS UUID),
      new.email,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      CAST(new.raw_user_meta_data->>'role' AS public.user_role)
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
