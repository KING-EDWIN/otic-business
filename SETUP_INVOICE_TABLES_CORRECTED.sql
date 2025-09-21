-- Corrected Invoice Tables Setup for Otic Business
-- This script works with the existing database schema

-- 1. Create invoices table (if not exists) - without business_id reference
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 18.00, -- 18% VAT for Uganda
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  payment_method VARCHAR(50), -- cash, bank_transfer, mobile_money, card
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_reference VARCHAR(100),
  notes TEXT,
  terms_and_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create invoice_items table (if not exists)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  line_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 18.00,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create invoice_payments table for tracking multiple payments
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create invoice_templates table for reusable templates
CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_name ON invoices(customer_name);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_payment_date ON invoice_payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_invoice_templates_user_id ON invoice_templates(user_id);

-- 6. Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view their own invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can view their own invoice payments" ON invoice_payments;
DROP POLICY IF EXISTS "Users can view their own invoice templates" ON invoice_templates;

-- Invoices policies
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

-- Invoice items policies
CREATE POLICY "Users can view their own invoice items" ON invoice_items
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

-- Invoice payments policies
CREATE POLICY "Users can view their own invoice payments" ON invoice_payments
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

-- Invoice templates policies
CREATE POLICY "Users can view their own invoice templates" ON invoice_templates
  FOR ALL USING (auth.uid() = user_id);

-- 8. Create functions for invoice number generation
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  -- Get the next invoice number
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number ~ '^INV-[0-9]+$';
  
  -- Format as INV-000001, INV-000002, etc.
  invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals(invoice_id_param UUID)
RETURNS VOID AS $$
DECLARE
  invoice_record RECORD;
  subtotal DECIMAL(15,2);
  tax_amount DECIMAL(15,2);
  total_amount DECIMAL(15,2);
BEGIN
  -- Get invoice details
  SELECT * INTO invoice_record FROM invoices WHERE id = invoice_id_param;
  
  -- Calculate subtotal from invoice items
  SELECT COALESCE(SUM(line_total), 0) INTO subtotal
  FROM invoice_items
  WHERE invoice_id = invoice_id_param;
  
  -- Calculate tax amount
  tax_amount := subtotal * (invoice_record.tax_rate / 100);
  
  -- Calculate total amount
  total_amount := subtotal + tax_amount - COALESCE(invoice_record.discount_amount, 0);
  
  -- Update invoice with calculated totals
  UPDATE invoices
  SET 
    subtotal = subtotal,
    tax_amount = tax_amount,
    total_amount = total_amount,
    updated_at = NOW()
  WHERE id = invoice_id_param;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_invoice_number ON invoices;
CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- 11. Create trigger to recalculate totals when invoice items change
CREATE OR REPLACE FUNCTION trigger_calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate totals for the affected invoice
  PERFORM calculate_invoice_totals(COALESCE(NEW.invoice_id, OLD.invoice_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_invoice_items_totals ON invoice_items;
CREATE TRIGGER trigger_invoice_items_totals
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_invoice_totals();

-- 12. Grant necessary permissions
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON invoice_items TO authenticated;
GRANT ALL ON invoice_payments TO authenticated;
GRANT ALL ON invoice_templates TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_invoice_totals(UUID) TO authenticated;

-- 13. Insert sample invoice template
INSERT INTO invoice_templates (user_id, template_name, template_data, is_default)
VALUES (
  NULL, -- Available to all users
  'Default Invoice Template',
  '{
    "header": {
      "title": "INVOICE",
      "logo": "",
      "company_name": "",
      "company_address": "",
      "company_phone": "",
      "company_email": ""
    },
    "customer_section": {
      "title": "Bill To:",
      "fields": ["customer_name", "customer_address", "customer_phone", "customer_email"]
    },
    "invoice_details": {
      "fields": ["invoice_number", "issue_date", "due_date", "payment_terms"]
    },
    "items_table": {
      "columns": ["description", "quantity", "unit_price", "total"],
      "show_tax": true,
      "show_discount": true
    },
    "footer": {
      "notes": "",
      "terms_and_conditions": "Payment is due within 30 days of invoice date."
    }
  }'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- 14. Create view for invoice summary
CREATE OR REPLACE VIEW invoice_summary AS
SELECT 
  i.id,
  i.invoice_number,
  i.customer_name,
  i.customer_email,
  i.issue_date,
  i.due_date,
  i.subtotal,
  i.tax_amount,
  i.discount_amount,
  i.total_amount,
  i.status,
  i.payment_status,
  i.created_at,
  COUNT(ii.id) as item_count,
  COALESCE(SUM(ii.quantity), 0) as total_quantity
FROM invoices i
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
GROUP BY i.id, i.invoice_number, i.customer_name, i.customer_email, 
         i.issue_date, i.due_date, i.subtotal, i.tax_amount, i.discount_amount, 
         i.total_amount, i.status, i.payment_status, i.created_at;

-- Grant access to the view
GRANT SELECT ON invoice_summary TO authenticated;

COMMENT ON TABLE invoices IS 'Main invoices table for tracking customer invoices';
COMMENT ON TABLE invoice_items IS 'Individual line items for each invoice';
COMMENT ON TABLE invoice_payments IS 'Payment tracking for invoices (supports multiple payments)';
COMMENT ON TABLE invoice_templates IS 'Reusable invoice templates for different formats';
COMMENT ON VIEW invoice_summary IS 'Summary view of invoices with item counts and totals';
