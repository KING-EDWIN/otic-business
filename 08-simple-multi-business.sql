-- Simple Multi-Business Tables
-- Copy the exact pattern from existing working tables

-- 1. Create businesses table (copying user_profiles pattern)
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    business_type VARCHAR(100) NOT NULL,
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
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Create business_memberships table (copying user_subscriptions pattern)
CREATE TABLE IF NOT EXISTS business_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- 3. Update business_invitations table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'business_invitations' 
                   AND column_name = 'email' 
                   AND table_schema = 'public') THEN
        ALTER TABLE business_invitations ADD COLUMN email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'business_invitations' 
                   AND column_name = 'token' 
                   AND table_schema = 'public') THEN
        ALTER TABLE business_invitations ADD COLUMN token VARCHAR(255) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'business_invitations' 
                   AND column_name = 'permissions' 
                   AND table_schema = 'public') THEN
        ALTER TABLE business_invitations ADD COLUMN permissions JSONB DEFAULT '{}';
    END IF;
END $$;

-- 4. Create business_switches table
CREATE TABLE IF NOT EXISTS business_switches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    switched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- 5. Create indexes
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

-- 6. Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_switches ENABLE ROW LEVEL SECURITY;

-- 7. Create simple RLS policies (start with basic ones that work)
-- Allow all operations for now (we'll restrict later)
CREATE POLICY "Allow all operations on businesses" ON businesses FOR ALL USING (true);
CREATE POLICY "Allow all operations on business_memberships" ON business_memberships FOR ALL USING (true);
CREATE POLICY "Allow all operations on business_invitations" ON business_invitations FOR ALL USING (true);
CREATE POLICY "Allow all operations on business_switches" ON business_switches FOR ALL USING (true);

-- 8. Create basic functions
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

-- 9. Create triggers
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
