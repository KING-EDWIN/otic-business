-- QuickBooks Integration Tables
CREATE TABLE IF NOT EXISTS quickbooks_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  company_id TEXT NOT NULL,
  company_name TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quickbooks_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'products', 'customers', 'sales', etc.
  status TEXT NOT NULL, -- 'success', 'error', 'pending'
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quickbooks_customer_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pos_customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  qb_customer_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quickbooks_product_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pos_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  qb_item_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quickbooks_invoice_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pos_sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  qb_invoice_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for QuickBooks tables
ALTER TABLE quickbooks_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own QuickBooks tokens" ON quickbooks_tokens FOR ALL USING (auth.uid() = user_id);

ALTER TABLE quickbooks_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own sync logs" ON quickbooks_sync_log FOR ALL USING (auth.uid() = user_id);

ALTER TABLE quickbooks_customer_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own customer mappings" ON quickbooks_customer_mapping FOR ALL USING (auth.uid() = user_id);

ALTER TABLE quickbooks_product_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own product mappings" ON quickbooks_product_mapping FOR ALL USING (auth.uid() = user_id);

ALTER TABLE quickbooks_invoice_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own invoice mappings" ON quickbooks_invoice_mapping FOR ALL USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quickbooks_tokens_user_id ON quickbooks_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_quickbooks_tokens_company_id ON quickbooks_tokens(company_id);
CREATE INDEX IF NOT EXISTS idx_quickbooks_sync_log_user_id ON quickbooks_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_quickbooks_customer_mapping_user_id ON quickbooks_customer_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_quickbooks_product_mapping_user_id ON quickbooks_product_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_quickbooks_invoice_mapping_user_id ON quickbooks_invoice_mapping(user_id);

-- Comments
COMMENT ON TABLE quickbooks_tokens IS 'Stores QuickBooks OAuth tokens for each user';
COMMENT ON TABLE quickbooks_sync_log IS 'Logs synchronization activities between POS and QuickBooks';
COMMENT ON TABLE quickbooks_customer_mapping IS 'Maps POS customers to QuickBooks customers';
COMMENT ON TABLE quickbooks_product_mapping IS 'Maps POS products to QuickBooks items';
COMMENT ON TABLE quickbooks_invoice_mapping IS 'Maps POS sales to QuickBooks invoices';

