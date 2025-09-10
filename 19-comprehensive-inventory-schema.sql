-- Comprehensive Inventory Tracking System Schema
-- This file updates the products table with all 17 required fields

-- First, let's add the new columns to the existing products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_grams INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_value DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_unit TEXT CHECK (size_unit IN ('ml', 'grams', 'kg', 'liters', 'pieces', 'boxes', 'packs'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity_per_carton INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS buying_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS carton_discount DECIMAL(5,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity_bought_cartons INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS current_stock_units INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS current_stock_cartons INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_contact TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS how_sold TEXT CHECK (how_sold IN ('Standard Sizes', 'Carton Only', 'Both')) DEFAULT 'Both';
ALTER TABLE products ADD COLUMN IF NOT EXISTS units_sold INTEGER DEFAULT 0;

-- Update existing columns to match new requirements
ALTER TABLE products ALTER COLUMN name SET NOT NULL;
ALTER TABLE products ALTER COLUMN price TYPE DECIMAL(10,2);
ALTER TABLE products ALTER COLUMN cost TYPE DECIMAL(10,2);

-- Create a function to auto-generate product codes
CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    counter INTEGER;
BEGIN
    -- Get the next available number
    SELECT COALESCE(MAX(CAST(SUBSTRING(product_code FROM '^PROD-(\d+)$') AS INTEGER)), 0) + 1
    INTO counter
    FROM products
    WHERE product_code ~ '^PROD-\d+$';
    
    -- Format as PROD-000001
    new_code := 'PROD-' || LPAD(counter::TEXT, 6, '0');
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate current stock levels
CREATE OR REPLACE FUNCTION calculate_stock_levels()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate current stock in units and cartons
    NEW.current_stock_units := NEW.stock;
    NEW.current_stock_cartons := CASE 
        WHEN NEW.quantity_per_carton > 0 THEN NEW.stock / NEW.quantity_per_carton
        ELSE 0
    END;
    
    -- Auto-generate product code if not provided
    IF NEW.product_code IS NULL OR NEW.product_code = '' THEN
        NEW.product_code := generate_product_code();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate stock levels
DROP TRIGGER IF EXISTS calculate_stock_trigger ON products;
CREATE TRIGGER calculate_stock_trigger
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION calculate_stock_levels();

-- Create a function to update units sold from sales
CREATE OR REPLACE FUNCTION update_units_sold()
RETURNS TRIGGER AS $$
BEGIN
    -- Update units sold for the product
    UPDATE products 
    SET units_sold = units_sold + NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Update stock level
    UPDATE products 
    SET stock = stock - NEW.quantity,
        current_stock_units = stock - NEW.quantity,
        current_stock_cartons = CASE 
            WHEN quantity_per_carton > 0 THEN (stock - NEW.quantity) / quantity_per_carton
            ELSE 0
        END
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update units sold when sale items are added
DROP TRIGGER IF EXISTS update_units_sold_trigger ON sale_items;
CREATE TRIGGER update_units_sold_trigger
    AFTER INSERT ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_units_sold();

-- Create a view for comprehensive inventory reporting
CREATE OR REPLACE VIEW inventory_comprehensive AS
SELECT 
    p.id,
    p.product_code,
    p.name,
    c.name as category,
    p.weight_grams,
    p.size_value,
    p.size_unit,
    p.quantity_per_carton,
    p.buying_price,
    p.selling_price,
    p.carton_discount,
    p.quantity_bought_cartons,
    p.current_stock_units,
    p.current_stock_cartons,
    p.reorder_level,
    p.purchase_date,
    p.expiry_date,
    p.supplier_name,
    p.supplier_contact,
    p.how_sold,
    p.units_sold,
    p.min_stock,
    CASE 
        WHEN p.current_stock_units <= p.reorder_level THEN 'Low Stock'
        WHEN p.expiry_date IS NOT NULL AND p.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
        ELSE 'In Stock'
    END as stock_status,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(current_stock_units, reorder_level);
CREATE INDEX IF NOT EXISTS idx_products_expiry ON products(expiry_date);

-- Insert sample categories if they don't exist
INSERT INTO categories (name, description, user_id) 
SELECT 'Beverages', 'Soft drinks, juices, water, etc.', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Beverages');

INSERT INTO categories (name, description, user_id) 
SELECT 'Snacks', 'Chips, cookies, candies, etc.', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Snacks');

INSERT INTO categories (name, description, user_id) 
SELECT 'Detergents', 'Soap, detergent, cleaning products', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Detergents');

INSERT INTO categories (name, description, user_id) 
SELECT 'Toiletries', 'Personal care products', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Toiletries');

INSERT INTO categories (name, description, user_id) 
SELECT 'Food Items', 'Rice, beans, cooking oil, etc.', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Food Items');

-- Grant permissions
GRANT ALL ON products TO anon;
GRANT ALL ON products TO authenticated;
GRANT ALL ON categories TO anon;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON suppliers TO anon;
GRANT ALL ON suppliers TO authenticated;
GRANT SELECT ON inventory_comprehensive TO anon;
GRANT SELECT ON inventory_comprehensive TO authenticated;
