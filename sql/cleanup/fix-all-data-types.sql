-- =====================================================
-- FIX ALL DATA TYPES IN OTIC VISION TABLES
-- =====================================================
-- This script fixes all data type mismatches in the OTIC Vision tables

-- 1. Drop and recreate personalised_visual_bank with correct data types
DROP TABLE IF EXISTS personalised_visual_bank CASCADE;

CREATE TABLE personalised_visual_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID, -- Optional business reference
  product_name VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255),
  category VARCHAR(100),
  retail_price DECIMAL(10,2), -- DECIMAL for prices (not INTEGER)
  cost_price DECIMAL(10,2),   -- DECIMAL for prices (not INTEGER)
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
  contrast_ratio DECIMAL(5,2), -- DECIMAL for contrast ratio
  color_temperature INTEGER,   -- INTEGER for color temperature
  luminance DECIMAL(3,2),      -- DECIMAL for luminance
  recognition_confidence DECIMAL(3,2) DEFAULT 0.95,
  similarity_threshold DECIMAL(3,2) DEFAULT 0.85,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Drop and recreate token_similarity_log with correct data types
DROP TABLE IF EXISTS token_similarity_log CASCADE;

CREATE TABLE token_similarity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES personalised_visual_bank(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_token JSONB NOT NULL,
  similarity_score DECIMAL(3,2) NOT NULL, -- DECIMAL for similarity score
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_match BOOLEAN DEFAULT FALSE
);

-- 3. Drop and recreate color_analysis_cache with correct data types
DROP TABLE IF EXISTS color_analysis_cache CASCADE;

CREATE TABLE color_analysis_cache (
  image_hash TEXT PRIMARY KEY,
  dominant_colors JSONB,
  spatial_pattern JSONB,
  lighting_profile JSONB,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Drop and recreate recognition_sessions with correct data types
DROP TABLE IF EXISTS recognition_sessions CASCADE;

CREATE TABLE recognition_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  total_recognitions INTEGER DEFAULT 0,
  successful_matches INTEGER DEFAULT 0,
  failed_matches INTEGER DEFAULT 0
);

-- 5. Enable RLS on all tables
ALTER TABLE personalised_visual_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_similarity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE recognition_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for personalised_visual_bank
CREATE POLICY "Users can view own products" ON personalised_visual_bank
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON personalised_visual_bank
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON personalised_visual_bank
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON personalised_visual_bank
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Create RLS policies for token_similarity_log
CREATE POLICY "Users can view own similarity logs" ON token_similarity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own similarity logs" ON token_similarity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Create RLS policies for color_analysis_cache
CREATE POLICY "Anyone can read color cache" ON color_analysis_cache
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert color cache" ON color_analysis_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. Create RLS policies for recognition_sessions
CREATE POLICY "Users can view own sessions" ON recognition_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON recognition_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON recognition_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create indexes
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_user_id ON personalised_visual_bank(user_id);
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_token_hash ON personalised_visual_bank(token_hash);
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_category ON personalised_visual_bank(category);
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_user_id ON token_similarity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_product_id ON token_similarity_log(product_id);
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_matched_at ON token_similarity_log(matched_at);

-- 11. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 12. Verify table structures
SELECT 
  'personalised_visual_bank columns:' as table_name,
  string_agg(column_name || ' (' || data_type || ')', ', ') as columns
FROM information_schema.columns 
WHERE table_name = 'personalised_visual_bank' 
AND table_schema = 'public';

SELECT 
  'token_similarity_log columns:' as table_name,
  string_agg(column_name || ' (' || data_type || ')', ', ') as columns
FROM information_schema.columns 
WHERE table_name = 'token_similarity_log' 
AND table_schema = 'public';

SELECT 
  'color_analysis_cache columns:' as table_name,
  string_agg(column_name || ' (' || data_type || ')', ', ') as columns
FROM information_schema.columns 
WHERE table_name = 'color_analysis_cache' 
AND table_schema = 'public';

SELECT 
  'recognition_sessions columns:' as table_name,
  string_agg(column_name || ' (' || data_type || ')', ', ') as columns
FROM information_schema.columns 
WHERE table_name = 'recognition_sessions' 
AND table_schema = 'public';

-- Success message
SELECT 'All OTIC Vision tables fixed with correct data types!' as status;
