-- Create all missing RPC functions for branch management system
-- These functions are called by branchDataService.ts but don't exist in the database

-- 1. get_branch_daily_metrics function
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
    created_at TIMESTAMP WITH TIME ZONE
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
        bdm.total_sales,
        bdm.total_transactions,
        bdm.total_customers,
        bdm.average_transaction_value,
        bdm.created_at
    FROM branch_daily_metrics bdm
    WHERE bdm.branch_id = branch_id_param
    AND bdm.metric_date BETWEEN start_date_param AND end_date_param
    ORDER BY bdm.metric_date DESC;
END;
$$;

-- 2. get_branch_hourly_metrics function
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
    created_at TIMESTAMP WITH TIME ZONE
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
        bhm.hour,
        bhm.sales,
        bhm.transactions,
        bhm.customers,
        bhm.created_at
    FROM branch_hourly_metrics bhm
    WHERE bhm.branch_id = branch_id_param
    AND bhm.metric_date = date_param
    ORDER BY bhm.hour ASC;
END;
$$;

-- 3. get_branch_product_performance function
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
    created_at TIMESTAMP WITH TIME ZONE
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
        bpp.product_name,
        bpp.brand_name,
        bpp.total_sold,
        bpp.total_revenue,
        bpp.average_price,
        bpp.performance_date,
        bpp.created_at
    FROM branch_product_performance bpp
    WHERE bpp.branch_id = branch_id_param
    AND bpp.performance_date BETWEEN start_date_param AND end_date_param
    ORDER BY bpp.total_revenue DESC;
END;
$$;

-- 4. get_branch_staff_performance function
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
    created_at TIMESTAMP WITH TIME ZONE
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
        bsp.staff_name,
        bsp.role,
        bsp.total_sales,
        bsp.total_transactions,
        bsp.hours_worked,
        bsp.performance_date,
        bsp.created_at
    FROM branch_staff_performance bsp
    WHERE bsp.branch_id = branch_id_param
    AND bsp.performance_date BETWEEN start_date_param AND end_date_param
    ORDER BY bsp.total_sales DESC;
END;
$$;

-- 5. create_branch_sale function
CREATE OR REPLACE FUNCTION create_branch_sale(
    branch_id_param UUID,
    customer_name_param TEXT,
    customer_phone_param TEXT,
    customer_email_param TEXT,
    payment_method_param TEXT,
    cashier_id_param UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sale_id UUID;
BEGIN
    INSERT INTO branch_sales (
        branch_id,
        customer_name,
        customer_phone,
        customer_email,
        payment_method,
        cashier_id,
        sale_status,
        created_at
    ) VALUES (
        branch_id_param,
        customer_name_param,
        customer_phone_param,
        customer_email_param,
        payment_method_param,
        cashier_id_param,
        'pending',
        NOW()
    ) RETURNING id INTO sale_id;
    
    RETURN sale_id;
END;
$$;

-- 6. add_sale_item function
CREATE OR REPLACE FUNCTION add_sale_item(
    sale_id_param UUID,
    product_id_param UUID,
    quantity_param INTEGER,
    unit_price_param DECIMAL(10,2)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item_id UUID;
BEGIN
    INSERT INTO branch_sale_items (
        sale_id,
        product_id,
        quantity,
        unit_price,
        total_price,
        created_at
    ) VALUES (
        sale_id_param,
        product_id_param,
        quantity_param,
        unit_price_param,
        quantity_param * unit_price_param,
        NOW()
    ) RETURNING id INTO item_id;
    
    RETURN item_id;
END;
$$;

-- 7. complete_branch_sale function
CREATE OR REPLACE FUNCTION complete_branch_sale(
    sale_id_param UUID,
    total_amount_param DECIMAL(10,2),
    tax_amount_param DECIMAL(10,2),
    discount_amount_param DECIMAL(10,2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE branch_sales 
    SET 
        total_amount = total_amount_param,
        tax_amount = tax_amount_param,
        discount_amount = discount_amount_param,
        sale_status = 'completed',
        completed_at = NOW()
    WHERE id = sale_id_param;
    
    RETURN TRUE;
END;
$$;

-- 8. update_branch_inventory function
CREATE OR REPLACE FUNCTION update_branch_inventory(
    branch_id_param UUID,
    product_id_param UUID,
    movement_type_param TEXT,
    quantity_param INTEGER,
    reason_param TEXT,
    reference_number_param TEXT,
    created_by_param UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    movement_id UUID;
    current_stock INTEGER;
BEGIN
    -- Get current stock
    SELECT current_stock INTO current_stock
    FROM branch_inventory
    WHERE branch_id = branch_id_param AND product_id = product_id_param;
    
    -- Update stock based on movement type
    IF movement_type_param = 'in' THEN
        UPDATE branch_inventory 
        SET current_stock = current_stock + quantity_param,
            last_restocked = NOW()
        WHERE branch_id = branch_id_param AND product_id = product_id_param;
    ELSIF movement_type_param = 'out' THEN
        UPDATE branch_inventory 
        SET current_stock = GREATEST(0, current_stock - quantity_param)
        WHERE branch_id = branch_id_param AND product_id = product_id_param;
    END IF;
    
    -- Record the movement
    INSERT INTO branch_inventory_movements (
        branch_id,
        product_id,
        movement_type,
        quantity,
        reason,
        reference_number,
        created_by,
        created_at
    ) VALUES (
        branch_id_param,
        product_id_param,
        movement_type_param,
        quantity_param,
        reason_param,
        reference_number_param,
        created_by_param,
        NOW()
    ) RETURNING id INTO movement_id;
    
    RETURN movement_id;
END;
$$;

-- 9. record_staff_attendance function
CREATE OR REPLACE FUNCTION record_staff_attendance(
    branch_id_param UUID,
    staff_id_param UUID,
    attendance_type_param TEXT,
    notes_param TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    attendance_id UUID;
BEGIN
    INSERT INTO branch_staff_attendance (
        branch_id,
        staff_id,
        attendance_type,
        notes,
        attendance_date,
        created_at
    ) VALUES (
        branch_id_param,
        staff_id_param,
        attendance_type_param,
        notes_param,
        CURRENT_DATE,
        NOW()
    ) RETURNING id INTO attendance_id;
    
    RETURN attendance_id;
END;
$$;

-- 10. generate_branch_ai_insights function
CREATE OR REPLACE FUNCTION generate_branch_ai_insights(
    branch_id_param UUID,
    insight_type_param TEXT,
    data_param JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    insight_id UUID;
BEGIN
    INSERT INTO branch_ai_insights (
        branch_id,
        insight_type,
        insight_data,
        confidence_score,
        created_at
    ) VALUES (
        branch_id_param,
        insight_type_param,
        data_param,
        0.85, -- Default confidence score
        NOW()
    ) RETURNING id INTO insight_id;
    
    RETURN insight_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_branch_daily_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_hourly_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_product_performance TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_staff_performance TO authenticated;
GRANT EXECUTE ON FUNCTION create_branch_sale TO authenticated;
GRANT EXECUTE ON FUNCTION add_sale_item TO authenticated;
GRANT EXECUTE ON FUNCTION complete_branch_sale TO authenticated;
GRANT EXECUTE ON FUNCTION update_branch_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION record_staff_attendance TO authenticated;
GRANT EXECUTE ON FUNCTION generate_branch_ai_insights TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Test query
SELECT 'All branch RPC functions created successfully' as status;
