-- Direct insert accounting data - bypass RLS temporarily
-- Run this in your Supabase SQL Editor

-- First, let's see what user_id we have in sales
SELECT 'Current user_id from sales:' as info, user_id FROM sales LIMIT 1;

-- Insert data directly with the known user_id
INSERT INTO expenses (id, user_id, paid_at, amount, description, payment_method)
VALUES (
  '550e8400-e29b-41d4-a716-446655440100',
  '00000000-0000-0000-0000-000000000001',
  '2025-09-01',
  100000,
  'Test Office Supplies',
  'cash'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, invoice_number, user_id, issue_date, due_date, status, subtotal, tax, total)
VALUES (
  '550e8400-e29b-41d4-a716-446655440101',
  'TEST-001',
  '00000000-0000-0000-0000-000000000001',
  '2025-09-01',
  '2025-10-01',
  'paid',
  500000,
  90000,
  590000
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (id, user_id, name, email, phone, currency_code, enabled)
VALUES (
  '550e8400-e29b-41d4-a716-446655440102',
  '00000000-0000-0000-0000-000000000001',
  'Test Customer Ltd',
  'test@customer.com',
  '+256 700 000 000',
  'UGX',
  true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, user_id, name, number, type, enabled)
VALUES (
  '550e8400-e29b-41d4-a716-446655440103',
  '00000000-0000-0000-0000-000000000001',
  'Cash Account',
  'CASH-001',
  'asset',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Check if data was inserted
SELECT 'expenses' as table_name, COUNT(*) as count FROM expenses;
SELECT 'invoices' as table_name, COUNT(*) as count FROM invoices;
SELECT 'customers' as table_name, COUNT(*) as count FROM customers;
SELECT 'accounts' as table_name, COUNT(*) as count FROM accounts;

