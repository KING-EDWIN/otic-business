-- Create simplified RPC functions based on actual table structure
-- Run this script in Supabase SQL Editor

-- Drop existing functions first
DROP FUNCTION IF EXISTS create_branch_sale CASCADE;
DROP FUNCTION IF EXISTS add_sale_item CASCADE;
DROP FUNCTION IF EXISTS complete_branch_sale CASCADE;
DROP FUNCTION IF EXISTS update_branch_inventory CASCADE;
DROP FUNCTION IF EXISTS record_staff_attendance CASCADE;

-- 1. Create create_branch_sale function (simplified)
CREATE OR REPLACE FUNCTION create_branch_sale(
    branch_id_param UUID,
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
    -- Insert with actual columns from branch_sales table
    INSERT INTO branch_sales (
        branch_id,
        cashier_id,
        sale_date,
        total_amount,
        payment_method,
        created_at
    ) VALUES (
        branch_id_param,
        cashier_id_param,
        NOW(),
        0.00, -- Will be updated when items are added
        payment_method_param,
        NOW()
    ) RETURNING id INTO sale_id;
    
    RETURN sale_id;
END;
$$;

-- 2. Create add_sale_item function (simplified)
CREATE OR REPLACE FUNCTION add_sale_item(
    sale_id_param UUID,
    product_name_param TEXT,
    quantity_param INTEGER,
    unit_price_param DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item_id UUID;
    total_price DECIMAL;
BEGIN
    -- Calculate total price
    total_price := quantity_param * unit_price_param;
    
    -- Insert with actual columns from branch_sale_items table
    INSERT INTO branch_sale_items (
        sale_id,
        product_name,
        quantity,
        unit_price,
        total_price,
        created_at
    ) VALUES (
        sale_id_param,
        product_name_param,
        quantity_param,
        unit_price_param,
        total_price,
        NOW()
    ) RETURNING id INTO item_id;
    
    -- Update the sale total amount
    UPDATE branch_sales SET
        total_amount = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM branch_sale_items
            WHERE sale_id = sale_id_param
        ),
        updated_at = NOW()
    WHERE id = sale_id_param;
    
    RETURN item_id;
END;
$$;

-- 3. Create complete_branch_sale function (simplified)
CREATE OR REPLACE FUNCTION complete_branch_sale(
    sale_id_param UUID,
    discount_amount_param DECIMAL DEFAULT 0,
    tax_amount_param DECIMAL DEFAULT 0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_amount DECIMAL;
    final_amount DECIMAL;
BEGIN
    -- Calculate total amount from sale items
    SELECT COALESCE(SUM(total_price), 0) INTO total_amount
    FROM branch_sale_items
    WHERE sale_id = sale_id_param;
    
    -- Calculate final amount with discount and tax
    final_amount := total_amount - COALESCE(discount_amount_param, 0) + COALESCE(tax_amount_param, 0);
    
    -- Update the sale record with actual columns
    UPDATE branch_sales SET
        total_amount = final_amount,
        discount_amount = COALESCE(discount_amount_param, 0),
        tax_amount = COALESCE(tax_amount_param, 0),
        updated_at = NOW()
    WHERE id = sale_id_param;
    
    RETURN TRUE;
END;
$$;

-- 4. Create update_branch_inventory function (simplified)
CREATE OR REPLACE FUNCTION update_branch_inventory(
    branch_id_param UUID,
    product_id_param UUID,
    quantity_change_param INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_stock INTEGER;
    new_stock INTEGER;
BEGIN
    -- Get current stock
    SELECT COALESCE(current_stock, 0) INTO current_stock
    FROM branch_inventory
    WHERE branch_id = branch_id_param AND product_id = product_id_param;
    
    -- Calculate new stock
    new_stock := current_stock + quantity_change_param;
    
    -- Update or insert inventory record with actual columns
    INSERT INTO branch_inventory (
        branch_id,
        product_id,
        current_stock,
        last_restocked,
        created_at
    ) VALUES (
        branch_id_param,
        product_id_param,
        new_stock,
        NOW(),
        NOW()
    ) ON CONFLICT (branch_id, product_id) 
    DO UPDATE SET
        current_stock = new_stock,
        last_restocked = NOW(),
        updated_at = NOW();
    
    -- Record inventory movement with actual columns
    INSERT INTO branch_inventory_movements (
        branch_id,
        product_id,
        movement_type,
        quantity,
        previous_stock,
        new_stock,
        reason,
        created_at
    ) VALUES (
        branch_id_param,
        product_id_param,
        CASE WHEN quantity_change_param > 0 THEN 'in' ELSE 'out' END,
        ABS(quantity_change_param),
        current_stock,
        new_stock,
        'Inventory adjustment',
        NOW()
    );
    
    RETURN TRUE;
END;
$$;

-- 5. Create record_staff_attendance function (simplified)
CREATE OR REPLACE FUNCTION record_staff_attendance(
    branch_id_param UUID,
    staff_id_param UUID,
    attendance_date_param DATE,
    status_param TEXT DEFAULT 'present'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    attendance_id UUID;
BEGIN
    -- Insert with actual columns from branch_staff_attendance table
    INSERT INTO branch_staff_attendance (
        branch_id,
        staff_id,
        attendance_date,
        status,
        created_at
    ) VALUES (
        branch_id_param,
        staff_id_param,
        attendance_date_param,
        status_param,
        NOW()
    ) ON CONFLICT (branch_id, staff_id, attendance_date)
    DO UPDATE SET
        status = status_param,
        created_at = NOW()
    RETURNING id INTO attendance_id;
    
    RETURN attendance_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_branch_sale(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_sale_item(UUID, TEXT, INTEGER, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_branch_sale(UUID, DECIMAL, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION update_branch_inventory(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION record_staff_attendance(UUID, UUID, DATE, TEXT) TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Test the functions
SELECT 'Testing create_branch_sale...' as status;
SELECT create_branch_sale(
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    'cash',
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID
) as sale_id;

SELECT 'All simplified RPC functions created successfully!' as status;
