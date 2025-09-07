-- Demo Data Setup for Otic Business
-- Run this in your Supabase SQL Editor to populate demo data

-- First, create the demo user profile if it doesn't exist
INSERT INTO user_profiles (id, email, full_name, business_name, business_type, phone, address, subscription_tier, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'demo@oticbusiness.com',
  'Demo Business Store',
  'Demo Business Store',
  'retail',
  '+256 700 000 000',
  'Kampala, Uganda',
  'free_trial',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create demo customers
INSERT INTO customers (id, name, email, phone, address, currency_code, enabled, user_id, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Demo Customer Ltd', 'customer@demo.com', '+256 700 000 000', 'Kampala, Uganda', 'UGX', true, '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'ABC Company', 'abc@company.com', '+256 700 000 001', 'Entebbe, Uganda', 'UGX', true, '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'XYZ Ltd', 'xyz@ltd.com', '+256 700 000 002', 'Jinja, Uganda', 'UGX', true, '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create demo accounts
INSERT INTO accounts (id, name, number, type, enabled, user_id, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440004', 'Cash Account', 'CASH-001', 'asset', true, '550e8400-e29b-41d4-a716-446655440000', NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Bank Account', 'BANK-001', 'asset', true, '550e8400-e29b-41d4-a716-446655440000', NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'Credit Card', 'CC-001', 'liability', true, '550e8400-e29b-41d4-a716-446655440000', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create demo expense categories
INSERT INTO expense_categories (id, name, description, user_id, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440006', 'Office Supplies', 'Stationery, equipment, etc.', 'demo-user-profile-id', NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'Utilities', 'Electricity, water, internet', 'demo-user-profile-id', NOW()),
  ('550e8400-e29b-41d4-a716-446655440008', 'Rent', 'Office rent and related costs', 'demo-user-profile-id', NOW()),
  ('550e8400-e29b-41d4-a716-446655440009', 'Marketing', 'Advertising and promotional costs', 'demo-user-profile-id', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create demo invoices
INSERT INTO invoices (id, invoice_number, customer_id, user_id, issue_date, due_date, status, currency_code, currency_rate, subtotal, discount, tax, total, notes, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440010', 'INV-001', '550e8400-e29b-41d4-a716-446655440000', 'demo-user-profile-id', '2025-09-01', '2025-10-01', 'paid', 'UGX', 1.0, 400000, 0, 72000, 472000, 'Demo invoice 1', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440011', 'INV-002', '550e8400-e29b-41d4-a716-446655440001', 'demo-user-profile-id', '2025-09-02', '2025-10-02', 'paid', 'UGX', 1.0, 600000, 0, 108000, 708000, 'Demo invoice 2', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440012', 'INV-003', '550e8400-e29b-41d4-a716-446655440002', 'demo-user-profile-id', '2025-09-03', '2025-10-03', 'sent', 'UGX', 1.0, 300000, 0, 54000, 354000, 'Demo invoice 3', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440013', 'INV-004', '550e8400-e29b-41d4-a716-446655440000', 'demo-user-profile-id', '2025-09-04', '2025-10-04', 'overdue', 'UGX', 1.0, 250000, 0, 45000, 295000, 'Demo invoice 4', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create demo invoice items
INSERT INTO invoice_items (id, invoice_id, product_id, name, description, quantity, price, total, tax_id, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440010', null, 'Product A', 'Sample product A', 2, 200000, 400000, null, NOW()),
  ('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440011', null, 'Product B', 'Sample product B', 3, 200000, 600000, null, NOW()),
  ('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440012', null, 'Product C', 'Sample product C', 1, 300000, 300000, null, NOW()),
  ('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440013', null, 'Product D', 'Sample product D', 1, 250000, 250000, null, NOW())
ON CONFLICT (id) DO NOTHING;

-- Create demo expenses
INSERT INTO expenses (id, user_id, account_id, paid_at, amount, currency_code, currency_rate, description, category_id, reference, payment_method, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440018', 'demo-user-profile-id', '550e8400-e29b-41d4-a716-446655440003', '2025-09-01', 85000, 'UGX', 1.0, 'Office Supplies', '550e8400-e29b-41d4-a716-446655440006', 'EXP-001', 'cash', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440019', 'demo-user-profile-id', '550e8400-e29b-41d4-a716-446655440004', '2025-09-02', 150000, 'UGX', 1.0, 'Electricity Bill', '550e8400-e29b-41d4-a716-446655440007', 'EXP-002', 'bank_transfer', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440020', 'demo-user-profile-id', '550e8400-e29b-41d4-a716-446655440004', '2025-09-03', 500000, 'UGX', 1.0, 'Office Rent', '550e8400-e29b-41d4-a716-446655440008', 'EXP-003', 'bank_transfer', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440021', 'demo-user-profile-id', '550e8400-e29b-41d4-a716-446655440005', '2025-09-04', 200000, 'UGX', 1.0, 'Marketing Campaign', '550e8400-e29b-41d4-a716-446655440009', 'EXP-004', 'credit_card', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create demo sales data (to match dashboard)
INSERT INTO sales (id, user_id, customer_name, customer_phone, total, tax, discount, payment_method, receipt_number, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440022', 'demo-user-profile-id', 'Walk-in Customer', '+256 700 000 100', 450000, 81000, 0, 'cash', 'RCP-001', '2025-09-07 10:00:00', NOW()),
  ('550e8400-e29b-41d4-a716-446655440023', 'demo-user-profile-id', 'Walk-in Customer', '+256 700 000 101', 320000, 57600, 0, 'mobile_money', 'RCP-002', '2025-09-05 14:30:00', NOW()),
  ('550e8400-e29b-41d4-a716-446655440024', 'demo-user-profile-id', 'Walk-in Customer', '+256 700 000 102', 280000, 50400, 0, 'cash', 'RCP-003', '2025-09-03 16:45:00', NOW()),
  ('550e8400-e29b-41d4-a716-446655440025', 'demo-user-profile-id', 'Walk-in Customer', '+256 700 000 103', 150000, 27000, 0, 'bank_transfer', 'RCP-004', '2025-09-01 09:15:00', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create demo sale items
INSERT INTO sale_items (id, sale_id, product_id, quantity, price, total, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440022', null, 2, 225000, 450000, NOW()),
  ('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440023', null, 1, 320000, 320000, NOW()),
  ('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440024', null, 1, 280000, 280000, NOW()),
  ('550e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440025', null, 1, 150000, 150000, NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT 
  'Customers' as table_name, COUNT(*) as count FROM customers WHERE user_id = 'demo-user-profile-id'
UNION ALL
SELECT 
  'Invoices' as table_name, COUNT(*) as count FROM invoices WHERE user_id = 'demo-user-profile-id'
UNION ALL
SELECT 
  'Expenses' as table_name, COUNT(*) as count FROM expenses WHERE user_id = 'demo-user-profile-id'
UNION ALL
SELECT 
  'Sales' as table_name, COUNT(*) as count FROM sales WHERE user_id = 'demo-user-profile-id'
UNION ALL
SELECT 
  'Accounts' as table_name, COUNT(*) as count FROM accounts WHERE user_id = 'demo-user-profile-id'
UNION ALL
SELECT 
  'Expense Categories' as table_name, COUNT(*) as count FROM expense_categories WHERE user_id = 'demo-user-profile-id';
