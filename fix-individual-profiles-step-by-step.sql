-- Fix individual_profiles table creation step by step
-- This script handles the column reference issues

-- Step 1: First, let's check what tables exist and what columns they have
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND (column_name LIKE '%individual%' OR table_name LIKE '%individual%')
ORDER BY table_name, column_name;

-- Step 2: Drop any existing foreign key constraints that reference individual_profiles
-- (This will prevent the "column does not exist" error)

-- Check for existing foreign key constraints
SELECT 
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
    AND (ccu.table_name = 'individual_profiles' OR ccu.table_name LIKE '%individual%');

-- Step 3: Create the individual_profiles table first (without foreign key references)
CREATE TABLE IF NOT EXISTS public.individual_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    profession TEXT NOT NULL, -- 'finance_professional', 'business_manager', 'consultant', etc.
    phone TEXT,
    company_affiliation TEXT, -- Current company they work for
    experience_years INTEGER DEFAULT 0,
    specializations TEXT[], -- Array of specializations
    certifications TEXT[], -- Array of certifications
    bio TEXT,
    profile_picture_url TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    location TEXT,
    timezone TEXT DEFAULT 'Africa/Kampala',
    availability_status TEXT DEFAULT 'available', -- 'available', 'busy', 'unavailable'
    hourly_rate DECIMAL(10,2), -- For consultants
    currency TEXT DEFAULT 'UGX',
    user_type TEXT DEFAULT 'individual' CHECK (user_type = 'individual'),
    email_verified BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_individual_profiles_email ON public.individual_profiles(email);
CREATE INDEX IF NOT EXISTS idx_individual_profiles_profession ON public.individual_profiles(profession);
CREATE INDEX IF NOT EXISTS idx_individual_profiles_availability ON public.individual_profiles(availability_status);

-- Step 5: Enable RLS
ALTER TABLE public.individual_profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for individual_profiles
-- Policy for SELECT (viewing profiles)
DROP POLICY IF EXISTS "Individuals can view their own profile" ON public.individual_profiles;
CREATE POLICY "Individuals can view their own profile" ON public.individual_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Policy for INSERT (creating profiles)
DROP POLICY IF EXISTS "Individuals can create their own profile" ON public.individual_profiles;
CREATE POLICY "Individuals can create their own profile" ON public.individual_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy for UPDATE (updating profiles)
DROP POLICY IF EXISTS "Individuals can update their own profile" ON public.individual_profiles;
CREATE POLICY "Individuals can update their own profile" ON public.individual_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy for DELETE (deleting profiles)
DROP POLICY IF EXISTS "Individuals can delete their own profile" ON public.individual_profiles;
CREATE POLICY "Individuals can delete their own profile" ON public.individual_profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- Step 7: Now create the related tables that reference individual_profiles
-- Create a table for business invitations (when businesses invite professionals)
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

-- Enable RLS for business_invitations
ALTER TABLE public.business_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_invitations
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

-- Create a table for professional services (services offered by individuals)
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

-- Enable RLS for professional_services
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for professional_services
DROP POLICY IF EXISTS "Individuals can manage their own services" ON public.professional_services;
CREATE POLICY "Individuals can manage their own services" ON public.professional_services
    FOR ALL
    TO authenticated
    USING (auth.uid() = individual_id)
    WITH CHECK (auth.uid() = individual_id);

-- Create a table for business relationships (which businesses an individual manages)
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

-- Enable RLS for business_relationships
ALTER TABLE public.business_relationships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_relationships
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

-- Step 8: Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 9: Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_individual_profiles_updated_at ON public.individual_profiles;
CREATE TRIGGER update_individual_profiles_updated_at 
    BEFORE UPDATE ON public.individual_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Step 10: Add some sample data for testing
INSERT INTO public.individual_profiles (
    id,
    email,
    full_name,
    profession,
    phone,
    company_affiliation,
    experience_years,
    specializations,
    bio,
    user_type,
    email_verified,
    profile_completed
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@individual.com',
    'Demo Professional',
    'finance_professional',
    '+256 700 000 001',
    'Demo Company',
    5,
    ARRAY['financial_analysis', 'budget_planning', 'tax_consultation'],
    'Experienced finance professional with expertise in financial analysis and business consulting.',
    'individual',
    TRUE,
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Step 11: Verify the tables were created successfully
SELECT 
    'Tables Created Successfully' as status,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('individual_profiles', 'business_invitations', 'professional_services', 'business_relationships')
ORDER BY table_name;
