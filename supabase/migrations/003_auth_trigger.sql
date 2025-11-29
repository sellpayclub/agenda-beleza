-- Trigger function to create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Try to find tenant by email
  SELECT id INTO v_tenant_id
  FROM tenants
  WHERE email = NEW.email
  LIMIT 1;

  -- If tenant found, create user record
  IF v_tenant_id IS NOT NULL THEN
    INSERT INTO public.users (id, tenant_id, role, name, email)
    VALUES (
      NEW.id,
      v_tenant_id,
      'admin',
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

