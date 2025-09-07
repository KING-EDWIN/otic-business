-- Simple Accounting Data Test
-- Run this in your Supabase SQL Editor

-- First, let's see what user_id we should use
SELECT 'Current user_id from sales:' as info, user_id FROM sales LIMIT 1;

-- Insert a simple expense (using the actual user_id from sales)
INSERT INTO expenses (id, user_id, paid_at, amount, description, payment_method)
SELECT 
  '550e8400-e29b-41d4-a716-446655440100',
  user_id,
  '2025-09-01',
  100000,
  'Test Office Supplies',
  'cash'
FROM sales 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Insert a simple invoice (using the actual user_id from sales)
INSERT INTO invoices (id, invoice_number, user_id, issue_date, due_date, status, subtotal, tax, total)
SELECT 
  '550e8400-e29b-41d4-a716-446655440101',
  'TEST-001',
  user_id,
  '2025-09-01',
  '2025-10-01',
  'paid',
  500000,
  90000,
  590000
FROM sales 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Check if data was inserted
SELECT 'Expenses count:' as info, COUNT(*) as count FROM expenses;
SELECT 'Invoices count:' as info, COUNT(*) as count FROM invoices;
