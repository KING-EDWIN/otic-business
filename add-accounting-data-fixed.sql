-- Add accounting data with the correct user_id from sales
-- Run this AFTER creating the tables

-- Insert test expense (using the actual user_id from sales)
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

-- Insert test invoice (using the actual user_id from sales)
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

-- Insert test customer (using the actual user_id from sales)
INSERT INTO customers (id, user_id, name, email, phone, currency_code, enabled)
SELECT 
  '550e8400-e29b-41d4-a716-446655440102',
  user_id,
  'Test Customer Ltd',
  'test@customer.com',
  '+256 700 000 000',
  'UGX',
  true
FROM sales 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Insert test account (using the actual user_id from sales)
INSERT INTO accounts (id, user_id, name, number, type, enabled)
SELECT 
  '550e8400-e29b-41d4-a716-446655440103',
  user_id,
  'Cash Account',
  'CASH-001',
  'asset',
  true
FROM sales 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Insert test expense category (using the actual user_id from sales)
INSERT INTO expense_categories (id, user_id, name, description)
SELECT 
  '550e8400-e29b-41d4-a716-446655440104',
  user_id,
  'Office Supplies',
  'Stationery, equipment, etc.'
FROM sales 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Check if data was inserted
SELECT 'expenses' as table_name, COUNT(*) as count FROM expenses;
SELECT 'invoices' as table_name, COUNT(*) as count FROM invoices;
SELECT 'customers' as table_name, COUNT(*) as count FROM customers;
SELECT 'accounts' as table_name, COUNT(*) as count FROM accounts;
SELECT 'expense_categories' as table_name, COUNT(*) as count FROM expense_categories;
