-- Create ALL missing RPC functions for branch management (CORRECTED)
-- Run this script in Supabase SQL Editor

-- First, let's check what functions already exist
SELECT 
    routine_name, 
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%branch%'
ORDER BY routine_name;

-- Drop existing functions with their exact signatures
DROP FUNCTION IF EXISTS create_branch_sale(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS add_sale_item(UUID, UUID, TEXT, INTEGER, DECIMAL, TEXT);
DROP FUNCTION IF EXISTS complete_branch_sale(UUID, DECIMAL, DECIMAL, TEXT);
DROP FUNCTION IF EXISTS update_branch_inventory(UUID, UUID, INTEGER, DECIMAL);
DROP FUNCTION IF EXISTS record_staff_attendance(UUID, UUID, DATE, TEXT);

-- Also drop any functions with different signatures that might exist
DROP FUNCTION IF EXISTS create_branch_sale CASCADE;
DROP FUNCTION IF EXISTS add_sale_item CASCADE;
DROP FUNCTION IF EXISTS complete_branch_sale CASCADE;
DROP FUNCTION IF EXISTS update_branch_inventory CASCADE;
DROP FUNCTION IF EXISTS record_staff_attendance CASCADE;

-- 1. Create create_branch_sale function
CREATE OR REPLACE FUNCTION create_branch_sale(
    branch_id_param UUID,
    customer_name_param TEXT,
    customer_phone_param TEXT,
    payment_method_param TEXT,
    cashier_id_param TEXT
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
        payment_method,
        cashier_id,
        status,
        created_at
    ) VALUES (
        branch_id_param,
        customer_name_param,
        customer_phone_param,
        payment_method_param,
        cashier_id_param,
        'pending',
        NOW()
    ) RETURNING id INTO sale_id;
    
    RETURN sale_id;
END;
$$;

-- 2. Create add_sale_item function
CREATE OR REPLACE FUNCTION add_sale_item(
    sale_id_param UUID,
    product_id_param UUID,
    product_name_param TEXT,
    quantity_param INTEGER,
    unit_price_param DECIMAL,
    brand_param TEXT
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
        product_name,
        quantity,
        unit_price,
        brand,
        created_at
    ) VALUES (
        sale_id_param,
        product_id_param,
        product_name_param,
        quantity_param,
        unit_price_param,
        brand_param,
        NOW()
    ) RETURNING id INTO item_id;
    
    RETURN item_id;
END;
$$;

-- 3. Create complete_branch_sale function
CREATE OR REPLACE FUNCTION complete_branch_sale(
    sale_id_param UUID,
    discount_amount_param DECIMAL,
    tax_amount_param DECIMAL,
    notes_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_amount DECIMAL;
BEGIN
    -- Calculate total amount from sale items
    SELECT COALESCE(SUM(quantity * unit_price), 0) INTO total_amount
    FROM branch_sale_items
    WHERE sale_id = sale_id_param;
    
    -- Update the sale record
    UPDATE branch_sales SET
        total_amount = total_amount - COALESCE(discount_amount_param, 0) + COALESCE(tax_amount_param, 0),
        discount_amount = COALESCE(discount_amount_param, 0),
        tax_amount = COALESCE(tax_amount_param, 0),
        notes = notes_param,
        status = 'completed',
        completed_at = NOW()
    WHERE id = sale_id_param;
    
    RETURN TRUE;
END;
$$;

-- 4. Create update_branch_inventory function
CREATE OR REPLACE FUNCTION update_branch_inventory(
    branch_id_param UUID,
    product_id_param UUID,
    quantity_change_param INTEGER,
    unit_cost_param DECIMAL
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
    
    -- Update or insert inventory record
    INSERT INTO branch_inventory (
        branch_id,
        product_id,
        current_stock,
        cost_price,
        last_restocked,
        created_at
    ) VALUES (
        branch_id_param,
        product_id_param,
        new_stock,
        unit_cost_param,
        NOW(),
        NOW()
    ) ON CONFLICT (branch_id, product_id) 
    DO UPDATE SET
        current_stock = new_stock,
        cost_price = unit_cost_param,
        last_restocked = NOW();
    
    -- Record inventory movement
    INSERT INTO branch_inventory_movements (
        branch_id,
        product_id,
        movement_type,
        quantity,
        reason,
        reference_number,
        created_at,
        created_by
    ) VALUES (
        branch_id_param,
        product_id_param,
        CASE WHEN quantity_change_param > 0 THEN 'in' ELSE 'out' END,
        ABS(quantity_change_param),
        'Inventory adjustment',
        'ADJ-' || EXTRACT(EPOCH FROM NOW())::TEXT,
        NOW(),
        'System'
    );
    
    RETURN TRUE;
END;
$$;

-- 5. Create record_staff_attendance function
CREATE OR REPLACE FUNCTION record_staff_attendance(
    branch_id_param UUID,
    staff_id_param UUID,
    attendance_date_param DATE,
    status_param TEXT
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
        updated_at = NOW()
    RETURNING id INTO attendance_id;
    
    RETURN attendance_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_branch_sale(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_sale_item(UUID, UUID, TEXT, INTEGER, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_branch_sale(UUID, DECIMAL, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_branch_inventory(UUID, UUID, INTEGER, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION record_staff_attendance(UUID, UUID, DATE, TEXT) TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Test the functions
SELECT 'Testing create_branch_sale...' as status;
SELECT create_branch_sale(
    '066efb80-2a71-41c5-b704-4d9574b5d5bf'::UUID,
    'Test Customer',
    '+256700000000',
    'cash',
    'test-cashier'
) as sale_id;

SELECT 'All missing RPC functions created successfully!' as status;
