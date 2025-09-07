-- Fix RLS issue - temporarily disable RLS for accounting tables
-- Run this in your Supabase SQL Editor

-- Disable RLS temporarily for accounting tables
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 'RLS STATUS AFTER DISABLE:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('invoices', 'expenses', 'customers', 'accounts', 'expense_categories');

-- Test data access
SELECT 'INVOICES AFTER RLS DISABLE:' as info;
SELECT id, user_id, invoice_number, total FROM invoices WHERE user_id = '00000000-0000-0000-0000-000000000001';

SELECT 'EXPENSES AFTER RLS DISABLE:' as info;
SELECT id, user_id, amount, description FROM expenses WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Count totals
SELECT 'FINAL COUNTS:' as info;
SELECT 'invoices' as table_name, COUNT(*) as count FROM invoices WHERE user_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'expenses' as table_name, COUNT(*) as count FROM expenses WHERE user_id = '00000000-0000-0000-0000-000000000001';
