-- Test script to verify business functions work correctly
-- Run this after fixing the RPC functions

-- Test 1: Check if functions exist
SELECT 'Function Existence Check' as test,
       routine_name,
       routine_type,
       data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_businesses', 'can_create_business', 'get_business_members')
ORDER BY routine_name;

-- Test 2: Check current user
SELECT 'Current User Check' as test,
       auth.uid() as user_id,
       auth.email() as email;

-- Test 3: Check if user has profile
SELECT 'User Profile Check' as test,
       CASE WHEN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid()) 
            THEN 'Profile exists' 
            ELSE 'No profile' 
       END as profile_status;

-- Test 4: Test get_user_businesses function
SELECT 'get_user_businesses Test' as test,
       COUNT(*) as business_count
FROM get_user_businesses(auth.uid());

-- Test 5: Test can_create_business function
SELECT 'can_create_business Test' as test,
       can_create_business(auth.uid()) as can_create;

-- Test 6: Show actual businesses (if any)
SELECT 'User Businesses' as test,
       b.id,
       b.name,
       b.business_type,
       bm.role,
       b.created_at
FROM businesses b
JOIN business_memberships bm ON b.id = bm.business_id
WHERE bm.user_id = auth.uid()
ORDER BY b.created_at DESC;

-- Test 7: Test get_business_members function (if user has businesses)
SELECT 'get_business_members Test' as test,
       COUNT(*) as member_count
FROM get_business_members(
    (SELECT b.id FROM businesses b 
     JOIN business_memberships bm ON b.id = bm.business_id 
     WHERE bm.user_id = auth.uid() 
     LIMIT 1)
);
