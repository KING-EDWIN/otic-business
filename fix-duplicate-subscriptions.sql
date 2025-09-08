-- Fix Duplicate Subscriptions
-- Run this in your Supabase SQL Editor to clean up duplicates

-- First, let's see what duplicates exist
SELECT user_id, COUNT(*) as count, 
       STRING_AGG(id::text, ', ') as subscription_ids
FROM user_subscriptions 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Delete duplicate subscriptions, keeping only the most recent one
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, updated_at DESC) as rn
  FROM user_subscriptions
)
DELETE FROM user_subscriptions 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Verify no more duplicates
SELECT user_id, COUNT(*) as count
FROM user_subscriptions 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Now add the unique constraint
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_user_id_unique UNIQUE (user_id);

-- Check final state
SELECT 'user_subscriptions' as table_name, COUNT(*) as count FROM user_subscriptions;

