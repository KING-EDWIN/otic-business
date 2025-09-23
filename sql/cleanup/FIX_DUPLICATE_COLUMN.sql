-- QUICK FIX: Remove duplicate barcode_image_url column
-- Run this if you get the duplicate column error

-- Drop the products table and recreate it without the duplicate column
DROP TABLE IF EXISTS products CASCADE;

-- Recreate products table without duplicate column
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
  
  -- Images (only one barcode_image_url column)
  product_image_url TEXT,
  barcode_image_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

SELECT 'Products table recreated successfully' as status;
