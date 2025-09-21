-- Fix variable naming conflicts in RPC functions
-- The issue: PL/pgSQL variable names conflict with table column names

-- 1. update_product_stock - Fixed variable naming conflict
CREATE OR REPLACE FUNCTION update_product_stock(
    product_id_param uuid,
    quantity_change integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_stock_value integer;  -- Renamed variable to avoid conflict
    new_stock integer;
BEGIN
    -- Check if products table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        RETURN FALSE;
    END IF;
    
    -- Get current stock using different variable name
    SELECT current_stock INTO current_stock_value FROM products WHERE id = product_id_param;
    
    IF current_stock_value IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new stock
    new_stock := current_stock_value + quantity_change;
    
    -- Update stock using correct column name
    UPDATE products 
    SET current_stock = new_stock, updated_at = NOW()
    WHERE id = product_id_param;
    
    RETURN TRUE;
END;
$$;

-- 2. get_inventory_alerts - Fixed to use correct column names and avoid conflicts
CREATE OR REPLACE FUNCTION get_inventory_alerts(
    p_user_id uuid
)
RETURNS TABLE (
    product_id uuid,
    product_name character varying(255),
    current_stock integer,
    min_stock integer,
    alert_type character varying(50)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if products table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        p.current_stock as current_stock,
        COALESCE(p.min_stock, 0) as min_stock,
        CASE 
            WHEN p.current_stock <= 0 THEN 'out_of_stock'::character varying(50)
            WHEN p.current_stock <= COALESCE(p.min_stock, 0) THEN 'low_stock'::character varying(50)
            ELSE 'normal'::character varying(50)
        END as alert_type
    FROM products p
    WHERE p.user_id = p_user_id
      AND (p.current_stock <= COALESCE(p.min_stock, 0) OR p.current_stock <= 0)
    ORDER BY p.current_stock ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Test the fixed functions
DO $$
DECLARE
    test_user_id UUID;
    test_product_id UUID;
BEGIN
    -- Get test IDs
    SELECT id INTO test_user_id FROM user_profiles LIMIT 1;
    SELECT id INTO test_product_id FROM products LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing fixed variable naming with user: %', test_user_id;
        
        -- Test inventory alerts
        PERFORM get_inventory_alerts(test_user_id);
        RAISE NOTICE 'get_inventory_alerts: OK';
        
        IF test_product_id IS NOT NULL THEN
            PERFORM update_product_stock(test_product_id, 1);
            RAISE NOTICE 'update_product_stock: OK';
        END IF;
    END IF;
END $$;

SELECT 'Fixed variable naming conflicts applied successfully' as status;



