-- Fix Products Table RLS Issues
-- Run this after the business setup

-- Ensure products table exists
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    category VARCHAR(100),
    brand VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'piece',
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

-- Create permissive RLS policies for products
CREATE POLICY "Users can view own products" ON products
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own products" ON products
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own products" ON products
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own products" ON products
    FOR DELETE USING (user_id = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Insert sample products data for testing
INSERT INTO products (
    user_id, 
    name, 
    description, 
    sku, 
    price, 
    cost, 
    stock_quantity, 
    category, 
    brand
) VALUES (
    '3488046f-56cf-4711-9045-7e6e158a1c91',
    'Samsung Galaxy A54',
    'Latest Samsung smartphone with 5G connectivity',
    'SAM-A54-128',
    500000.00,
    400000.00,
    10,
    'Electronics',
    'Samsung'
), (
    '3488046f-56cf-4711-9045-7e6e158a1c91',
    'iPhone 15 Pro',
    'Apple iPhone 15 Pro with titanium design',
    'APP-IP15P-256',
    4500000.00,
    4000000.00,
    5,
    'Electronics',
    'Apple'
), (
    '3488046f-56cf-4711-9045-7e6e158a1c91',
    'MacBook Air M2',
    'Apple MacBook Air with M2 chip',
    'APP-MBA-M2-256',
    8000000.00,
    7000000.00,
    3,
    'Computers',
    'Apple'
), (
    '3488046f-56cf-4711-9045-7e6e158a1c91',
    'Dell XPS 13',
    'Dell XPS 13 laptop with Intel i7',
    'DEL-XPS13-I7',
    6000000.00,
    5000000.00,
    2,
    'Computers',
    'Dell'
) ON CONFLICT DO NOTHING;


