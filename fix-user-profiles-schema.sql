-- Fix user_profiles table schema
-- This script adds missing columns and ensures proper structure

-- Step 1: Add missing columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'business' CHECK (user_type IN ('business', 'individual'));

-- Step 2: Update existing records to have default values
UPDATE user_profiles 
SET full_name = COALESCE(full_name, business_name, 'User'),
    user_type = COALESCE(user_type, 'business')
WHERE full_name IS NULL OR user_type IS NULL;

-- Step 3: Check the current structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Step 4: Verify the changes
SELECT COUNT(*) as total_users FROM user_profiles;
SELECT user_type, COUNT(*) as count FROM user_profiles GROUP BY user_type;
