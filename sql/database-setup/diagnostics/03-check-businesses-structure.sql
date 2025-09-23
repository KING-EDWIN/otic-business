-- DIAGNOSTIC SCRIPT 3: Check businesses table structure
-- Run this script and paste the results

SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public'
ORDER BY ordinal_position;
