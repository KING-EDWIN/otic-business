-- DIAGNOSTIC SCRIPT 8: Check indexes
-- Run this script and paste the results

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
