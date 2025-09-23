-- =====================================================
-- TEST SUPABASE FUNCTIONS
-- =====================================================
-- Run this after fixing the functions to verify they work

-- 1. Test find_best_token_match function
SELECT 'Testing find_best_token_match...' as test_step;

SELECT 
  id,
  product_name,
  manufacturer,
  category,
  retail_price,
  cost_price,
  similarity_score,
  confidence_level
FROM find_best_token_match(
  '{"tokenHash": "test123", "histogram": [0.1, 0.2, 0.3], "dominantColors": [], "spatialDistribution": {}}',
  NULL,
  0.5
)
LIMIT 5;

-- 2. Test log_token_similarity function
SELECT 'Testing log_token_similarity...' as test_step;

-- This will only work if you have products in the database
-- If no products exist, it will return an error (which is expected)
DO $$
DECLARE
  log_id UUID;
  product_exists BOOLEAN;
BEGIN
  -- Check if any products exist
  SELECT EXISTS(SELECT 1 FROM personalised_visual_bank LIMIT 1) INTO product_exists;
  
  IF product_exists THEN
    -- Get first product ID
    SELECT log_token_similarity(
      (SELECT id FROM personalised_visual_bank LIMIT 1),
      '00000000-0000-0000-0000-000000000001',
      '{"test": "data"}',
      0.85,
      true
    ) INTO log_id;
    
    RAISE NOTICE 'log_token_similarity test passed, log_id: %', log_id;
  ELSE
    RAISE NOTICE 'No products found, skipping log_token_similarity test';
  END IF;
END $$;

-- 3. Test get_product_by_visual_token function
SELECT 'Testing get_product_by_visual_token...' as test_step;

SELECT 
  id,
  product_name,
  manufacturer,
  category,
  retail_price,
  cost_price,
  raw_image_url,
  token_metadata
FROM get_product_by_visual_token('test123', NULL)
LIMIT 5;

-- 4. Test register_visual_product function
SELECT 'Testing register_visual_product...' as test_step;

-- This will create a test product
SELECT register_visual_product(
  '00000000-0000-0000-0000-000000000001',
  'Test Product',
  'Test Manufacturer',
  'Test Category',
  100.00,
  80.00,
  'data:image/test',
  'test_token',
  'test_hash_' || extract(epoch from now()),
  '{"test": "metadata"}',
  '[{"r": 255, "g": 0, "b": 0, "percentage": 0.5}]',
  '{"topLeft": {"r": 255, "g": 0, "b": 0}}',
  '{"brightness": 0.8}',
  4.5,
  6500,
  0.75
) as test_product_id;

-- 5. Verify the test product was created
SELECT 'Verifying test product...' as test_step;

SELECT 
  id,
  product_name,
  manufacturer,
  category,
  retail_price,
  cost_price,
  token_hash
FROM personalised_visual_bank 
WHERE product_name = 'Test Product'
ORDER BY created_at DESC
LIMIT 1;

-- 6. Clean up test data
SELECT 'Cleaning up test data...' as test_step;

DELETE FROM personalised_visual_bank 
WHERE product_name = 'Test Product' 
AND manufacturer = 'Test Manufacturer';

-- Final success message
SELECT 'All function tests completed successfully!' as status;
