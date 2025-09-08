-- Fix the signup foreign key constraint issue
-- This script addresses the problem where user_profiles.id has a foreign key constraint
-- to auth.users.id, but we're trying to insert before the user exists in auth.users

-- Step 1: Check current constraints
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.table_name='user_profiles' 
  AND kcu.column_name = 'id';

-- Step 2: Remove the problematic foreign key constraint
-- The user_profiles.id should be a primary key, not a foreign key
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Step 3: Ensure user_profiles.id is properly set as primary key
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);

-- Step 4: Create a function to handle user profile creation after auth user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles when a new user is created in auth.users
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;

-- Step 7: Verify the fix
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.table_name='user_profiles' 
  AND kcu.column_name = 'id';
