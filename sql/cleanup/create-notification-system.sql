-- Create comprehensive notification system
-- This script creates tables, functions, and triggers for business notifications

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'invitation', 'low_stock', 'payment', 'sale', 'expense', 'tax')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, business_id, notification_type)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_business_user ON notifications(business_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(business_id, user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id, business_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can only see their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- RLS policies for notification preferences
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID, p_business_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_result INTEGER;
BEGIN
  IF p_business_id IS NULL THEN
    SELECT COUNT(*) INTO count_result
    FROM notifications
    WHERE user_id = p_user_id
      AND is_read = FALSE
      AND (expires_at IS NULL OR expires_at > NOW());
  ELSE
    SELECT COUNT(*) INTO count_result
    FROM notifications
    WHERE user_id = p_user_id
      AND business_id = p_business_id
      AND is_read = FALSE
      AND (expires_at IS NULL OR expires_at > NOW());
  END IF;
  
  RETURN COALESCE(count_result, 0);
END;
$$;

-- Function to get recent notifications
CREATE OR REPLACE FUNCTION get_recent_notifications(
  p_user_id UUID, 
  p_business_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  priority VARCHAR(20),
  is_read BOOLEAN,
  action_url VARCHAR(500),
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.priority,
    n.is_read,
    n.action_url,
    n.created_at
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND (p_business_id IS NULL OR n.business_id = p_business_id)
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
  ORDER BY n.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID, p_business_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF p_business_id IS NULL THEN
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id
      AND is_read = FALSE;
  ELSE
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id
      AND business_id = p_business_id
      AND is_read = FALSE;
  END IF;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_business_id UUID,
  p_user_id UUID,
  p_title VARCHAR(255),
  p_message TEXT,
  p_type VARCHAR(50),
  p_priority VARCHAR(20) DEFAULT 'medium',
  p_action_url VARCHAR(500) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    business_id,
    user_id,
    title,
    message,
    type,
    priority,
    action_url,
    metadata,
    expires_at
  ) VALUES (
    p_business_id,
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_priority,
    p_action_url,
    p_metadata,
    p_expires_at
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to check for low stock and create notifications
CREATE OR REPLACE FUNCTION check_low_stock_notifications(p_business_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  low_stock_count INTEGER := 0;
  business_owner_id UUID;
  notification_id UUID;
BEGIN
  -- Get business owner
  SELECT bm.user_id INTO business_owner_id
  FROM business_memberships bm
  WHERE bm.business_id = p_business_id
    AND bm.role = 'owner'
  LIMIT 1;
  
  IF business_owner_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Count low stock items
  SELECT COUNT(*) INTO low_stock_count
  FROM products
  WHERE business_id = p_business_id
    AND stock_quantity <= COALESCE(low_stock_threshold, 10)
    AND stock_quantity > 0;
  
  -- Create notification if there are low stock items
  IF low_stock_count > 0 THEN
    SELECT create_notification(
      p_business_id,
      business_owner_id,
      'Low Stock Alert',
      'You have ' || low_stock_count || ' products running low on stock. Consider restocking soon.',
      'low_stock',
      'high',
      '/inventory',
      jsonb_build_object('low_stock_count', low_stock_count),
      NOW() + INTERVAL '7 days'
    ) INTO notification_id;
  END IF;
  
  RETURN low_stock_count;
END;
$$;

-- Function to create sale notification
CREATE OR REPLACE FUNCTION create_sale_notification(
  p_business_id UUID,
  p_user_id UUID,
  p_sale_amount DECIMAL,
  p_payment_method VARCHAR(50)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  SELECT create_notification(
    p_business_id,
    p_user_id,
    'New Sale Completed',
    'Sale of UGX ' || p_sale_amount || ' completed via ' || p_payment_method,
    'sale',
    'medium',
    '/accounting',
    jsonb_build_object(
      'sale_amount', p_sale_amount,
      'payment_method', p_payment_method
    )
  ) INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to create invitation notification
CREATE OR REPLACE FUNCTION create_invitation_notification(
  p_business_id UUID,
  p_invited_email VARCHAR(255),
  p_role VARCHAR(50)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
  business_owner_id UUID;
BEGIN
  -- Get business owner
  SELECT bm.user_id INTO business_owner_id
  FROM business_memberships bm
  WHERE bm.business_id = p_business_id
    AND bm.role = 'owner'
  LIMIT 1;
  
  IF business_owner_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT create_notification(
    p_business_id,
    business_owner_id,
    'Employee Invitation Sent',
    'Invitation sent to ' || p_invited_email || ' for ' || p_role || ' role',
    'invitation',
    'medium',
    '/business-management',
    jsonb_build_object(
      'invited_email', p_invited_email,
      'role', p_role
    )
  ) INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_notifications(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, UUID, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, JSONB, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION check_low_stock_notifications(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_sale_notification(UUID, UUID, DECIMAL, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION create_invitation_notification(UUID, VARCHAR, VARCHAR) TO authenticated;

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id, notification_type, enabled, email_enabled, push_enabled)
SELECT DISTINCT 
  bm.user_id,
  nt.notification_type,
  CASE 
    WHEN nt.notification_type IN ('low_stock', 'payment', 'sale') THEN TRUE
    ELSE FALSE
  END,
  FALSE,
  TRUE
FROM business_memberships bm
CROSS JOIN (
  SELECT unnest(ARRAY['low_stock', 'payment', 'sale', 'invitation', 'expense', 'tax']) as notification_type
) nt
WHERE NOT EXISTS (
  SELECT 1 FROM notification_preferences np 
  WHERE np.user_id = bm.user_id 
  AND np.notification_type = nt.notification_type
);

-- Create some sample notifications for testing
INSERT INTO notifications (business_id, user_id, title, message, type, priority, action_url)
SELECT 
  bm.business_id,
  bm.user_id,
  'Welcome to Otic Business!',
  'Your business account has been set up successfully. Start by adding your first products to inventory.',
  'info',
  'medium',
  '/inventory'
FROM business_memberships bm
WHERE bm.role = 'owner'
  AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.business_id = bm.business_id 
    AND n.title = 'Welcome to Otic Business!'
  );

-- Test the functions
SELECT 'Testing notification functions:' as info;
SELECT get_unread_notification_count('3488046f-56cf-4711-9045-7e6e158a1c91') as unread_count;
SELECT * FROM get_recent_notifications('3488046f-56cf-4711-9045-7e6e158a1c91', NULL, 5);
