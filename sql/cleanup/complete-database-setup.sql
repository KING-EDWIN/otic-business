-- Complete Database Setup for Otic Business
-- This script creates all necessary tables, functions, and policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table if not exists
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    business_name TEXT,
    phone TEXT,
    address TEXT,
    tier TEXT DEFAULT 'free_trial' CHECK (tier IN ('free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage')),
    email_verified BOOLEAN DEFAULT false,
    verification_timestamp TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    user_type TEXT DEFAULT 'business',
    individual_profession_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create businesses table if not exists
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    business_type TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    tax_id TEXT,
    registration_number TEXT,
    currency TEXT DEFAULT 'UGX',
    timezone TEXT DEFAULT 'Africa/Kampala',
    logo_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- Create business_memberships table if not exists
CREATE TABLE IF NOT EXISTS public.business_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'employee', 'viewer')),
    permissions JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    invited_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, business_id)
);

-- Create system_troubleshoot_logs table if not exists
CREATE TABLE IF NOT EXISTS public.system_troubleshoot_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_details JSONB DEFAULT '{}'::jsonb,
    page_url TEXT,
    user_agent TEXT,
    browser_info JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_auth table if not exists
CREATE TABLE IF NOT EXISTS public.admin_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_troubleshoot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop policies for user_profiles
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.user_profiles';
    END LOOP;
    
    -- Drop policies for businesses
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'businesses'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.businesses';
    END LOOP;
    
    -- Drop policies for business_memberships
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'business_memberships'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.business_memberships';
    END LOOP;
    
    -- Drop policies for system_troubleshoot_logs
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'system_troubleshoot_logs'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.system_troubleshoot_logs';
    END LOOP;
END $$;

-- Create comprehensive RLS policies

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Public can view basic profile info" ON public.user_profiles
FOR SELECT TO public
USING (true);

-- Businesses policies
CREATE POLICY "Users can view businesses they are members of" ON public.businesses
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.business_memberships 
        WHERE business_id = businesses.id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can create businesses" ON public.businesses
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update businesses they own" ON public.businesses
FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Business memberships policies
CREATE POLICY "Users can view their own memberships" ON public.business_memberships
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view memberships for their businesses" ON public.business_memberships
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.business_memberships bm2
        WHERE bm2.business_id = business_memberships.business_id 
        AND bm2.user_id = auth.uid()
        AND bm2.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Users can create memberships for their businesses" ON public.business_memberships
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.business_memberships bm2
        WHERE bm2.business_id = business_memberships.business_id 
        AND bm2.user_id = auth.uid()
        AND bm2.role IN ('owner', 'admin')
    )
);

-- System troubleshoot logs policies
CREATE POLICY "Users can report their own errors" ON public.system_troubleshoot_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own error reports" ON public.system_troubleshoot_logs
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all error reports" ON public.system_troubleshoot_logs
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_auth 
        WHERE id = auth.uid()
    )
);

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS get_user_businesses(uuid);
DROP FUNCTION IF EXISTS can_create_business(uuid);
DROP FUNCTION IF EXISTS get_business_members(uuid);
DROP FUNCTION IF EXISTS log_system_error(TEXT, TEXT, JSONB, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS get_system_error_reports(TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS update_error_report_status(UUID, TEXT, TEXT);

-- Create RPC functions

-- Function to get user's businesses
CREATE OR REPLACE FUNCTION get_user_businesses(user_id_param UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    business_type TEXT,
    industry TEXT,
    website TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    tax_id TEXT,
    registration_number TEXT,
    currency TEXT,
    timezone TEXT,
    logo_url TEXT,
    status TEXT,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    user_role TEXT,
    joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.name,
        b.description,
        b.business_type,
        b.industry,
        b.website,
        b.phone,
        b.email,
        b.address,
        b.city,
        b.state,
        b.country,
        b.postal_code,
        b.tax_id,
        b.registration_number,
        b.currency,
        b.timezone,
        b.logo_url,
        b.status,
        b.settings,
        b.created_at,
        b.updated_at,
        b.created_by,
        bm.role as user_role,
        bm.joined_at
    FROM businesses b
    INNER JOIN business_memberships bm ON b.id = bm.business_id
    WHERE bm.user_id = user_id_param
    ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create business
CREATE OR REPLACE FUNCTION can_create_business(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    business_count INTEGER;
    user_tier TEXT;
BEGIN
    -- Get user's tier
    SELECT tier INTO user_tier
    FROM user_profiles
    WHERE id = user_id_param;
    
    -- Count user's businesses
    SELECT COUNT(*) INTO business_count
    FROM business_memberships
    WHERE user_id = user_id_param AND role = 'owner';
    
    -- Check tier limits
    CASE user_tier
        WHEN 'free_trial' THEN RETURN business_count < 1;
        WHEN 'start_smart' THEN RETURN business_count < 3;
        WHEN 'grow_intelligence' THEN RETURN business_count < 10;
        WHEN 'enterprise_advantage' THEN RETURN true;
        ELSE RETURN business_count < 1;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get business members
CREATE OR REPLACE FUNCTION get_business_members(business_id_param UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email TEXT,
    full_name TEXT,
    business_name TEXT,
    role TEXT,
    status TEXT,
    joined_at TIMESTAMP WITH TIME ZONE
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
        bm.joined_at
    FROM business_memberships bm
    INNER JOIN user_profiles up ON bm.user_id = up.id
    WHERE bm.business_id = business_id_param
    ORDER BY bm.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log system errors
CREATE OR REPLACE FUNCTION log_system_error(
    p_error_type TEXT,
    p_error_message TEXT,
    p_error_details JSONB DEFAULT '{}'::jsonb,
    p_page_url TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_browser_info JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    current_user_id UUID;
    current_user_email TEXT;
BEGIN
    current_user_id := auth.uid();
    
    SELECT email INTO current_user_email 
    FROM public.user_profiles 
    WHERE id = current_user_id;
    
    INSERT INTO public.system_troubleshoot_logs (
        user_id,
        user_email,
        error_type,
        error_message,
        error_details,
        page_url,
        user_agent,
        browser_info
    ) VALUES (
        current_user_id,
        current_user_email,
        p_error_type,
        p_error_message,
        p_error_details,
        p_page_url,
        p_user_agent,
        p_browser_info
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_businesses(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION can_create_business(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_business_members(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION log_system_error(TEXT, TEXT, JSONB, TEXT, TEXT, JSONB) TO authenticated, anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_memberships_user_id ON public.business_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_business_memberships_business_id ON public.business_memberships(business_id);
CREATE INDEX IF NOT EXISTS idx_system_troubleshoot_logs_user_id ON public.system_troubleshoot_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_troubleshoot_logs_timestamp ON public.system_troubleshoot_logs(timestamp);

-- Insert sample admin user (password: admin123)
INSERT INTO public.admin_auth (email, password_hash, role) 
VALUES ('admin@oticbusiness.com', '$2a$10$rQZ8K9vL2mN3pQ4rS5tU6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Test the setup
SELECT 'Setup Complete' as status, 
       COUNT(*) as user_profiles_count 
FROM user_profiles;

SELECT 'Businesses Table' as status, 
       COUNT(*) as businesses_count 
FROM businesses;

SELECT 'Business Memberships Table' as status, 
       COUNT(*) as memberships_count 
FROM business_memberships;

SELECT 'System Logs Table' as status, 
       COUNT(*) as logs_count 
FROM system_troubleshoot_logs;
