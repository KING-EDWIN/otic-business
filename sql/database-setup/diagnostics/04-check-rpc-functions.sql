-- DIAGNOSTIC SCRIPT 4: Check all RPC functions
-- Run this script and paste the results

SELECT 
    routine_name,
    routine_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
