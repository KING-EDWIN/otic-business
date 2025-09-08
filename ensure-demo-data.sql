-- Ensure Demo Data Exists for Deployed App
-- Run this in Supabase SQL Editor to ensure demo data is available

-- First, ensure the demo user profile exists
INSERT INTO user_profiles (
  id, 
  email, 
  business_name, 
  phone, 
  address, 
  tier, 
  created_at, 
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@oticbusiness.com',
  'Demo Business Store',
  '+256 700 000 000',
  'Kampala, Uganda',
  'premium',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  business_name = EXCLUDED.business_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  tier = EXCLUDED.tier,
  updated_at = NOW();

-- Ensure demo subscription exists
INSERT INTO user_subscriptions (
  user_id,
  tier,
  status,
  expires_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'premium',
  'active',
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  tier = EXCLUDED.tier,
  status = EXCLUDED.status,
  expires_at = EXCLUDED.expires_at,
  updated_at = NOW();

-- Check if we have demo data, if not, create some
DO $$
BEGIN
  -- Check if we have any products for demo user
  IF NOT EXISTS (SELECT 1 FROM products WHERE user_id = '00000000-0000-0000-0000-000000000001' LIMIT 1) THEN
    -- Insert demo products
    INSERT INTO products (id, name, barcode, price, cost, stock, min_stock, category_id, user_id, created_at, updated_at) VALUES
    ('demo-prod-001', 'Samsung Galaxy S21', 'SAMSUNG-S21', 2500000.00, 2000000.00, 15, 5, 'electronics', '00000000-0000-0000-0000-000000000001', NOW(), NOW()),
    ('demo-prod-002', 'iPhone 13', 'IPHONE-13', 3000000.00, 2500000.00, 10, 3, 'electronics', '00000000-0000-0000-0000-000000000001', NOW(), NOW()),
    ('demo-prod-003', 'MacBook Pro', 'MACBOOK-PRO', 8000000.00, 7000000.00, 5, 2, 'electronics', '00000000-0000-0000-0000-000000000001', NOW(), NOW()),
    ('demo-prod-004', 'Dell Laptop', 'DELL-LAPTOP', 4000000.00, 3500000.00, 8, 3, 'electronics', '00000000-0000-0000-0000-000000000001', NOW(), NOW()),
    ('demo-prod-005', 'Sony Headphones', 'SONY-HP', 500000.00, 400000.00, 25, 10, 'electronics', '00000000-0000-0000-0000-000000000001', NOW(), NOW());
  END IF;

  -- Check if we have any sales for demo user
  IF NOT EXISTS (SELECT 1 FROM sales WHERE user_id = '00000000-0000-0000-0000-000000000001' LIMIT 1) THEN
    -- Insert demo sales
    INSERT INTO sales (id, user_id, total, payment_method, receipt_number, created_at) VALUES
    ('demo-sale-001', '00000000-0000-0000-0000-000000000001', 2500000.00, 'cash', 'RCP-001', NOW() - INTERVAL '1 day'),
    ('demo-sale-002', '00000000-0000-0000-0000-000000000001', 3000000.00, 'mobile_money', 'RCP-002', NOW() - INTERVAL '2 days'),
    ('demo-sale-003', '00000000-0000-0000-0000-000000000001', 8000000.00, 'card', 'RCP-003', NOW() - INTERVAL '3 days'),
    ('demo-sale-004', '00000000-0000-0000-0000-000000000001', 4000000.00, 'cash', 'RCP-004', NOW() - INTERVAL '4 days'),
    ('demo-sale-005', '00000000-0000-0000-0000-000000000001', 500000.00, 'mobile_money', 'RCP-005', NOW() - INTERVAL '5 days');
  END IF;

  -- Check if we have any expenses for demo user
  IF NOT EXISTS (SELECT 1 FROM expenses WHERE user_id = '00000000-0000-0000-0000-000000000001' LIMIT 1) THEN
    -- Insert demo expenses
    INSERT INTO expenses (id, user_id, amount, description, category, created_at) VALUES
    ('demo-exp-001', '00000000-0000-0000-0000-000000000001', 500000.00, 'Office Rent', 'rent', NOW() - INTERVAL '1 day'),
    ('demo-exp-002', '00000000-0000-0000-0000-000000000001', 200000.00, 'Electricity Bill', 'utilities', NOW() - INTERVAL '2 days'),
    ('demo-exp-003', '00000000-0000-0000-0000-000000000001', 100000.00, 'Internet Bill', 'utilities', NOW() - INTERVAL '3 days'),
    ('demo-exp-004', '00000000-0000-0000-0000-000000000001', 300000.00, 'Staff Salary', 'payroll', NOW() - INTERVAL '4 days'),
    ('demo-exp-005', '00000000-0000-0000-0000-000000000001', 150000.00, 'Marketing', 'marketing', NOW() - INTERVAL '5 days');
  END IF;
END $$;

-- Verify data exists
SELECT 
  'user_profiles' as table_name, 
  COUNT(*) as count 
FROM user_profiles 
WHERE id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
  'products' as table_name, 
  COUNT(*) as count 
FROM products 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
  'sales' as table_name, 
  COUNT(*) as count 
FROM sales 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
  'expenses' as table_name, 
  COUNT(*) as count 
FROM expenses 
WHERE user_id = '00000000-0000-0000-0000-000000000001';


