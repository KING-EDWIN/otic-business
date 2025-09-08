-- Simple fix: Just remove the foreign key constraint
-- Don't try to add a primary key since one already exists

-- Step 1: Remove the foreign key constraint that's causing the issue
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Step 2: Check what constraints remain
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.table_name='user_profiles' 
ORDER BY tc.constraint_type, tc.constraint_name;

-- Step 3: Create a simple trigger function that handles the user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert into user_profiles when a new user is created in auth.users
  -- Use ON CONFLICT to handle cases where the profile already exists
  INSERT INTO public.user_profiles (
    id,
    email,
    business_name,
    tier,
    email_verified,
    verification_timestamp,
    verified_by,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'New Business', -- Default business name
    'free_trial',   -- Default tier
    false,          -- Not verified initially
    null,
    null,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- If profile already exists, do nothing
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;
