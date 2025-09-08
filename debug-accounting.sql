-- Debug Accounting Data
-- Run this in your Supabase SQL Editor to check what data exists

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'invoices', 'expenses', 'accounts', 'expense_categories', 'invoice_items')
ORDER BY table_name;

-- Check if there's any data in these tables
SELECT 'customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'invoices' as table_name, COUNT(*) as count FROM invoices
UNION ALL
SELECT 'expenses' as table_name, COUNT(*) as count FROM expenses
UNION ALL
SELECT 'accounts' as table_name, COUNT(*) as count FROM accounts
UNION ALL
SELECT 'expense_categories' as table_name, COUNT(*) as count FROM expense_categories
UNION ALL
SELECT 'invoice_items' as table_name, COUNT(*) as count FROM invoice_items;

-- Check what user_id is being used
SELECT 'sales user_id' as info, user_id, COUNT(*) as count FROM sales GROUP BY user_id;
SELECT 'user_profiles' as info, id, email FROM user_profiles LIMIT 3;


