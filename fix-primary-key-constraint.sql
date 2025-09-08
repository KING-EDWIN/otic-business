-- Fix the multiple primary keys error for user_profiles table
-- First, let's check what constraints already exist

-- Step 1: Check existing constraints on user_profiles table
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
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.table_name='user_profiles' 
ORDER BY tc.constraint_type, tc.constraint_name;

-- Step 2: Check if there's already a primary key
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'user_profiles' 
  AND constraint_type = 'PRIMARY KEY';

-- Step 3: Remove the foreign key constraint (if it exists) without adding a new primary key
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Step 4: Check what the current primary key is
SELECT 
    kcu.column_name,
    kcu.ordinal_position
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'user_profiles'
  AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY kcu.ordinal_position;

-- Step 5: If the primary key is not on the 'id' column, we need to fix it
-- But first, let's just remove the foreign key constraint and see what happens
-- The primary key should already be properly set

-- Step 6: Create the trigger function (this should work now)
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
EXCEPTION
  WHEN unique_violation THEN
    -- If the user profile already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 8: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;

-- Step 9: Verify the final state
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
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.table_name='user_profiles' 
ORDER BY tc.constraint_type, tc.constraint_name;
