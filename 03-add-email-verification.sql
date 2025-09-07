-- Add Email Verification System
-- Run this in your Supabase SQL Editor

-- Add email_verified column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add verification_timestamp column for tracking when verification was done
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS verification_timestamp TIMESTAMP WITH TIME ZONE;

-- Add verified_by column to track who verified the email (admin)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS verified_by UUID;

-- Create index for better performance on email verification queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON user_profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_timestamp ON user_profiles(verification_timestamp);

-- Update existing users to be verified (for testing purposes)
-- You can comment this out if you want to manually verify each user
UPDATE user_profiles 
SET email_verified = TRUE, 
    verification_timestamp = NOW(),
    verified_by = '00000000-0000-0000-0000-000000000000' -- Admin user ID
WHERE email_verified IS NULL OR email_verified = FALSE;

-- Create a view for admin to see unverified users
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

-- Create a view for admin to see all users with verification status
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
