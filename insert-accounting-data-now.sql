-- Insert accounting data RIGHT NOW
-- Run this in your Supabase SQL Editor

-- First, let's check if the tables exist
SELECT 'CHECKING TABLES:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('invoices', 'expenses', 'customers', 'accounts', 'expense_categories');

-- Insert sample invoice
INSERT INTO invoices (id, invoice_number, user_id, issue_date, due_date, status, currency_code, currency_rate, subtotal, discount, tax, total, notes, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440101',
  'INV-001',
  '00000000-0000-0000-0000-000000000001',
  '2025-09-01',
  '2025-10-01',
  'paid',
  'UGX',
  1.0,
  500000,
  0,
  90000,
  590000,
  'Sample invoice for testing',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample expenses
INSERT INTO expenses (id, user_id, paid_at, amount, description, payment_method, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440201', '00000000-0000-0000-0000-000000000001', '2025-09-01', 150000, 'Office Supplies', 'cash', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440202', '00000000-0000-0000-0000-000000000001', '2025-09-02', 300000, 'Rent Payment', 'bank_transfer', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440203', '00000000-0000-0000-0000-000000000001', '2025-09-03', 75000, 'Internet Bill', 'bank_transfer', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Check what we inserted
SELECT 'INVOICES AFTER INSERT:' as info;
SELECT id, invoice_number, user_id, total FROM invoices WHERE user_id = '00000000-0000-0000-0000-000000000001';

SELECT 'EXPENSES AFTER INSERT:' as info;
SELECT id, user_id, amount, description FROM expenses WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Count totals
SELECT 'COUNTS:' as info;
SELECT 'invoices' as table_name, COUNT(*) as count FROM invoices WHERE user_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'expenses' as table_name, COUNT(*) as count FROM expenses WHERE user_id = '00000000-0000-0000-0000-000000000001';

