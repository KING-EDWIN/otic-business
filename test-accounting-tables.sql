-- Test if accounting tables exist and have data
-- Run this in your Supabase SQL Editor

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('expenses', 'invoices', 'customers', 'accounts', 'expense_categories')
ORDER BY table_name;

-- Check data in each table
SELECT 'expenses' as table_name, COUNT(*) as count FROM expenses
UNION ALL
SELECT 'invoices' as table_name, COUNT(*) as count FROM invoices
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'accounts' as table_name, COUNT(*) as count FROM accounts
UNION ALL
SELECT 'expense_categories' as table_name, COUNT(*) as count FROM expense_categories;

-- Check what user_id is in expenses and invoices
SELECT 'expenses user_id' as info, user_id, COUNT(*) as count FROM expenses GROUP BY user_id;
SELECT 'invoices user_id' as info, user_id, COUNT(*) as count FROM invoices GROUP BY user_id;
SELECT 'sales user_id' as info, user_id, COUNT(*) as count FROM sales GROUP BY user_id;
