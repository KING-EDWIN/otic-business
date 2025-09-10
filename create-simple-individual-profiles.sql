-- Simple individual_profiles table creation
-- This creates just the basic table without complex relationships

-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS public.individual_profiles CASCADE;

-- Create the individual_profiles table
CREATE TABLE public.individual_profiles (
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

-- Create indexes for better performance
CREATE INDEX idx_individual_profiles_email ON public.individual_profiles(email);
CREATE INDEX idx_individual_profiles_profession ON public.individual_profiles(profession);
CREATE INDEX idx_individual_profiles_availability ON public.individual_profiles(availability_status);

-- Enable RLS
ALTER TABLE public.individual_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for individual_profiles
-- Policy for SELECT (viewing profiles)
CREATE POLICY "Individuals can view their own profile" ON public.individual_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Policy for INSERT (creating profiles)
CREATE POLICY "Individuals can create their own profile" ON public.individual_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy for UPDATE (updating profiles)
CREATE POLICY "Individuals can update their own profile" ON public.individual_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy for DELETE (deleting profiles)
CREATE POLICY "Individuals can delete their own profile" ON public.individual_profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_individual_profiles_updated_at 
    BEFORE UPDATE ON public.individual_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing
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

-- Verify the table was created successfully
SELECT 
    'individual_profiles table created successfully' as status,
    COUNT(*) as record_count
FROM public.individual_profiles;
