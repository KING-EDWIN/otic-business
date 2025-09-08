-- Verify all accounting data was inserted
-- Run this in your Supabase SQL Editor

-- Check counts for all tables
SELECT 'expenses' as table_name, COUNT(*) as count FROM expenses
UNION ALL
SELECT 'invoices' as table_name, COUNT(*) as count FROM invoices
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'accounts' as table_name, COUNT(*) as count FROM accounts
UNION ALL
SELECT 'expense_categories' as table_name, COUNT(*) as count FROM expense_categories;

-- Check the actual data in each table
SELECT 'EXPENSES DATA:' as info;
SELECT id, user_id, amount, description FROM expenses;

SELECT 'INVOICES DATA:' as info;
SELECT id, invoice_number, user_id, total FROM invoices;

SELECT 'CUSTOMERS DATA:' as info;
SELECT id, name, user_id FROM customers;

SELECT 'ACCOUNTS DATA:' as info;
SELECT id, name, user_id FROM accounts;

