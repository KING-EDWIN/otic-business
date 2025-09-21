-- =====================================================
-- COMPREHENSIVE FIX FOR STORAGE AND RLS ISSUES
-- =====================================================
-- This script fixes both storage access control and RLS policy issues

-- 1. First, let's check the current state
SELECT 
  'Current Storage Buckets:' as info,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'product-images';

-- 2. Check current RLS policies
SELECT 
  'Current RLS Policies:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'personalised_visual_bank'
ORDER BY policyname;

-- 3. Drop and recreate the product-images bucket
DELETE FROM storage.buckets WHERE name = 'product-images';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- 4. Drop all existing storage policies
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- 5. Create new storage policies
CREATE POLICY "Public read access for product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- 6. Grant storage permissions
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;

-- 7. Drop and recreate personalised_visual_bank table with correct RLS
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

-- 8. Enable RLS
ALTER TABLE personalised_visual_bank ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for personalised_visual_bank
CREATE POLICY "Users can view own products" ON personalised_visual_bank
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON personalised_visual_bank
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON personalised_visual_bank
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON personalised_visual_bank
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Create indexes
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_user_id ON personalised_visual_bank(user_id);
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_token_hash ON personalised_visual_bank(token_hash);
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_category ON personalised_visual_bank(category);

-- 11. Grant permissions
GRANT ALL ON personalised_visual_bank TO authenticated;

-- 12. Test the setup with a sample insert
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

-- 13. Verify the insert worked
SELECT 
  'Test Insert Verification:' as info,
  id,
  product_name,
  retail_price,
  cost_price,
  user_id
FROM personalised_visual_bank 
WHERE product_name = 'Test Product';

-- 14. Clean up test data
DELETE FROM personalised_visual_bank 
WHERE product_name = 'Test Product';

-- 15. Final verification
SELECT 
  'Final Status Check:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets 
      WHERE name = 'product-images' AND public = true
    ) THEN '✅ Storage bucket is public and accessible'
    ELSE '❌ Storage bucket issues remain'
  END as storage_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'personalised_visual_bank'
      AND policyname LIKE '%insert%'
    ) THEN '✅ RLS policies are configured'
    ELSE '❌ RLS policies missing'
  END as rls_status;

-- Success message
SELECT 'Storage and RLS issues fixed successfully!' as status;


