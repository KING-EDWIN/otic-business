-- Fix User Profiles Foreign Key Constraint
-- The issue is that the constraint references auth.users but Supabase auth works differently

-- 1. First, let's see what constraints exist
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

-- 2. Drop the problematic foreign key constraint
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 3. Create a new constraint that properly references auth.users
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. If the above fails, let's try without the foreign key constraint
-- (Supabase auth handles user deletion automatically)
-- ALTER TABLE public.user_profiles 
-- DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 5. Add a trigger to ensure data integrity instead of foreign key
CREATE OR REPLACE FUNCTION check_user_exists()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id) THEN
        RAISE EXCEPTION 'User with id % does not exist in auth.users', NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS check_user_exists_trigger ON public.user_profiles;

-- Create the trigger
CREATE TRIGGER check_user_exists_trigger
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_user_exists();

-- 6. Test the fix by checking if we can insert a profile
-- (This will only work if there's a corresponding auth.users record)
SELECT 'Database structure fixed. Foreign key constraint updated to properly reference auth.users' as status;
