-- Fixed RPC functions using correct column names from actual database structure

-- 1. update_product_stock - Fixed to use current_stock instead of stock
CREATE OR REPLACE FUNCTION update_product_stock(
    product_id_param uuid,
    quantity_change integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_stock integer;
    new_stock integer;
BEGIN
    -- Check if products table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        RETURN FALSE;
    END IF;
    
    -- Get current stock using correct column name
    SELECT current_stock INTO current_stock FROM products WHERE id = product_id_param;
    
    IF current_stock IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new stock
    new_stock := current_stock + quantity_change;
    
    -- Update stock using correct column name
    UPDATE products 
    SET current_stock = new_stock, updated_at = NOW()
    WHERE id = product_id_param;
    
    RETURN TRUE;
END;
$$;

-- 2. get_inventory_alerts - Fixed to use current_stock instead of stock
CREATE OR REPLACE FUNCTION get_inventory_alerts(
    p_user_id uuid
)
RETURNS TABLE (
    product_id uuid,
    product_name text,
    current_stock integer,
    min_stock integer,
    alert_type text
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
            WHEN p.current_stock <= 0 THEN 'out_of_stock'
            WHEN p.current_stock <= COALESCE(p.min_stock, 0) THEN 'low_stock'
            ELSE 'normal'
        END as alert_type
    FROM products p
    WHERE p.user_id = p_user_id
      AND (p.current_stock <= COALESCE(p.min_stock, 0) OR p.current_stock <= 0)
    ORDER BY p.current_stock ASC;
END;
$$;

-- 3. get_sales_analytics - Fixed to use correct table structure
CREATE OR REPLACE FUNCTION get_sales_analytics(
    p_user_id uuid,
    p_period text DEFAULT 'month'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Check if sales table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') THEN
        RETURN jsonb_build_object(
            'period', p_period,
            'total_sales', 0,
            'total_orders', 0,
            'average_order_value', 0,
            'top_products', '[]'::jsonb,
            'generated_at', NOW()
        );
    END IF;
    
    SELECT jsonb_build_object(
        'period', p_period,
        'total_sales', COALESCE(SUM(s.total), 0),
        'total_orders', COUNT(s.id),
        'average_order_value', COALESCE(AVG(s.total), 0),
        'top_products', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'product_name', p.name,
                    'quantity_sold', si.total_quantity
                )
            )
            FROM (
                SELECT 
                    si.product_id,
                    SUM(si.quantity) as total_quantity
                FROM sale_items si
                JOIN sales s ON si.sale_id = s.id
                WHERE s.user_id = p_user_id
                GROUP BY si.product_id
                ORDER BY total_quantity DESC
                LIMIT 5
            ) si
            JOIN products p ON si.product_id = p.id
        ), '[]'::jsonb),
        'generated_at', NOW()
    ) INTO result
    FROM sales s
    WHERE s.user_id = p_user_id
      AND CASE 
        WHEN p_period = 'day' THEN s.created_at >= CURRENT_DATE
        WHEN p_period = 'week' THEN s.created_at >= CURRENT_DATE - INTERVAL '7 days'
        WHEN p_period = 'month' THEN s.created_at >= CURRENT_DATE - INTERVAL '30 days'
        WHEN p_period = 'year' THEN s.created_at >= CURRENT_DATE - INTERVAL '365 days'
        ELSE s.created_at >= CURRENT_DATE - INTERVAL '30 days'
      END;
    
    RETURN result;
END;
$$;

-- 4. process_sale - Fixed to use correct table structure
CREATE OR REPLACE FUNCTION process_sale(
    p_user_id uuid,
    p_cart_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sale_id uuid;
    total_amount numeric := 0;
    item jsonb;
BEGIN
    -- Check if sales table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Sales table not found'
        );
    END IF;
    
    -- Create sale record
    INSERT INTO sales (user_id, total, payment_method, receipt_number, created_at)
    VALUES (p_user_id, 0, 'cash', 'RCP-' || extract(epoch from now())::text, NOW())
    RETURNING id INTO sale_id;
    
    -- Process each cart item
    FOR item IN SELECT * FROM jsonb_array_elements(p_cart_items)
    LOOP
        total_amount := total_amount + (item->>'price')::numeric * (item->>'quantity')::integer;
        
        -- Create sale item if sale_items table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sale_items') THEN
            INSERT INTO sale_items (sale_id, product_id, quantity, price, subtotal)
            VALUES (
                sale_id,
                (item->>'product_id')::uuid,
                (item->>'quantity')::integer,
                (item->>'price')::numeric,
                (item->>'price')::numeric * (item->>'quantity')::integer
            );
        END IF;
    END LOOP;
    
    -- Update sale total
    UPDATE sales SET total = total_amount WHERE id = sale_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'sale_id', sale_id,
        'total', total_amount
    );
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
        RAISE NOTICE 'Testing fixed RPC functions with user: %', test_user_id;
        
        -- Test inventory alerts
        PERFORM get_inventory_alerts(test_user_id);
        RAISE NOTICE 'get_inventory_alerts: OK';
        
        -- Test sales analytics
        PERFORM get_sales_analytics(test_user_id, 'month');
        RAISE NOTICE 'get_sales_analytics: OK';
        
        IF test_product_id IS NOT NULL THEN
            PERFORM update_product_stock(test_product_id, 1);
            RAISE NOTICE 'update_product_stock: OK';
        END IF;
    END IF;
END $$;

SELECT 'Fixed RPC functions created successfully' as status;

