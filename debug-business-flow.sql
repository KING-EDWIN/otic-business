-- Debug script to check business flow
-- This will help us understand what's happening with businesses

-- Check if we can connect
SELECT 'Connection Test' as test, current_user as user, current_database() as database;

-- Check if tables exist
SELECT 'Tables Check' as test, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN '✓ user_profiles' ELSE '✗ user_profiles' END as user_profiles,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') THEN '✓ businesses' ELSE '✗ businesses' END as businesses,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_memberships') THEN '✓ business_memberships' ELSE '✗ business_memberships' END as business_memberships;

-- Check if RPC functions exist
SELECT 'RPC Functions Check' as test,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_businesses') THEN '✓ get_user_businesses' ELSE '✗ get_user_businesses' END as get_user_businesses,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'can_create_business') THEN '✓ can_create_business' ELSE '✗ can_create_business' END as can_create_business,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_business_members') THEN '✓ get_business_members' ELSE '✗ get_business_members' END as get_business_members;

-- Check current user
SELECT 'Current User' as test, auth.uid() as user_id, auth.email() as email;

-- Check if current user has a profile
SELECT 'User Profile Check' as test, 
       CASE WHEN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid()) THEN '✓ Profile exists' ELSE '✗ No profile' END as profile_status;

-- Check businesses count
SELECT 'Businesses Count' as test, COUNT(*) as total_businesses FROM businesses;

-- Check business memberships count
SELECT 'Business Memberships Count' as test, COUNT(*) as total_memberships FROM business_memberships;

-- Check if current user has any businesses
SELECT 'User Businesses Check' as test, 
       COUNT(*) as user_businesses_count
FROM businesses b
JOIN business_memberships bm ON b.id = bm.business_id
WHERE bm.user_id = auth.uid();

-- Test the get_user_businesses function
SELECT 'Function Test' as test, 
       COUNT(*) as function_result_count
FROM get_user_businesses(auth.uid());

-- Show actual businesses for current user
SELECT 'User Businesses Details' as test,
       b.id,
       b.name,
       b.business_type,
       bm.role,
       bm.joined_at
FROM businesses b
JOIN business_memberships bm ON b.id = bm.business_id
WHERE bm.user_id = auth.uid()
ORDER BY b.created_at DESC;
