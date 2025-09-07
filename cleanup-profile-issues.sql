-- Cleanup Profile Issues
-- Run this in your Supabase SQL Editor to fix any existing data conflicts

-- First, let's check if there are any duplicate or problematic profiles
SELECT id, email, business_name, created_at 
FROM user_profiles 
WHERE id IN (
  SELECT id FROM user_profiles 
  GROUP BY id 
  HAVING COUNT(*) > 1
);

-- If there are duplicates, we can clean them up
-- (This will keep the most recent one)
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC) as rn
  FROM user_profiles
)
DELETE FROM user_profiles 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Ensure the user_subscriptions table has proper constraints
ALTER TABLE user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_key;

-- Create a unique constraint on user_id to prevent duplicates
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_user_id_unique UNIQUE (user_id);

-- Update any existing subscriptions to have proper timestamps
UPDATE user_subscriptions 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at IS NULL OR updated_at IS NULL;

-- Ensure user_profiles has proper timestamps
UPDATE user_profiles 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at IS NULL OR updated_at IS NULL;

-- Check the final state
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'user_subscriptions' as table_name, COUNT(*) as count FROM user_subscriptions;
