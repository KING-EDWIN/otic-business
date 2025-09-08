-- Check if accounting data exists
-- Run this in your Supabase SQL Editor

-- Check all tables and their data
SELECT 'expenses' as table_name, COUNT(*) as count, 
       CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM expenses
UNION ALL
SELECT 'invoices' as table_name, COUNT(*) as count,
       CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM invoices
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as count,
       CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM customers
UNION ALL
SELECT 'accounts' as table_name, COUNT(*) as count,
       CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM accounts;

-- Show actual data if it exists
SELECT 'EXPENSES DATA:' as info;
SELECT id, user_id, amount, description FROM expenses LIMIT 5;

SELECT 'INVOICES DATA:' as info;
SELECT id, invoice_number, user_id, total FROM invoices LIMIT 5;

