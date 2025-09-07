-- Email Verification Setup Script
-- Run this in your Supabase SQL Editor to add email verification functionality

-- Step 1: Add email verification columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS verification_timestamp TIMESTAMP WITH TIME ZONE;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS verified_by UUID;

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON user_profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_timestamp ON user_profiles(verification_timestamp);

-- Step 3: Update existing users to be verified (for testing)
-- This will set all existing users as verified
UPDATE user_profiles 
SET email_verified = TRUE, 
    verification_timestamp = NOW(),
    verified_by = '00000000-0000-0000-0000-000000000000' -- Admin UUID placeholder
WHERE email_verified IS NULL OR email_verified = FALSE;

-- Step 4: Create views for admin management
CREATE OR REPLACE VIEW unverified_users AS
SELECT 
    id,
    email,
    business_name,
    phone,
    tier,
    email_verified,
    verification_timestamp,
    verified_by,
    created_at
FROM user_profiles 
WHERE email_verified = FALSE
ORDER BY created_at ASC;

CREATE OR REPLACE VIEW user_verification_status AS
SELECT 
    id,
    email,
    business_name,
    phone,
    tier,
    email_verified,
    verification_timestamp,
    verified_by,
    created_at,
    CASE 
        WHEN email_verified = TRUE THEN 'Verified'
        WHEN email_verified = FALSE THEN 'Pending'
        ELSE 'Unknown'
    END as verification_status
FROM user_profiles 
ORDER BY created_at DESC;

-- Step 5: Verify the setup
SELECT 
    'Setup Complete' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_verified = TRUE THEN 1 END) as verified_users,
    COUNT(CASE WHEN email_verified = FALSE THEN 1 END) as unverified_users
FROM user_profiles;
