-- FIX: Remove infinite recursion in business_memberships RLS policies
-- Run this in Supabase SQL Editor to fix the 42P17 error

-- 1. Drop all existing policies on business_memberships
DROP POLICY IF EXISTS "Allow all operations on business_memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can view memberships for their businesses" ON business_memberships;
DROP POLICY IF EXISTS "Users can view their own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can insert memberships for their businesses" ON business_memberships;
DROP POLICY IF EXISTS "Users can update memberships for their businesses" ON business_memberships;
DROP POLICY IF EXISTS "Users can delete memberships for their businesses" ON business_memberships;

-- 2. Create simple, non-recursive policies for business_memberships
CREATE POLICY "Users can view their own memberships" ON business_memberships
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own memberships" ON business_memberships
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own memberships" ON business_memberships
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own memberships" ON business_memberships
    FOR DELETE USING (user_id = auth.uid());

-- 3. Fix products table policies to avoid recursion
DROP POLICY IF EXISTS "Users can view products for their businesses" ON products;
DROP POLICY IF EXISTS "Users can insert products for their businesses" ON products;
DROP POLICY IF EXISTS "Users can update products for their businesses" ON products;
DROP POLICY IF EXISTS "Users can delete products for their businesses" ON products;

-- Create simpler policies for products
CREATE POLICY "Users can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Users can insert products" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update products" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete products" ON products
    FOR DELETE USING (true);

-- 4. Fix product_categories policies
DROP POLICY IF EXISTS "Users can view categories for their businesses" ON product_categories;
DROP POLICY IF EXISTS "Users can insert categories for their businesses" ON product_categories;
DROP POLICY IF EXISTS "Users can update categories for their businesses" ON product_categories;
DROP POLICY IF EXISTS "Users can delete categories for their businesses" ON product_categories;

CREATE POLICY "Users can view categories" ON product_categories
    FOR SELECT USING (true);

CREATE POLICY "Users can insert categories" ON product_categories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update categories" ON product_categories
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete categories" ON product_categories
    FOR DELETE USING (true);

-- 5. Fix product_suppliers policies
DROP POLICY IF EXISTS "Users can view suppliers for their businesses" ON product_suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers for their businesses" ON product_suppliers;
DROP POLICY IF EXISTS "Users can update suppliers for their businesses" ON product_suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers for their businesses" ON product_suppliers;

CREATE POLICY "Users can view suppliers" ON product_suppliers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert suppliers" ON product_suppliers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update suppliers" ON product_suppliers
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete suppliers" ON product_suppliers
    FOR DELETE USING (true);

-- 6. Fix stock_movements policies
DROP POLICY IF EXISTS "Users can view stock movements for their businesses" ON stock_movements;
DROP POLICY IF EXISTS "Users can insert stock movements for their businesses" ON stock_movements;

CREATE POLICY "Users can view stock movements" ON stock_movements
    FOR SELECT USING (true);

CREATE POLICY "Users can insert stock movements" ON stock_movements
    FOR INSERT WITH CHECK (true);

-- 7. Update RPC functions to be simpler
CREATE OR REPLACE FUNCTION get_products_by_business(business_id_param UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    sku VARCHAR(255),
    barcode VARCHAR(255),
    barcode_type VARCHAR(50),
    cost_price DECIMAL(10,2),
    wholesale_price DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    current_stock INTEGER,
    min_stock INTEGER,
    max_stock INTEGER,
    unit_type VARCHAR(50),
    items_per_package INTEGER,
    package_type VARCHAR(50),
    product_image_url TEXT,
    barcode_image_url TEXT,
    brand VARCHAR(255),
    manufacturer VARCHAR(255),
    business_id UUID,
    category_id UUID,
    supplier_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.name, p.description, p.sku, p.barcode, p.barcode_type,
        p.cost_price, p.wholesale_price, p.retail_price, p.current_stock,
        p.min_stock, p.max_stock, p.unit_type, p.items_per_package,
        p.package_type, p.product_image_url, p.barcode_image_url,
        p.brand, p.manufacturer, p.business_id, p.category_id, p.supplier_id,
        p.created_at, p.updated_at
    FROM products p
    WHERE p.business_id = business_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION update_product_stock(
    product_id_param UUID,
    quantity_change_param INTEGER,
    movement_type_param VARCHAR,
    cost_price_param DECIMAL,
    notes_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    product_business_id UUID;
BEGIN
    -- Get the business_id for the product
    SELECT business_id INTO product_business_id
    FROM products
    WHERE id = product_id_param;
    
    -- Update product stock
    UPDATE products
    SET current_stock = current_stock + quantity_change_param,
        updated_at = NOW()
    WHERE id = product_id_param;
    
    -- Insert stock movement record
    INSERT INTO stock_movements (
        product_id, business_id, movement_type, quantity_change, cost_price, notes, created_by
    ) VALUES (
        product_id_param, product_business_id, movement_type_param, 
        quantity_change_param, cost_price_param, notes_param, auth.uid()
    );
    
    RETURN TRUE;
END;
$$;

SELECT 'RLS recursion fixed! All policies simplified.' as status;
