-- Create optimized function for dashboard stats
-- This single function replaces multiple queries for better performance

CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id UUID)
RETURNS TABLE (
  total_sales BIGINT,
  total_products BIGINT,
  total_revenue NUMERIC,
  low_stock_items BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(sales_stats.total_sales, 0) as total_sales,
    COALESCE(products_stats.total_products, 0) as total_products,
    COALESCE(sales_stats.total_revenue, 0) as total_revenue,
    COALESCE(low_stock_stats.low_stock_items, 0) as low_stock_items
  FROM (
    SELECT 
      COUNT(*) as total_sales,
      COALESCE(SUM(total), 0) as total_revenue
    FROM sales 
    WHERE sales.user_id = get_dashboard_stats.user_id
  ) sales_stats
  CROSS JOIN (
    SELECT COUNT(*) as total_products
    FROM products 
    WHERE products.user_id = get_dashboard_stats.user_id
  ) products_stats
  CROSS JOIN (
    SELECT COUNT(*) as low_stock_items
    FROM products 
    WHERE products.user_id = get_dashboard_stats.user_id 
    AND products.stock <= 5
  ) low_stock_stats;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_stats(UUID) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock <= 5;
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

-- Optimize existing indexes
CREATE INDEX IF NOT EXISTS idx_sales_user_id_created_at ON sales(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_products_user_id_stock ON products(user_id, stock);



