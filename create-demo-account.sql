-- Create demo account for demonstration purposes
-- This creates a real user account that can be used for demos

-- First, create the auth user (this needs to be done through Supabase Auth UI or API)
-- For now, we'll create the profile and subscription records

-- Demo user profile
INSERT INTO user_profiles (
  id,
  email,
  tier,
  business_name,
  phone,
  address,
  created_at
) VALUES (
  'demo-user-12345',
  'demo@oticbusiness.com',
  'free_trial',
  'Demo Business Store',
  '+256 700 000 000',
  'Kampala, Uganda',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  tier = EXCLUDED.tier,
  business_name = EXCLUDED.business_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address;

-- Demo subscription (14-day free trial)
INSERT INTO subscriptions (
  id,
  user_id,
  tier,
  status,
  expires_at,
  created_at
) VALUES (
  'demo-sub-12345',
  'demo-user-12345',
  'free_trial',
  'trial',
  (NOW() + INTERVAL '14 days')::timestamp,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  tier = EXCLUDED.tier,
  status = EXCLUDED.status,
  expires_at = EXCLUDED.expires_at;

-- Demo categories
INSERT INTO categories (id, name, user_id, created_at) VALUES
('demo-cat-1', 'Electronics', 'demo-user-12345', NOW()),
('demo-cat-2', 'Clothing', 'demo-user-12345', NOW()),
('demo-cat-3', 'Food & Beverages', 'demo-user-12345', NOW()),
('demo-cat-4', 'Home & Garden', 'demo-user-12345', NOW())
ON CONFLICT (id) DO NOTHING;

-- Demo suppliers
INSERT INTO suppliers (id, name, contact_person, phone, email, address, user_id, created_at) VALUES
('demo-sup-1', 'Tech Suppliers Ltd', 'John Doe', '+256 700 111 111', 'john@techsuppliers.com', 'Kampala, Uganda', 'demo-user-12345', NOW()),
('demo-sup-2', 'Fashion Wholesale', 'Jane Smith', '+256 700 222 222', 'jane@fashionwholesale.com', 'Kampala, Uganda', 'demo-user-12345', NOW()),
('demo-sup-3', 'Food Distributors', 'Mike Johnson', '+256 700 333 333', 'mike@fooddistributors.com', 'Kampala, Uganda', 'demo-user-12345', NOW())
ON CONFLICT (id) DO NOTHING;

-- Demo products
INSERT INTO products (id, name, barcode, price, cost, stock, category_id, supplier_id, user_id, created_at) VALUES
('demo-prod-1', 'Samsung Galaxy A54', '1234567890123', 1200000, 1000000, 15, 'demo-cat-1', 'demo-sup-1', 'demo-user-12345', NOW()),
('demo-prod-2', 'iPhone 14', '1234567890124', 3500000, 3000000, 8, 'demo-cat-1', 'demo-sup-1', 'demo-user-12345', NOW()),
('demo-prod-3', 'Men\'s T-Shirt', '1234567890125', 25000, 15000, 50, 'demo-cat-2', 'demo-sup-2', 'demo-user-12345', NOW()),
('demo-prod-4', 'Women\'s Dress', '1234567890126', 45000, 30000, 30, 'demo-cat-2', 'demo-sup-2', 'demo-user-12345', NOW()),
('demo-prod-5', 'Coca Cola 500ml', '1234567890127', 3000, 2000, 100, 'demo-cat-3', 'demo-sup-3', 'demo-user-12345', NOW()),
('demo-prod-6', 'Bread Loaf', '1234567890128', 2000, 1200, 25, 'demo-cat-3', 'demo-sup-3', 'demo-user-12345', NOW()),
('demo-prod-7', 'Garden Hose', '1234567890129', 35000, 25000, 12, 'demo-cat-4', 'demo-sup-1', 'demo-user-12345', NOW()),
('demo-prod-8', 'Plant Pot', '1234567890130', 15000, 10000, 20, 'demo-cat-4', 'demo-sup-1', 'demo-user-12345', NOW())
ON CONFLICT (id) DO NOTHING;

-- Demo sales
INSERT INTO sales (id, user_id, total, payment_method, receipt_number, created_at) VALUES
('demo-sale-1', 'demo-user-12345', 1250000, 'mobile_money', 'RCP-001', NOW() - INTERVAL '2 days'),
('demo-sale-2', 'demo-user-12345', 70000, 'cash', 'RCP-002', NOW() - INTERVAL '1 day'),
('demo-sale-3', 'demo-user-12345', 5000, 'cash', 'RCP-003', NOW() - INTERVAL '6 hours'),
('demo-sale-4', 'demo-user-12345', 50000, 'card', 'RCP-004', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Demo sale items
INSERT INTO sale_items (id, sale_id, product_id, quantity, price) VALUES
('demo-item-1', 'demo-sale-1', 'demo-prod-1', 1, 1200000),
('demo-item-2', 'demo-sale-1', 'demo-prod-3', 2, 25000),
('demo-item-3', 'demo-sale-2', 'demo-prod-4', 1, 45000),
('demo-item-4', 'demo-sale-2', 'demo-prod-3', 1, 25000),
('demo-item-5', 'demo-sale-3', 'demo-prod-5', 1, 3000),
('demo-item-6', 'demo-sale-3', 'demo-prod-6', 1, 2000),
('demo-item-7', 'demo-sale-4', 'demo-prod-7', 1, 35000),
('demo-item-8', 'demo-sale-4', 'demo-prod-8', 1, 15000)
ON CONFLICT (id) DO NOTHING;

-- Demo analytics data
INSERT INTO analytics_data (id, user_id, metric_name, metric_value, date, created_at) VALUES
('demo-analytics-1', 'demo-user-12345', 'daily_sales', 1305000, CURRENT_DATE, NOW()),
('demo-analytics-2', 'demo-user-12345', 'daily_sales', 70000, CURRENT_DATE - INTERVAL '1 day', NOW()),
('demo-analytics-3', 'demo-user-12345', 'daily_sales', 5000, CURRENT_DATE - INTERVAL '2 days', NOW()),
('demo-analytics-4', 'demo-user-12345', 'total_products', 8, CURRENT_DATE, NOW()),
('demo-analytics-5', 'demo-user-12345', 'low_stock_items', 2, CURRENT_DATE, NOW()),
('demo-analytics-6', 'demo-user-12345', 'total_revenue', 1375000, CURRENT_DATE, NOW())
ON CONFLICT (id) DO NOTHING;



