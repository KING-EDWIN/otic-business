-- =====================================================
-- FIX ONLY OTIC VISION TEST TABLES
-- =====================================================
-- This script only fixes the tables we created for OTIC Vision testing

-- 1. Check what OTIC Vision tables exist
SELECT 
  'OTIC Vision Tables:' as info,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'personalised_visual_bank',
  'token_similarity_log', 
  'color_analysis_cache',
  'recognition_sessions'
)
ORDER BY table_name;

-- 2. Fix personalised_visual_bank table (our main test table)
DROP TABLE IF EXISTS personalised_visual_bank CASCADE;

CREATE TABLE personalised_visual_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID,
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

-- 3. Enable RLS on our test table
ALTER TABLE personalised_visual_bank ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for our test table
CREATE POLICY "Users can view own products" ON personalised_visual_bank
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON personalised_visual_bank
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON personalised_visual_bank
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON personalised_visual_bank
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create indexes for our test table
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_user_id ON personalised_visual_bank(user_id);
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_token_hash ON personalised_visual_bank(token_hash);
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_category ON personalised_visual_bank(category);

-- 6. Grant permissions for our test table
GRANT ALL ON personalised_visual_bank TO authenticated;

-- 7. Fix token_similarity_log table (our test log table)
DROP TABLE IF EXISTS token_similarity_log CASCADE;

CREATE TABLE token_similarity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES personalised_visual_bank(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_token JSONB NOT NULL,
  similarity_score DECIMAL(3,2) NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_match BOOLEAN DEFAULT FALSE
);

-- 8. Enable RLS on our test log table
ALTER TABLE token_similarity_log ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for our test log table
CREATE POLICY "Users can view own similarity logs" ON token_similarity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own similarity logs" ON token_similarity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Create indexes for our test log table
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_user_id ON token_similarity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_product_id ON token_similarity_log(product_id);
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_matched_at ON token_similarity_log(matched_at);

-- 11. Grant permissions for our test log table
GRANT ALL ON token_similarity_log TO authenticated;

-- 12. Test our setup with a sample insert (using a simple user ID)
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
  '00000000-0000-0000-0000-000000000001', -- Simple test user ID
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

-- 13. Verify our test insert worked
SELECT 
  'Test Insert Verification:' as info,
  id,
  product_name,
  retail_price,
  cost_price,
  user_id
FROM personalised_visual_bank 
WHERE product_name = 'Test Product';

-- 14. Clean up our test data
DELETE FROM personalised_visual_bank 
WHERE product_name = 'Test Product';

-- 15. Final verification of our test tables
SELECT 
  'Final OTIC Vision Tables Status:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'personalised_visual_bank' 
      AND table_schema = 'public'
    ) THEN '✅ personalised_visual_bank: Ready'
    ELSE '❌ personalised_visual_bank: Missing'
  END as main_table_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'token_similarity_log' 
      AND table_schema = 'public'
    ) THEN '✅ token_similarity_log: Ready'
    ELSE '❌ token_similarity_log: Missing'
  END as log_table_status;

-- Success message
SELECT 'OTIC Vision test tables fixed successfully!' as status;
