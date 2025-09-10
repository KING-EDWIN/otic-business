-- Fix duplicate user_profiles records
-- This script handles the duplicate key constraint issue

-- First, let's see if there are any duplicate records
SELECT 
    id, 
    email, 
    user_type, 
    created_at,
    COUNT(*) as duplicate_count
FROM user_profiles 
GROUP BY id, email, user_type, created_at
HAVING COUNT(*) > 1;

-- If there are duplicates, we can remove them by keeping only the latest record
-- (This is a safe operation that keeps the most recent profile)

-- Step 1: Create a temporary table with the latest records
CREATE TEMP TABLE latest_user_profiles AS
SELECT DISTINCT ON (id) 
    id,
    email,
    full_name,
    business_name,
    phone,
    address,
    user_type,
    tier,
    email_verified,
    created_at,
    updated_at
FROM user_profiles
ORDER BY id, created_at DESC;

-- Step 2: Delete all existing records
DELETE FROM user_profiles;

-- Step 3: Insert the cleaned records back
INSERT INTO user_profiles (
    id,
    email,
    full_name,
    business_name,
    phone,
    address,
    user_type,
    tier,
    email_verified,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    full_name,
    business_name,
    phone,
    address,
    user_type,
    tier,
    email_verified,
    created_at,
    updated_at
FROM latest_user_profiles;

-- Step 4: Clean up the temporary table
DROP TABLE latest_user_profiles;

-- Verify the fix
SELECT 
    COUNT(*) as total_profiles,
    COUNT(DISTINCT id) as unique_profiles
FROM user_profiles;

-- Show the current user profiles
SELECT 
    id,
    email,
    full_name,
    user_type,
    tier,
    email_verified,
    created_at
FROM user_profiles
ORDER BY created_at DESC;
