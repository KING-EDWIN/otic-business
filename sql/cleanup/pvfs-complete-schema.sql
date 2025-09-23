-- =====================================================
-- PVFS (Personalized Visual Filtering System) - Complete Schema
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CORE PVFS TABLES
-- =====================================================

-- VFT Categories Table
CREATE TABLE vft_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- For UI display
  color TEXT, -- For UI theming
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO vft_categories (name, description, icon, color) VALUES
('Clothing and Textile', 'Apparel, fabrics, and clothing accessories', '👕', '#faa51a'),
('Electronics', 'Electronic devices and accessories', '📱', '#040458'),
('Food and Beverages', 'Food items and drinks', '🍕', '#faa51a'),
('Home and Garden', 'Household items and garden supplies', '🏠', '#040458'),
('Health and Beauty', 'Health products and beauty items', '💄', '#faa51a'),
('Sports and Recreation', 'Sports equipment and recreational items', '⚽', '#040458'),
('Books and Media', 'Books, magazines, and media', '📚', '#faa51a'),
('Automotive', 'Vehicle parts and automotive accessories', '🚗', '#040458'),
('Office Supplies', 'Office equipment and supplies', '📝', '#faa51a'),
('Toys and Games', 'Children''s toys and games', '🎮', '#040458'),
('Other', 'Custom category for unique items', '📦', '#666666');

-- Visual Filter Tags Table
CREATE TABLE visual_filter_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  category_id UUID REFERENCES vft_categories(id),
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP,
  confidence_score DECIMAL DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, tag_name)
);

-- VFT Products Table
CREATE TABLE vft_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vft_id UUID REFERENCES visual_filter_tags(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  cost DECIMAL NOT NULL,
  profit_margin DECIMAL GENERATED ALWAYS AS (price - cost) STORED,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  barcode TEXT,
  sku TEXT,
  weight DECIMAL,
  dimensions TEXT, -- "L x W x H"
  color TEXT,
  size TEXT,
  material TEXT,
  country_of_origin TEXT,
  supplier TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. VISUAL FINGERPRINTING TABLES
-- =====================================================

-- Product Visual Fingerprints
CREATE TABLE product_visual_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES vft_products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  angle_type TEXT NOT NULL, -- 'front', 'back', 'side', 'top'
  confidence_score DECIMAL DEFAULT 0.0,
  image_hash TEXT, -- For duplicate detection
  file_size INTEGER,
  dimensions TEXT, -- "width x height"
  created_at TIMESTAMP DEFAULT NOW()
);

-- Visual Scan History
CREATE TABLE visual_scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES vft_products(id) ON DELETE SET NULL,
  vft_name TEXT NOT NULL,
  scan_image_url TEXT,
  detected_objects JSONB, -- Store AI detection results
  confidence_score DECIMAL,
  scan_location TEXT, -- 'pos', 'inventory', 'mobile'
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. ANALYTICS & LEARNING TABLES
-- =====================================================

-- VFT Usage Statistics
CREATE TABLE vft_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vft_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, vft_name)
);

-- VFT Time Patterns
CREATE TABLE vft_time_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vft_name TEXT NOT NULL,
  hour_of_day INTEGER,
  day_of_week INTEGER,
  usage_frequency INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, vft_name, hour_of_day, day_of_week)
);

-- VFT Profit Analysis
CREATE TABLE vft_profit_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vft_name TEXT NOT NULL,
  total_sales DECIMAL DEFAULT 0,
  total_profit DECIMAL DEFAULT 0,
  profit_margin DECIMAL DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- VFT Analytics (Daily)
CREATE TABLE vft_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vft_name TEXT NOT NULL,
  scan_count INTEGER DEFAULT 1,
  sales_count INTEGER DEFAULT 0,
  total_revenue DECIMAL DEFAULT 0,
  scan_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. DUPLICATE DETECTION & SIMILARITY
-- =====================================================

-- Product Similarity Log
CREATE TABLE product_similarity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product1_id UUID REFERENCES vft_products(id) ON DELETE CASCADE,
  product2_id UUID REFERENCES vft_products(id) ON DELETE CASCADE,
  similarity_score DECIMAL NOT NULL,
  similarity_reason TEXT,
  user_action TEXT, -- 'ignore', 'merge', 'separate'
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE vft_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_filter_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE vft_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_visual_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vft_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE vft_time_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE vft_profit_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE vft_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_similarity_log ENABLE ROW LEVEL SECURITY;

-- VFT Categories - Public read access
CREATE POLICY "Public read access for vft_categories" ON vft_categories
  FOR SELECT USING (true);

-- Visual Filter Tags - User-specific access
CREATE POLICY "Users can manage their own vft_tags" ON visual_filter_tags
  FOR ALL USING (auth.uid() = user_id);

-- VFT Products - User-specific access
CREATE POLICY "Users can manage their own vft_products" ON vft_products
  FOR ALL USING (auth.uid() = user_id);

-- Product Visual Fingerprints - User-specific access
CREATE POLICY "Users can manage their own visual_fingerprints" ON product_visual_fingerprints
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vft_products 
      WHERE id = product_visual_fingerprints.product_id 
      AND user_id = auth.uid()
    )
  );

-- Visual Scan History - User-specific access
CREATE POLICY "Users can manage their own scan_history" ON visual_scan_history
  FOR ALL USING (auth.uid() = user_id);

-- Analytics tables - User-specific access
CREATE POLICY "Users can manage their own usage_stats" ON vft_usage_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own time_patterns" ON vft_time_patterns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own profit_analysis" ON vft_profit_analysis
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own analytics" ON vft_analytics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own similarity_log" ON product_similarity_log
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 6. RPC FUNCTIONS
-- =====================================================

-- Function to create a new VFT
CREATE OR REPLACE FUNCTION create_vft(
  p_tag_name TEXT,
  p_category_id UUID,
  p_confidence_score DECIMAL DEFAULT 0.0
) RETURNS UUID AS $$
DECLARE
  v_vft_id UUID;
BEGIN
  -- Check if VFT already exists for this user
  SELECT id INTO v_vft_id 
  FROM visual_filter_tags 
  WHERE user_id = auth.uid() AND tag_name = p_tag_name;
  
  IF v_vft_id IS NOT NULL THEN
    -- Update usage count and last used
    UPDATE visual_filter_tags 
    SET usage_count = usage_count + 1,
        last_used = NOW(),
        confidence_score = GREATEST(confidence_score, p_confidence_score),
        updated_at = NOW()
    WHERE id = v_vft_id;
    
    RETURN v_vft_id;
  ELSE
    -- Create new VFT
    INSERT INTO visual_filter_tags (user_id, tag_name, category_id, confidence_score)
    VALUES (auth.uid(), p_tag_name, p_category_id, p_confidence_score);
    
    -- Get the ID of the inserted record
    SELECT id INTO v_vft_id 
    FROM visual_filter_tags 
    WHERE user_id = auth.uid() AND tag_name = p_tag_name;
    
    RETURN v_vft_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to register a product with VFT
CREATE OR REPLACE FUNCTION register_vft_product(
  p_vft_id UUID,
  p_brand_name TEXT,
  p_product_name TEXT,
  p_price DECIMAL,
  p_cost DECIMAL,
  p_description TEXT DEFAULT NULL,
  p_stock_quantity INTEGER DEFAULT 0,
  p_barcode TEXT DEFAULT NULL,
  p_sku TEXT DEFAULT NULL,
  p_weight DECIMAL DEFAULT NULL,
  p_dimensions TEXT DEFAULT NULL,
  p_color TEXT DEFAULT NULL,
  p_size TEXT DEFAULT NULL,
  p_material TEXT DEFAULT NULL,
  p_country_of_origin TEXT DEFAULT NULL,
  p_supplier TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_product_id UUID;
BEGIN
  INSERT INTO vft_products (
    user_id, vft_id, brand_name, product_name, price, cost,
    description, stock_quantity, barcode, sku, weight,
    dimensions, color, size, material, country_of_origin, supplier
  ) VALUES (
    auth.uid(), p_vft_id, p_brand_name, p_product_name, p_price, p_cost,
    p_description, p_stock_quantity, p_barcode, p_sku, p_weight,
    p_dimensions, p_color, p_size, p_material, p_country_of_origin, p_supplier
  );
  
  -- Get the ID of the inserted record
  SELECT id INTO v_product_id 
  FROM vft_products 
  WHERE user_id = auth.uid() AND vft_id = p_vft_id AND brand_name = p_brand_name AND product_name = p_product_name
  ORDER BY created_at DESC LIMIT 1;
  
  RETURN v_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log visual scan
CREATE OR REPLACE FUNCTION log_visual_scan(
  p_product_id UUID DEFAULT NULL,
  p_vft_name TEXT DEFAULT NULL,
  p_scan_image_url TEXT DEFAULT NULL,
  p_detected_objects JSONB DEFAULT NULL,
  p_confidence_score DECIMAL DEFAULT 0.0,
  p_scan_location TEXT DEFAULT 'mobile'
) RETURNS UUID AS $$
DECLARE
  v_scan_id UUID;
BEGIN
  INSERT INTO visual_scan_history (
    user_id, product_id, vft_name, scan_image_url,
    detected_objects, confidence_score, scan_location
  ) VALUES (
    auth.uid(), p_product_id, p_vft_name, p_scan_image_url,
    p_detected_objects, p_confidence_score, p_scan_location
  );
  
  -- Get the ID of the inserted record
  SELECT id INTO v_scan_id 
  FROM visual_scan_history 
  WHERE user_id = auth.uid() AND vft_name = p_vft_name
  ORDER BY created_at DESC LIMIT 1;
  
  -- Update VFT usage stats
  INSERT INTO vft_usage_stats (user_id, vft_name, usage_count, last_used)
  VALUES (auth.uid(), p_vft_name, 1, NOW())
  ON CONFLICT (user_id, vft_name) 
  DO UPDATE SET 
    usage_count = vft_usage_stats.usage_count + 1,
    last_used = NOW();
  
  -- Update time patterns
  INSERT INTO vft_time_patterns (user_id, vft_name, hour_of_day, day_of_week, usage_frequency)
  VALUES (auth.uid(), p_vft_name, EXTRACT(hour FROM NOW()), EXTRACT(dow FROM NOW()), 1)
  ON CONFLICT (user_id, vft_name, hour_of_day, day_of_week)
  DO UPDATE SET usage_frequency = vft_time_patterns.usage_frequency + 1;
  
  RETURN v_scan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get products by VFT for POS
CREATE OR REPLACE FUNCTION get_products_by_vft(p_vft_name TEXT)
RETURNS TABLE (
  product_id UUID,
  brand_name TEXT,
  product_name TEXT,
  price DECIMAL,
  stock_quantity INTEGER,
  profit_margin DECIMAL,
  barcode TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.brand_name,
    p.product_name,
    p.price,
    p.stock_quantity,
    p.profit_margin,
    p.barcode
  FROM vft_products p
  JOIN visual_filter_tags vft ON p.vft_id = vft.id
  WHERE vft.user_id = auth.uid() 
    AND vft.tag_name = p_vft_name
    AND p.stock_quantity > 0
  ORDER BY p.usage_count DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect similar products
CREATE OR REPLACE FUNCTION detect_similar_products(p_product_id UUID)
RETURNS TABLE (
  similar_product_id UUID,
  similarity_score DECIMAL,
  similarity_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p2.id as similar_product_id,
    CASE 
      WHEN p1.brand_name = p2.brand_name AND p1.product_name = p2.product_name THEN 0.9
      WHEN p1.brand_name = p2.brand_name THEN 0.7
      WHEN p1.product_name = p2.product_name THEN 0.6
      WHEN p1.description = p2.description THEN 0.5
      ELSE 0.3
    END as similarity_score,
    CASE 
      WHEN p1.brand_name = p2.brand_name AND p1.product_name = p2.product_name THEN 'Exact match'
      WHEN p1.brand_name = p2.brand_name THEN 'Same brand'
      WHEN p1.product_name = p2.product_name THEN 'Same product name'
      WHEN p1.description = p2.description THEN 'Same description'
      ELSE 'Similar category'
    END as similarity_reason
  FROM vft_products p1
  CROSS JOIN vft_products p2
  WHERE p1.id = p_product_id
    AND p2.user_id = auth.uid()
    AND p2.id != p_product_id
    AND (
      p1.brand_name = p2.brand_name OR
      p1.product_name = p2.product_name OR
      p1.description = p2.description
    )
  ORDER BY similarity_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get VFT analytics
CREATE OR REPLACE FUNCTION get_vft_analytics(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  vft_name TEXT,
  total_scans INTEGER,
  total_sales INTEGER,
  total_revenue DECIMAL,
  avg_confidence DECIMAL,
  most_used_hour INTEGER,
  most_used_day INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    va.vft_name,
    SUM(va.scan_count) as total_scans,
    SUM(va.sales_count) as total_sales,
    SUM(va.total_revenue) as total_revenue,
    AVG(vsh.confidence_score) as avg_confidence,
    (SELECT tp2.hour_of_day FROM vft_time_patterns tp2 WHERE tp2.vft_name = va.vft_name AND tp2.user_id = auth.uid() GROUP BY tp2.hour_of_day ORDER BY COUNT(*) DESC LIMIT 1) as most_used_hour,
    (SELECT tp2.day_of_week FROM vft_time_patterns tp2 WHERE tp2.vft_name = va.vft_name AND tp2.user_id = auth.uid() GROUP BY tp2.day_of_week ORDER BY COUNT(*) DESC LIMIT 1) as most_used_day
  FROM vft_analytics va
  LEFT JOIN visual_scan_history vsh ON va.vft_name = vsh.vft_name
  LEFT JOIN vft_time_patterns tp ON va.vft_name = tp.vft_name
  WHERE va.user_id = auth.uid()
    AND va.scan_date BETWEEN p_start_date AND p_end_date
  GROUP BY va.vft_name
  ORDER BY total_scans DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for VFT lookups
CREATE INDEX idx_visual_filter_tags_user_tag ON visual_filter_tags(user_id, tag_name);
CREATE INDEX idx_visual_filter_tags_category ON visual_filter_tags(category_id);
CREATE INDEX idx_vft_products_vft ON vft_products(vft_id);
CREATE INDEX idx_vft_products_user ON vft_products(user_id);
CREATE INDEX idx_vft_products_barcode ON vft_products(barcode) WHERE barcode IS NOT NULL;

-- Indexes for analytics
CREATE INDEX idx_vft_analytics_user_date ON vft_analytics(user_id, scan_date);
CREATE INDEX idx_vft_usage_stats_user ON vft_usage_stats(user_id);
CREATE INDEX idx_vft_time_patterns_user ON vft_time_patterns(user_id);

-- Indexes for visual fingerprints
CREATE INDEX idx_visual_fingerprints_product ON product_visual_fingerprints(product_id);
CREATE INDEX idx_visual_fingerprints_angle ON product_visual_fingerprints(angle_type);

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER update_vft_categories_updated_at BEFORE UPDATE ON vft_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visual_filter_tags_updated_at BEFORE UPDATE ON visual_filter_tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vft_products_updated_at BEFORE UPDATE ON vft_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample VFTs for testing (using a dummy user ID - replace with actual user ID)
-- INSERT INTO visual_filter_tags (user_id, tag_name, category_id, confidence_score) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'Calculator', (SELECT id FROM vft_categories WHERE name = 'Electronics'), 0.95),
-- ('00000000-0000-0000-0000-000000000001', 'Hanger', (SELECT id FROM vft_categories WHERE name = 'Clothing and Textile'), 0.90),
-- ('00000000-0000-0000-0000-000000000001', 'Bottle', (SELECT id FROM vft_categories WHERE name = 'Food and Beverages'), 0.85);

-- =====================================================
-- COMPLETE PVFS SCHEMA READY!
-- =====================================================
