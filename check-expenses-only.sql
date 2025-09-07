-- Check expenses data specifically
-- Run this in your Supabase SQL Editor

SELECT 'EXPENSES DATA:' as info;
SELECT id, user_id, amount, description FROM expenses LIMIT 5;

-- Count expenses
SELECT 'expenses' as table_name, COUNT(*) as count FROM expenses;
