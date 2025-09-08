-- Fix Auth User Issue for dylankatamba80@gmail.com
-- Run this in your Supabase SQL Editor

-- Step 1: Check current user profile
SELECT 
    'Current User Profile' as info,
    id,
    email,
    business_name,
    email_verified,
    verification_timestamp,
    verified_by,
    created_at
FROM user_profiles 
WHERE email = 'dylankatamba80@gmail.com';

-- Step 2: If the user profile exists but auth user doesn't, we need to:
-- 1. Delete the existing profile (since it has wrong ID)
-- 2. Create a new profile with the correct auth user ID

-- First, let's see what the current profile looks like
DO $$
DECLARE
    profile_exists boolean;
    current_profile_id uuid;
BEGIN
    -- Check if profile exists
    SELECT EXISTS(
        SELECT 1 FROM user_profiles WHERE email = 'dylankatamba80@gmail.com'
    ) INTO profile_exists;
    
    IF profile_exists THEN
        -- Get the current profile ID
        SELECT id INTO current_profile_id 
        FROM user_profiles 
        WHERE email = 'dylankatamba80@gmail.com';
        
        RAISE NOTICE 'Profile exists with ID: %', current_profile_id;
        
        -- Delete the existing profile (it will be recreated by the auth trigger)
        DELETE FROM user_profiles WHERE email = 'dylankatamba80@gmail.com';
        
        RAISE NOTICE 'Profile deleted. Now create the auth user manually in Supabase Dashboard.';
        RAISE NOTICE 'After creating auth user, the profile will be automatically created by the trigger.';
        
    ELSE
        RAISE NOTICE 'No profile found for dylankatamba80@gmail.com';
    END IF;
END $$;

-- Step 3: Instructions for manual auth user creation
SELECT 
    'INSTRUCTIONS' as step,
    '1. Go to Supabase Dashboard > Authentication > Users' as instruction_1,
    '2. Click "Add User" button' as instruction_2,
    '3. Enter email: dylankatamba80@gmail.com' as instruction_3,
    '4. Enter password: 123qazx' as instruction_4,
    '5. Check "Email Confirmed" checkbox' as instruction_5,
    '6. Click "Create User"' as instruction_6,
    '7. The user profile will be automatically created by the trigger' as instruction_7;
