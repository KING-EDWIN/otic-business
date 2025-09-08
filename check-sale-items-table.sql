-- Check the structure of the sale_items table
-- Run this in your Supabase SQL Editor

-- Get table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sale_items' 
ORDER BY ordinal_position;

-- Also check if the table exists and get a sample row
SELECT * FROM sale_items LIMIT 1;


