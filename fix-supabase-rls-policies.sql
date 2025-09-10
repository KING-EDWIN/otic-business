-- Fix Supabase RLS Policies for Otic Business
-- Run this in your Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

DROP POLICY IF EXISTS "Users can view own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert own sales" ON sales;
DROP POLICY IF EXISTS "Users can update own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete own sales" ON sales;

DROP POLICY IF EXISTS "Users can view own sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can insert own sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can update own sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can delete own sale items" ON sale_items;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users can view own payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Users can insert own payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Users can update own payment requests" ON payment_requests;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for products
CREATE POLICY "Users can view own products" ON products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for sales
CREATE POLICY "Users can view own sales" ON sales
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales" ON sales
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales" ON sales
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales" ON sales
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for sale_items
CREATE POLICY "Users can view own sale items" ON sale_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sales 
            WHERE sales.id = sale_items.sale_id 
            AND sales.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own sale items" ON sale_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sales 
            WHERE sales.id = sale_items.sale_id 
            AND sales.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own sale items" ON sale_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM sales 
            WHERE sales.id = sale_items.sale_id 
            AND sales.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own sale items" ON sale_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM sales 
            WHERE sales.id = sale_items.sale_id 
            AND sales.user_id = auth.uid()
        )
    );

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for payment_requests
CREATE POLICY "Users can view own payment requests" ON payment_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment requests" ON payment_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment requests" ON payment_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure the auth.uid() function is available
-- This should already exist in Supabase, but let's make sure
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.sub', true),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
  )::uuid
$$;
