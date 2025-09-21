-- Check the actual structure of the businesses table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'businesses'
ORDER BY ordinal_position;

-- Check if owner_id column exists
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'businesses'
    AND column_name = 'owner_id'
) as owner_id_exists;

-- Check what columns are available for user identification
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'businesses'
AND column_name LIKE '%user%' OR column_name LIKE '%owner%' OR column_name LIKE '%created%';

