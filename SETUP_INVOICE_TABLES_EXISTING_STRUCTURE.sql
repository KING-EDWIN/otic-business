-- Invoice Setup Script - Works with EXISTING table structure
-- Based on accounting-tables.sql structure

-- First, let's check what columns actually exist and add missing ones
-- Add missing columns to existing invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 18.00,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;

-- Add missing columns to existing invoice_items table
ALTER TABLE invoice_items 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS item_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 18.00,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15,2) DEFAULT 0;

-- Create invoice_payments table for tracking multiple payments
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

-- Create invoice_templates table for reusable templates
CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_name ON invoices(customer_name);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_payment_date ON invoice_payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_invoice_templates_user_id ON invoice_templates(user_id);

-- Enable Row Level Security on new tables
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Users can view their own invoice payments" ON invoice_payments
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own invoice templates" ON invoice_templates
  FOR ALL USING (auth.uid() = user_id);

-- Create functions for invoice number generation
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

-- Create function to calculate invoice totals
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
  tax_amount := subtotal * (COALESCE(invoice_record.tax_rate, 18.00) / 100);
  
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

-- Create trigger to auto-generate invoice numbers
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

-- Create trigger to recalculate totals when invoice items change
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

-- Grant necessary permissions
GRANT ALL ON invoice_payments TO authenticated;
GRANT ALL ON invoice_templates TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_invoice_totals(UUID) TO authenticated;

-- Insert sample invoice template
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

-- Create view for invoice summary
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

COMMENT ON TABLE invoice_payments IS 'Payment tracking for invoices (supports multiple payments)';
COMMENT ON TABLE invoice_templates IS 'Reusable invoice templates for different formats';
COMMENT ON VIEW invoice_summary IS 'Summary view of invoices with item counts and totals';
