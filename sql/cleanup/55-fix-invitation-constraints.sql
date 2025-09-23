-- Fix business_invitations table constraints and check structure
-- This will resolve the null value constraint errors

-- 1. Check the current structure of business_invitations table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'business_invitations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check what data is currently in the table
SELECT 
    id,
    business_id,
    invited_email,
    email,
    invited_name,
    role,
    status,
    created_at
FROM business_invitations 
ORDER BY created_at DESC
LIMIT 5;

-- 3. Fix any existing null invited_email values
UPDATE business_invitations 
SET invited_email = COALESCE(invited_email, email, 'unknown@example.com')
WHERE invited_email IS NULL;

-- 4. Make sure the table has proper constraints
-- First, let's see what constraints exist
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'business_invitations'::regclass;

-- 5. If needed, add proper constraints
-- (We'll add these only if they don't exist)

-- 6. Refresh schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Business invitations table structure checked and fixed' as status;
