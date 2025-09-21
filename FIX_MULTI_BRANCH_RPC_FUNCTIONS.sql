-- Fix Multi-Branch Management RPC Functions
-- This script creates the missing RPC functions for branch management

-- 1. Create function to get business branches
CREATE OR REPLACE FUNCTION get_business_branches(business_id_param UUID)
RETURNS TABLE (
  id UUID,
  branch_name TEXT,
  branch_code TEXT,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  manager_name TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bl.id,
    bl.branch_name,
    bl.branch_code,
    bl.address,
    bl.city,
    bl.phone,
    bl.email,
    bl.manager_name,
    bl.is_active,
    bl.created_at,
    bl.updated_at
  FROM branch_locations bl
  WHERE bl.business_id = business_id_param
  ORDER BY bl.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create function to create a new branch
CREATE OR REPLACE FUNCTION create_branch(
  business_id_param UUID,
  branch_name_param TEXT,
  branch_code_param TEXT,
  address_param TEXT DEFAULT NULL,
  city_param TEXT DEFAULT NULL,
  phone_param TEXT DEFAULT NULL,
  email_param TEXT DEFAULT NULL,
  manager_name_param TEXT DEFAULT NULL,
  manager_phone_param TEXT DEFAULT NULL,
  manager_email_param TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  branch_name TEXT,
  branch_code TEXT,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  new_branch_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Check if user has permission to create branches for this business
  IF NOT EXISTS (
    SELECT 1 FROM business_memberships 
    WHERE business_id = business_id_param 
    AND user_id = current_user_id 
    AND role IN ('owner', 'admin', 'manager')
  ) THEN
    RETURN QUERY SELECT 
      gen_random_uuid()::UUID,
      ''::TEXT,
      ''::TEXT,
      false::BOOLEAN,
      'You do not have permission to create branches for this business'::TEXT;
    RETURN;
  END IF;
  
  -- Check if branch code already exists for this business
  IF EXISTS (
    SELECT 1 FROM branch_locations 
    WHERE business_id = business_id_param 
    AND branch_code = branch_code_param
  ) THEN
    RETURN QUERY SELECT 
      gen_random_uuid()::UUID,
      ''::TEXT,
      ''::TEXT,
      false::BOOLEAN,
      'Branch code already exists for this business'::TEXT;
    RETURN;
  END IF;
  
  -- Insert new branch
  INSERT INTO branch_locations (
    business_id,
    branch_name,
    branch_code,
    address,
    city,
    phone,
    email,
    manager_name,
    manager_phone,
    manager_email,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    business_id_param,
    branch_name_param,
    branch_code_param,
    address_param,
    city_param,
    phone_param,
    email_param,
    manager_name_param,
    manager_phone_param,
    manager_email_param,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO new_branch_id;
  
  -- Return success response
  RETURN QUERY SELECT 
    new_branch_id,
    branch_name_param,
    branch_code_param,
    true::BOOLEAN,
    'Branch created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to update a branch
CREATE OR REPLACE FUNCTION update_branch(
  branch_id_param UUID,
  branch_name_param TEXT,
  branch_code_param TEXT,
  address_param TEXT DEFAULT NULL,
  city_param TEXT DEFAULT NULL,
  phone_param TEXT DEFAULT NULL,
  email_param TEXT DEFAULT NULL,
  manager_name_param TEXT DEFAULT NULL,
  is_active_param BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  current_user_id UUID;
  business_id_check UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Get business_id for this branch
  SELECT business_id INTO business_id_check
  FROM branch_locations
  WHERE id = branch_id_param;
  
  -- Check if user has permission to update branches for this business
  IF NOT EXISTS (
    SELECT 1 FROM business_memberships 
    WHERE business_id = business_id_check 
    AND user_id = current_user_id 
    AND role IN ('owner', 'admin', 'manager')
  ) THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'You do not have permission to update this branch'::TEXT;
    RETURN;
  END IF;
  
  -- Update branch
  UPDATE branch_locations SET
    branch_name = branch_name_param,
    branch_code = branch_code_param,
    address = address_param,
    city = city_param,
    phone = phone_param,
    email = email_param,
    manager_name = manager_name_param,
    is_active = is_active_param,
    updated_at = NOW()
  WHERE id = branch_id_param;
  
  -- Return success response
  RETURN QUERY SELECT 
    true::BOOLEAN,
    'Branch updated successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to delete a branch
CREATE OR REPLACE FUNCTION delete_branch(branch_id_param UUID)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  current_user_id UUID;
  business_id_check UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Get business_id for this branch
  SELECT business_id INTO business_id_check
  FROM branch_locations
  WHERE id = branch_id_param;
  
  -- Check if user has permission to delete branches for this business
  IF NOT EXISTS (
    SELECT 1 FROM business_memberships 
    WHERE business_id = business_id_check 
    AND user_id = current_user_id 
    AND role IN ('owner', 'admin')
  ) THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'You do not have permission to delete this branch'::TEXT;
    RETURN;
  END IF;
  
  -- Delete branch (cascade will handle related records)
  DELETE FROM branch_locations WHERE id = branch_id_param;
  
  -- Return success response
  RETURN QUERY SELECT 
    true::BOOLEAN,
    'Branch deleted successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_business_branches(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_branch(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_branch(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_branch(UUID) TO authenticated;

-- Test the functions
DO $$
BEGIN
  RAISE NOTICE 'Multi-Branch RPC functions have been created successfully!';
  RAISE NOTICE 'Functions available: get_business_branches, create_branch, update_branch, delete_branch';
END $$;
