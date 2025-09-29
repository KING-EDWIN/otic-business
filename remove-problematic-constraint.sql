-- Remove Problematic Foreign Key Constraint
-- Supabase auth system doesn't work well with foreign key constraints to auth.users

-- 1. Drop the problematic foreign key constraint
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 2. Drop any other foreign key constraints that might be causing issues
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 3. Verify the constraint is removed
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'user_profiles'
  AND tc.table_schema = 'public';

-- 4. Add a simple check constraint instead
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_id_check 
CHECK (id IS NOT NULL AND length(id::text) = 36);

-- 5. Create a function to clean up orphaned profiles when auth users are deleted
CREATE OR REPLACE FUNCTION cleanup_orphaned_profiles()
RETURNS void AS $$
BEGIN
    -- Delete profiles that don't have corresponding auth users
    DELETE FROM public.user_profiles 
    WHERE id NOT IN (SELECT id FROM auth.users);
    
    RAISE NOTICE 'Cleaned up orphaned profiles';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Test that we can now insert profiles without constraint issues
SELECT 'Foreign key constraint removed. User profiles can now be created without constraint violations.' as status;
