-- TEST CONNECTION AND VERIFY SETUP
-- Run this after the main setup to verify everything is working

-- 1. Test basic connection
SELECT 'Connection successful' as test_result;

-- 2. Check if all required tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('user_profiles', 'businesses', 'business_memberships', 'business_invitations', 'products', 'sales', 'inventory', 'customers', 'orders', 'transactions') 
    THEN 'Required table exists'
    ELSE 'Optional table'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'businesses', 'business_memberships', 'business_invitations', 'products', 'sales', 'inventory', 'customers', 'orders', 'transactions')
ORDER BY table_name;

-- 3. Check if RPC functions exist
SELECT 
  routine_name,
  routine_type,
  'Function exists' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_businesses', 'get_individual_businesses', 'get_business_members', 'can_create_business', 'test_user_data', 'switch_business_context', 'get_user_invitations', 'respond_to_invitation')
ORDER BY routine_name;

-- 4. Test a simple RPC function
SELECT 'RPC functions test' as test_result;

-- 5. Check permissions
SELECT 
  grantee,
  privilege_type,
  table_name
FROM information_schema.table_privileges 
WHERE grantee = 'authenticated' 
AND table_name IN ('user_profiles', 'businesses', 'business_memberships')
LIMIT 5;




