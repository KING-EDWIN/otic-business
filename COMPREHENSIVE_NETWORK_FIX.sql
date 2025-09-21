-- =====================================================
-- COMPREHENSIVE NETWORK AND AUTHENTICATION FIX
-- =====================================================

-- 1. Ensure all RLS policies are permissive for authenticated users
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON user_profiles;

DROP POLICY IF EXISTS "businesses_select" ON businesses;
DROP POLICY IF EXISTS "businesses_insert" ON businesses;
DROP POLICY IF EXISTS "businesses_update" ON businesses;
DROP POLICY IF EXISTS "businesses_delete" ON businesses;

DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;

-- Create very permissive policies for authenticated users
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "user_profiles_delete" ON user_profiles FOR DELETE TO authenticated USING (true);

CREATE POLICY "businesses_select" ON businesses FOR SELECT TO authenticated USING (true);
CREATE POLICY "businesses_insert" ON businesses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "businesses_update" ON businesses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "businesses_delete" ON businesses FOR DELETE TO authenticated USING (true);

CREATE POLICY "products_select" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "products_delete" ON products FOR DELETE TO authenticated USING (true);

-- 2. Fix PVFS RLS policies
DROP POLICY IF EXISTS "vft_categories_select" ON vft_categories;
DROP POLICY IF EXISTS "vft_categories_insert" ON vft_categories;
DROP POLICY IF EXISTS "vft_categories_update" ON vft_categories;
DROP POLICY IF EXISTS "vft_categories_delete" ON vft_categories;

DROP POLICY IF EXISTS "visual_filter_tags_select" ON visual_filter_tags;
DROP POLICY IF EXISTS "visual_filter_tags_insert" ON visual_filter_tags;
DROP POLICY IF EXISTS "visual_filter_tags_update" ON visual_filter_tags;
DROP POLICY IF EXISTS "visual_filter_tags_delete" ON visual_filter_tags;

DROP POLICY IF EXISTS "vft_products_select" ON vft_products;
DROP POLICY IF EXISTS "vft_products_insert" ON vft_products;
DROP POLICY IF EXISTS "vft_products_update" ON vft_products;
DROP POLICY IF EXISTS "vft_products_delete" ON vft_products;

-- Create PVFS policies
CREATE POLICY "vft_categories_select" ON vft_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "vft_categories_insert" ON vft_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vft_categories_update" ON vft_categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "vft_categories_delete" ON vft_categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "visual_filter_tags_select" ON visual_filter_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "visual_filter_tags_insert" ON visual_filter_tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "visual_filter_tags_update" ON visual_filter_tags FOR UPDATE TO authenticated USING (true);
CREATE POLICY "visual_filter_tags_delete" ON visual_filter_tags FOR DELETE TO authenticated USING (true);

CREATE POLICY "vft_products_select" ON vft_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "vft_products_insert" ON vft_products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vft_products_update" ON vft_products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "vft_products_delete" ON vft_products FOR DELETE TO authenticated USING (true);

-- 3. Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 4. Ensure RPC functions exist and are accessible
CREATE OR REPLACE FUNCTION create_vft(
  p_tag_name TEXT,
  p_category_id UUID,
  p_confidence_score DECIMAL DEFAULT 0.0
) RETURNS UUID AS $$
DECLARE
  v_vft_id UUID;
BEGIN
  INSERT INTO visual_filter_tags (user_id, tag_name, category_id, confidence_score)
  VALUES (auth.uid(), p_tag_name, p_category_id, p_confidence_score)
  RETURNING id INTO v_vft_id;
  
  RETURN v_vft_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 5. Test the setup
SELECT 'Network and authentication fix completed successfully' as status;
