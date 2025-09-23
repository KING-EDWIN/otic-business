-- Check the actual structure of the products table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Also check if products table exists
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'products'
) as products_table_exists;




