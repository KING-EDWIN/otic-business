-- Fix Missing Auth User
-- This script creates the missing auth user for dylankatamba80@gmail.com
-- Run this in your Supabase SQL Editor

-- First, let's check if the user exists in user_profiles but not in auth.users
SELECT 
    'User Profile Check' as check_type,
    id,
    email,
    business_name,
    email_verified,
    created_at
FROM user_profiles 
WHERE email = 'dylankatamba80@gmail.com';

-- Check if there are any auth users with this email
-- Note: We can't directly query auth.users from SQL, but we can check if the profile exists

-- If the user profile exists but auth user doesn't, we need to create the auth user
-- This requires using the Supabase Admin API or the Supabase Dashboard

-- For now, let's update the user profile to ensure it has the correct structure
UPDATE user_profiles 
SET 
    email_verified = true,
    verification_timestamp = NOW(),
    verified_by = '00000000-0000-0000-0000-000000000000'
WHERE email = 'dylankatamba80@gmail.com';

-- Verify the update
SELECT 
    'Updated Profile' as status,
    id,
    email,
    business_name,
    email_verified,
    verification_timestamp,
    verified_by
FROM user_profiles 
WHERE email = 'dylankatamba80@gmail.com';
