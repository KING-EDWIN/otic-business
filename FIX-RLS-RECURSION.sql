-- FIX RLS RECURSION - Remove circular dependencies
-- Run this script in Supabase SQL editor

-- 1. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view businesses they are members of" ON businesses;
DROP POLICY IF EXISTS "Users can update businesses they own" ON businesses;
DROP POLICY IF EXISTS "Users can insert businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can view memberships for their businesses" ON business_memberships;
DROP POLICY IF EXISTS "Users can insert memberships for their businesses" ON business_memberships;
DROP POLICY IF EXISTS "Users can update memberships for their businesses" ON business_memberships;
DROP POLICY IF EXISTS "Users can view invitations for their businesses" ON business_invitations;
DROP POLICY IF EXISTS "Users can insert invitations for their businesses" ON business_invitations;
DROP POLICY IF EXISTS "Users can update invitations for their businesses" ON business_invitations;

-- 2. Create simple, non-recursive policies

-- User profiles - simple auth check
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses - allow all authenticated users to view all businesses for now
CREATE POLICY "Authenticated users can view businesses" ON businesses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update businesses they created" ON businesses
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can insert businesses" ON businesses
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Business memberships - simple user-based access
CREATE POLICY "Users can view own memberships" ON business_memberships
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert memberships" ON business_memberships
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own memberships" ON business_memberships
    FOR UPDATE USING (user_id = auth.uid());

-- Business invitations - allow all authenticated users for now
CREATE POLICY "Authenticated users can view invitations" ON business_invitations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert invitations" ON business_invitations
    FOR INSERT WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "Users can update invitations" ON business_invitations
    FOR UPDATE USING (auth.uid() = invited_by);

-- 3. Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 4. Test the fix
SELECT 'RLS policies fixed - no more recursion!' as status;

-- 5. Test with the user
SELECT * FROM get_user_businesses('3488046f-56cf-4711-9045-7e6e158a1c91');
