-- Quick RLS fix for Supabase Dashboard
-- Run this in the SQL Editor in Supabase Dashboard

-- Drop all existing policies
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON user_profiles;

DROP POLICY IF EXISTS "businesses_select" ON businesses;
DROP POLICY IF EXISTS "businesses_insert" ON businesses;
DROP POLICY IF EXISTS "businesses_update" ON businesses;
DROP POLICY IF EXISTS "businesses_delete" ON businesses;

DROP POLICY IF EXISTS "business_memberships_select" ON business_memberships;
DROP POLICY IF EXISTS "business_memberships_insert" ON business_memberships;
DROP POLICY IF EXISTS "business_memberships_update" ON business_memberships;
DROP POLICY IF EXISTS "business_memberships_delete" ON business_memberships;

DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;

-- Create simple permissive policies
CREATE POLICY "user_profiles_all" ON user_profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "businesses_all" ON businesses FOR ALL TO authenticated USING (true);
CREATE POLICY "business_memberships_all" ON business_memberships FOR ALL TO authenticated USING (true);
CREATE POLICY "products_all" ON products FOR ALL TO authenticated USING (true);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

SELECT 'RLS policies updated successfully' as status;
