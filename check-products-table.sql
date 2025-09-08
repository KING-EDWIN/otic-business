-- Check the structure of the products table
-- Run this in your Supabase SQL Editor first

-- Get table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Also check if the table exists and get a sample row
SELECT * FROM products LIMIT 1;

