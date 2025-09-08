-- Simple RLS Fix for Testing
-- Run this in your Supabase SQL Editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Demo user can access demo data" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;
DROP POLICY IF EXISTS "Demo user can access demo products" ON products;

DROP POLICY IF EXISTS "Users can view own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert own sales" ON sales;
DROP POLICY IF EXISTS "Users can update own sales" ON sales;
DROP POLICY IF EXISTS "Demo user can access demo sales" ON sales;

DROP POLICY IF EXISTS "Users can view own sale_items" ON sale_items;
DROP POLICY IF EXISTS "Users can insert own sale_items" ON sale_items;
DROP POLICY IF EXISTS "Users can update own sale_items" ON sale_items;
DROP POLICY IF EXISTS "Demo user can access demo sale_items" ON sale_items;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Demo user can access demo subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_data;
DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics_data;
DROP POLICY IF EXISTS "Users can update own analytics" ON analytics_data;
DROP POLICY IF EXISTS "Demo user can access demo analytics" ON analytics_data;

DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
DROP POLICY IF EXISTS "Demo user can access demo categories" ON categories;

DROP POLICY IF EXISTS "Users can view own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Demo user can access demo suppliers" ON suppliers;

-- Create simple, permissive policies for testing
CREATE POLICY "Allow all operations on user_profiles" ON user_profiles
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on products" ON products
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on sales" ON sales
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on sale_items" ON sale_items
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on subscriptions" ON subscriptions
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on analytics_data" ON analytics_data
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on categories" ON categories
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on suppliers" ON suppliers
  FOR ALL USING (true);

-- Update user_tier enum to include free_trial
ALTER TYPE user_tier ADD VALUE IF NOT EXISTS 'free_trial';

-- Update subscription_status enum to include trial
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'trial';



