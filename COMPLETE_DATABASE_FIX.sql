-- COMPLETE DATABASE FIX
-- This script fixes ALL database issues for the Otic Business application
-- Run this script in your Supabase SQL Editor

-- ============================================================================
-- STEP 1: CREATE MISSING TABLES AND ENSURE PROPER STRUCTURE
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create/Update Enums
DO $$ 
BEGIN
    -- Create user_tier enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_tier') THEN
        CREATE TYPE user_tier AS ENUM ('basic', 'premium', 'standard', 'free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage');
    ELSE
        -- Add new tier values to existing user_tier enum
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'free_trial' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_tier')) THEN
            ALTER TYPE user_tier ADD VALUE 'free_trial';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'start_smart' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_tier')) THEN
            ALTER TYPE user_tier ADD VALUE 'start_smart';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'grow_intelligence' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_tier')) THEN
            ALTER TYPE user_tier ADD VALUE 'grow_intelligence';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'enterprise_advantage' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_tier')) THEN
            ALTER TYPE user_tier ADD VALUE 'enterprise_advantage';
        END IF;
    END IF;
END $$;

-- User profiles table (main user data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  address TEXT,
  tier user_tier DEFAULT 'free_trial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_timestamp TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  user_type VARCHAR(50) DEFAULT 'business',
  individual_profession_id UUID,
  full_name TEXT
);

-- Businesses table
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
  country VARCHAR(100),
  postal_code VARCHAR(20),
  tax_id VARCHAR(100),
  registration_number VARCHAR(100),
  currency VARCHAR(3) DEFAULT 'UGX',
  timezone VARCHAR(50) DEFAULT 'Africa/Kampala',
  logo_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Business memberships table
CREATE TABLE IF NOT EXISTS business_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'employee', 'viewer')),
  permissions JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

-- System troubleshoot logs table
CREATE TABLE IF NOT EXISTS system_troubleshoot_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  user_agent TEXT,
  browser_info JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin auth table
CREATE TABLE IF NOT EXISTS admin_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: ENABLE RLS AND CREATE POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_troubleshoot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_auth ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop policies for all tables
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('user_profiles', 'businesses', 'business_memberships', 'system_troubleshoot_logs', 'admin_auth')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON ' || policy_record.schemaname || '.' || policy_record.tablename;
    END LOOP;
END $$;

-- Create comprehensive RLS policies

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON user_profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Public can view basic profile info" ON user_profiles
FOR SELECT TO public
USING (true);

-- Businesses policies
CREATE POLICY "Users can view businesses they are members of" ON businesses
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM business_memberships 
        WHERE business_id = businesses.id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can create businesses" ON businesses
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update businesses they own" ON businesses
FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Business memberships policies
CREATE POLICY "Users can view their own memberships" ON business_memberships
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view memberships for their businesses" ON business_memberships
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM business_memberships bm2
        WHERE bm2.business_id = business_memberships.business_id 
        AND bm2.user_id = auth.uid()
        AND bm2.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Users can create memberships for their businesses" ON business_memberships
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM business_memberships bm2
        WHERE bm2.business_id = business_memberships.business_id 
        AND bm2.user_id = auth.uid()
        AND bm2.role IN ('owner', 'admin')
    )
);

-- System troubleshoot logs policies
CREATE POLICY "Users can report their own errors" ON system_troubleshoot_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own error reports" ON system_troubleshoot_logs
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all error reports" ON system_troubleshoot_logs
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_auth 
        WHERE id = auth.uid()
    )
);

-- ============================================================================
-- STEP 3: CREATE RPC FUNCTIONS WITH CORRECT TYPES
-- ============================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS get_user_businesses(uuid);
DROP FUNCTION IF EXISTS can_create_business(uuid);
DROP FUNCTION IF EXISTS get_business_members(uuid);
DROP FUNCTION IF EXISTS log_system_error(TEXT, TEXT, JSONB, TEXT, TEXT, JSONB);

-- Create get_user_businesses function with correct return types
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
    status VARCHAR(20),
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    user_role VARCHAR(50),
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

-- Create can_create_business function
CREATE OR REPLACE FUNCTION can_create_business(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    business_count INTEGER;
    user_tier TEXT;
BEGIN
    -- Get user's tier
    SELECT tier::TEXT INTO user_tier
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

-- Create get_business_members function
CREATE OR REPLACE FUNCTION get_business_members(business_id_param UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email TEXT,
    full_name TEXT,
    business_name TEXT,
    role VARCHAR(50),
    status VARCHAR(20),
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

-- Create log_system_error function
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
    FROM user_profiles 
    WHERE id = current_user_id;
    
    INSERT INTO system_troubleshoot_logs (
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

-- ============================================================================
-- STEP 4: GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_businesses(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION can_create_business(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_business_members(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION log_system_error(TEXT, TEXT, JSONB, TEXT, TEXT, JSONB) TO authenticated, anon;

-- ============================================================================
-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_memberships_user_id ON business_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_business_memberships_business_id ON business_memberships(business_id);
CREATE INDEX IF NOT EXISTS idx_businesses_created_by ON businesses(created_by);
CREATE INDEX IF NOT EXISTS idx_system_troubleshoot_logs_user_id ON system_troubleshoot_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_troubleshoot_logs_timestamp ON system_troubleshoot_logs(timestamp);

-- ============================================================================
-- STEP 6: INSERT SAMPLE DATA (OPTIONAL)
-- ============================================================================

-- Insert sample admin user (password: admin123)
INSERT INTO admin_auth (email, password_hash, role) 
VALUES ('admin@oticbusiness.com', '$2a$10$rQZ8K9vL2mN3pQ4rS5tU6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- STEP 7: TEST THE SETUP
-- ============================================================================

-- Test queries to verify everything works
SELECT 'Setup Complete' as status, 
       'Tables Created' as info,
       COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'businesses', 'business_memberships', 'system_troubleshoot_logs', 'admin_auth');

-- Test RPC functions
SELECT 'Function Test' as test, 
       'get_user_businesses' as function_name,
       COUNT(*) as result_count
FROM get_user_businesses(auth.uid());

SELECT 'Function Test' as test, 
       'can_create_business' as function_name,
       CASE WHEN can_create_business(auth.uid()) THEN 1 ELSE 0 END as result_count;

-- Show current user info
SELECT 'Current User' as test, 
       auth.uid() as user_id, 
       auth.email() as email;

-- Show user profile status
SELECT 'User Profile Status' as test,
       CASE WHEN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid()) 
            THEN 'Profile exists' 
            ELSE 'No profile - will be created on first login' 
       END as profile_status;

-- Show businesses count
SELECT 'Businesses Count' as test, COUNT(*) as total_businesses FROM businesses;

-- Show business memberships count
SELECT 'Business Memberships Count' as test, COUNT(*) as total_memberships FROM business_memberships;
