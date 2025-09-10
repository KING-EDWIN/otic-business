-- Multi-Business Management Tables
-- This file creates tables to support multiple business management for Enterprise Advantage tier users

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    business_type VARCHAR(100) NOT NULL, -- 'retail', 'restaurant', 'service', 'manufacturing', etc.
    industry VARCHAR(100),
    website VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(100),
    registration_number VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    logo_url TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create business_memberships table to link users to businesses
CREATE TABLE IF NOT EXISTS business_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'owner', 'admin', 'manager', 'employee', 'viewer'
    permissions JSONB DEFAULT '{}', -- Custom permissions for the user in this business
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'pending', 'suspended'
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- Create business_invitations table for inviting users to businesses
CREATE TABLE IF NOT EXISTS business_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
    token VARCHAR(255) UNIQUE NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_switches table to track business context switches
CREATE TABLE IF NOT EXISTS business_switches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    switched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_created_by ON businesses(created_by);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_business_memberships_user_id ON business_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_business_memberships_business_id ON business_memberships(business_id);
CREATE INDEX IF NOT EXISTS idx_business_memberships_role ON business_memberships(role);
CREATE INDEX IF NOT EXISTS idx_business_invitations_email ON business_invitations(email);
CREATE INDEX IF NOT EXISTS idx_business_invitations_token ON business_invitations(token);
CREATE INDEX IF NOT EXISTS idx_business_invitations_status ON business_invitations(status);
CREATE INDEX IF NOT EXISTS idx_business_switches_user_id ON business_switches(user_id);
CREATE INDEX IF NOT EXISTS idx_business_switches_business_id ON business_switches(business_id);

-- Create RLS policies for businesses table
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view businesses they are members of
CREATE POLICY "Users can view businesses they are members of" ON businesses
    FOR SELECT USING (
        id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Policy: Users can insert businesses if they have Enterprise Advantage tier
CREATE POLICY "Enterprise users can create businesses" ON businesses
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM user_subscriptions us
            JOIN tiers t ON us.tier_id = t.id
            WHERE us.user_id = auth.uid()
            AND t.name = 'enterprise_advantage'
            AND us.status = 'active'
        )
    );

-- Policy: Business owners can update their businesses
CREATE POLICY "Business owners can update their businesses" ON businesses
    FOR UPDATE USING (
        created_by = auth.uid() OR
        id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Create RLS policies for business_memberships table
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own memberships
CREATE POLICY "Users can view their own memberships" ON business_memberships
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Business owners/admins can view all memberships for their businesses
CREATE POLICY "Business owners can view memberships" ON business_memberships
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses 
            WHERE created_by = auth.uid()
        ) OR
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Policy: Business owners can manage memberships
CREATE POLICY "Business owners can manage memberships" ON business_memberships
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses 
            WHERE created_by = auth.uid()
        ) OR
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Create RLS policies for business_invitations table
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Business owners can manage invitations
CREATE POLICY "Business owners can manage invitations" ON business_invitations
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses 
            WHERE created_by = auth.uid()
        ) OR
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Create RLS policies for business_switches table
ALTER TABLE business_switches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own business switches
CREATE POLICY "Users can view their own switches" ON business_switches
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Users can insert their own business switches
CREATE POLICY "Users can insert their own switches" ON business_switches
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        business_id IN (
            SELECT business_id 
            FROM business_memberships 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Create functions for business management
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

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_memberships_updated_at
    BEFORE UPDATE ON business_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_invitations_updated_at
    BEFORE UPDATE ON business_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
