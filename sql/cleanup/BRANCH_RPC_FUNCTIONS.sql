-- =====================================================
-- BRANCH MANAGEMENT RPC FUNCTIONS
-- =====================================================
-- This script creates comprehensive RPC functions for branch management
-- including data collection, analytics, and reporting

-- =====================================================
-- 1. BRANCH SALES FUNCTIONS
-- =====================================================

-- Create a new sale
CREATE OR REPLACE FUNCTION create_branch_sale(
    branch_id_param UUID,
    customer_name_param TEXT,
    customer_phone_param TEXT,
    customer_email_param TEXT,
    payment_method_param TEXT,
    cashier_id_param UUID
)
RETURNS TABLE (
    sale_id UUID,
    sale_number TEXT,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    new_sale_id UUID;
    sale_number TEXT;
    current_user_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check if user has permission to create sales for this branch
    IF NOT EXISTS (
        SELECT 1 FROM branch_locations bl
        JOIN business_memberships bm ON bl.business_id = bm.business_id
        WHERE bl.id = branch_id_param 
        AND bm.user_id = current_user_id
    ) THEN
        RETURN QUERY SELECT 
            gen_random_uuid()::UUID,
            ''::TEXT,
            false::BOOLEAN,
            'You do not have permission to create sales for this branch'::TEXT;
        RETURN;
    END IF;
    
    -- Generate sale number
    sale_number := 'SALE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
    
    -- Insert new sale
    INSERT INTO branch_sales (
        branch_id,
        sale_number,
        customer_name,
        customer_phone,
        customer_email,
        payment_method,
        cashier_id,
        created_at
    ) VALUES (
        branch_id_param,
        sale_number,
        customer_name_param,
        customer_phone_param,
        customer_email_param,
        payment_method_param,
        cashier_id_param,
        NOW()
    ) RETURNING id INTO new_sale_id;
    
    -- Return success response
    RETURN QUERY SELECT 
        new_sale_id,
        sale_number,
        true::BOOLEAN,
        'Sale created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add item to sale
CREATE OR REPLACE FUNCTION add_sale_item(
    sale_id_param UUID,
    product_id_param UUID,
    product_name_param TEXT,
    product_sku_param TEXT,
    product_barcode_param TEXT,
    quantity_param INTEGER,
    unit_price_param DECIMAL(10,2),
    category_param TEXT,
    brand_param TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    total_price DECIMAL(12,2);
    current_user_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check if user has permission to add items to this sale
    IF NOT EXISTS (
        SELECT 1 FROM branch_sales bs
        JOIN branch_locations bl ON bs.branch_id = bl.id
        JOIN business_memberships bm ON bl.business_id = bm.business_id
        WHERE bs.id = sale_id_param 
        AND bm.user_id = current_user_id
    ) THEN
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'You do not have permission to add items to this sale'::TEXT;
        RETURN;
    END IF;
    
    -- Calculate total price
    total_price := quantity_param * unit_price_param;
    
    -- Insert sale item
    INSERT INTO branch_sale_items (
        sale_id,
        product_id,
        product_name,
        product_sku,
        product_barcode,
        quantity,
        unit_price,
        total_price,
        category,
        brand
    ) VALUES (
        sale_id_param,
        product_id_param,
        product_name_param,
        product_sku_param,
        product_barcode_param,
        quantity_param,
        unit_price_param,
        total_price,
        category_param,
        brand_param
    );
    
    -- Update sale totals
    UPDATE branch_sales SET
        total_amount = (
            SELECT COALESCE(SUM(total_price), 0) 
            FROM branch_sale_items 
            WHERE sale_id = sale_id_param
        ),
        items_count = (
            SELECT COUNT(*) 
            FROM branch_sale_items 
            WHERE sale_id = sale_id_param
        ),
        updated_at = NOW()
    WHERE id = sale_id_param;
    
    -- Return success response
    RETURN QUERY SELECT 
        true::BOOLEAN,
        'Item added to sale successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete sale
CREATE OR REPLACE FUNCTION complete_branch_sale(
    sale_id_param UUID,
    discount_amount_param DECIMAL(12,2),
    tax_amount_param DECIMAL(12,2),
    notes_param TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    final_amount DECIMAL(12,2);
    current_user_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check if user has permission to complete this sale
    IF NOT EXISTS (
        SELECT 1 FROM branch_sales bs
        JOIN branch_locations bl ON bs.branch_id = bl.id
        JOIN business_memberships bm ON bl.business_id = bm.business_id
        WHERE bs.id = sale_id_param 
        AND bm.user_id = current_user_id
    ) THEN
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'You do not have permission to complete this sale'::TEXT;
        RETURN;
    END IF;
    
    -- Calculate final amount
    SELECT 
        (total_amount - discount_amount_param + tax_amount_param)
    INTO final_amount
    FROM branch_sales 
    WHERE id = sale_id_param;
    
    -- Update sale
    UPDATE branch_sales SET
        discount_amount = discount_amount_param,
        tax_amount = tax_amount_param,
        total_amount = final_amount,
        payment_status = 'completed',
        notes = notes_param,
        updated_at = NOW()
    WHERE id = sale_id_param;
    
    -- Update inventory
    UPDATE branch_inventory bi SET
        current_stock = current_stock - si.quantity,
        last_sold = NOW(),
        updated_at = NOW()
    FROM branch_sale_items si
    WHERE bi.branch_id = (SELECT branch_id FROM branch_sales WHERE id = sale_id_param)
    AND bi.product_id = si.product_id
    AND si.sale_id = sale_id_param;
    
    -- Record inventory movement
    INSERT INTO branch_inventory_movements (
        branch_id,
        product_id,
        movement_type,
        quantity,
        previous_stock,
        new_stock,
        reason,
        created_by
    )
    SELECT 
        bs.branch_id,
        si.product_id,
        'out',
        si.quantity,
        bi.current_stock + si.quantity,
        bi.current_stock,
        'Sale completed',
        current_user_id
    FROM branch_sales bs
    JOIN branch_sale_items si ON bs.id = si.sale_id
    JOIN branch_inventory bi ON bs.branch_id = bi.branch_id AND si.product_id = bi.product_id
    WHERE bs.id = sale_id_param;
    
    -- Return success response
    RETURN QUERY SELECT 
        true::BOOLEAN,
        'Sale completed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. BRANCH INVENTORY FUNCTIONS
-- =====================================================

-- Update branch inventory
CREATE OR REPLACE FUNCTION update_branch_inventory(
    branch_id_param UUID,
    product_id_param UUID,
    quantity_change_param INTEGER,
    movement_type_param TEXT,
    reason_param TEXT,
    reference_number_param TEXT,
    unit_cost_param DECIMAL(10,2)
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    new_stock INTEGER
) AS $$
DECLARE
    current_stock INTEGER;
    new_stock INTEGER;
    current_user_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check if user has permission to update inventory for this branch
    IF NOT EXISTS (
        SELECT 1 FROM branch_locations bl
        JOIN business_memberships bm ON bl.business_id = bm.business_id
        WHERE bl.id = branch_id_param 
        AND bm.user_id = current_user_id
    ) THEN
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'You do not have permission to update inventory for this branch'::TEXT,
            0;
        RETURN;
    END IF;
    
    -- Get current stock
    SELECT COALESCE(current_stock, 0) INTO current_stock
    FROM branch_inventory
    WHERE branch_id = branch_id_param AND product_id = product_id_param;
    
    -- Calculate new stock
    IF movement_type_param IN ('in', 'transfer_in', 'return') THEN
        new_stock := current_stock + quantity_change_param;
    ELSIF movement_type_param IN ('out', 'transfer_out', 'damage', 'expired') THEN
        new_stock := current_stock - quantity_change_param;
    ELSIF movement_type_param = 'adjustment' THEN
        new_stock := quantity_change_param;
    ELSE
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'Invalid movement type'::TEXT,
            current_stock;
        RETURN;
    END IF;
    
    -- Check if new stock is negative
    IF new_stock < 0 THEN
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'Insufficient stock for this operation'::TEXT,
            current_stock;
        RETURN;
    END IF;
    
    -- Insert or update inventory
    INSERT INTO branch_inventory (
        branch_id,
        product_id,
        current_stock,
        updated_at
    ) VALUES (
        branch_id_param,
        product_id_param,
        new_stock,
        NOW()
    ) ON CONFLICT (branch_id, product_id) 
    DO UPDATE SET
        current_stock = new_stock,
        updated_at = NOW();
    
    -- Record movement
    INSERT INTO branch_inventory_movements (
        branch_id,
        product_id,
        movement_type,
        quantity,
        previous_stock,
        new_stock,
        unit_cost,
        total_cost,
        reference_number,
        reason,
        created_by
    ) VALUES (
        branch_id_param,
        product_id_param,
        movement_type_param,
        ABS(quantity_change_param),
        current_stock,
        new_stock,
        unit_cost_param,
        ABS(quantity_change_param) * unit_cost_param,
        reference_number_param,
        reason_param,
        current_user_id
    );
    
    -- Return success response
    RETURN QUERY SELECT 
        true::BOOLEAN,
        'Inventory updated successfully'::TEXT,
        new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. BRANCH ANALYTICS FUNCTIONS
-- =====================================================

-- Get branch daily metrics
CREATE OR REPLACE FUNCTION get_branch_daily_metrics(
    branch_id_param UUID,
    start_date_param DATE,
    end_date_param DATE
)
RETURNS TABLE (
    metric_date DATE,
    total_sales DECIMAL(12,2),
    total_transactions INTEGER,
    total_customers INTEGER,
    average_transaction_value DECIMAL(10,2),
    cash_sales DECIMAL(12,2),
    card_sales DECIMAL(12,2),
    mobile_money_sales DECIMAL(12,2),
    bank_transfer_sales DECIMAL(12,2),
    net_profit DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bs.created_at::DATE as metric_date,
        COALESCE(SUM(bs.total_amount), 0) as total_sales,
        COUNT(bs.id)::INTEGER as total_transactions,
        COUNT(DISTINCT bs.customer_phone)::INTEGER as total_customers,
        COALESCE(AVG(bs.total_amount), 0) as average_transaction_value,
        COALESCE(SUM(CASE WHEN bs.payment_method = 'cash' THEN bs.total_amount ELSE 0 END), 0) as cash_sales,
        COALESCE(SUM(CASE WHEN bs.payment_method = 'card' THEN bs.total_amount ELSE 0 END), 0) as card_sales,
        COALESCE(SUM(CASE WHEN bs.payment_method = 'mobile_money' THEN bs.total_amount ELSE 0 END), 0) as mobile_money_sales,
        COALESCE(SUM(CASE WHEN bs.payment_method = 'bank_transfer' THEN bs.total_amount ELSE 0 END), 0) as bank_transfer_sales,
        COALESCE(SUM(bs.total_amount - bs.discount_amount), 0) as net_profit
    FROM branch_sales bs
    WHERE bs.branch_id = branch_id_param
    AND bs.created_at::DATE BETWEEN start_date_param AND end_date_param
    AND bs.payment_status = 'completed'
    GROUP BY bs.created_at::DATE
    ORDER BY metric_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get branch hourly metrics
CREATE OR REPLACE FUNCTION get_branch_hourly_metrics(
    branch_id_param UUID,
    target_date_param DATE
)
RETURNS TABLE (
    hour_of_day INTEGER,
    sales_amount DECIMAL(12,2),
    transaction_count INTEGER,
    customer_count INTEGER,
    average_transaction_value DECIMAL(10,2),
    efficiency_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM bs.created_at)::INTEGER as hour_of_day,
        COALESCE(SUM(bs.total_amount), 0) as sales_amount,
        COUNT(bs.id)::INTEGER as transaction_count,
        COUNT(DISTINCT bs.customer_phone)::INTEGER as customer_count,
        COALESCE(AVG(bs.total_amount), 0) as average_transaction_value,
        COALESCE(
            CASE 
                WHEN COUNT(bs.id) > 0 THEN 
                    LEAST(100, (COUNT(bs.id) * 10.0) + (AVG(bs.total_amount) / 100.0))
                ELSE 0 
            END, 0
        ) as efficiency_score
    FROM branch_sales bs
    WHERE bs.branch_id = branch_id_param
    AND bs.created_at::DATE = target_date_param
    AND bs.payment_status = 'completed'
    GROUP BY EXTRACT(HOUR FROM bs.created_at)
    ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get branch product performance
CREATE OR REPLACE FUNCTION get_branch_product_performance(
    branch_id_param UUID,
    start_date_param DATE,
    end_date_param DATE
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    total_sales DECIMAL(12,2),
    total_quantity_sold INTEGER,
    total_revenue DECIMAL(12,2),
    total_profit DECIMAL(12,2),
    profit_margin DECIMAL(5,2),
    average_daily_sales DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        si.product_id,
        si.product_name,
        COALESCE(SUM(si.total_price), 0) as total_sales,
        COALESCE(SUM(si.quantity), 0)::INTEGER as total_quantity_sold,
        COALESCE(SUM(si.total_price), 0) as total_revenue,
        COALESCE(SUM(si.total_price - (si.quantity * COALESCE(p.cost, 0))), 0) as total_profit,
        COALESCE(
            CASE 
                WHEN SUM(si.total_price) > 0 THEN 
                    ((SUM(si.total_price - (si.quantity * COALESCE(p.cost, 0)))) / SUM(si.total_price)) * 100
                ELSE 0 
            END, 0
        ) as profit_margin,
        COALESCE(SUM(si.total_price) / GREATEST(1, (end_date_param - start_date_param + 1)), 0) as average_daily_sales
    FROM branch_sale_items si
    JOIN branch_sales bs ON si.sale_id = bs.id
    LEFT JOIN products p ON si.product_id = p.id
    WHERE bs.branch_id = branch_id_param
    AND bs.created_at::DATE BETWEEN start_date_param AND end_date_param
    AND bs.payment_status = 'completed'
    GROUP BY si.product_id, si.product_name
    ORDER BY total_sales DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. BRANCH STAFF FUNCTIONS
-- =====================================================

-- Get branch staff performance
CREATE OR REPLACE FUNCTION get_branch_staff_performance(
    branch_id_param UUID,
    start_date_param DATE,
    end_date_param DATE
)
RETURNS TABLE (
    staff_id UUID,
    staff_name TEXT,
    total_sales DECIMAL(12,2),
    total_transactions INTEGER,
    total_customers INTEGER,
    average_transaction_value DECIMAL(10,2),
    efficiency_score DECIMAL(5,2),
    commission_earned DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bs.cashier_id as staff_id,
        COALESCE(up.full_name, 'Unknown Staff') as staff_name,
        COALESCE(SUM(bs.total_amount), 0) as total_sales,
        COUNT(bs.id)::INTEGER as total_transactions,
        COUNT(DISTINCT bs.customer_phone)::INTEGER as total_customers,
        COALESCE(AVG(bs.total_amount), 0) as average_transaction_value,
        COALESCE(
            CASE 
                WHEN COUNT(bs.id) > 0 THEN 
                    LEAST(100, (COUNT(bs.id) * 5.0) + (AVG(bs.total_amount) / 50.0))
                ELSE 0 
            END, 0
        ) as efficiency_score,
        COALESCE(SUM(bs.total_amount * COALESCE(bst.commission_rate, 0) / 100), 0) as commission_earned
    FROM branch_sales bs
    LEFT JOIN auth.users u ON bs.cashier_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.id
    LEFT JOIN branch_staff bst ON bs.branch_id = bst.branch_id AND bs.cashier_id = bst.user_id
    WHERE bs.branch_id = branch_id_param
    AND bs.created_at::DATE BETWEEN start_date_param AND end_date_param
    AND bs.payment_status = 'completed'
    AND bs.cashier_id IS NOT NULL
    GROUP BY bs.cashier_id, up.full_name, bst.commission_rate
    ORDER BY total_sales DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record staff attendance
CREATE OR REPLACE FUNCTION record_staff_attendance(
    branch_id_param UUID,
    staff_id_param UUID,
    attendance_date_param DATE,
    check_in_time_param TIMESTAMP,
    check_out_time_param TIMESTAMP,
    status_param TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    current_user_id UUID;
    hours_worked DECIMAL(4,2);
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check if user has permission to record attendance for this branch
    IF NOT EXISTS (
        SELECT 1 FROM branch_locations bl
        JOIN business_memberships bm ON bl.business_id = bm.business_id
        WHERE bl.id = branch_id_param 
        AND bm.user_id = current_user_id
    ) THEN
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'You do not have permission to record attendance for this branch'::TEXT;
        RETURN;
    END IF;
    
    -- Calculate hours worked
    IF check_in_time_param IS NOT NULL AND check_out_time_param IS NOT NULL THEN
        hours_worked := EXTRACT(EPOCH FROM (check_out_time_param - check_in_time_param)) / 3600;
    ELSE
        hours_worked := 0;
    END IF;
    
    -- Insert or update attendance record
    INSERT INTO branch_staff_attendance (
        branch_id,
        staff_id,
        attendance_date,
        check_in_time,
        check_out_time,
        hours_worked,
        status
    ) VALUES (
        branch_id_param,
        staff_id_param,
        attendance_date_param,
        check_in_time_param,
        check_out_time_param,
        hours_worked,
        status_param
    ) ON CONFLICT (branch_id, staff_id, attendance_date)
    DO UPDATE SET
        check_in_time = COALESCE(check_in_time_param, branch_staff_attendance.check_in_time),
        check_out_time = COALESCE(check_out_time_param, branch_staff_attendance.check_out_time),
        hours_worked = COALESCE(hours_worked, branch_staff_attendance.hours_worked),
        status = COALESCE(status_param, branch_staff_attendance.status);
    
    -- Return success response
    RETURN QUERY SELECT 
        true::BOOLEAN,
        'Attendance recorded successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. BRANCH AI INSIGHTS FUNCTIONS
-- =====================================================

-- Generate AI insights for branch
CREATE OR REPLACE FUNCTION generate_branch_ai_insights(
    branch_id_param UUID
)
RETURNS TABLE (
    insight_id UUID,
    insight_type TEXT,
    title TEXT,
    description TEXT,
    confidence_score DECIMAL(5,2),
    impact_level TEXT,
    actionable BOOLEAN
) AS $$
DECLARE
    current_user_id UUID;
    sales_data RECORD;
    inventory_data RECORD;
    staff_data RECORD;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check if user has permission to generate insights for this branch
    IF NOT EXISTS (
        SELECT 1 FROM branch_locations bl
        JOIN business_memberships bm ON bl.business_id = bm.business_id
        WHERE bl.id = branch_id_param 
        AND bm.user_id = current_user_id
    ) THEN
        RETURN QUERY SELECT 
            gen_random_uuid()::UUID,
            ''::TEXT,
            ''::TEXT,
            'You do not have permission to generate insights for this branch'::TEXT,
            0::DECIMAL(5,2),
            ''::TEXT,
            false::BOOLEAN;
        RETURN;
    END IF;
    
    -- Get sales data for insights
    SELECT 
        COALESCE(SUM(total_amount), 0) as total_sales,
        COUNT(*) as transaction_count,
        COALESCE(AVG(total_amount), 0) as avg_transaction
    INTO sales_data
    FROM branch_sales
    WHERE branch_id = branch_id_param
    AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND payment_status = 'completed';
    
    -- Get inventory data for insights
    SELECT 
        COUNT(*) as low_stock_items,
        SUM(CASE WHEN current_stock <= minimum_stock THEN 1 ELSE 0 END) as critical_items
    INTO inventory_data
    FROM branch_inventory
    WHERE branch_id = branch_id_param;
    
    -- Get staff data for insights
    SELECT 
        COUNT(*) as active_staff,
        COALESCE(AVG(performance_score), 0) as avg_performance
    INTO staff_data
    FROM branch_staff
    WHERE branch_id = branch_id_param AND is_active = true;
    
    -- Generate sales prediction insight
    IF sales_data.total_sales > 0 THEN
        INSERT INTO branch_ai_insights (
            branch_id,
            insight_type,
            title,
            description,
            confidence_score,
            impact_level,
            actionable,
            insight_data
        ) VALUES (
            branch_id_param,
            'sales_prediction',
            'Sales Trend Analysis',
            'Based on recent sales data, this branch is showing ' || 
            CASE 
                WHEN sales_data.avg_transaction > 50000 THEN 'strong performance'
                WHEN sales_data.avg_transaction > 25000 THEN 'moderate performance'
                ELSE 'room for improvement'
            END || ' with an average transaction value of UGX ' || 
            ROUND(sales_data.avg_transaction)::TEXT,
            CASE 
                WHEN sales_data.transaction_count > 50 THEN 85.0
                WHEN sales_data.transaction_count > 20 THEN 70.0
                ELSE 60.0
            END,
            'high',
            true,
            json_build_object(
                'total_sales', sales_data.total_sales,
                'transaction_count', sales_data.transaction_count,
                'avg_transaction', sales_data.avg_transaction
            )
        );
    END IF;
    
    -- Generate inventory optimization insight
    IF inventory_data.critical_items > 0 THEN
        INSERT INTO branch_ai_insights (
            branch_id,
            insight_type,
            title,
            description,
            confidence_score,
            impact_level,
            actionable,
            insight_data
        ) VALUES (
            branch_id_param,
            'inventory_optimization',
            'Low Stock Alert',
            'You have ' || inventory_data.critical_items::TEXT || 
            ' items at or below minimum stock levels. Consider restocking soon.',
            95.0,
            'high',
            true,
            json_build_object(
                'critical_items', inventory_data.critical_items,
                'low_stock_items', inventory_data.low_stock_items
            )
        );
    END IF;
    
    -- Generate staff performance insight
    IF staff_data.avg_performance < 70 THEN
        INSERT INTO branch_ai_insights (
            branch_id,
            insight_type,
            title,
            description,
            confidence_score,
            impact_level,
            actionable,
            insight_data
        ) VALUES (
            branch_id_param,
            'staff_performance',
            'Staff Performance Review',
            'Staff performance is below average (' || ROUND(staff_data.avg_performance)::TEXT || 
            '%). Consider additional training or motivation programs.',
            80.0,
            'medium',
            true,
            json_build_object(
                'avg_performance', staff_data.avg_performance,
                'active_staff', staff_data.active_staff
            )
        );
    END IF;
    
    -- Return generated insights
    RETURN QUERY
    SELECT 
        bai.id as insight_id,
        bai.insight_type,
        bai.title,
        bai.description,
        bai.confidence_score,
        bai.impact_level,
        bai.actionable
    FROM branch_ai_insights bai
    WHERE bai.branch_id = branch_id_param
    AND bai.created_at >= CURRENT_DATE - INTERVAL '1 day'
    ORDER BY bai.confidence_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_branch_sale(UUID, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_sale_item(UUID, UUID, TEXT, TEXT, TEXT, INTEGER, DECIMAL, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_branch_sale(UUID, DECIMAL, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_branch_inventory(UUID, UUID, INTEGER, TEXT, TEXT, TEXT, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_daily_metrics(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_hourly_metrics(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_product_performance(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_branch_staff_performance(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION record_staff_attendance(UUID, UUID, DATE, TIMESTAMP, TIMESTAMP, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_branch_ai_insights(UUID) TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Branch Management RPC Functions created successfully!';
    RAISE NOTICE 'Functions available: create_branch_sale, add_sale_item, complete_branch_sale, update_branch_inventory, get_branch_daily_metrics, get_branch_hourly_metrics, get_branch_product_performance, get_branch_staff_performance, record_staff_attendance, generate_branch_ai_insights';
END $$;
