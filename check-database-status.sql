-- Comprehensive database status check
-- This script will show us what tables exist and what might be missing

-- Check if we can connect and see all tables
SELECT 'Database Connection Test' as test_type, 
       current_database() as database_name,
       current_user as current_user,
       version() as postgres_version;

-- Check all tables in public schema
SELECT 'All Tables' as info, 
       table_name, 
       table_type,
       is_insertable_into,
       is_updatable
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check specific tables we need for business management
SELECT 'Required Tables Check' as info, 
       CASE 
         WHEN table_name = 'user_profiles' THEN '✓ user_profiles'
         WHEN table_name = 'businesses' THEN '✓ businesses'
         WHEN table_name = 'business_memberships' THEN '✓ business_memberships'
         WHEN table_name = 'system_troubleshoot_logs' THEN '✓ system_troubleshoot_logs'
         WHEN table_name = 'admin_auth' THEN '✓ admin_auth'
         ELSE '✗ ' || table_name
       END as table_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'businesses', 'business_memberships', 'system_troubleshoot_logs', 'admin_auth')
ORDER BY table_name;

-- Check RLS status for key tables
SELECT 'RLS Status' as info,
       schemaname,
       tablename,
       rowsecurity as rls_enabled,
       hasrls
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'businesses', 'business_memberships', 'system_troubleshoot_logs')
ORDER BY tablename;

-- Check RPC functions we need
SELECT 'RPC Functions' as info,
       routine_name,
       routine_type,
       data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_businesses', 'can_create_business', 'get_business_members', 'log_system_error', 'get_system_error_reports')
ORDER BY routine_name;

-- Check if we have any data in key tables
SELECT 'Data Count Check' as info,
       'user_profiles' as table_name,
       COUNT(*) as record_count
FROM user_profiles
UNION ALL
SELECT 'Data Count Check' as info,
       'businesses' as table_name,
       COUNT(*) as record_count
FROM businesses
UNION ALL
SELECT 'Data Count Check' as info,
       'business_memberships' as table_name,
       COUNT(*) as record_count
FROM business_memberships
UNION ALL
SELECT 'Data Count Check' as info,
       'system_troubleshoot_logs' as table_name,
       COUNT(*) as record_count
FROM system_troubleshoot_logs;

-- Check current user's businesses
SELECT 'User Businesses Test' as info,
       COUNT(*) as business_count
FROM businesses b
JOIN business_memberships bm ON b.id = bm.business_id
WHERE bm.user_id = auth.uid();

-- Test the get_user_businesses function
SELECT 'Function Test' as info,
       'get_user_businesses' as function_name,
       COUNT(*) as result_count
FROM get_user_businesses(auth.uid());




