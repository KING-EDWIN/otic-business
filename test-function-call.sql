-- Test the actual function call to see what's happening
-- Run this in Supabase SQL Editor

-- Test the get_dashboard_stats function directly
SELECT get_dashboard_stats('00000000-0000-0000-0000-000000000001'::UUID) as dashboard_data;

-- If that fails, let's check the function signature
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'get_dashboard_stats';

-- Test with a simpler query to see if RPC works at all
SELECT 'RPC test: ' || current_user as rpc_status;


