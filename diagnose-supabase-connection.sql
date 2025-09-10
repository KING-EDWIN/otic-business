-- Diagnose Supabase Connection and RLS Issues
-- Run this to understand what's happening with your database

-- 1. Check if you can access the auth schema (this might fail - that's normal)
SELECT 'Auth schema access test' as test_name;
-- SELECT auth.uid() as current_user_id; -- This will only work if authenticated

-- 2. Check RLS status for all tables
SELECT 
    'RLS Status Check' as test_name,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 3. Check existing policies
SELECT 
    'Existing Policies' as test_name,
    nsp.nspname AS schema_name,
    rel.relname AS table_name,
    pol.polname AS policy_name,
    CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command
FROM pg_policy pol
JOIN pg_class rel ON rel.oid = pol.polrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
ORDER BY table_name, policy_name;

-- 4. Check if user_profiles table exists and its structure
SELECT 
    'Table Structure' as test_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 5. Check if there are any existing user profiles (this might fail due to RLS)
SELECT 
    'User Profiles Count' as test_name,
    COUNT(*) as total_profiles
FROM user_profiles;

-- 6. Check for any constraints on user_profiles
SELECT 
    'Constraints' as test_name,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_profiles'::regclass;

-- 7. Check if the table has the correct primary key
SELECT 
    'Primary Key' as test_name,
    a.attname as column_name,
    t.typname as data_type
FROM pg_index i
JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
JOIN pg_type t ON t.oid = a.atttypid
WHERE i.indrelid = 'public.user_profiles'::regclass
  AND i.indisprimary = true;

