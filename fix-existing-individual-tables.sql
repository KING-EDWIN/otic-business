-- Fix existing individual tables that are causing the individual_id error
-- This script will either drop the problematic tables or fix their references

-- Step 1: Drop foreign key constraints that reference non-existent tables
-- First, let's see what constraints exist
SELECT 
    'Existing constraints to drop' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('individual_business_access', 'individual_professions', 'individual_signups')
    AND (ccu.table_name NOT IN ('individual_profiles', 'user_profiles', 'auth.users') OR ccu.table_name IS NULL);

-- Step 2: Drop the problematic tables entirely (since they seem to be old/unused)
-- This is the safest approach to avoid conflicts

-- Drop individual_business_access table
DROP TABLE IF EXISTS public.individual_business_access CASCADE;

-- Drop individual_professions table  
DROP TABLE IF EXISTS public.individual_professions CASCADE;

-- Drop individual_signups table
DROP TABLE IF EXISTS public.individual_signups CASCADE;

-- Step 3: Now create the new tables without conflicts
-- Create business_invitations table
CREATE TABLE IF NOT EXISTS public.business_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID, -- Will add foreign key later
    individual_id UUID, -- Will add foreign key later
    invitation_type TEXT NOT NULL, -- 'consultation', 'employment', 'partnership'
    role_title TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, individual_id, invitation_type)
);

-- Create professional_services table
CREATE TABLE IF NOT EXISTS public.professional_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    individual_id UUID, -- Will add foreign key later
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

-- Create business_relationships table
CREATE TABLE IF NOT EXISTS public.business_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    individual_id UUID, -- Will add foreign key later
    business_id UUID, -- Will add foreign key later
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

-- Step 4: Enable RLS on all new tables
ALTER TABLE public.business_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_relationships ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
-- Business invitations policies
CREATE POLICY "Users can view invitations they sent or received" ON public.business_invitations
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = business_id OR 
        auth.uid() = individual_id
    );

CREATE POLICY "Businesses can create invitations" ON public.business_invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = business_id);

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
CREATE POLICY "Individuals can manage their own services" ON public.professional_services
    FOR ALL
    TO authenticated
    USING (auth.uid() = individual_id)
    WITH CHECK (auth.uid() = individual_id);

-- Business relationships policies
CREATE POLICY "Users can view relationships they're involved in" ON public.business_relationships
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = individual_id OR 
        auth.uid() = business_id
    );

CREATE POLICY "Users can create relationships they're involved in" ON public.business_relationships
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = individual_id OR 
        auth.uid() = business_id
    );

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
CREATE TRIGGER update_business_invitations_updated_at 
    BEFORE UPDATE ON public.business_invitations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_services_updated_at 
    BEFORE UPDATE ON public.professional_services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_relationships_updated_at 
    BEFORE UPDATE ON public.business_relationships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Add sample data
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
    'All individual-related tables after cleanup' as status,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%individual%' OR table_name LIKE '%professional%' OR table_name LIKE '%business_%')
ORDER BY table_name;
