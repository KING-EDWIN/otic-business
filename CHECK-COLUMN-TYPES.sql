-- CHECK ACTUAL COLUMN TYPES
-- Run this script in Supabase SQL editor to get the actual column types

-- Check business_invitations table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'business_invitations' 
AND column_name IN ('id', 'business_id', 'invited_email', 'role', 'status', 'message', 'expires_at', 'created_at')
ORDER BY ordinal_position;

-- Check businesses table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name IN ('id', 'name')
ORDER BY ordinal_position;

-- Check user_profiles table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('id', 'full_name')
ORDER BY ordinal_position;

-- Test a simple query to see what types are returned
SELECT 
    bi.id,
    bi.business_id,
    bi.invited_email,
    bi.role,
    bi.status,
    bi.message,
    bi.expires_at,
    bi.created_at,
    b.name as business_name,
    up.full_name as invited_by_name
FROM business_invitations bi
JOIN businesses b ON bi.business_id = b.id
JOIN user_profiles up ON bi.invited_by = up.id
LIMIT 1;




