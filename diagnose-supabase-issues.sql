-- Diagnose Supabase Issues
-- Run this in your Supabase SQL Editor to check the current state

-- Check if tables exist and their RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls as rls_forced
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'products', 'sales', 'sale_items', 'subscriptions', 'payment_requests')
ORDER BY tablename;

-- Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if auth.uid() function works
SELECT auth.uid() as current_user_id;

-- Check current user and role
SELECT current_user, current_role;

-- Check if we can access the auth schema
SELECT has_schema_privilege('auth', 'usage') as can_use_auth_schema;

-- Check table permissions for authenticated role
SELECT 
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'authenticated' 
AND table_schema = 'public'
AND table_name IN ('user_profiles', 'products', 'sales', 'sale_items', 'subscriptions', 'payment_requests')
ORDER BY table_name, privilege_type;

-- Check table permissions for anon role
SELECT 
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'anon' 
AND table_schema = 'public'
AND table_name IN ('user_profiles', 'products', 'sales', 'sale_items', 'subscriptions', 'payment_requests')
ORDER BY table_name, privilege_type;

-- Check if there are any users in the system
SELECT COUNT(*) as user_count FROM auth.users;

-- Check if there are any user_profiles
SELECT COUNT(*) as profile_count FROM user_profiles;

-- Test a simple query to see if we can access data
SELECT COUNT(*) as sales_count FROM sales LIMIT 1;

