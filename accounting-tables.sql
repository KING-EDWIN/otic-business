-- Accounting Tables for Otic Business
-- Run this in your Supabase SQL Editor

-- Create accounting-specific tables
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  currency_code TEXT DEFAULT 'UGX',
  enabled BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'partially_paid', 'paid', 'overdue', 'cancelled')),
  currency_code TEXT DEFAULT 'UGX',
  currency_rate DECIMAL(10,4) DEFAULT 1.0,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  tax_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID,
  paid_at DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency_code TEXT DEFAULT 'UGX',
  currency_rate DECIMAL(10,4) DEFAULT 1.0,
  description TEXT NOT NULL,
  category_id UUID,
  reference TEXT,
  payment_method TEXT DEFAULT 'cash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  number TEXT UNIQUE,
  type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_at ON expenses(paid_at);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_user_id ON expense_categories(user_id);

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('invoice_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

-- Create trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number = generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- Create function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_total()
RETURNS TRIGGER AS $$
DECLARE
  invoice_subtotal DECIMAL(10,2);
  invoice_tax DECIMAL(10,2);
  invoice_total DECIMAL(10,2);
BEGIN
  -- Calculate subtotal from invoice items
  SELECT COALESCE(SUM(total), 0) INTO invoice_subtotal
  FROM invoice_items
  WHERE invoice_id = NEW.invoice_id;
  
  -- Calculate tax (assuming 18% VAT for Uganda)
  invoice_tax := invoice_subtotal * 0.18;
  invoice_total := invoice_subtotal + invoice_tax;
  
  -- Update invoice totals
  UPDATE invoices
  SET subtotal = invoice_subtotal,
      tax = invoice_tax,
      total = invoice_total,
      updated_at = NOW()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_invoice_total
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_total();

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own customers" ON customers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own invoice items" ON invoice_items
  FOR ALL USING (auth.uid() = (SELECT user_id FROM invoices WHERE id = invoice_id));

CREATE POLICY "Users can manage own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own expense categories" ON expense_categories
  FOR ALL USING (auth.uid() = user_id);

-- Insert default accounts for each user
CREATE OR REPLACE FUNCTION create_default_accounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default accounts when a user profile is created
  INSERT INTO accounts (name, number, type, user_id) VALUES
    ('Cash Account', 'CASH-001', 'asset', NEW.id),
    ('Bank Account', 'BANK-001', 'asset', NEW.id),
    ('Sales Revenue', 'REV-001', 'revenue', NEW.id),
    ('Office Expenses', 'EXP-001', 'expense', NEW.id);
  
  -- Create default expense categories
  INSERT INTO expense_categories (name, description, user_id) VALUES
    ('Office Supplies', 'Stationery, equipment, etc.', NEW.id),
    ('Utilities', 'Electricity, water, internet', NEW.id),
    ('Rent', 'Office rent and related costs', NEW.id),
    ('Transport', 'Fuel, maintenance, etc.', NEW.id),
    ('Marketing', 'Advertising and promotional costs', NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_accounts
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_accounts();

-- Create function to get accounting dashboard stats
CREATE OR REPLACE FUNCTION get_accounting_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_invoices INTEGER;
  total_revenue DECIMAL(10,2);
  total_expenses DECIMAL(10,2);
  net_profit DECIMAL(10,2);
  overdue_invoices INTEGER;
BEGIN
  -- Count total invoices
  SELECT COUNT(*) INTO total_invoices
  FROM invoices
  WHERE user_id = p_user_id;
  
  -- Calculate total revenue (paid invoices only)
  SELECT COALESCE(SUM(total), 0) INTO total_revenue
  FROM invoices
  WHERE user_id = p_user_id AND status = 'paid';
  
  -- Calculate total expenses
  SELECT COALESCE(SUM(amount), 0) INTO total_expenses
  FROM expenses
  WHERE user_id = p_user_id;
  
  -- Calculate net profit
  net_profit := total_revenue - total_expenses;
  
  -- Count overdue invoices
  SELECT COUNT(*) INTO overdue_invoices
  FROM invoices
  WHERE user_id = p_user_id 
    AND (status = 'overdue' OR (status = 'sent' AND due_date < CURRENT_DATE));
  
  -- Build result JSON
  result := json_build_object(
    'totalInvoices', total_invoices,
    'totalRevenue', total_revenue,
    'totalExpenses', total_expenses,
    'netProfit', net_profit,
    'overdueInvoices', overdue_invoices
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
