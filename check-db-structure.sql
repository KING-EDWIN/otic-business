-- Check database structure for business management
-- This script will help us understand what tables exist

-- Check if businesses table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('businesses', 'business_memberships', 'business_invitations', 'user_profiles')
ORDER BY table_name, ordinal_position;

-- Check if business_memberships table exists
SELECT 
    'business_memberships' as table_name,
    COUNT(*) as row_count
FROM business_memberships;

-- Check if business_invitations table exists (we might need to create this)
SELECT 
    'business_invitations' as table_name,
    COUNT(*) as row_count
FROM business_invitations;

-- Check current businesses
SELECT 
    'businesses' as table_name,
    COUNT(*) as row_count
FROM businesses;

-- Check user profiles
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as row_count
FROM user_profiles;



