-- Fix individual_id references in existing tables
-- This script updates the foreign key constraints to point to the correct tables

-- Step 1: Check what foreign key constraints currently exist
SELECT 
    'Current foreign key constraints' as info,
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
    AND tc.table_name IN ('individual_signups', 'individual_business_access', 'individual_professions')
ORDER BY tc.table_name;

-- Step 2: Drop existing foreign key constraints that are causing issues
-- We'll drop them and recreate them with the correct references

-- Drop constraints on individual_signups table
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints tc
        WHERE tc.table_name = 'individual_signups' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.individual_signups DROP CONSTRAINT ' || constraint_name;
    END LOOP;
END $$;

-- Drop constraints on individual_business_access table
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints tc
        WHERE tc.table_name = 'individual_business_access' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.individual_business_access DROP CONSTRAINT ' || constraint_name;
    END LOOP;
END $$;

-- Drop constraints on individual_professions table
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints tc
        WHERE tc.table_name = 'individual_professions' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.individual_professions DROP CONSTRAINT ' || constraint_name;
    END LOOP;
END $$;

-- Step 3: Add correct foreign key constraints
-- individual_signups should reference auth.users(id) for the user ID
ALTER TABLE public.individual_signups 
ADD CONSTRAINT fk_individual_signups_user_id 
FOREIGN KEY (individual_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- individual_business_access should reference auth.users(id) for individual_id
ALTER TABLE public.individual_business_access 
ADD CONSTRAINT fk_individual_business_access_individual_id 
FOREIGN KEY (individual_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- individual_business_access should reference user_profiles(id) for business_id
ALTER TABLE public.individual_business_access 
ADD CONSTRAINT fk_individual_business_access_business_id 
FOREIGN KEY (business_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- individual_professions should reference auth.users(id) for individual_id
ALTER TABLE public.individual_professions 
ADD CONSTRAINT fk_individual_professions_individual_id 
FOREIGN KEY (individual_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4: Now create the new tables that were failing before
-- Create business_invitations table
CREATE TABLE IF NOT EXISTS public.business_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    individual_id UUID REFERENCES public.individual_profiles(id) ON DELETE CASCADE,
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
    individual_id UUID REFERENCES public.individual_profiles(id) ON DELETE CASCADE,
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
    individual_id UUID REFERENCES public.individual_profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
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

-- Step 5: Enable RLS on all tables
ALTER TABLE public.business_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_relationships ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
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

-- Step 7: Create triggers for updated_at
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

-- Step 8: Verify everything is working
SELECT 
    'All tables created successfully' as status,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('individual_profiles', 'business_invitations', 'professional_services', 'business_relationships', 'individual_signups', 'individual_business_access', 'individual_professions')
ORDER BY table_name;
