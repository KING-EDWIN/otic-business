-- Check the actual structure of branch management tables
-- Run this script and paste the results here

-- Check branch_sales table structure
SELECT 'branch_sales table structure:' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'branch_sales'
ORDER BY ordinal_position;

-- Check branch_sale_items table structure
SELECT 'branch_sale_items table structure:' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'branch_sale_items'
ORDER BY ordinal_position;

-- Check branch_inventory table structure
SELECT 'branch_inventory table structure:' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'branch_inventory'
ORDER BY ordinal_position;

-- Check branch_inventory_movements table structure
SELECT 'branch_inventory_movements table structure:' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'branch_inventory_movements'
ORDER BY ordinal_position;

-- Check branch_staff_attendance table structure
SELECT 'branch_staff_attendance table structure:' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'branch_staff_attendance'
ORDER BY ordinal_position;

-- Also check if these tables exist at all
SELECT 'All branch tables:' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'branch_%'
ORDER BY table_name;
