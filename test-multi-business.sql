-- Test Multi-Business System
-- Run this after running 04-fix-multi-business-tables.sql

-- 1. Test if all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('businesses', 'business_memberships', 'business_invitations', 'business_switches') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('businesses', 'business_memberships', 'business_invitations', 'business_switches')
ORDER BY table_name;

-- 2. Test if functions exist
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IN ('get_user_businesses', 'can_create_business', 'get_business_members') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_businesses', 'can_create_business', 'get_business_members')
ORDER BY routine_name;

-- 3. Test if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('businesses', 'business_memberships', 'business_invitations', 'business_switches')
ORDER BY tablename;

-- 4. Test if indexes exist
SELECT 
    indexname,
    tablename,
    CASE 
        WHEN indexname LIKE 'idx_%' 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('businesses', 'business_memberships', 'business_invitations', 'business_switches')
ORDER BY tablename, indexname;
