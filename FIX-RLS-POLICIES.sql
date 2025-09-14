-- FIX RLS POLICIES - Comprehensive fix for all tables
-- Run this script in Supabase SQL editor

-- 1. Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view businesses they own" ON businesses;
DROP POLICY IF EXISTS "Users can view businesses they are members of" ON businesses;
DROP POLICY IF EXISTS "Users can view own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Users can view invitations for their businesses" ON business_invitations;

-- 3. Create proper RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Create proper RLS policies for businesses
CREATE POLICY "Users can view businesses they are members of" ON businesses
    FOR SELECT USING (
        id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

CREATE POLICY "Users can update businesses they own" ON businesses
    FOR UPDATE USING (
        id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND role = 'owner'
            AND status = 'active'
        )
    );

CREATE POLICY "Users can insert businesses" ON businesses
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 5. Create proper RLS policies for business_memberships
CREATE POLICY "Users can view own memberships" ON business_memberships
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view memberships for their businesses" ON business_memberships
    FOR SELECT USING (
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

CREATE POLICY "Users can insert memberships for their businesses" ON business_memberships
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

CREATE POLICY "Users can update memberships for their businesses" ON business_memberships
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- 6. Create proper RLS policies for business_invitations
CREATE POLICY "Users can view invitations for their businesses" ON business_invitations
    FOR SELECT USING (
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

CREATE POLICY "Users can insert invitations for their businesses" ON business_invitations
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

CREATE POLICY "Users can update invitations for their businesses" ON business_invitations
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- 7. Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 8. Test the policies
SELECT 'RLS policies created successfully!' as status;

-- 9. Test with a specific user
SELECT * FROM get_user_businesses('3488046f-56cf-4711-9045-7e6e158a1c91');
