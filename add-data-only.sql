-- Add Sample Accounting Data Only
-- Run this in your Supabase SQL Editor AFTER creating the tables

-- First, get the actual user_id from your existing data
WITH user_data AS (
  SELECT user_id FROM sales LIMIT 1
),
user_profile AS (
  SELECT id FROM user_profiles LIMIT 1
)

-- Insert customers
INSERT INTO customers (id, name, email, phone, address, currency_code, enabled, user_id, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440001',
  'ABC Company Ltd',
  'abc@company.com',
  '+256 700 000 001',
  'Kampala, Uganda',
  'UGX',
  true,
  COALESCE(ud.user_id, up.id),
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (id, name, email, phone, address, currency_code, enabled, user_id, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440002',
  'XYZ Trading Co',
  'xyz@trading.com',
  '+256 700 000 002',
  'Entebbe, Uganda',
  'UGX',
  true,
  COALESCE(ud.user_id, up.id),
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (id, name, email, phone, address, currency_code, enabled, user_id, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440003',
  'Demo Customer',
  'demo@customer.com',
  '+256 700 000 003',
  'Jinja, Uganda',
  'UGX',
  true,
  COALESCE(ud.user_id, up.id),
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

-- Insert accounts
INSERT INTO accounts (id, name, number, type, enabled, user_id, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440004',
  'Cash Account',
  'CASH-001',
  'asset',
  true,
  COALESCE(ud.user_id, up.id),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, name, number, type, enabled, user_id, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440005',
  'Bank Account',
  'BANK-001',
  'asset',
  true,
  COALESCE(ud.user_id, up.id),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, name, number, type, enabled, user_id, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440006',
  'Credit Card',
  'CC-001',
  'liability',
  true,
  COALESCE(ud.user_id, up.id),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

-- Insert expense categories
INSERT INTO expense_categories (id, name, description, user_id, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440007',
  'Office Supplies',
  'Stationery, equipment, etc.',
  COALESCE(ud.user_id, up.id),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_categories (id, name, description, user_id, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440008',
  'Utilities',
  'Electricity, water, internet',
  COALESCE(ud.user_id, up.id),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_categories (id, name, description, user_id, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440009',
  'Rent',
  'Office rent and related costs',
  COALESCE(ud.user_id, up.id),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_categories (id, name, description, user_id, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440010',
  'Marketing',
  'Advertising and promotional costs',
  COALESCE(ud.user_id, up.id),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

-- Insert expenses
INSERT INTO expenses (id, user_id, account_id, paid_at, amount, currency_code, currency_rate, description, category_id, reference, payment_method, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440011',
  COALESCE(ud.user_id, up.id),
  '550e8400-e29b-41d4-a716-446655440004',
  '2025-09-01',
  85000,
  'UGX',
  1.0,
  'Office Supplies',
  '550e8400-e29b-41d4-a716-446655440007',
  'EXP-001',
  'cash',
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO expenses (id, user_id, account_id, paid_at, amount, currency_code, currency_rate, description, category_id, reference, payment_method, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440012',
  COALESCE(ud.user_id, up.id),
  '550e8400-e29b-41d4-a716-446655440005',
  '2025-09-02',
  150000,
  'UGX',
  1.0,
  'Electricity Bill',
  '550e8400-e29b-41d4-a716-446655440008',
  'EXP-002',
  'bank_transfer',
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO expenses (id, user_id, account_id, paid_at, amount, currency_code, currency_rate, description, category_id, reference, payment_method, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440013',
  COALESCE(ud.user_id, up.id),
  '550e8400-e29b-41d4-a716-446655440005',
  '2025-09-03',
  500000,
  'UGX',
  1.0,
  'Office Rent',
  '550e8400-e29b-41d4-a716-446655440009',
  'EXP-003',
  'bank_transfer',
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO expenses (id, user_id, account_id, paid_at, amount, currency_code, currency_rate, description, category_id, reference, payment_method, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440014',
  COALESCE(ud.user_id, up.id),
  '550e8400-e29b-41d4-a716-446655440006',
  '2025-09-04',
  200000,
  'UGX',
  1.0,
  'Marketing Campaign',
  '550e8400-e29b-41d4-a716-446655440010',
  'EXP-004',
  'credit_card',
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO expenses (id, user_id, account_id, paid_at, amount, currency_code, currency_rate, description, category_id, reference, payment_method, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440015',
  COALESCE(ud.user_id, up.id),
  '550e8400-e29b-41d4-a716-446655440004',
  '2025-09-05',
  75000,
  'UGX',
  1.0,
  'Internet Bill',
  '550e8400-e29b-41d4-a716-446655440008',
  'EXP-005',
  'mobile_money',
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

-- Insert invoices
INSERT INTO invoices (id, invoice_number, customer_id, user_id, issue_date, due_date, status, currency_code, currency_rate, subtotal, discount, tax, total, notes, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440016',
  'INV-001',
  '550e8400-e29b-41d4-a716-446655440001',
  COALESCE(ud.user_id, up.id),
  '2025-09-01',
  '2025-10-01',
  'paid',
  'UGX',
  1.0,
  400000,
  0,
  72000,
  472000,
  'Monthly service invoice',
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, invoice_number, customer_id, user_id, issue_date, due_date, status, currency_code, currency_rate, subtotal, discount, tax, total, notes, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440017',
  'INV-002',
  '550e8400-e29b-41d4-a716-446655440002',
  COALESCE(ud.user_id, up.id),
  '2025-09-02',
  '2025-10-02',
  'paid',
  'UGX',
  1.0,
  600000,
  0,
  108000,
  708000,
  'Product delivery invoice',
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, invoice_number, customer_id, user_id, issue_date, due_date, status, currency_code, currency_rate, subtotal, discount, tax, total, notes, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440018',
  'INV-003',
  '550e8400-e29b-41d4-a716-446655440003',
  COALESCE(ud.user_id, up.id),
  '2025-09-03',
  '2025-10-03',
  'sent',
  'UGX',
  1.0,
  300000,
  0,
  54000,
  354000,
  'Consultation services',
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, invoice_number, customer_id, user_id, issue_date, due_date, status, currency_code, currency_rate, subtotal, discount, tax, total, notes, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440019',
  'INV-004',
  '550e8400-e29b-41d4-a716-446655440001',
  COALESCE(ud.user_id, up.id),
  '2025-09-04',
  '2025-10-04',
  'overdue',
  'UGX',
  1.0,
  250000,
  0,
  45000,
  295000,
  'Overdue maintenance invoice',
  NOW(),
  NOW()
FROM user_data ud
FULL OUTER JOIN user_profile up ON true
ON CONFLICT (id) DO NOTHING;

-- Insert invoice items
INSERT INTO invoice_items (id, invoice_id, product_id, name, description, quantity, price, total, tax_id, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440016', null, 'Service Fee', 'Monthly service charge', 1, 400000, 400000, null, NOW()),
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440017', null, 'Product A', 'Sample product delivery', 2, 300000, 600000, null, NOW()),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440018', null, 'Consultation', 'Business consultation', 1, 300000, 300000, null, NOW()),
  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440019', null, 'Maintenance', 'Equipment maintenance', 1, 250000, 250000, null, NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT 
  'Customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 
  'Invoices' as table_name, COUNT(*) as count FROM invoices
UNION ALL
SELECT 
  'Expenses' as table_name, COUNT(*) as count FROM expenses
UNION ALL
SELECT 
  'Accounts' as table_name, COUNT(*) as count FROM accounts
UNION ALL
SELECT 
  'Expense Categories' as table_name, COUNT(*) as count FROM expense_categories
UNION ALL
SELECT 
  'Invoice Items' as table_name, COUNT(*) as count FROM invoice_items;


