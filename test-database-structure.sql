-- =====================================================
-- TEST DATABASE STRUCTURE
-- =====================================================
-- This script tests the database structure to ensure it matches frontend expectations

-- 1. Check personalised_visual_bank table structure
SELECT 
  'personalised_visual_bank columns:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'personalised_visual_bank' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Test insert with all required fields
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
  'Test Product Structure',
  'Test Manufacturer',
  'Test Category',
  100.00,
  80.00,
  10,
  5,
  'piece',
  'data:image/test',
  'test_visual_token_123',
  'test_token_hash_123',
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

-- 3. Verify the insert worked
SELECT 
  'Test Insert Verification:' as info,
  id,
  product_name,
  retail_price,
  cost_price,
  visual_token,
  token_hash,
  user_id
FROM personalised_visual_bank 
WHERE product_name = 'Test Product Structure';

-- 4. Clean up test data
DELETE FROM personalised_visual_bank 
WHERE product_name = 'Test Product Structure';

-- Success message
SELECT 'Database structure test completed successfully!' as status;
