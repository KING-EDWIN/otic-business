-- Final data insertion - this WILL work
-- Run this in your Supabase SQL Editor

-- First, let's see what we have
SELECT 'BEFORE INSERTION:' as info;
SELECT 'expenses' as table, COUNT(*) as count FROM expenses;
SELECT 'invoices' as table, COUNT(*) as count FROM invoices;

-- Insert expense directly
INSERT INTO expenses (id, user_id, paid_at, amount, description, payment_method)
VALUES (
  'expense-001',
  '00000000-0000-0000-0000-000000000001',
  '2025-09-01',
  100000,
  'Office Supplies',
  'cash'
)
ON CONFLICT (id) DO NOTHING;

-- Insert invoice directly
INSERT INTO invoices (id, invoice_number, user_id, issue_date, due_date, status, subtotal, tax, total)
VALUES (
  'invoice-001',
  'INV-001',
  '00000000-0000-0000-0000-000000000001',
  '2025-09-01',
  '2025-10-01',
  'paid',
  500000,
  90000,
  590000
)
ON CONFLICT (id) DO NOTHING;

-- Check results
SELECT 'AFTER INSERTION:' as info;
SELECT 'expenses' as table, COUNT(*) as count FROM expenses;
SELECT 'invoices' as table, COUNT(*) as count FROM invoices;

-- Show the actual data
SELECT 'EXPENSES:' as info, id, amount, description FROM expenses;
SELECT 'INVOICES:' as info, id, invoice_number, total FROM invoices;
