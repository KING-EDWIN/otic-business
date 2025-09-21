-- Fix Multi-Business Schema
-- Drop existing functions first to avoid conflicts

-- Drop existing functions
DROP FUNCTION IF EXISTS get_user_businesses(uuid);
DROP FUNCTION IF EXISTS can_create_business(uuid);
DROP FUNCTION IF EXISTS switch_business_context(uuid, uuid);
DROP FUNCTION IF EXISTS get_business_members(uuid);

-- Create business_roles enum
DO $$ BEGIN
    CREATE TYPE business_role AS ENUM ('owner', 'admin', 'manager', 'employee', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create business_status enum
DO $$ BEGIN
    CREATE TYPE business_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create invitation_status enum
DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create businesses table (enhanced)
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    country VARCHAR(100) DEFAULT 'Uganda',
    postal_code VARCHAR(20),
    tax_id VARCHAR(100),
    registration_number VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'UGX',
    timezone VARCHAR(50) DEFAULT 'Africa/Kampala',
    logo_url TEXT,
    status business_status DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create business_memberships table (enhanced)
CREATE TABLE IF NOT EXISTS business_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    role business_role NOT NULL DEFAULT 'employee',
    permissions JSONB DEFAULT '{}',
    status business_status DEFAULT 'active',
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- Create business_invitations table
CREATE TABLE IF NOT EXISTS business_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role business_role NOT NULL DEFAULT 'employee',
    permissions JSONB DEFAULT '{}',
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    status invitation_status DEFAULT 'pending',
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_switches table (audit log)
CREATE TABLE IF NOT EXISTS business_switches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    to_business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    switched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create business_settings table
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, setting_key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_created_by ON businesses(created_by);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_business_memberships_user_id ON business_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_business_memberships_business_id ON business_memberships(business_id);
CREATE INDEX IF NOT EXISTS idx_business_memberships_role ON business_memberships(role);
CREATE INDEX IF NOT EXISTS idx_business_invitations_email ON business_invitations(email);
CREATE INDEX IF NOT EXISTS idx_business_invitations_token ON business_invitations(token);
CREATE INDEX IF NOT EXISTS idx_business_invitations_status ON business_invitations(status);
CREATE INDEX IF NOT EXISTS idx_business_switches_user_id ON business_switches(user_id);
CREATE INDEX IF NOT EXISTS idx_business_settings_business_id ON business_settings(business_id);

-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_switches ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for businesses
DROP POLICY IF EXISTS "Users can view businesses they are members of" ON businesses;
CREATE POLICY "Users can view businesses they are members of" ON businesses
    FOR SELECT USING (
        id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create businesses" ON businesses;
CREATE POLICY "Users can create businesses" ON businesses
    FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Business owners can update their businesses" ON businesses;
CREATE POLICY "Business owners can update their businesses" ON businesses
    FOR UPDATE USING (
        id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

DROP POLICY IF EXISTS "Business owners can delete their businesses" ON businesses;
CREATE POLICY "Business owners can delete their businesses" ON businesses
    FOR DELETE USING (
        id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Create RLS policies for business_memberships
DROP POLICY IF EXISTS "Users can view their memberships" ON business_memberships;
CREATE POLICY "Users can view their memberships" ON business_memberships
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Business owners can manage memberships" ON business_memberships;
CREATE POLICY "Business owners can manage memberships" ON business_memberships
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Create RLS policies for business_invitations
DROP POLICY IF EXISTS "Users can view invitations for their businesses" ON business_invitations;
CREATE POLICY "Users can view invitations for their businesses" ON business_invitations
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS "Business owners can manage invitations" ON business_invitations;
CREATE POLICY "Business owners can manage invitations" ON business_invitations
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Create RLS policies for business_switches
DROP POLICY IF EXISTS "Users can view their own switches" ON business_switches;
CREATE POLICY "Users can view their own switches" ON business_switches
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create switches" ON business_switches;
CREATE POLICY "Users can create switches" ON business_switches
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for business_settings
DROP POLICY IF EXISTS "Business members can view settings" ON business_settings;
CREATE POLICY "Business members can view settings" ON business_settings
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Business owners can manage settings" ON business_settings;
CREATE POLICY "Business owners can manage settings" ON business_settings
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM business_memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Create functions for business management
CREATE OR REPLACE FUNCTION get_user_businesses(user_id_param UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    business_type VARCHAR(100),
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
    currency VARCHAR(3),
    timezone VARCHAR(50),
    logo_url TEXT,
    status business_status,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    user_role business_role,
    joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id, b.name, b.description, b.business_type, b.industry, b.website, 
        b.phone, b.email, b.address, b.city, b.state, b.country, b.postal_code,
        b.tax_id, b.registration_number, b.currency, b.timezone, b.logo_url,
        b.status, b.settings, b.created_at, b.updated_at, b.created_by,
        bm.role, bm.joined_at
    FROM businesses b
    INNER JOIN business_memberships bm ON b.id = bm.business_id
    WHERE bm.user_id = user_id_param AND bm.status = 'active'
    ORDER BY bm.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_businesses(UUID) TO anon, authenticated;

-- Create function to check if user can create business
CREATE OR REPLACE FUNCTION can_create_business(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    business_count INTEGER;
    user_tier TEXT;
BEGIN
    -- Get user's current tier
    SELECT tier INTO user_tier
    FROM user_profiles
    WHERE id = user_id_param;
    
    -- Count existing businesses
    SELECT COUNT(*) INTO business_count
    FROM business_memberships
    WHERE user_id = user_id_param AND role = 'owner';
    
    -- Check tier limits
    CASE user_tier
        WHEN 'free_trial' THEN RETURN business_count < 1;
        WHEN 'start_smart' THEN RETURN business_count < 2;
        WHEN 'grow_intelligence' THEN RETURN business_count < 5;
        WHEN 'enterprise_advantage' THEN RETURN business_count < 20;
        ELSE RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION can_create_business(UUID) TO anon, authenticated;

-- Create function to switch business context
CREATE OR REPLACE FUNCTION switch_business_context(
    user_id_param UUID,
    business_id_param UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    membership_exists BOOLEAN;
BEGIN
    -- Check if user is a member of the business
    SELECT EXISTS(
        SELECT 1 FROM business_memberships 
        WHERE user_id = user_id_param 
        AND business_id = business_id_param 
        AND status = 'active'
    ) INTO membership_exists;
    
    IF NOT membership_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Log the switch
    INSERT INTO business_switches (user_id, to_business_id)
    VALUES (user_id_param, business_id_param);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION switch_business_context(UUID, UUID) TO anon, authenticated;

-- Create function to get business members
CREATE OR REPLACE FUNCTION get_business_members(business_id_param UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email TEXT,
    full_name TEXT,
    business_name TEXT,
    role business_role,
    status business_status,
    joined_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bm.id,
        bm.user_id,
        up.email,
        up.full_name,
        up.business_name,
        bm.role,
        bm.status,
        bm.joined_at,
        bm.invited_by
    FROM business_memberships bm
    LEFT JOIN user_profiles up ON bm.user_id = up.id
    WHERE bm.business_id = business_id_param
    ORDER BY bm.role DESC, bm.joined_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_business_members(UUID) TO anon, authenticated;

-- Insert sample data for testing
INSERT INTO businesses (
    id, name, description, business_type, industry, email, phone, address, 
    city, country, created_by
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Demo Electronics Store',
    'Leading electronics retailer in Kampala',
    'retail',
    'electronics',
    'info@demo-electronics.com',
    '+256 700 123 456',
    'Shop 15, Kampala Road',
    'Kampala',
    'Uganda',
    '3488046f-56cf-4711-9045-7e6e158a1c91'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO business_memberships (
    user_id, business_id, role, status, joined_at
) VALUES (
    '3488046f-56cf-4711-9045-7e6e158a1c91',
    '550e8400-e29b-41d4-a716-446655440001',
    'owner',
    'active',
    NOW()
) ON CONFLICT (user_id, business_id) DO NOTHING;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_memberships_updated_at ON business_memberships;
CREATE TRIGGER update_business_memberships_updated_at
    BEFORE UPDATE ON business_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_invitations_updated_at ON business_invitations;
CREATE TRIGGER update_business_invitations_updated_at
    BEFORE UPDATE ON business_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_settings_updated_at ON business_settings;
CREATE TRIGGER update_business_settings_updated_at
    BEFORE UPDATE ON business_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();




