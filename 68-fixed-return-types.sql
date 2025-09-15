-- Fix RPC functions with correct return types matching database column types

-- 1. get_inventory_alerts - Fixed return types to match database
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

-- 2. get_system_error_reports - Fixed return types
CREATE OR REPLACE FUNCTION get_system_error_reports(
    p_status text DEFAULT 'active',
    p_limit integer DEFAULT 50
)
RETURNS TABLE (
    log_id uuid,
    error_type text,
    error_message text,
    error_details jsonb,
    status text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_error_logs') THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        id as log_id,
        error_type,
        error_message,
        error_details,
        status,
        created_at
    FROM system_error_logs
    WHERE status = p_status
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$;

-- 3. get_user_business_permissions - Fixed return types
CREATE OR REPLACE FUNCTION get_user_business_permissions(
    user_id_param uuid,
    business_id_param uuid
)
RETURNS TABLE (
    permission_type character varying(50),
    permission_value boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        'read'::character varying(50) as permission_type,
        true as permission_value
    FROM business_memberships
    WHERE user_id = user_id_param 
      AND business_id = business_id_param
      AND status = 'active'
    UNION ALL
    SELECT 
        'write'::character varying(50) as permission_type,
        CASE 
            WHEN role IN ('owner', 'admin', 'manager') THEN true
            ELSE false
        END as permission_value
    FROM business_memberships
    WHERE user_id = user_id_param 
      AND business_id = business_id_param
      AND status = 'active';
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
    test_business_id UUID;
BEGIN
    -- Get test IDs
    SELECT id INTO test_user_id FROM user_profiles LIMIT 1;
    SELECT id INTO test_business_id FROM businesses LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing fixed return types with user: %', test_user_id;
        
        -- Test inventory alerts
        PERFORM get_inventory_alerts(test_user_id);
        RAISE NOTICE 'get_inventory_alerts: OK';
        
        -- Test system error reports
        PERFORM get_system_error_reports('active', 10);
        RAISE NOTICE 'get_system_error_reports: OK';
        
        IF test_business_id IS NOT NULL THEN
            PERFORM get_user_business_permissions(test_user_id, test_business_id);
            RAISE NOTICE 'get_user_business_permissions: OK';
        END IF;
    END IF;
END $$;

SELECT 'Fixed return types applied successfully' as status;

