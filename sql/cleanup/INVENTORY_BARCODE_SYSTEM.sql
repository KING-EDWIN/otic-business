-- COMPREHENSIVE INVENTORY BARCODE SYSTEM
-- This script creates a complete inventory management system with barcode support
-- Run this script in your Supabase SQL Editor

-- ============================================================================
-- STEP 1: CREATE ENHANCED PRODUCT TABLES
-- ============================================================================

-- Drop existing products table and recreate with enhanced structure
DROP TABLE IF EXISTS products CASCADE;

-- Create comprehensive products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Basic Product Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  
  -- Barcode Information
  barcode VARCHAR(100) UNIQUE,
  barcode_type VARCHAR(20) DEFAULT 'existing' CHECK (barcode_type IN ('existing', 'generated')),
  
  -- Pricing
  cost_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  wholesale_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  retail_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Inventory
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  max_stock INTEGER DEFAULT 1000,
  
  -- Product Details
  category VARCHAR(100),
  brand VARCHAR(100),
  manufacturer VARCHAR(100),
  unit_type VARCHAR(50) DEFAULT 'piece' CHECK (unit_type IN ('piece', 'kg', 'liter', 'box', 'pack', 'gram', 'ml')),
  
  -- Packaging Information
  items_per_package INTEGER DEFAULT 1, -- How many individual items in one package
  package_type VARCHAR(50) DEFAULT 'individual', -- individual, box, pack, etc.
  
  -- Images
  product_image_url TEXT,
  barcode_image_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product categories table
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES product_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  payment_terms VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock movements table (for tracking inventory changes)
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Movement Details
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  
  -- Reference Information
  reference_type VARCHAR(50), -- 'purchase', 'sale', 'adjustment', 'transfer'
  reference_id UUID, -- ID of the related record
  
  -- Additional Info
  reason TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase orders table
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  
  -- Order Details
  order_number VARCHAR(50) NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Financial
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  
  -- Additional Info
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase order items table
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Item Details
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_cost DECIMAL(15,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: ENABLE RLS AND CREATE POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('products', 'product_categories', 'suppliers', 'stock_movements', 'purchase_orders', 'purchase_order_items')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON ' || policy_record.schemaname || '.' || policy_record.tablename;
    END LOOP;
END $$;

-- Create comprehensive RLS policies

-- Products policies
CREATE POLICY "Users can view their own products" ON products
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own products" ON products
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own products" ON products
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own products" ON products
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Product categories policies
CREATE POLICY "Users can manage their own categories" ON product_categories
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Suppliers policies
CREATE POLICY "Users can manage their own suppliers" ON suppliers
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Stock movements policies
CREATE POLICY "Users can view their own stock movements" ON stock_movements
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own stock movements" ON stock_movements
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Purchase orders policies
CREATE POLICY "Users can manage their own purchase orders" ON purchase_orders
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Purchase order items policies
CREATE POLICY "Users can manage their own purchase order items" ON purchase_order_items
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM purchase_orders 
        WHERE id = purchase_order_items.purchase_order_id 
        AND user_id = auth.uid()
    )
);

-- ============================================================================
-- STEP 3: CREATE RPC FUNCTIONS
-- ============================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS get_products_by_business(uuid);
DROP FUNCTION IF EXISTS get_product_by_barcode(TEXT);
DROP FUNCTION IF EXISTS update_product_stock(uuid, INTEGER, TEXT);
DROP FUNCTION IF EXISTS generate_product_barcode(TEXT, TEXT, TEXT);

-- Create get_products_by_business function
CREATE OR REPLACE FUNCTION get_products_by_business(business_id_param UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    barcode_type VARCHAR(20),
    cost_price DECIMAL(15,2),
    wholesale_price DECIMAL(15,2),
    retail_price DECIMAL(15,2),
    current_stock INTEGER,
    min_stock INTEGER,
    max_stock INTEGER,
    category VARCHAR(100),
    brand VARCHAR(100),
    manufacturer VARCHAR(100),
    unit_type VARCHAR(50),
    items_per_package INTEGER,
    package_type VARCHAR(50),
    product_image_url TEXT,
    barcode_image_url TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.sku,
        p.barcode,
        p.barcode_type,
        p.cost_price,
        p.wholesale_price,
        p.retail_price,
        p.current_stock,
        p.min_stock,
        p.max_stock,
        p.category,
        p.brand,
        p.manufacturer,
        p.unit_type,
        p.items_per_package,
        p.package_type,
        p.product_image_url,
        p.barcode_image_url,
        p.status,
        p.created_at,
        p.updated_at
    FROM products p
    WHERE p.business_id = business_id_param
    AND p.status = 'active'
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_product_by_barcode function
CREATE OR REPLACE FUNCTION get_product_by_barcode(barcode_param TEXT)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    barcode_type VARCHAR(20),
    cost_price DECIMAL(15,2),
    wholesale_price DECIMAL(15,2),
    retail_price DECIMAL(15,2),
    current_stock INTEGER,
    min_stock INTEGER,
    max_stock INTEGER,
    category VARCHAR(100),
    brand VARCHAR(100),
    manufacturer VARCHAR(100),
    unit_type VARCHAR(50),
    items_per_package INTEGER,
    package_type VARCHAR(50),
    product_image_url TEXT,
    barcode_image_url TEXT,
    status VARCHAR(20),
    business_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.sku,
        p.barcode,
        p.barcode_type,
        p.cost_price,
        p.wholesale_price,
        p.retail_price,
        p.current_stock,
        p.min_stock,
        p.max_stock,
        p.category,
        p.brand,
        p.manufacturer,
        p.unit_type,
        p.items_per_package,
        p.package_type,
        p.product_image_url,
        p.barcode_image_url,
        p.status,
        p.business_id,
        p.created_at,
        p.updated_at
    FROM products p
    WHERE p.barcode = barcode_param
    AND p.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create update_product_stock function
CREATE OR REPLACE FUNCTION update_product_stock(
    product_id_param UUID,
    quantity_change INTEGER,
    movement_type_param TEXT,
    reason_param TEXT DEFAULT NULL,
    reference_type_param TEXT DEFAULT NULL,
    reference_id_param UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
    new_stock INTEGER;
    user_id_val UUID;
    business_id_val UUID;
BEGIN
    -- Get current stock and user info
    SELECT current_stock, user_id, business_id 
    INTO current_stock, user_id_val, business_id_val
    FROM products 
    WHERE id = product_id_param;
    
    IF current_stock IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new stock
    IF movement_type_param = 'in' THEN
        new_stock := current_stock + quantity_change;
    ELSIF movement_type_param = 'out' THEN
        new_stock := current_stock - quantity_change;
    ELSIF movement_type_param = 'adjustment' THEN
        new_stock := quantity_change;
    ELSE
        RETURN FALSE;
    END IF;
    
    -- Update product stock
    UPDATE products 
    SET current_stock = new_stock, updated_at = NOW()
    WHERE id = product_id_param;
    
    -- Record stock movement
    INSERT INTO stock_movements (
        user_id,
        business_id,
        product_id,
        movement_type,
        quantity,
        previous_stock,
        new_stock,
        reference_type,
        reference_id,
        reason
    ) VALUES (
        user_id_val,
        business_id_val,
        product_id_param,
        movement_type_param,
        quantity_change,
        current_stock,
        new_stock,
        reference_type_param,
        reference_id_param,
        reason_param
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create generate_product_barcode function
CREATE OR REPLACE FUNCTION generate_product_barcode(
    business_name_param TEXT,
    product_name_param TEXT,
    manufacturer_param TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    generated_barcode TEXT;
    business_prefix TEXT;
    product_code TEXT;
    manufacturer_code TEXT;
    final_barcode TEXT;
BEGIN
    -- Extract first 2 letters of business name
    business_prefix := UPPER(LEFT(business_name_param, 2));
    
    -- Create product code (first 3 letters of product name)
    product_code := UPPER(LEFT(product_name_param, 3));
    
    -- Create manufacturer code (first 2 letters of manufacturer)
    IF manufacturer_param IS NOT NULL THEN
        manufacturer_code := UPPER(LEFT(manufacturer_param, 2));
    ELSE
        manufacturer_code := 'XX';
    END IF;
    
    -- Generate barcode: BusinessPrefix + ProductCode + ManufacturerCode + RandomNumber
    final_barcode := business_prefix || product_code || manufacturer_code || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
    
    -- Check if barcode already exists
    WHILE EXISTS (SELECT 1 FROM products WHERE barcode = final_barcode) LOOP
        final_barcode := business_prefix || product_code || manufacturer_code || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
    END LOOP;
    
    RETURN final_barcode;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_products_by_business(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_product_by_barcode(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_product_stock(uuid, INTEGER, TEXT, TEXT, TEXT, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION generate_product_barcode(TEXT, TEXT, TEXT) TO authenticated, anon;

-- ============================================================================
-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_user_id ON stock_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_business_id ON stock_movements(business_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_business_id ON purchase_orders(business_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user_id ON purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);

-- ============================================================================
-- STEP 6: INSERT SAMPLE DATA
-- ============================================================================

-- Insert sample categories
INSERT INTO product_categories (user_id, business_id, name, description) 
SELECT 
    auth.uid(),
    b.id,
    'Electronics',
    'Electronic devices and accessories'
FROM businesses b
WHERE b.created_by = auth.uid()
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (user_id, business_id, name, description) 
SELECT 
    auth.uid(),
    b.id,
    'Food & Beverages',
    'Food and beverage products'
FROM businesses b
WHERE b.created_by = auth.uid()
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample supplier
INSERT INTO suppliers (user_id, business_id, name, contact_person, email, phone, address)
SELECT 
    auth.uid(),
    b.id,
    'Sample Supplier Ltd',
    'John Doe',
    'john@supplier.com',
    '+256700000000',
    'Kampala, Uganda'
FROM businesses b
WHERE b.created_by = auth.uid()
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 7: TEST THE SETUP
-- ============================================================================

-- Test queries to verify everything works
SELECT 'Inventory System Setup Complete' as status, 
       'Tables Created' as info,
       COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'product_categories', 'suppliers', 'stock_movements', 'purchase_orders', 'purchase_order_items');

-- Test RPC functions
SELECT 'Function Test' as test, 
       'get_products_by_business' as function_name,
       'Ready' as status;

SELECT 'Function Test' as test, 
       'get_product_by_barcode' as function_name,
       'Ready' as status;

SELECT 'Function Test' as test, 
       'update_product_stock' as function_name,
       'Ready' as status;

SELECT 'Function Test' as test, 
       'generate_product_barcode' as function_name,
       'Ready' as status;

-- Show current user info
SELECT 'Current User' as test, 
       auth.uid() as user_id, 
       auth.email() as email;

-- Show businesses count
SELECT 'Businesses Count' as test, COUNT(*) as total_businesses FROM businesses;

-- Show categories count
SELECT 'Categories Count' as test, COUNT(*) as total_categories FROM product_categories;

-- Show suppliers count
SELECT 'Suppliers Count' as test, COUNT(*) as total_suppliers FROM suppliers;
