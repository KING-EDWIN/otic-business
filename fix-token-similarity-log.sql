-- =====================================================
-- FIX TOKEN_SIMILARITY_LOG TABLE STRUCTURE
-- =====================================================
-- This script fixes the token_similarity_log table structure

-- 1. Check current table structure
SELECT 
  'Current token_similarity_log structure:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'token_similarity_log' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Drop the table if it exists (to recreate with correct structure)
DROP TABLE IF EXISTS token_similarity_log CASCADE;

-- 3. Recreate the table with correct structure
CREATE TABLE token_similarity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES personalised_visual_bank(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_token JSONB NOT NULL,
  similarity_score DECIMAL(3,2) NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_match BOOLEAN DEFAULT FALSE
);

-- 4. Enable RLS
ALTER TABLE token_similarity_log ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Users can view own similarity logs" ON token_similarity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own similarity logs" ON token_similarity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_user_id ON token_similarity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_product_id ON token_similarity_log(product_id);
CREATE INDEX IF NOT EXISTS idx_token_similarity_log_matched_at ON token_similarity_log(matched_at);

-- 7. Grant permissions
GRANT ALL ON token_similarity_log TO authenticated;

-- 8. Verify the new structure
SELECT 
  'New token_similarity_log structure:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'token_similarity_log' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT 'token_similarity_log table fixed successfully!' as status;


