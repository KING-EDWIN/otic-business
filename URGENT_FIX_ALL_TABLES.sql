-- URGENT FIX: Create all missing tables and fix RLS policies
-- Run this immediately to fix all 404 errors

-- 1. Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create product_suppliers table
CREATE TABLE IF NOT EXISTS product_suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjustment'
    quantity_change INTEGER NOT NULL,
    cost_price DECIMAL(10,2),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ensure products table has all required columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES product_suppliers(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode_type VARCHAR(50) DEFAULT 'existing';
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS retail_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_stock INTEGER DEFAULT 1000;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_type VARCHAR(50) DEFAULT 'piece';
ALTER TABLE products ADD COLUMN IF NOT EXISTS items_per_package INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS package_type VARCHAR(50) DEFAULT 'individual';
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode_image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_product_categories_business_id ON product_categories(business_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_business_id ON product_suppliers(business_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_business_id ON stock_movements(business_id);

-- 6. Enable RLS on all tables
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for product_categories
DROP POLICY IF EXISTS "Users can view categories for their businesses" ON product_categories;
CREATE POLICY "Users can view categories for their businesses" ON product_categories
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert categories for their businesses" ON product_categories;
CREATE POLICY "Users can insert categories for their businesses" ON product_categories
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update categories for their businesses" ON product_categories;
CREATE POLICY "Users can update categories for their businesses" ON product_categories
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete categories for their businesses" ON product_categories;
CREATE POLICY "Users can delete categories for their businesses" ON product_categories
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

-- 8. Create RLS policies for product_suppliers
DROP POLICY IF EXISTS "Users can view suppliers for their businesses" ON product_suppliers;
CREATE POLICY "Users can view suppliers for their businesses" ON product_suppliers
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert suppliers for their businesses" ON product_suppliers;
CREATE POLICY "Users can insert suppliers for their businesses" ON product_suppliers
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update suppliers for their businesses" ON product_suppliers;
CREATE POLICY "Users can update suppliers for their businesses" ON product_suppliers
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete suppliers for their businesses" ON product_suppliers;
CREATE POLICY "Users can delete suppliers for their businesses" ON product_suppliers
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

-- 9. Create RLS policies for stock_movements
DROP POLICY IF EXISTS "Users can view stock movements for their businesses" ON stock_movements;
CREATE POLICY "Users can view stock movements for their businesses" ON stock_movements
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert stock movements for their businesses" ON stock_movements;
CREATE POLICY "Users can insert stock movements for their businesses" ON stock_movements
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

-- 10. Create RLS policies for products
DROP POLICY IF EXISTS "Users can view products for their businesses" ON products;
CREATE POLICY "Users can view products for their businesses" ON products
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert products for their businesses" ON products;
CREATE POLICY "Users can insert products for their businesses" ON products
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update products for their businesses" ON products;
CREATE POLICY "Users can update products for their businesses" ON products
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete products for their businesses" ON products;
CREATE POLICY "Users can delete products for their businesses" ON products
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

-- 11. Fix user_profiles RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 12. Create RPC functions for inventory management
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

CREATE OR REPLACE FUNCTION get_product_by_barcode(business_id_param UUID, barcode_param VARCHAR)
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
    WHERE p.business_id = business_id_param AND p.barcode = barcode_param;
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
    
    -- Check if user has access to this business
    IF NOT EXISTS (
        SELECT 1 FROM business_memberships 
        WHERE business_id = product_business_id 
        AND user_id = auth.uid()
    ) THEN
        RETURN FALSE;
    END IF;
    
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

CREATE OR REPLACE FUNCTION generate_product_barcode(
    business_name_param VARCHAR,
    product_name_param VARCHAR,
    manufacturer_param VARCHAR
)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    barcode_value VARCHAR;
BEGIN
    -- Generate a unique barcode based on business name, product name, and timestamp
    barcode_value := UPPER(LEFT(business_name_param, 2)) || 
                     UPPER(LEFT(product_name_param, 3)) || 
                     UPPER(LEFT(manufacturer_param, 2)) || 
                     EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
    
    -- Ensure barcode is unique
    WHILE EXISTS (SELECT 1 FROM products WHERE barcode = barcode_value) LOOP
        barcode_value := barcode_value || 'X';
    END LOOP;
    
    RETURN barcode_value;
END;
$$;

-- 13. Insert sample data
INSERT INTO product_categories (name, description, business_id) 
SELECT 'Beverages', 'Drinks and beverages', id FROM businesses LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (name, description, business_id) 
SELECT 'Snacks', 'Snacks and light foods', id FROM businesses LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (name, description, business_id) 
SELECT 'Detergents', 'Cleaning products', id FROM businesses LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (name, description, business_id) 
SELECT 'Toiletries', 'Personal care products', id FROM businesses LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (name, description, business_id) 
SELECT 'Food Items', 'Food and groceries', id FROM businesses LIMIT 1
ON CONFLICT DO NOTHING;

-- 14. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 15. Update table statistics
ANALYZE product_categories;
ANALYZE product_suppliers;
ANALYZE stock_movements;
ANALYZE products;

SELECT 'All tables created and RLS policies fixed successfully!' as status;
