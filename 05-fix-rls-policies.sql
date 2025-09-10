-- Fix RLS Policies with proper type casting
-- This file fixes the type mismatch errors in the RLS policies

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view businesses they are members of" ON businesses;
DROP POLICY IF EXISTS "Enterprise users can create businesses" ON businesses;
DROP POLICY IF EXISTS "Business owners can update their businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view their own memberships" ON business_memberships;
DROP POLICY IF EXISTS "Business owners can view memberships" ON business_memberships;
DROP POLICY IF EXISTS "Business owners can manage memberships" ON business_memberships;
DROP POLICY IF EXISTS "Business owners can manage invitations" ON business_invitations;
DROP POLICY IF EXISTS "Users can view their own switches" ON business_switches;
DROP POLICY IF EXISTS "Users can insert their own switches" ON business_switches;

-- Recreate RLS policies with proper type casting
-- Policy: Users can view businesses they are members of
CREATE POLICY "Users can view businesses they are members of" ON businesses
    FOR SELECT USING (
        id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid()::uuid
            AND status = 'active'
        )
    );

-- Policy: Users can insert businesses if they have Enterprise Advantage tier
CREATE POLICY "Enterprise users can create businesses" ON businesses
    FOR INSERT WITH CHECK (
        auth.uid()::uuid = created_by AND
        EXISTS (
            SELECT 1 FROM user_subscriptions us
            JOIN tiers t ON us.tier_id = t.id
            WHERE us.user_id = auth.uid()::uuid
            AND t.name = 'enterprise_advantage'
            AND us.status = 'active'
        )
    );

-- Policy: Business owners can update their businesses
CREATE POLICY "Business owners can update their businesses" ON businesses
    FOR UPDATE USING (
        auth.uid()::uuid = created_by OR
        id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid()::uuid
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Policy: Users can view their own memberships
CREATE POLICY "Users can view their own memberships" ON business_memberships
    FOR SELECT USING (user_id = auth.uid()::uuid);

-- Policy: Business owners/admins can view all memberships for their businesses
CREATE POLICY "Business owners can view memberships" ON business_memberships
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses 
            WHERE created_by = auth.uid()::uuid
        ) OR
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid()::uuid
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Policy: Business owners can manage memberships
CREATE POLICY "Business owners can manage memberships" ON business_memberships
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses 
            WHERE created_by = auth.uid()::uuid
        ) OR
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid()::uuid
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Policy: Business owners can manage invitations
CREATE POLICY "Business owners can manage invitations" ON business_invitations
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses 
            WHERE created_by = auth.uid()::uuid
        ) OR
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid()::uuid
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Policy: Users can view their own business switches
CREATE POLICY "Users can view their own switches" ON business_switches
    FOR SELECT USING (user_id = auth.uid()::uuid);

-- Policy: Users can insert their own business switches
CREATE POLICY "Users can insert their own switches" ON business_switches
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::uuid AND
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid()::uuid
            AND status = 'active'
        )
    );

-- Also fix the functions to use proper type casting
CREATE OR REPLACE FUNCTION get_user_businesses(user_uuid UUID)
RETURNS TABLE (
    business_id UUID,
    business_name VARCHAR(255),
    role VARCHAR(50),
    permissions JSONB,
    joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as business_id,
        b.name as business_name,
        bm.role,
        bm.permissions,
        bm.joined_at
    FROM businesses b
    JOIN business_memberships bm ON b.id = bm.business_id
    WHERE bm.user_id = user_uuid
    AND bm.status = 'active'
    AND b.status = 'active'
    ORDER BY bm.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create businesses
CREATE OR REPLACE FUNCTION can_create_business(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_subscriptions us
        JOIN tiers t ON us.tier_id = t.id
        WHERE us.user_id = user_uuid
        AND t.name = 'enterprise_advantage'
        AND us.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get business members
CREATE OR REPLACE FUNCTION get_business_members(business_uuid UUID)
RETURNS TABLE (
    user_id UUID,
    email VARCHAR(255),
    full_name TEXT,
    role VARCHAR(50),
    status VARCHAR(20),
    joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.email,
        COALESCE(p.first_name || ' ' || p.last_name, u.email) as full_name,
        bm.role,
        bm.status,
        bm.joined_at
    FROM business_memberships bm
    JOIN auth.users u ON bm.user_id = u.id
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE bm.business_id = business_uuid
    ORDER BY bm.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
