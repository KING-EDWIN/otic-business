-- Fix Dashboard Data - Following Original Design Intention
-- The original design: user_profiles IS the business profile for business users
-- Products and sales are linked by user_id (which IS the business ID)

-- 1. Create sample products for the business user
-- The user_id IS the business identifier for business users
INSERT INTO products (
  id,
  name,
  description,
  retail_price,
  wholesale_price,
  cost_price,
  current_stock,
  min_stock,
  barcode,
  category,
  brand,
  unit_type,
  user_id,  -- This IS the business ID for business users
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'Coca Cola 500ml',
  'Refreshing soft drink',
  2500,
  2000,
  1500,
  50,
  10,
  '1234567890123',
  'Beverages',
  'Coca Cola',
  'ml',
  '4144c232-c9a9-41e4-9464-3a035f3d782a', -- user_id IS business_id
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Bread Loaf',
  'Fresh white bread',
  3500,
  3000,
  2000,
  25,
  5,
  '2345678901234',
  'Bakery',
  'Bakery Fresh',
  'kg',
  '4144c232-c9a9-41e4-9464-3a035f3d782a',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Rice 1kg',
  'Premium quality rice',
  8000,
  7000,
  5000,
  30,
  8,
  '3456789012345',
  'Grains',
  'Premium Rice',
  'kg',
  '4144c232-c9a9-41e4-9464-3a035f3d782a',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Cooking Oil 1L',
  'Vegetable cooking oil',
  12000,
  10000,
  8000,
  15,
  5,
  '4567890123456',
  'Cooking',
  'Golden Oil',
  'ml',
  '4144c232-c9a9-41e4-9464-3a035f3d782a',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Sugar 1kg',
  'White granulated sugar',
  6000,
  5000,
  3500,
  20,
  5,
  '5678901234567',
  'Sweeteners',
  'Sweet Sugar',
  'kg',
  '4144c232-c9a9-41e4-9464-3a035f3d782a',
  NOW(),
  NOW()
);

-- 2. Create sample sales
-- Using actual sales table structure: id, user_id, total, payment_method, receipt_number, created_at
INSERT INTO sales (
  id,
  user_id,  -- This IS the business ID for business users
  total,
  payment_method,
  receipt_number,
  created_at
) VALUES 
(
  gen_random_uuid(),
  '4144c232-c9a9-41e4-9464-3a035f3d782a',
  7080,
  'cash',
  'RCP-001',
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  '4144c232-c9a9-41e4-9464-3a035f3d782a',
  13570,
  'mobile_money',
  'RCP-002',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  '4144c232-c9a9-41e4-9464-3a035f3d782a',
  20060,
  'card',
  'RCP-003',
  NOW() - INTERVAL '3 days'
);

-- 3. Create sample sale items
-- Using actual sale_items table structure: id, sale_id, product_id, quantity, price, created_at
INSERT INTO sale_items (
  id,
  sale_id,
  product_id,
  quantity,
  price,
  created_at
) 
SELECT 
  gen_random_uuid(),
  s.id,
  p.id,
  CASE 
    WHEN p.name LIKE '%Coca Cola%' THEN 2
    WHEN p.name LIKE '%Bread%' THEN 1
    WHEN p.name LIKE '%Rice%' THEN 1
    WHEN p.name LIKE '%Oil%' THEN 1
    WHEN p.name LIKE '%Sugar%' THEN 1
    ELSE 1
  END,
  p.retail_price,
  NOW() - INTERVAL '1 day'
FROM sales s
CROSS JOIN products p
WHERE s.user_id = '4144c232-c9a9-41e4-9464-3a035f3d782a'
LIMIT 5;

-- 4. Verify the data follows the original design
SELECT 'Data created following original design!' as status;

-- Show summary
SELECT 
  'Products' as table_name,
  COUNT(*) as count
FROM products 
WHERE user_id = '4144c232-c9a9-41e4-9464-3a035f3d782a'

UNION ALL

SELECT 
  'Sales' as table_name,
  COUNT(*) as count
FROM sales 
WHERE user_id = '4144c232-c9a9-41e4-9464-3a035f3d782a'

UNION ALL

SELECT 
  'Sale Items' as table_name,
  COUNT(*) as count
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
WHERE s.user_id = '4144c232-c9a9-41e4-9464-3a035f3d782a';
