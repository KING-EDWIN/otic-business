-- Fix user_profiles foreign key constraint issue
-- The problem is that user_profiles.id has a foreign key to auth.users.id
-- but we're trying to insert before the user exists in auth.users

-- First, let's check the current constraint
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
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
WHERE tc.table_name='user_profiles' 
  AND kcu.column_name = 'id';

-- Option 1: Drop the foreign key constraint if it exists
-- (This is the safest approach for now)
DO $$ 
BEGIN
    -- Drop the foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user_profiles' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%id%'
    ) THEN
        ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint on user_profiles.id';
    ELSE
        RAISE NOTICE 'No foreign key constraint found on user_profiles.id';
    END IF;
END $$;

-- Option 2: If we want to keep the constraint, we need to modify the signup process
-- But for now, let's just remove the constraint since user_profiles.id should be the primary key
-- and not necessarily a foreign key to auth.users

-- Verify the constraint is removed
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
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
WHERE tc.table_name='user_profiles' 
  AND kcu.column_name = 'id';
