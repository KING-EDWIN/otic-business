-- Fix business loading issues
-- This script addresses the problem of users seeing 9 businesses instead of their own

-- First, let's check what's currently in the database
SELECT 'Current business_memberships for user:' as info;
SELECT bm.*, b.name as business_name, b.created_by 
FROM business_memberships bm
JOIN businesses b ON bm.business_id = b.id
WHERE bm.user_id = '3488046f-56cf-4711-9045-7e6e158a1c91'
ORDER BY bm.joined_at;

-- Check for duplicates
SELECT 'Duplicate memberships:' as info;
SELECT business_id, COUNT(*) as count 
FROM business_memberships
WHERE user_id = '3488046f-56cf-4711-9045-7e6e158a1c91'
GROUP BY business_id 
HAVING COUNT(*) > 1;

-- Clean up duplicate memberships (keep the most recent one)
DELETE FROM business_memberships 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY user_id, business_id ORDER BY joined_at DESC) as rn
    FROM business_memberships
    WHERE user_id = '3488046f-56cf-4711-9045-7e6e158a1c91'
  ) t 
  WHERE rn > 1
);

-- Create a better RPC function for getting user businesses
CREATE OR REPLACE FUNCTION get_user_businesses_clean(p_user_id UUID)
RETURNS TABLE (
  business_id UUID,
  business_name TEXT,
  role TEXT,
  status TEXT,
  joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as business_id,
    b.name as business_name,
    bm.role::TEXT,
    bm.status::TEXT,
    bm.joined_at
  FROM business_memberships bm
  JOIN businesses b ON bm.business_id = b.id
  WHERE bm.user_id = p_user_id
    AND bm.status = 'active'
  ORDER BY bm.joined_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_businesses_clean(UUID) TO authenticated;

-- Test the new function
SELECT 'Testing new function:' as info;
SELECT * FROM get_user_businesses_clean('3488046f-56cf-4711-9045-7e6e158a1c91');

-- Update the existing function to use the clean version
CREATE OR REPLACE FUNCTION get_user_businesses(p_user_id UUID)
RETURNS TABLE (
  business_id UUID,
  business_name TEXT,
  role TEXT,
  status TEXT,
  joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as business_id,
    b.name as business_name,
    bm.role::TEXT,
    bm.status::TEXT,
    bm.joined_at
  FROM business_memberships bm
  JOIN businesses b ON bm.business_id = b.id
  WHERE bm.user_id = p_user_id
    AND bm.status = 'active'
  ORDER BY bm.joined_at DESC;
END;
$$;

-- Add RLS policy to ensure users only see their own businesses
DROP POLICY IF EXISTS "Users can only see their own business memberships" ON business_memberships;
CREATE POLICY "Users can only see their own business memberships" ON business_memberships
  FOR SELECT USING (auth.uid() = user_id);

-- Add RLS policy for businesses table
DROP POLICY IF EXISTS "Users can only see businesses they are members of" ON businesses;
CREATE POLICY "Users can only see businesses they are members of" ON businesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_memberships bm 
      WHERE bm.business_id = businesses.id 
      AND bm.user_id = auth.uid()
      AND bm.status = 'active'
    )
  );

-- Final verification
SELECT 'Final verification - user businesses:' as info;
SELECT * FROM get_user_businesses('3488046f-56cf-4711-9045-7e6e158a1c91');
