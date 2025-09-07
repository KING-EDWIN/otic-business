-- Temporarily disable RLS to insert data
-- Run this if the direct insert still fails

-- Disable RLS temporarily
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories DISABLE ROW LEVEL SECURITY;

-- Now try inserting data
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

-- Re-enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Check results
SELECT 'expenses' as table_name, COUNT(*) as count FROM expenses;
SELECT 'invoices' as table_name, COUNT(*) as count FROM invoices;
