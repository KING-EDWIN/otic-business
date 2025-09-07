-- Quick Fix for Email Verification
-- Run this in your Supabase SQL Editor

-- Step 1: Check if email_verified column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'email_verified';

-- Step 2: Add email_verified column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN email_verified BOOLEAN DEFAULT TRUE;
        ALTER TABLE user_profiles ADD COLUMN verification_timestamp TIMESTAMP WITH TIME ZONE;
        ALTER TABLE user_profiles ADD COLUMN verified_by UUID;
        
        -- Set all existing users as verified
        UPDATE user_profiles 
        SET email_verified = TRUE, 
            verification_timestamp = NOW(),
            verified_by = '00000000-0000-0000-0000-000000000000'
        WHERE email_verified IS NULL;
        
        RAISE NOTICE 'Email verification columns added and all users set as verified';
    ELSE
        RAISE NOTICE 'Email verification columns already exist';
    END IF;
END $$;

-- Step 3: Recreate the user_verification_status view
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

-- Step 4: Verify the fix
SELECT 
    'Email Verification Status' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_verified = TRUE THEN 1 END) as verified_users,
    COUNT(CASE WHEN email_verified = FALSE THEN 1 END) as unverified_users
FROM user_profiles;
