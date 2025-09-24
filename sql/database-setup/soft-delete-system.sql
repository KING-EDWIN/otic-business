-- Soft Delete System for Account Recovery
-- This allows users to recover their accounts within 30 days of deletion

-- Create deleted_users table to store soft-deleted accounts
CREATE TABLE IF NOT EXISTS deleted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  business_name VARCHAR(255),
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('business', 'individual')),
  tier VARCHAR(50) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  profile_data JSONB, -- Store the complete profile data
  business_data JSONB, -- Store business-related data
  deletion_reason TEXT,
  deleted_by UUID REFERENCES auth.users(id), -- Who deleted the account (user themselves or admin)
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recovery_token UUID DEFAULT gen_random_uuid(),
  recovery_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  is_recovered BOOLEAN DEFAULT FALSE,
  recovered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_deleted_users_email ON deleted_users(email);
CREATE INDEX IF NOT EXISTS idx_deleted_users_original_user_id ON deleted_users(original_user_id);
CREATE INDEX IF NOT EXISTS idx_deleted_users_recovery_token ON deleted_users(recovery_token);
CREATE INDEX IF NOT EXISTS idx_deleted_users_deleted_at ON deleted_users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_deleted_users_recovery_expires ON deleted_users(recovery_expires_at);

-- Enable RLS
ALTER TABLE deleted_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deleted_users
CREATE POLICY "Users can view their own deleted account" ON deleted_users 
  FOR SELECT USING (auth.uid() = original_user_id);

CREATE POLICY "Admins can view all deleted accounts" ON deleted_users 
  FOR SELECT USING (true);

CREATE POLICY "System can insert deleted accounts" ON deleted_users 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update deleted accounts" ON deleted_users 
  FOR UPDATE USING (true);

-- Function to soft delete a user account
CREATE OR REPLACE FUNCTION soft_delete_user_account(
  user_id_param UUID,
  deletion_reason_param TEXT DEFAULT 'User requested account deletion'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  business_data JSONB;
  user_data JSONB;
  result JSONB;
BEGIN
  -- Get user profile data
  SELECT * INTO user_profile 
  FROM user_profiles 
  WHERE id = user_id_param;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;

  -- Get user's businesses
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', b.id,
        'name', b.name,
        'business_type', b.business_type,
        'currency', b.currency,
        'timezone', b.timezone,
        'created_at', b.created_at,
        'updated_at', b.updated_at
      )
    ), 
    '[]'::jsonb
  ) INTO business_data
  FROM businesses b
  JOIN business_memberships bm ON b.id = bm.business_id
  WHERE bm.user_id = user_id_param;

  -- Prepare user data
  user_data := jsonb_build_object(
    'profile', row_to_json(user_profile),
    'businesses', business_data
  );

  -- Insert into deleted_users table
  INSERT INTO deleted_users (
    original_user_id,
    email,
    full_name,
    business_name,
    user_type,
    tier,
    phone,
    address,
    profile_data,
    business_data,
    deletion_reason,
    deleted_by
  ) VALUES (
    user_id_param,
    user_profile.email,
    user_profile.full_name,
    user_profile.business_name,
    user_profile.user_type,
    user_profile.tier,
    user_profile.phone,
    user_profile.address,
    user_data,
    business_data,
    deletion_reason_param,
    user_id_param -- User deleted their own account
  );

  -- Now delete the actual user data (hard delete)
  -- Delete business memberships
  DELETE FROM business_memberships WHERE user_id = user_id_param;
  
  -- Delete user profile
  DELETE FROM user_profiles WHERE id = user_id_param;
  
  -- Note: We don't delete the auth user here - that's handled by the application
  -- The auth user will be deleted by supabase.auth.admin.deleteUser()

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Account soft deleted successfully',
    'recovery_token', (SELECT recovery_token FROM deleted_users WHERE original_user_id = user_id_param ORDER BY deleted_at DESC LIMIT 1)
  );
END;
$$;

-- Function to recover a soft-deleted account
CREATE OR REPLACE FUNCTION recover_user_account(
  recovery_token_param UUID,
  new_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_user RECORD;
  profile_data JSONB;
  business_data JSONB;
  result JSONB;
BEGIN
  -- Get the deleted user data
  SELECT * INTO deleted_user 
  FROM deleted_users 
  WHERE recovery_token = recovery_token_param 
    AND is_recovered = FALSE 
    AND recovery_expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Recovery token not found or expired'
    );
  END IF;

  -- Extract profile data
  profile_data := deleted_user.profile_data->'profile';
  business_data := deleted_user.business_data;

  -- Restore user profile
  INSERT INTO user_profiles (
    id,
    email,
    full_name,
    business_name,
    user_type,
    tier,
    phone,
    address,
    email_verified,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    deleted_user.email,
    deleted_user.full_name,
    deleted_user.business_name,
    deleted_user.user_type,
    deleted_user.tier,
    deleted_user.phone,
    deleted_user.address,
    true, -- Email is verified since they're recovering
    NOW(),
    NOW()
  );

  -- Restore business memberships if any
  IF business_data IS NOT NULL AND jsonb_array_length(business_data) > 0 THEN
    -- For now, we'll just log that businesses existed
    -- In a full implementation, you might want to restore business memberships
    -- but this requires careful consideration of business ownership
    RAISE NOTICE 'User had businesses: %', business_data;
  END IF;

  -- Mark as recovered
  UPDATE deleted_users 
  SET is_recovered = TRUE, 
      recovered_at = NOW(),
      updated_at = NOW()
  WHERE recovery_token = recovery_token_param;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Account recovered successfully',
    'user_data', jsonb_build_object(
      'email', deleted_user.email,
      'full_name', deleted_user.full_name,
      'business_name', deleted_user.business_name,
      'user_type', deleted_user.user_type,
      'tier', deleted_user.tier
    )
  );
END;
$$;

-- Function to check if email has a recoverable account
CREATE OR REPLACE FUNCTION check_recoverable_account(email_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_user RECORD;
BEGIN
  -- Check if there's a recoverable account for this email
  SELECT * INTO deleted_user 
  FROM deleted_users 
  WHERE email = email_param 
    AND is_recovered = FALSE 
    AND recovery_expires_at > NOW()
  ORDER BY deleted_at DESC 
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'has_recoverable_account', false
    );
  END IF;

  RETURN jsonb_build_object(
    'has_recoverable_account', true,
    'deleted_at', deleted_user.deleted_at,
    'days_remaining', EXTRACT(DAYS FROM (deleted_user.recovery_expires_at - NOW())),
    'user_type', deleted_user.user_type,
    'business_name', deleted_user.business_name
  );
END;
$$;

-- Function to permanently delete expired accounts (run this as a cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_deleted_accounts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Count accounts to be deleted
  SELECT COUNT(*) INTO deleted_count
  FROM deleted_users 
  WHERE recovery_expires_at < NOW() 
    AND is_recovered = FALSE;

  -- Delete expired accounts
  DELETE FROM deleted_users 
  WHERE recovery_expires_at < NOW() 
    AND is_recovered = FALSE;

  RETURN deleted_count;
END;
$$;

-- Create a view for admin to see deleted accounts
CREATE OR REPLACE VIEW admin_deleted_accounts AS
SELECT 
  du.id,
  du.email,
  du.full_name,
  du.business_name,
  du.user_type,
  du.tier,
  du.deletion_reason,
  du.deleted_at,
  du.recovery_expires_at,
  du.is_recovered,
  du.recovered_at,
  EXTRACT(DAYS FROM (du.recovery_expires_at - NOW())) as days_remaining,
  CASE 
    WHEN du.recovery_expires_at < NOW() THEN 'EXPIRED'
    WHEN du.is_recovered THEN 'RECOVERED'
    ELSE 'ACTIVE'
  END as status
FROM deleted_users du
ORDER BY du.deleted_at DESC;

-- Grant permissions
GRANT SELECT ON admin_deleted_accounts TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_user_account(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION recover_user_account(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_recoverable_account(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_deleted_accounts() TO authenticated;
