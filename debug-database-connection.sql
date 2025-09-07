-- Debug database connection and RLS
-- Run this in your Supabase SQL Editor

-- Check if we're in the right database/schema
SELECT current_database(), current_schema();

-- Check if tables exist and their structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('invoices', 'expenses') 
ORDER BY table_name, ordinal_position;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('invoices', 'expenses');

-- Check if data exists without RLS
SELECT 'INVOICES (no RLS):' as info;
SELECT id, user_id, invoice_number, total FROM invoices LIMIT 5;

SELECT 'EXPENSES (no RLS):' as info;
SELECT id, user_id, amount, description FROM expenses LIMIT 5;

-- Check what user_ids actually exist
SELECT 'DISTINCT USER_IDS IN INVOICES:' as info;
SELECT DISTINCT user_id FROM invoices;

SELECT 'DISTINCT USER_IDS IN EXPENSES:' as info;
SELECT DISTINCT user_id FROM expenses;

-- Check if our specific user_id exists
SELECT 'INVOICES FOR OUR USER:' as info;
SELECT COUNT(*) as count FROM invoices WHERE user_id = '00000000-0000-0000-0000-000000000001';

SELECT 'EXPENSES FOR OUR USER:' as info;
SELECT COUNT(*) as count FROM expenses WHERE user_id = '00000000-0000-0000-0000-000000000001';
