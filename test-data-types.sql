-- =====================================================
-- TEST DATA TYPES IN OTIC VISION TABLES
-- =====================================================
-- This script tests the data types to ensure they can handle the expected values

-- 1. Test inserting data with decimal prices
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
  'Test Product with Decimal Price',
  'Test Manufacturer',
  'Test Category',
  6102.10,  -- Decimal price
  4500.75,  -- Decimal price
  10,       -- Integer stock
  5,        -- Integer min stock
  'piece',
  'data:image/test',
  'test_token_123',
  'test_hash_' || extract(epoch from now()),
  '{"test": "metadata"}',
  '[{"r": 255, "g": 0, "b": 0, "percentage": 0.5}]',
  '{"topLeft": {"r": 255, "g": 0, "b": 0}}',
  '{"brightness": 0.8, "contrast": 4.5, "color_temperature": 6500}',
  4.50,     -- Decimal contrast ratio
  6500,     -- Integer color temperature
  0.75,     -- Decimal luminance
  0.95,     -- Decimal confidence
  0.85      -- Decimal threshold
);

-- 2. Test inserting similarity log with decimal score
INSERT INTO token_similarity_log (
  product_id,
  user_id,
  detected_token,
  similarity_score,
  is_match
) VALUES (
  (SELECT id FROM personalised_visual_bank WHERE product_name = 'Test Product with Decimal Price' LIMIT 1),
  '00000000-0000-0000-0000-000000000001',
  '{"test": "detected_token"}',
  0.87,     -- Decimal similarity score
  true
);

-- 3. Test inserting color analysis cache
INSERT INTO color_analysis_cache (
  image_hash,
  dominant_colors,
  spatial_pattern,
  lighting_profile
) VALUES (
  'test_hash_123',
  '[{"r": 255, "g": 0, "b": 0, "percentage": 0.5}]',
  '{"pattern": "test"}',
  '{"brightness": 0.8}'
);

-- 4. Test inserting recognition session
INSERT INTO recognition_sessions (
  user_id,
  total_recognitions,
  successful_matches,
  failed_matches
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  10,  -- Integer
  8,   -- Integer
  2    -- Integer
);

-- 5. Verify the inserted data
SELECT 
  'Test Data Verification' as test_type,
  product_name,
  retail_price,
  cost_price,
  current_stock,
  min_stock,
  contrast_ratio,
  color_temperature,
  luminance
FROM personalised_visual_bank 
WHERE product_name = 'Test Product with Decimal Price';

SELECT 
  'Similarity Log Verification' as test_type,
  similarity_score,
  is_match
FROM token_similarity_log 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1;

-- 6. Clean up test data
DELETE FROM token_similarity_log 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

DELETE FROM personalised_visual_bank 
WHERE product_name = 'Test Product with Decimal Price';

DELETE FROM color_analysis_cache 
WHERE image_hash = 'test_hash_123';

DELETE FROM recognition_sessions 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Success message
SELECT 'Data type tests completed successfully!' as status;


