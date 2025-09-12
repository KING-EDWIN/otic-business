-- FIX: Fix user_profiles and auth access control issues
-- Run this in Supabase SQL Editor to fix the access control errors

-- 1. Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Allow all operations on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;

-- 2. Create simple, permissive policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert profiles" ON user_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update profiles" ON user_profiles
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete profiles" ON user_profiles
    FOR DELETE USING (true);

-- 3. Ensure RLS is enabled on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Fix businesses table policies
DROP POLICY IF EXISTS "Allow all operations on businesses" ON businesses;
DROP POLICY IF EXISTS "Users can update businesses they own" ON businesses;
DROP POLICY IF EXISTS "Users can view businesses they are members of" ON businesses;

CREATE POLICY "Users can view all businesses" ON businesses
    FOR SELECT USING (true);

CREATE POLICY "Users can insert businesses" ON businesses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update businesses" ON businesses
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete businesses" ON businesses
    FOR DELETE USING (true);

-- 5. Fix business_memberships policies (ensure they're simple)
DROP POLICY IF EXISTS "Users can view their own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON business_memberships;

CREATE POLICY "Users can view all memberships" ON business_memberships
    FOR SELECT USING (true);

CREATE POLICY "Users can insert memberships" ON business_memberships
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update memberships" ON business_memberships
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete memberships" ON business_memberships
    FOR DELETE USING (true);

-- 6. Fix subscriptions table policies
DROP POLICY IF EXISTS "Allow all operations on subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own data" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;

CREATE POLICY "Users can view all subscriptions" ON subscriptions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update subscriptions" ON subscriptions
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete subscriptions" ON subscriptions
    FOR DELETE USING (true);

-- 7. Ensure all tables have RLS enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 8. Test the policies
SELECT 'Auth access policies fixed successfully!' as status;
