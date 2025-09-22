-- PERFORMANCE OPTIMIZATION SCRIPT
-- This script optimizes database performance for the inventory system

-- 1. Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_business_status ON products(business_id, status);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_brand_search ON products USING gin(to_tsvector('english', brand));
CREATE INDEX IF NOT EXISTS idx_products_created_at_desc ON products(created_at DESC);

-- 2. Optimize stock movements table
CREATE INDEX IF NOT EXISTS idx_stock_movements_business_product ON stock_movements(business_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type_date ON stock_movements(movement_type, created_at DESC);

-- 3. Optimize business memberships
CREATE INDEX IF NOT EXISTS idx_business_memberships_business_role ON business_memberships(business_id, role);
CREATE INDEX IF NOT EXISTS idx_business_memberships_user_status ON business_memberships(user_id, status);

-- 4. Update table statistics for better query planning
ANALYZE products;
ANALYZE business_memberships;
ANALYZE stock_movements;
ANALYZE businesses;

-- 5. Create optimized view for product listings
CREATE OR REPLACE VIEW product_listing_view AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.sku,
    p.barcode,
    p.barcode_type,
    p.cost_price,
    p.wholesale_price,
    p.retail_price,
    p.current_stock,
    p.min_stock,
    p.max_stock,
    p.category,
    p.brand,
    p.manufacturer,
    p.unit_type,
    p.items_per_package,
    p.package_type,
    p.product_image_url,
    p.barcode_image_url,
    p.status,
    p.created_at,
    p.updated_at,
    p.business_id,
    p.user_id
FROM products p
WHERE p.status = 'active';

-- 6. Create optimized function for product search
CREATE OR REPLACE FUNCTION search_products(
    business_id_param UUID,
    search_term_param TEXT DEFAULT NULL,
    barcode_type_param TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    barcode_type VARCHAR(20),
    cost_price DECIMAL(15,2),
    wholesale_price DECIMAL(15,2),
    retail_price DECIMAL(15,2),
    current_stock INTEGER,
    min_stock INTEGER,
    max_stock INTEGER,
    category VARCHAR(100),
    brand VARCHAR(100),
    manufacturer VARCHAR(100),
    unit_type VARCHAR(50),
    items_per_package INTEGER,
    package_type VARCHAR(50),
    product_image_url TEXT,
    barcode_image_url TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.sku,
        p.barcode,
        p.barcode_type,
        p.cost_price,
        p.wholesale_price,
        p.retail_price,
        p.current_stock,
        p.min_stock,
        p.max_stock,
        p.category,
        p.brand,
        p.manufacturer,
        p.unit_type,
        p.items_per_package,
        p.package_type,
        p.product_image_url,
        p.barcode_image_url,
        p.status,
        p.created_at,
        p.updated_at
    FROM products p
    WHERE p.business_id = business_id_param
    AND p.status = 'active'
    AND (search_term_param IS NULL OR 
         p.name ILIKE '%' || search_term_param || '%' OR
         p.barcode ILIKE '%' || search_term_param || '%' OR
         p.brand ILIKE '%' || search_term_param || '%')
    AND (barcode_type_param IS NULL OR p.barcode_type = barcode_type_param)
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION search_products(UUID, TEXT, TEXT) TO authenticated, anon;

-- 8. Create function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products(business_id_param UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    current_stock INTEGER,
    min_stock INTEGER,
    barcode VARCHAR(100),
    retail_price DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.current_stock,
        p.min_stock,
        p.barcode,
        p.retail_price
    FROM products p
    WHERE p.business_id = business_id_param
    AND p.status = 'active'
    AND p.current_stock <= p.min_stock
    ORDER BY (p.current_stock::float / p.min_stock::float) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant permissions
GRANT EXECUTE ON FUNCTION get_low_stock_products(UUID) TO authenticated, anon;

-- 10. Create function to get product statistics
CREATE OR REPLACE FUNCTION get_product_stats(business_id_param UUID)
RETURNS TABLE (
    total_products BIGINT,
    low_stock_count BIGINT,
    total_value DECIMAL,
    avg_cost_price DECIMAL,
    categories_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE current_stock <= min_stock) as low_stock_count,
        SUM(current_stock * cost_price) as total_value,
        AVG(cost_price) as avg_cost_price,
        COUNT(DISTINCT category) as categories_count
    FROM products
    WHERE business_id = business_id_param
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Grant permissions
GRANT EXECUTE ON FUNCTION get_product_stats(UUID) TO authenticated, anon;

-- 12. Vacuum and analyze tables
VACUUM ANALYZE products;
VACUUM ANALYZE business_memberships;
VACUUM ANALYZE stock_movements;

-- 13. Show optimization results
SELECT 'Performance optimization complete' as status,
       'Indexes created, functions optimized, statistics updated' as details;




