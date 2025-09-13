-- Fix email verification status for all users
-- This will allow verified users to access the system

-- Update all user profiles to have email_verified = true
-- (assuming all existing users are verified since they can log in)
UPDATE user_profiles 
SET email_verified = true, 
    updated_at = NOW()
WHERE email_verified = false;

-- Check the results
SELECT 
    email, 
    email_verified, 
    full_name,
    created_at
FROM user_profiles 
ORDER BY created_at;

-- Also refresh the schema cache to ensure RPC functions are available
NOTIFY pgrst, 'reload schema';

-- Grant execute permissions on all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

SELECT 'Email verification status updated and schema refreshed' as status;
