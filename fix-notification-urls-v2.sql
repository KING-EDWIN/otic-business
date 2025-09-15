-- Fix notification action URLs and function conflicts
-- This script updates existing notifications and fixes function naming conflicts

-- First, drop the existing functions to avoid conflicts
DROP FUNCTION IF EXISTS create_notification(UUID, UUID, VARCHAR(255), TEXT, VARCHAR(50), VARCHAR(20), TEXT, JSONB, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS create_invitation_notification(UUID, UUID, VARCHAR(255), VARCHAR(50));
DROP FUNCTION IF EXISTS create_sale_notification(UUID, UUID, DECIMAL(10,2), VARCHAR(50));

-- Update existing notifications with wrong URLs (use relative paths for production compatibility)
UPDATE notifications 
SET action_url = REPLACE(action_url, 'http://localhost:8080/', '/')
WHERE action_url LIKE 'http://localhost:8080/%';

UPDATE notifications 
SET action_url = REPLACE(action_url, 'http://localhost:8081/', '/')
WHERE action_url LIKE 'http://localhost:8081/%';

-- Create the create_notification function with explicit parameter types
CREATE OR REPLACE FUNCTION create_notification(
  p_business_id UUID,
  p_user_id UUID,
  p_title VARCHAR(255),
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'info',
  p_priority VARCHAR(20) DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
  final_action_url TEXT;
BEGIN
  -- Generate UUID for the notification
  notification_id := gen_random_uuid();
  
  -- Convert absolute URLs to relative paths for production compatibility
  IF p_action_url IS NOT NULL THEN
    -- Remove localhost URLs and keep only the path
    final_action_url := REGEXP_REPLACE(p_action_url, 'https?://[^/]+', '');
    -- Ensure it starts with /
    IF final_action_url !~ '^/' THEN
      final_action_url := '/' || final_action_url;
    END IF;
  END IF;
  
  -- Insert the notification
  INSERT INTO notifications (
    id,
    business_id,
    user_id,
    title,
    message,
    type,
    priority,
    action_url,
    metadata,
    expires_at,
    created_at
  ) VALUES (
    notification_id,
    p_business_id,
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_priority,
    final_action_url,
    p_metadata,
    p_expires_at,
    NOW()
  );
  
  RETURN notification_id;
END;
$$;

-- Create the create_invitation_notification function
CREATE OR REPLACE FUNCTION create_invitation_notification(
  p_business_id UUID,
  p_user_id UUID,
  p_invited_email VARCHAR(255),
  p_role VARCHAR(50)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
  business_name TEXT;
BEGIN
  -- Get business name
  SELECT name INTO business_name 
  FROM businesses 
  WHERE id = p_business_id;
  
  -- Create notification with relative path
  SELECT create_notification(
    p_business_id,
    p_user_id,
    'New Team Invitation',
    'You have been invited to join ' || COALESCE(business_name, 'a business') || ' as ' || p_role || '. Click to accept the invitation.',
    'invitation',
    'high',
    '/business-management',
    jsonb_build_object(
      'invited_email', p_invited_email,
      'role', p_role,
      'business_id', p_business_id
    )
  ) INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Create the create_sale_notification function
CREATE OR REPLACE FUNCTION create_sale_notification(
  p_business_id UUID,
  p_user_id UUID,
  p_sale_amount DECIMAL(10,2),
  p_payment_method VARCHAR(50)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
  business_name TEXT;
BEGIN
  -- Get business name
  SELECT name INTO business_name 
  FROM businesses 
  WHERE id = p_business_id;
  
  -- Create notification with relative path
  SELECT create_notification(
    p_business_id,
    p_user_id,
    'New Sale Completed',
    'A sale of UGX ' || p_sale_amount || ' was completed via ' || p_payment_method || ' in ' || COALESCE(business_name, 'your business') || '.',
    'sale',
    'medium',
    '/pos',
    jsonb_build_object(
      'sale_amount', p_sale_amount,
      'payment_method', p_payment_method,
      'business_id', p_business_id
    )
  ) INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_notification(UUID, UUID, VARCHAR(255), TEXT, VARCHAR(50), VARCHAR(20), TEXT, JSONB, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION create_invitation_notification(UUID, UUID, VARCHAR(255), VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION create_sale_notification(UUID, UUID, DECIMAL(10,2), VARCHAR(50)) TO authenticated;

-- Show updated notifications
SELECT id, title, action_url, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 5;
