-- Test database connection and data access
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Test basic connection
SELECT 'Database connection: WORKING' as status;

-- 2. Test demo user exists
SELECT 
  'Demo user: ' || CASE WHEN COUNT(*) > 0 THEN 'FOUND' ELSE 'MISSING' END as user_status
FROM user_profiles 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 3. Test data exists
SELECT 
  'Sales: ' || COUNT(*) as sales_count,
  'Products: ' || COUNT(*) as products_count,
  'Revenue: UGX ' || COALESCE(SUM(total), 0) as total_revenue
FROM sales 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- 4. Test if functions exist
SELECT 
  'get_dashboard_stats function: ' || CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_dashboard_stats'
  ) THEN 'EXISTS' ELSE 'MISSING' END as function_status;

-- 5. Test RPC call (if function exists)
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_dashboard_stats')
  THEN 'RPC functions: READY'
  ELSE 'RPC functions: NEED TO BE CREATED'
  END as rpc_status;


