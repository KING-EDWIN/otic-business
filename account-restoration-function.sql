-- Account Restoration Function
-- This function restores a soft-deleted account back to its normal state

CREATE OR REPLACE FUNCTION restore_user_account(
  deleted_account_id_param UUID,
  admin_user_id_param UUID,
  restoration_reason_param TEXT DEFAULT 'Account restoration requested'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_account RECORD;
  new_user_id UUID;
  result JSONB;
BEGIN
  -- Get the deleted account information
  SELECT * INTO deleted_account 
  FROM deleted_users 
  WHERE id = deleted_account_id_param 
    AND is_recovered = false
    AND recovery_expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Account not found, already recovered, or recovery period expired'
    );
  END IF;

  -- Check if recovery period has expired
  IF deleted_account.recovery_expires_at <= NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Recovery period has expired. Account cannot be restored.'
    );
  END IF;

  -- Generate a new user ID for the restored account
  new_user_id := uuid_generate_v4();

  -- Restore the user profile
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
    verification_timestamp,
    verified_by,
    features_enabled,
    two_factor_enabled,
    individual_profession_id,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    deleted_account.email,
    deleted_account.full_name,
    deleted_account.business_name,
    deleted_account.user_type::text,
    deleted_account.tier::user_tier,
    deleted_account.phone,
    deleted_account.address,
    true, -- Mark as verified since it was verified before
    deleted_account.deleted_at, -- Use deletion time as verification time
    admin_user_id_param,
    '{}', -- Empty features object
    false, -- Two factor disabled by default
    null, -- Individual profession ID
    NOW(),
    NOW()
  );

  -- Restore businesses if they exist
  IF deleted_account.business_data IS NOT NULL AND jsonb_array_length(deleted_account.business_data) > 0 THEN
    -- Insert businesses from the business_data JSON
    INSERT INTO businesses (
      id,
      name,
      description,
      business_type,
      industry,
      website,
      phone,
      email,
      address,
      city,
      state,
      country,
      postal_code,
      tax_id,
      registration_number,
      currency,
      timezone,
      logo_url,
      status,
      settings,
      created_by,
      created_at,
      updated_at
    )
    SELECT 
      (business_item->>'id')::UUID,
      business_item->>'name',
      business_item->>'description',
      business_item->>'business_type',
      business_item->>'industry',
      business_item->>'website',
      business_item->>'phone',
      business_item->>'email',
      business_item->>'address',
      business_item->>'city',
      business_item->>'state',
      business_item->>'country',
      business_item->>'postal_code',
      business_item->>'tax_id',
      business_item->>'registration_number',
      business_item->>'currency',
      business_item->>'timezone',
      business_item->>'logo_url',
      'active',
      '{}',
      new_user_id,
      (business_item->>'created_at')::TIMESTAMP WITH TIME ZONE,
      NOW()
    FROM jsonb_array_elements(deleted_account.business_data) AS business_item;

    -- Restore business memberships
    INSERT INTO business_memberships (
      user_id,
      business_id,
      role,
      status,
      joined_at,
      created_at,
      updated_at
    )
    SELECT 
      new_user_id,
      (business_item->>'id')::UUID,
      'owner', -- Restored user becomes owner of their businesses
      'active',
      (business_item->>'created_at')::TIMESTAMP WITH TIME ZONE,
      NOW(),
      NOW()
    FROM jsonb_array_elements(deleted_account.business_data) AS business_item;
  END IF;

  -- Mark the deleted account as recovered
  UPDATE deleted_users 
  SET 
    is_recovered = true,
    recovered_at = NOW(),
    updated_at = NOW()
  WHERE id = deleted_account_id_param;

  -- Log the restoration action
  INSERT INTO admin_logs (
    admin_user_id,
    action_type,
    target_user_id,
    details,
    created_at
  ) VALUES (
    admin_user_id_param,
    'account_restored',
    new_user_id,
    jsonb_build_object(
      'original_user_id', deleted_account.original_user_id,
      'email', deleted_account.email,
      'restoration_reason', restoration_reason_param,
      'deleted_at', deleted_account.deleted_at,
      'restored_at', NOW()
    ),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Account restored successfully',
    'new_user_id', new_user_id,
    'email', deleted_account.email,
    'restored_at', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to restore account: ' || SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION restore_user_account(UUID, UUID, TEXT) TO authenticated;

-- Test the function (optional - remove in production)
-- SELECT restore_user_account(
--   '7e755e4c-7796-4cd9-9410-43bc732cbb9c', -- deleted account ID
--   '00000000-0000-0000-0000-000000000000', -- admin user ID
--   'Testing account restoration'
-- );
