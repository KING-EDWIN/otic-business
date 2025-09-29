-- Check Database Structure for Signup Issues
-- This script will help us understand the actual database structure

-- 1. Check if auth schema exists and what tables are in it
SELECT 
    schemaname, 
    tablename, 
    tableowner
FROM pg_tables 
WHERE schemaname = 'auth'
ORDER BY tablename;

-- 2. Check the actual structure of auth.users table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Check user_profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 4. Check foreign key constraints on user_profiles
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_schema,
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

-- 5. Check if there are any users in auth.users
SELECT COUNT(*) as user_count FROM auth.users;

-- 6. Check if there are any profiles in user_profiles
SELECT COUNT(*) as profile_count FROM public.user_profiles;

-- 7. Check recent auth.users entries (last 5)
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Check recent user_profiles entries (last 5)
SELECT id, email, created_at 
FROM public.user_profiles 
ORDER BY created_at DESC 
LIMIT 5;
