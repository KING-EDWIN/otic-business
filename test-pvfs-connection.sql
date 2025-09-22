-- Test if PVFS tables and functions exist
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'vft_%'
ORDER BY table_name;

-- Test if create_vft function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'create_vft';

-- Test if we can call the function (this will fail if function doesn't exist)
-- SELECT create_vft('Test Tag', (SELECT id FROM vft_categories LIMIT 1), 0.8);



