-- Accounting Tables for Otic Business
-- This file contains the necessary tables for professional accounting functionality

-- 1. Chart of Accounts
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_code VARCHAR(10) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- Asset, Liability, Equity, Revenue, Expense
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bank Accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50),
  bank_name VARCHAR(255),
  account_type VARCHAR(50) NOT NULL, -- Checking, Savings, Credit Card, Cash
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  customer_id UUID,
  customer_name VARCHAR(255),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  payment_terms VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  line_total DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50), -- Cash, Bank Transfer, Credit Card
  bank_account_id UUID REFERENCES bank_accounts(id),
  vendor_name VARCHAR(255),
  receipt_url TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- debit, credit
  account_id UUID REFERENCES chart_of_accounts(id),
  bank_account_id UUID REFERENCES bank_accounts(id),
  reference VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Profit and Loss Summary (for quick access)
CREATE TABLE IF NOT EXISTS profit_loss_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  total_expenses DECIMAL(15,2) DEFAULT 0,
  net_income DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  tax_id VARCHAR(50),
  payment_terms VARCHAR(100),
  credit_limit DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_user_id ON chart_of_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- Insert default chart of accounts
INSERT INTO chart_of_accounts (user_id, account_code, account_name, account_type) VALUES
  (NULL, '1000', 'Cash on Hand', 'Asset'),
  (NULL, '1010', 'Checking Account', 'Asset'),
  (NULL, '2001', 'Credit Card', 'Liability'),
  (NULL, '3000', 'Owner Equity', 'Equity'),
  (NULL, '4000', 'Sales Revenue', 'Revenue'),
  (NULL, '5000', 'Cost of Goods Sold', 'Expense'),
  (NULL, '6000', 'Operating Expenses', 'Expense'),
  (NULL, '6010', 'Online Marketing', 'Expense'),
  (NULL, '6020', 'Subscriptions', 'Expense'),
  (NULL, '6090', 'Depreciation', 'Expense');

-- Enable Row Level Security
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_loss_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own chart of accounts" ON chart_of_accounts
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own bank accounts" ON bank_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own invoice items" ON invoice_items
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM invoices WHERE id = invoice_id));

CREATE POLICY "Users can view their own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profit loss summary" ON profit_loss_summary
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own customers" ON customers
