-- =====================================================
-- COMPLETE SUPABASE SETUP FOR OTIC VISION SYSTEM
-- =====================================================
-- This script sets up everything needed for the OTIC Vision system
-- Run this in your Supabase SQL Editor

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the personalised_visual_bank table
CREATE TABLE IF NOT EXISTS personalised_visual_bank (
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

-- 3. Create token_similarity_log table
CREATE TABLE IF NOT EXISTS token_similarity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES personalised_visual_bank(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_token JSONB NOT NULL,
  similarity_score DECIMAL(3,2) NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_match BOOLEAN DEFAULT FALSE
);

-- 4. Create color_analysis_cache table
CREATE TABLE IF NOT EXISTS color_analysis_cache (
  image_hash TEXT PRIMARY KEY,
  dominant_colors JSONB,
  spatial_pattern JSONB,
  lighting_profile JSONB,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create recognition_sessions table
CREATE TABLE IF NOT EXISTS recognition_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  total_recognitions INTEGER DEFAULT 0,
  successful_matches INTEGER DEFAULT 0,
  failed_matches INTEGER DEFAULT 0
);

-- 6. Create RLS Policies for personalised_visual_bank
ALTER TABLE personalised_visual_bank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products" ON personalised_visual_bank
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON personalised_visual_bank
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON personalised_visual_bank
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON personalised_visual_bank
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Create RLS Policies for token_similarity_log
ALTER TABLE token_similarity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own similarity logs" ON token_similarity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own similarity logs" ON token_similarity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Create RLS Policies for color_analysis_cache (public read, authenticated write)
ALTER TABLE color_analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read color cache" ON color_analysis_cache
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert color cache" ON color_analysis_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. Create RLS Policies for recognition_sessions
ALTER TABLE recognition_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON recognition_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON recognition_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON recognition_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create RPC Functions for token operations

-- Function to find best token match
CREATE OR REPLACE FUNCTION find_best_token_match(
  detected_token_metadata JSONB,
  user_id_param UUID DEFAULT NULL,
  min_similarity DECIMAL DEFAULT 0.85
)
RETURNS TABLE (
  id UUID,
  product_name VARCHAR,
  manufacturer VARCHAR,
  category VARCHAR,
  retail_price DECIMAL,
  cost_price DECIMAL,
  similarity_score DECIMAL,
  confidence_level DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  detected_histogram DECIMAL[];
  detected_colors JSONB;
  detected_spatial JSONB;
BEGIN
  -- Extract detected token components
  detected_histogram := ARRAY(SELECT jsonb_array_elements_text(detected_token_metadata->'histogram')::DECIMAL);
  detected_colors := detected_token_metadata->'dominantColors';
  detected_spatial := detected_token_metadata->'spatialDistribution';
  
  -- Return products with similarity calculations
  RETURN QUERY
  SELECT 
    pvb.id,
    pvb.product_name,
    pvb.manufacturer,
    pvb.category,
    pvb.retail_price,
    pvb.cost_price,
    -- Simplified similarity calculation (you can enhance this)
    CASE 
      WHEN pvb.token_metadata->>'tokenHash' = detected_token_metadata->>'tokenHash' THEN 1.0
      ELSE 0.5 -- Placeholder similarity
    END as similarity_score,
    pvb.recognition_confidence as confidence_level
  FROM personalised_visual_bank pvb
  WHERE (user_id_param IS NULL OR pvb.user_id = user_id_param)
  ORDER BY similarity_score DESC;
END;
$$;

-- Function to log token similarity
CREATE OR REPLACE FUNCTION log_token_similarity(
  product_id_param UUID,
  user_id_param UUID,
  detected_token_param JSONB,
  similarity_score_param DECIMAL,
  is_match_param BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO token_similarity_log (
    product_id,
    user_id,
    detected_token,
    similarity_score,
    is_match
  ) VALUES (
    product_id_param,
    user_id_param,
    detected_token_param,
    similarity_score_param,
    is_match_param
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to get product by visual token
CREATE OR REPLACE FUNCTION get_product_by_visual_token(
  token_hash_param TEXT,
  user_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  product_name VARCHAR,
  manufacturer VARCHAR,
  category VARCHAR,
  retail_price DECIMAL,
  cost_price DECIMAL,
  raw_image_url TEXT,
  token_metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pvb.id,
    pvb.product_name,
    pvb.manufacturer,
    pvb.category,
    pvb.retail_price,
    pvb.cost_price,
    pvb.raw_image_url,
    pvb.token_metadata
  FROM personalised_visual_bank pvb
  WHERE pvb.token_hash = token_hash_param
    AND (user_id_param IS NULL OR pvb.user_id = user_id_param);
END;
$$;

-- Function to register visual product
CREATE OR REPLACE FUNCTION register_visual_product(
  user_id_param UUID,
  product_name_param VARCHAR,
  manufacturer_param VARCHAR,
  category_param VARCHAR,
  retail_price_param DECIMAL,
  cost_price_param DECIMAL,
  raw_image_url_param TEXT,
  visual_token_param TEXT,
  token_hash_param TEXT,
  token_metadata_param JSONB,
  dominant_colors_param JSONB,
  color_distribution_param JSONB,
  lighting_profile_param JSONB,
  contrast_ratio_param DECIMAL,
  color_temperature_param INTEGER,
  luminance_param DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_id UUID;
BEGIN
  INSERT INTO personalised_visual_bank (
    user_id,
    product_name,
    manufacturer,
    category,
    retail_price,
    cost_price,
    raw_image_url,
    visual_token,
    token_hash,
    token_metadata,
    dominant_colors,
    color_distribution,
    lighting_profile,
    contrast_ratio,
    color_temperature,
    luminance
  ) VALUES (
    user_id_param,
    product_name_param,
    manufacturer_param,
    category_param,
    retail_price_param,
    cost_price_param,
    raw_image_url_param,
    visual_token_param,
    token_hash_param,
    token_metadata_param,
    dominant_colors_param,
    color_distribution_param,
    lighting_profile_param,
    contrast_ratio_param,
    color_temperature_param,
    luminance_param
  ) RETURNING id INTO product_id;
  
  RETURN product_id;
END;
$$;

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_user_id ON personalised_visual_bank(user_id);
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_token_hash ON personalised_visual_bank(token_hash);
CREATE INDEX IF NOT EXISTS idx_personalised_visual_bank_category ON personalised_visual_bank(category);
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_user_id ON token_similarity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_product_id ON token_similarity_log(product_id);
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_matched_at ON token_similarity_log(matched_at);

-- 12. Create storage bucket policies (run after creating bucket)
-- Note: These will be created when you set up the storage bucket

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'OTIC Vision database setup completed successfully!' as status;
