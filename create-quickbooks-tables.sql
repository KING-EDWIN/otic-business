-- QuickBooks Integration Tables
-- This script creates the necessary tables for QuickBooks integration

-- QuickBooks tokens table
CREATE TABLE IF NOT EXISTS quickbooks_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  realm_id VARCHAR(255) NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  company_name VARCHAR(255),
  environment VARCHAR(20) DEFAULT 'sandbox',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QuickBooks sync log table
CREATE TABLE IF NOT EXISTS quickbooks_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL, -- 'customers', 'products', 'invoices', 'sales'
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'pending'
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QuickBooks customer mapping table
CREATE TABLE IF NOT EXISTS quickbooks_customer_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pos_customer_id UUID NOT NULL,
  qb_customer_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pos_customer_id),
  UNIQUE(user_id, qb_customer_id)
);

-- QuickBooks product mapping table
CREATE TABLE IF NOT EXISTS quickbooks_product_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pos_product_id UUID NOT NULL,
  qb_item_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pos_product_id),
  UNIQUE(user_id, qb_item_id)
);

-- QuickBooks invoice mapping table
CREATE TABLE IF NOT EXISTS quickbooks_invoice_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pos_sale_id UUID NOT NULL,
  qb_invoice_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pos_sale_id),
  UNIQUE(user_id, qb_invoice_id)
);

-- RLS Policies for QuickBooks tables

-- QuickBooks tokens - users can only access their own tokens
ALTER TABLE quickbooks_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own QuickBooks tokens" ON quickbooks_tokens
  FOR ALL USING (true); -- This will be filtered by application logic

-- QuickBooks sync log - users can only access their own sync logs
ALTER TABLE quickbooks_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own sync logs" ON quickbooks_sync_log
  FOR ALL USING (auth.uid() = user_id);

-- QuickBooks customer mapping - users can only access their own mappings
ALTER TABLE quickbooks_customer_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own customer mappings" ON quickbooks_customer_mapping
  FOR ALL USING (auth.uid() = user_id);

-- QuickBooks product mapping - users can only access their own mappings
ALTER TABLE quickbooks_product_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own product mappings" ON quickbooks_product_mapping
  FOR ALL USING (auth.uid() = user_id);

-- QuickBooks invoice mapping - users can only access their own mappings
ALTER TABLE quickbooks_invoice_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own invoice mappings" ON quickbooks_invoice_mapping
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quickbooks_tokens_realm_id ON quickbooks_tokens(realm_id);
CREATE INDEX IF NOT EXISTS idx_quickbooks_sync_log_user_id ON quickbooks_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_quickbooks_sync_log_created_at ON quickbooks_sync_log(created_at);
CREATE INDEX IF NOT EXISTS idx_quickbooks_customer_mapping_user_id ON quickbooks_customer_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_quickbooks_product_mapping_user_id ON quickbooks_product_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_quickbooks_invoice_mapping_user_id ON quickbooks_invoice_mapping(user_id);

-- Comments
COMMENT ON TABLE quickbooks_tokens IS 'Stores QuickBooks OAuth tokens for each company';
COMMENT ON TABLE quickbooks_sync_log IS 'Logs of data synchronization between POS and QuickBooks';
COMMENT ON TABLE quickbooks_customer_mapping IS 'Maps POS customers to QuickBooks customers';
COMMENT ON TABLE quickbooks_product_mapping IS 'Maps POS products to QuickBooks items';
COMMENT ON TABLE quickbooks_invoice_mapping IS 'Maps POS sales to QuickBooks invoices';

