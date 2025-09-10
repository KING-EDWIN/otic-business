-- Create tables without foreign key references first
-- This avoids the individual_id column error

-- Step 1: Create business_invitations table WITHOUT foreign key constraints
CREATE TABLE IF NOT EXISTS public.business_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID, -- No foreign key constraint yet
    individual_id UUID, -- No foreign key constraint yet
    invitation_type TEXT NOT NULL, -- 'consultation', 'employment', 'partnership'
    role_title TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, individual_id, invitation_type)
);

-- Step 2: Create professional_services table WITHOUT foreign key constraints
CREATE TABLE IF NOT EXISTS public.professional_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    individual_id UUID, -- No foreign key constraint yet
    service_name TEXT NOT NULL,
    service_description TEXT,
    service_category TEXT NOT NULL, -- 'accounting', 'consulting', 'training', etc.
    hourly_rate DECIMAL(10,2),
    fixed_rate DECIMAL(10,2),
    currency TEXT DEFAULT 'UGX',
    duration_hours INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create business_relationships table WITHOUT foreign key constraints
CREATE TABLE IF NOT EXISTS public.business_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    individual_id UUID, -- No foreign key constraint yet
    business_id UUID, -- No foreign key constraint yet
    relationship_type TEXT NOT NULL, -- 'manager', 'consultant', 'employee', 'advisor'
    role_title TEXT,
    permissions TEXT[], -- Array of permissions
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(individual_id, business_id)
);

-- Step 4: Enable RLS on all tables
ALTER TABLE public.business_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_relationships ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies (these don't need foreign key constraints)
-- Business invitations policies
DROP POLICY IF EXISTS "Users can view invitations they sent or received" ON public.business_invitations;
CREATE POLICY "Users can view invitations they sent or received" ON public.business_invitations
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = business_id OR 
        auth.uid() = individual_id
    );

DROP POLICY IF EXISTS "Businesses can create invitations" ON public.business_invitations;
CREATE POLICY "Businesses can create invitations" ON public.business_invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = business_id);

DROP POLICY IF EXISTS "Users can update invitations they sent or received" ON public.business_invitations;
CREATE POLICY "Users can update invitations they sent or received" ON public.business_invitations
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = business_id OR 
        auth.uid() = individual_id
    )
    WITH CHECK (
        auth.uid() = business_id OR 
        auth.uid() = individual_id
    );

-- Professional services policies
DROP POLICY IF EXISTS "Individuals can manage their own services" ON public.professional_services;
CREATE POLICY "Individuals can manage their own services" ON public.professional_services
    FOR ALL
    TO authenticated
    USING (auth.uid() = individual_id)
    WITH CHECK (auth.uid() = individual_id);

-- Business relationships policies
DROP POLICY IF EXISTS "Users can view relationships they're involved in" ON public.business_relationships;
CREATE POLICY "Users can view relationships they're involved in" ON public.business_relationships
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = individual_id OR 
        auth.uid() = business_id
    );

DROP POLICY IF EXISTS "Users can create relationships they're involved in" ON public.business_relationships;
CREATE POLICY "Users can create relationships they're involved in" ON public.business_relationships
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = individual_id OR 
        auth.uid() = business_id
    );

DROP POLICY IF EXISTS "Users can update relationships they're involved in" ON public.business_relationships;
CREATE POLICY "Users can update relationships they're involved in" ON public.business_relationships
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = individual_id OR 
        auth.uid() = business_id
    )
    WITH CHECK (
        auth.uid() = individual_id OR 
        auth.uid() = business_id
    );

-- Step 6: Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_business_invitations_updated_at ON public.business_invitations;
CREATE TRIGGER update_business_invitations_updated_at 
    BEFORE UPDATE ON public.business_invitations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_professional_services_updated_at ON public.professional_services;
CREATE TRIGGER update_professional_services_updated_at 
    BEFORE UPDATE ON public.professional_services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_relationships_updated_at ON public.business_relationships;
CREATE TRIGGER update_business_relationships_updated_at 
    BEFORE UPDATE ON public.business_relationships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Add some sample data for testing
INSERT INTO public.business_invitations (
    business_id,
    individual_id,
    invitation_type,
    role_title,
    description,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'consultation',
    'Financial Consultant',
    'We need help with our financial planning and analysis.',
    'pending'
) ON CONFLICT (business_id, individual_id, invitation_type) DO NOTHING;

INSERT INTO public.professional_services (
    individual_id,
    service_name,
    service_description,
    service_category,
    hourly_rate,
    currency
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Financial Analysis',
    'Comprehensive financial analysis and reporting services',
    'accounting',
    50.00,
    'UGX'
) ON CONFLICT DO NOTHING;

-- Step 8: Verify all tables were created successfully
SELECT 
    'Tables created successfully without foreign keys' as status,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('individual_profiles', 'business_invitations', 'professional_services', 'business_relationships')
ORDER BY table_name;
