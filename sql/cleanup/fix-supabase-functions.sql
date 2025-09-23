-- =====================================================
-- FIX SUPABASE FUNCTIONS - HANDLE EXISTING FUNCTIONS
-- =====================================================
-- This script fixes the function creation issues

-- 1. Drop existing functions if they exist (with all possible signatures)
DROP FUNCTION IF EXISTS find_best_token_match(jsonb, uuid, numeric);
DROP FUNCTION IF EXISTS find_best_token_match(jsonb, uuid);
DROP FUNCTION IF EXISTS find_best_token_match(jsonb);
DROP FUNCTION IF EXISTS log_token_similarity(uuid, uuid, jsonb, numeric, boolean);
DROP FUNCTION IF EXISTS log_token_similarity(uuid, uuid, jsonb, numeric);
DROP FUNCTION IF EXISTS get_product_by_visual_token(text, uuid);
DROP FUNCTION IF EXISTS get_product_by_visual_token(text);
DROP FUNCTION IF EXISTS register_visual_product(uuid, varchar, varchar, varchar, numeric, numeric, text, text, text, jsonb, jsonb, jsonb, jsonb, numeric, integer, numeric);

-- 2. Create the corrected functions

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

-- Success message
SELECT 'Supabase functions fixed successfully!' as status;
