-- Add user_type field to user_profiles table
-- Run this in your Supabase SQL Editor

-- Step 1: Add user_type column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'business' 
CHECK (user_type IN ('business', 'individual'));

-- Step 2: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);

-- Step 3: Update existing users to have 'business' as default user_type
UPDATE user_profiles 
SET user_type = 'business' 
WHERE user_type IS NULL;

-- Step 4: Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'user_type';

-- Step 5: Show current user types distribution
SELECT 
    user_type,
    COUNT(*) as count
FROM user_profiles 
GROUP BY user_type;
