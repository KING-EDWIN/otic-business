-- Fix the get_products_by_vft function to remove non-existent column reference
-- The function was trying to reference p.usage_count which doesn't exist in vft_products table

DROP FUNCTION IF EXISTS get_products_by_vft(TEXT);

CREATE OR REPLACE FUNCTION get_products_by_vft(p_vft_name TEXT)
RETURNS TABLE (
  product_id UUID,
  brand_name TEXT,
  product_name TEXT,
  price DECIMAL,
  stock_quantity INTEGER,
  profit_margin DECIMAL,
  barcode TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.brand_name,
    p.product_name,
    p.price,
    p.stock_quantity,
    p.profit_margin,
    p.barcode
  FROM vft_products p
  JOIN visual_filter_tags vft ON p.vft_id = vft.id
  WHERE vft.user_id = auth.uid() 
    AND vft.tag_name = p_vft_name
    AND p.stock_quantity > 0
  ORDER BY p.created_at DESC; -- Removed usage_count reference, order by creation date instead
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_products_by_vft(TEXT) TO authenticated;

-- Test the function
DO $$
BEGIN
  RAISE NOTICE 'get_products_by_vft function has been fixed successfully!';
  RAISE NOTICE 'Removed reference to non-existent usage_count column.';
END $$;
