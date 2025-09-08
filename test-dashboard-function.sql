-- Test the get_dashboard_stats function specifically
-- Run this in Supabase SQL Editor

-- 1. Test the function call directly
SELECT get_dashboard_stats('00000000-0000-0000-0000-000000000001'::UUID) as dashboard_data;

-- 2. If that works, let's also test the fallback query that the frontend uses
SELECT 
  COUNT(*) as total_sales,
  COALESCE(SUM(total), 0) as total_revenue,
  (SELECT COUNT(*) FROM products WHERE user_id = '00000000-0000-0000-0000-000000000001') as total_products,
  (SELECT COUNT(*) FROM products WHERE user_id = '00000000-0000-0000-0000-000000000001' AND stock <= min_stock) as low_stock_items
FROM sales 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

