-- Check table schemas and create corrected functions
-- Run this script in Supabase SQL Editor

-- First, let's check what columns exist in each table
SELECT 'branch_sales table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'branch_sales'
ORDER BY ordinal_position;

SELECT 'branch_sale_items table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'branch_sale_items'
ORDER BY ordinal_position;

SELECT 'branch_inventory table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'branch_inventory'
ORDER BY ordinal_position;

SELECT 'branch_inventory_movements table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'branch_inventory_movements'
ORDER BY ordinal_position;

SELECT 'branch_staff_attendance table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'branch_staff_attendance'
ORDER BY ordinal_position;

-- Now let's create the functions based on the actual table structure
-- Drop existing functions first
DROP FUNCTION IF EXISTS create_branch_sale CASCADE;
DROP FUNCTION IF EXISTS add_sale_item CASCADE;
DROP FUNCTION IF EXISTS complete_branch_sale CASCADE;
DROP FUNCTION IF EXISTS update_branch_inventory CASCADE;
DROP FUNCTION IF EXISTS record_staff_attendance CASCADE;

-- 1. Create create_branch_sale function (using actual table columns)
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
    -- Insert with only the columns that exist
    INSERT INTO branch_sales (
        branch_id,
        status,
        created_at
    ) VALUES (
        branch_id_param,
        'pending',
        NOW()
    ) RETURNING id INTO sale_id;
    
    RETURN sale_id;
END;
$$;

-- 2. Create add_sale_item function (using actual table columns)
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
    -- Insert with only the columns that exist
    INSERT INTO branch_sale_items (
        sale_id,
        product_id,
        quantity,
        unit_price,
        created_at
    ) VALUES (
        sale_id_param,
        product_id_param,
        quantity_param,
        unit_price_param,
        NOW()
    ) RETURNING id INTO item_id;
    
    RETURN item_id;
END;
$$;

-- 3. Create complete_branch_sale function (using actual table columns)
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
    
    -- Update the sale record with only existing columns
    UPDATE branch_sales SET
        status = 'completed',
        updated_at = NOW()
    WHERE id = sale_id_param;
    
    RETURN TRUE;
END;
$$;

-- 4. Create update_branch_inventory function (using actual table columns)
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
    
    -- Update or insert inventory record with only existing columns
    INSERT INTO branch_inventory (
        branch_id,
        product_id,
        current_stock,
        created_at
    ) VALUES (
        branch_id_param,
        product_id_param,
        new_stock,
        NOW()
    ) ON CONFLICT (branch_id, product_id) 
    DO UPDATE SET
        current_stock = new_stock,
        updated_at = NOW();
    
    -- Record inventory movement with only existing columns
    INSERT INTO branch_inventory_movements (
        branch_id,
        product_id,
        movement_type,
        quantity,
        created_at
    ) VALUES (
        branch_id_param,
        product_id_param,
        CASE WHEN quantity_change_param > 0 THEN 'in' ELSE 'out' END,
        ABS(quantity_change_param),
        NOW()
    );
    
    RETURN TRUE;
END;
$$;

-- 5. Create record_staff_attendance function (using actual table columns)
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
    -- Insert with only existing columns
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

SELECT 'All functions created successfully with actual table structure!' as status;
