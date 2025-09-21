-- Complete fix for all branch management functions
-- Run this script in Supabase SQL Editor

-- First, let's check what tables exist and their structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name LIKE 'branch_%'
ORDER BY table_name, ordinal_position;

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS get_branch_daily_metrics(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS get_branch_hourly_metrics(UUID, DATE);
DROP FUNCTION IF EXISTS get_branch_product_performance(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS get_branch_staff_performance(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS generate_branch_ai_insights(UUID);
DROP FUNCTION IF EXISTS get_branch_inventory(UUID);
DROP FUNCTION IF EXISTS get_inventory_movements(UUID);

-- Fix branch_hourly_metrics table schema
DO $$
BEGIN
    -- Add hour column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'branch_hourly_metrics' 
        AND column_name = 'hour'
    ) THEN
        ALTER TABLE branch_hourly_metrics ADD COLUMN hour INTEGER;
    END IF;
    
    -- Add sales column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'branch_hourly_metrics' 
        AND column_name = 'sales'
    ) THEN
        ALTER TABLE branch_hourly_metrics ADD COLUMN sales DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add transactions column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'branch_hourly_metrics' 
        AND column_name = 'transactions'
    ) THEN
        ALTER TABLE branch_hourly_metrics ADD COLUMN transactions INTEGER DEFAULT 0;
    END IF;
    
    -- Add customers column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'branch_hourly_metrics' 
        AND column_name = 'customers'
    ) THEN
        ALTER TABLE branch_hourly_metrics ADD COLUMN customers INTEGER DEFAULT 0;
    END IF;
END $$;

-- 1. Fix get_branch_daily_metrics function
CREATE OR REPLACE FUNCTION get_branch_daily_metrics(
    branch_id_param UUID,
    start_date_param DATE,
    end_date_param DATE
)
RETURNS TABLE (
    id UUID,
    branch_id UUID,
    metric_date DATE,
    total_sales DECIMAL(10,2),
    total_transactions INTEGER,
    total_customers INTEGER,
    average_transaction_value DECIMAL(10,2),
    created_at TIMESTAMP WITHOUT TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bdm.id,
        bdm.branch_id,
        bdm.metric_date,
        COALESCE(bdm.total_sales, 0) as total_sales,
        COALESCE(bdm.total_transactions, 0) as total_transactions,
        COALESCE(bdm.total_customers, 0) as total_customers,
        COALESCE(bdm.average_transaction_value, 0) as average_transaction_value,
        bdm.created_at
    FROM branch_daily_metrics bdm
    WHERE bdm.branch_id = branch_id_param
    AND bdm.metric_date BETWEEN start_date_param AND end_date_param
    ORDER BY bdm.metric_date DESC;
END;
$$;

-- 2. Fix get_branch_hourly_metrics function
CREATE OR REPLACE FUNCTION get_branch_hourly_metrics(
    branch_id_param UUID,
    date_param DATE
)
RETURNS TABLE (
    id UUID,
    branch_id UUID,
    metric_date DATE,
    hour INTEGER,
    sales DECIMAL(10,2),
    transactions INTEGER,
    customers INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bhm.id,
        bhm.branch_id,
        bhm.metric_date,
        COALESCE(bhm.hour, 0) as hour,
        COALESCE(bhm.sales, 0) as sales,
        COALESCE(bhm.transactions, 0) as transactions,
        COALESCE(bhm.customers, 0) as customers,
        bhm.created_at
    FROM branch_hourly_metrics bhm
    WHERE bhm.branch_id = branch_id_param
    AND bhm.metric_date = date_param
    ORDER BY bhm.hour ASC;
END;
$$;

-- 3. Fix get_branch_product_performance function
CREATE OR REPLACE FUNCTION get_branch_product_performance(
    branch_id_param UUID,
    start_date_param DATE,
    end_date_param DATE
)
RETURNS TABLE (
    id UUID,
    branch_id UUID,
    product_id UUID,
    product_name TEXT,
    brand_name TEXT,
    total_sold INTEGER,
    total_revenue DECIMAL(10,2),
    average_price DECIMAL(10,2),
    performance_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bpp.id,
        bpp.branch_id,
        bpp.product_id,
        COALESCE(bpp.product_name, 'Unknown Product') as product_name,
        COALESCE(bpp.brand_name, 'Unknown Brand') as brand_name,
        COALESCE(bpp.total_sold, 0) as total_sold,
        COALESCE(bpp.total_revenue, 0) as total_revenue,
        COALESCE(bpp.average_price, 0) as average_price,
        bpp.performance_date,
        bpp.created_at
    FROM branch_product_performance bpp
    WHERE bpp.branch_id = branch_id_param
    AND bpp.performance_date BETWEEN start_date_param AND end_date_param
    ORDER BY bpp.total_revenue DESC;
END;
$$;

-- 4. Fix get_branch_staff_performance function
CREATE OR REPLACE FUNCTION get_branch_staff_performance(
    branch_id_param UUID,
    start_date_param DATE,
    end_date_param DATE
)
RETURNS TABLE (
    id UUID,
    branch_id UUID,
    staff_id UUID,
    staff_name TEXT,
    role TEXT,
    total_sales DECIMAL(10,2),
    total_transactions INTEGER,
    hours_worked DECIMAL(5,2),
    performance_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bsp.id,
        bsp.branch_id,
        bsp.staff_id,
        COALESCE(bsp.staff_name, 'Unknown Staff') as staff_name,
        COALESCE(bsp.role, 'Unknown Role') as role,
        COALESCE(bsp.total_sales, 0) as total_sales,
        COALESCE(bsp.total_transactions, 0) as total_transactions,
        COALESCE(bsp.hours_worked, 0) as hours_worked,
        bsp.performance_date,
        bsp.created_at
    FROM branch_staff_performance bsp
    WHERE bsp.branch_id = branch_id_param
    AND bsp.performance_date BETWEEN start_date_param AND end_date_param
    ORDER BY bsp.total_sales DESC;
END;
$$;

-- 5. Fix generate_branch_ai_insights function (single parameter version)
CREATE OR REPLACE FUNCTION generate_branch_ai_insights(
    branch_id_param UUID
)
RETURNS TABLE (
    id UUID,
    branch_id UUID,
    insight_type TEXT,
    insight_data JSONB,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITHOUT TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bai.id,
        bai.branch_id,
        COALESCE(bai.insight_type, 'general') as insight_type,
        COALESCE(bai.insight_data, '{}'::jsonb) as insight_data,
        COALESCE(bai.confidence_score, 0.85) as confidence_score,
        bai.created_at
    FROM branch_ai_insights bai
    WHERE bai.branch_id = branch_id_param
    ORDER BY bai.created_at DESC
    LIMIT 10;
END;
$$;

-- 6. Create get_branch_inventory function
CREATE OR REPLACE FUNCTION get_branch_inventory(
    branch_id_param UUID
)
RETURNS TABLE (
    id UUID,
    branch_id UUID,
    product_id UUID,
    current_stock INTEGER,
    minimum_stock INTEGER,
    maximum_stock INTEGER,
    selling_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    last_restocked TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bi.id,
        bi.branch_id,
        bi.product_id,
        COALESCE(bi.current_stock, 0) as current_stock,
        COALESCE(bi.minimum_stock, 0) as minimum_stock,
        COALESCE(bi.maximum_stock, 0) as maximum_stock,
        COALESCE(bi.selling_price, 0) as selling_price,
        COALESCE(bi.cost_price, 0) as cost_price,
        bi.last_restocked,
        bi.created_at
    FROM branch_inventory bi
    WHERE bi.branch_id = branch_id_param
    ORDER BY bi.created_at DESC;
END;
$$;

-- 7. Create get_inventory_movements function
CREATE OR REPLACE FUNCTION get_inventory_movements(
    branch_id_param UUID
)
RETURNS TABLE (
    id UUID,
    branch_id UUID,
    product_id UUID,
    movement_type TEXT,
    quantity INTEGER,
    reason TEXT,
    reference_number TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    created_by TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bim.id,
        bim.branch_id,
        bim.product_id,
        COALESCE(bim.movement_type, 'unknown') as movement_type,
        COALESCE(bim.quantity, 0) as quantity,
        COALESCE(bim.reason, 'No reason provided') as reason,
        COALESCE(bim.reference_number, 'N/A') as reference_number,
        bim.created_at,
        COALESCE(bim.created_by, 'System') as created_by
    FROM branch_inventory_movements bim
    WHERE bim.branch_id = branch_id_param
    ORDER BY bim.created_at DESC
    LIMIT 100;
END;
$$;

-- Insert sample data for testing
-- Sample daily metrics
INSERT INTO branch_daily_metrics (
    branch_id, 
    metric_date, 
    total_sales, 
    total_transactions, 
    total_customers, 
    average_transaction_value
) 
SELECT 
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6),
    (RANDOM() * 10000 + 1000)::DECIMAL(10,2),
    (RANDOM() * 50 + 10)::INTEGER,
    (RANDOM() * 30 + 5)::INTEGER,
    (RANDOM() * 500 + 100)::DECIMAL(10,2)
WHERE NOT EXISTS (
    SELECT 1 FROM branch_daily_metrics 
    WHERE branch_id = '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID
);

-- Sample hourly metrics
INSERT INTO branch_hourly_metrics (
    branch_id,
    metric_date,
    hour,
    sales,
    transactions,
    customers
)
SELECT 
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    CURRENT_DATE,
    generate_series(8, 20),
    (RANDOM() * 1000 + 100)::DECIMAL(10,2),
    (RANDOM() * 10 + 1)::INTEGER,
    (RANDOM() * 5 + 1)::INTEGER
WHERE NOT EXISTS (
    SELECT 1 FROM branch_hourly_metrics 
    WHERE branch_id = '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID 
    AND metric_date = CURRENT_DATE
);

-- Sample AI insights
INSERT INTO branch_ai_insights (
    branch_id,
    insight_type,
    insight_data,
    confidence_score
)
SELECT 
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    insight_type,
    insight_data,
    confidence_score
FROM (VALUES 
    ('sales_trend', '{"trend": "increasing", "percentage": 15.5, "period": "last_7_days"}'::jsonb, 0.92),
    ('inventory_alert', '{"product": "Coca Cola", "stock_level": "low", "recommendation": "restock"}'::jsonb, 0.88),
    ('customer_behavior', '{"peak_hours": [14, 15, 16], "average_basket": 2500}'::jsonb, 0.85),
    ('staff_performance', '{"top_performer": "John Doe", "efficiency": 95.2}'::jsonb, 0.90)
) AS sample_data(insight_type, insight_data, confidence_score)
WHERE NOT EXISTS (
    SELECT 1 FROM branch_ai_insights 
    WHERE branch_id = '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID
);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_branch_daily_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_hourly_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_product_performance TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_staff_performance TO authenticated;
GRANT EXECUTE ON FUNCTION generate_branch_ai_insights TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION get_inventory_movements TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Test the functions
SELECT 'Testing get_branch_daily_metrics...' as status;
SELECT * FROM get_branch_daily_metrics('066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE);

SELECT 'Testing generate_branch_ai_insights...' as status;
SELECT * FROM generate_branch_ai_insights('066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID);

SELECT 'Testing get_branch_hourly_metrics...' as status;
SELECT * FROM get_branch_hourly_metrics('066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID, CURRENT_DATE);

SELECT 'All functions created and tested successfully!' as status;
