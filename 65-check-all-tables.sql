-- Check all tables that exist in the database
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if we have any inventory/product related tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%product%' OR table_name LIKE '%inventory%' OR table_name LIKE '%stock%')
ORDER BY table_name;

