-- Update Existing Users to be Verified
-- Run this in your Supabase SQL Editor to set all existing users as verified

-- Update all existing users to have email_verified = true
UPDATE user_profiles 
SET email_verified = true,
    verification_timestamp = NOW(),
    verified_by = '00000000-0000-0000-0000-000000000000'
WHERE email_verified IS NULL OR email_verified = false;

-- Check the results
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
    COUNT(CASE WHEN email_verified = false THEN 1 END) as unverified_users
FROM user_profiles;

-- Show a few examples
SELECT 
    id,
    email,
    business_name,
    email_verified,
    verification_timestamp
FROM user_profiles 
ORDER BY created_at DESC
LIMIT 5;
