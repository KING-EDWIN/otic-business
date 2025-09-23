-- =====================================================
-- FIX TABLE AND RLS ONLY (NO STORAGE CHANGES)
-- =====================================================
-- This script only fixes the personalised_visual_bank table and RLS

-- 1. Fix personalised_visual_bank table
DROP TABLE IF EXISTS personalised_visual_bank CASCADE;

CREATE TABLE personalised_visual_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID, -- Optional business reference
  product_name VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255),
  category VARCHAR(100),
  retail_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  unit_type TEXT DEFAULT 'piece',
  raw_image_url TEXT,
  visual_token TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  token_metadata JSONB,
  dominant_colors JSONB,
  color_distribution JSONB,
  lighting_profile JSONB,
  contrast_ratio DECIMAL(5,2),
  color_temperature INTEGER,
  luminance DECIMAL(3,2),
  recognition_confidence DECIMAL(3,2) DEFAULT 0.95,
  similarity_threshold DECIMAL(3,2) DEFAULT 0.85,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE personalised_visual_bank ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for personalised_visual_bank
CREATE POLICY "Users can view own products" ON personalised_visual_bank
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON personalised_visual_bank
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON personalised_visual_bank
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON personalised_visual_bank
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_user_id ON personalised_visual_bank(user_id);
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_token_hash ON personalised_visual_bank(token_hash);
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_category ON personalised_visual_bank(category);

-- 5. Grant permissions
GRANT ALL ON personalised_visual_bank TO authenticated;

-- 6. Create a test user if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = '00000000-0000-0000-0000-000000000001'
  ) THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      'test@oticvision.com',
      '$2a$10$dummy.hash.for.testing',
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"user_type": "business"}',
      false,
      'authenticated',
      'authenticated'
    );
    RAISE NOTICE 'Created test user';
  ELSE
    RAISE NOTICE 'Test user already exists';
  END IF;
END $$;

-- 7. Create user profile for test user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
  ) THEN
    INSERT INTO user_profiles (
      user_id,
      email,
      first_name,
      last_name,
      user_type,
      tier,
      email_verified,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      'test@oticvision.com',
      'Test',
      'User',
      'business',
      'premium',
      true,
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Created user profile';
  ELSE
    RAISE NOTICE 'User profile already exists';
  END IF;
END $$;

-- 8. Test the setup with a sample insert
INSERT INTO personalised_visual_bank (
  user_id,
  product_name,
  manufacturer,
  category,
  retail_price,
  cost_price,
  current_stock,
  min_stock,
  unit_type,
  raw_image_url,
  visual_token,
  token_hash,
  token_metadata,
  dominant_colors,
  color_distribution,
  lighting_profile,
  contrast_ratio,
  color_temperature,
  luminance,
  recognition_confidence,
  similarity_threshold
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Product',
  'Test Manufacturer',
  'Test Category',
  100.00,
  80.00,
  10,
  5,
  'piece',
  'data:image/test',
  'test_token_123',
  'test_hash_' || extract(epoch from now()),
  '{"test": "metadata"}',
  '[{"r": 255, "g": 0, "b": 0, "percentage": 0.5}]',
  '{"topLeft": {"r": 255, "g": 0, "b": 0}}',
  '{"brightness": 0.8, "contrast": 4.5, "color_temperature": 6500}',
  4.50,
  6500,
  0.75,
  0.95,
  0.85
);

-- 9. Verify the insert worked
SELECT 
  'Test Insert Verification:' as info,
  id,
  product_name,
  retail_price,
  cost_price,
  user_id
FROM personalised_visual_bank 
WHERE product_name = 'Test Product';

-- 10. Clean up test data
DELETE FROM personalised_visual_bank 
WHERE product_name = 'Test Product';

-- 11. Final verification
SELECT 
  'Final Status Check:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'personalised_visual_bank'
      AND policyname LIKE '%insert%'
    ) THEN '✅ RLS policies are configured'
    ELSE '❌ RLS policies missing'
  END as rls_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = '00000000-0000-0000-0000-000000000001'
    ) THEN '✅ Test user exists'
    ELSE '❌ Test user missing'
  END as user_status;

-- Success message
SELECT 'Table and RLS fixed successfully!' as status;
