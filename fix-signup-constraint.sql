-- Fix Signup Constraint Issues
-- This script addresses the foreign key constraint violation in user_profiles table

-- Check if the foreign key constraint exists and is correct
SELECT 
    tc.constraint_name, 
    tc.table_name, 
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
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'user_profiles'
  AND tc.table_schema = 'public';

-- Check if auth.users table exists and has the expected structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Verify that user_profiles table structure is correct
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Test: Check if we can insert a test profile (this will fail if constraint is broken)
-- DO NOT RUN THIS IN PRODUCTION - IT'S JUST FOR TESTING
/*
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- This is just a test to see if the constraint works
    -- In real usage, the auth.users record would exist
    test_user_id := gen_random_uuid();
    
    -- This should fail with foreign key constraint violation
    -- which confirms the constraint is working
    INSERT INTO public.user_profiles (id, email, user_type) 
    VALUES (test_user_id, 'test@example.com', 'individual');
    
    -- If we get here, something is wrong with the constraint
    RAISE NOTICE 'WARNING: Foreign key constraint may not be working properly!';
    
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'SUCCESS: Foreign key constraint is working correctly';
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Unexpected error: %', SQLERRM;
END $$;
*/

-- If needed, recreate the foreign key constraint
-- (Only run this if the constraint is missing or broken)
/*
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
*/
