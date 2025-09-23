-- Fix Sales Table - Run this in Supabase SQL Editor

-- First, check if sales table exists and what columns it has
-- If it doesn't exist, create it with the correct structure

-- Create sales table if it doesn't exist
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID,
    product_id UUID,
    customer_id UUID,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add sale_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'sale_date') THEN
        ALTER TABLE sales ADD COLUMN sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Enable RLS on sales table
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert own sales" ON sales;
DROP POLICY IF EXISTS "Users can update own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete own sales" ON sales;

-- Create permissive RLS policies for sales
CREATE POLICY "Users can view own sales" ON sales
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sales" ON sales
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sales" ON sales
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sales" ON sales
    FOR DELETE USING (user_id = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);

-- Insert sample sales data for testing
INSERT INTO sales (
    user_id, 
    product_id, 
    quantity, 
    unit_price, 
    total_amount, 
    payment_method, 
    payment_status,
    sale_date
) VALUES (
    '3488046f-56cf-4711-9045-7e6e158a1c91',
    '550e8400-e29b-41d4-a716-446655440002',
    2,
    50000.00,
    100000.00,
    'cash',
    'completed',
    NOW() - INTERVAL '1 day'
), (
    '3488046f-56cf-4711-9045-7e6e158a1c91',
    '550e8400-e29b-41d4-a716-446655440003',
    1,
    25000.00,
    25000.00,
    'mobile_money',
    'completed',
    NOW() - INTERVAL '2 days'
), (
    '3488046f-56cf-4711-9045-7e6e158a1c91',
    '550e8400-e29b-41d4-a716-446655440004',
    3,
    15000.00,
    45000.00,
    'cash',
    'completed',
    NOW() - INTERVAL '3 days'
) ON CONFLICT DO NOTHING;





