-- Add Sample Accounting Data
-- Run this AFTER running accounting-tables-fixed.sql
-- This will add sample data for the first user in your system

-- First, let's get a user ID to work with
-- We'll use the first user from user_profiles table
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the first user ID
    SELECT user_id INTO user_uuid 
    FROM user_profiles 
    LIMIT 1;
    
    IF user_uuid IS NOT NULL THEN
        -- Insert sample bank accounts
        INSERT INTO bank_accounts (user_id, account_name, account_type, current_balance, is_active) VALUES
        (user_uuid, 'Cash on Hand', 'Cash', 922050.00, true),
        (user_uuid, 'Checking Account', 'Checking', 153300.00, true),
        (user_uuid, 'Credit Card', 'Credit Card', -500.00, true)
        ON CONFLICT DO NOTHING;

        -- Insert sample expenses
        INSERT INTO expenses (user_id, expense_date, category, description, amount, payment_method, vendor_name, status) VALUES
        (user_uuid, CURRENT_DATE, 'Online Marketing', 'Google Ads Campaign', 10000.00, 'Bank Transfer', 'Google', 'approved'),
        (user_uuid, CURRENT_DATE, 'Subscriptions', 'Software Subscriptions', 6000.00, 'Credit Card', 'Various', 'approved'),
        (user_uuid, CURRENT_DATE, 'Depreciation', 'Equipment Depreciation', 2000.00, 'Internal', 'Internal', 'approved')
        ON CONFLICT DO NOTHING;

        -- Insert sample customers
        INSERT INTO customers (user_id, customer_name, email, phone, address, payment_terms, credit_limit, is_active) VALUES
        (user_uuid, 'Acme Corporation', 'contact@acme.com', '+1-555-0123', '123 Business St, City, State 12345', 'Net 30', 50000.00, true),
        (user_uuid, 'Tech Solutions Ltd', 'info@techsolutions.com', '+1-555-0456', '456 Tech Ave, City, State 67890', 'Net 15', 100000.00, true)
        ON CONFLICT DO NOTHING;

        -- Insert sample invoices
        INSERT INTO invoices (user_id, invoice_number, customer_name, issue_date, due_date, subtotal, tax_amount, total_amount, status) VALUES
        (user_uuid, 'INV-001', 'Acme Corporation', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 500.00, 50.00, 550.00, 'paid'),
        (user_uuid, 'INV-002', 'Tech Solutions Ltd', CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', 147344.00, 14734.40, 162078.40, 'overdue')
        ON CONFLICT DO NOTHING;

        -- Insert sample transactions
        INSERT INTO transactions (user_id, transaction_date, description, amount, transaction_type, reference) VALUES
        (user_uuid, CURRENT_DATE, 'Cash Sale', 550.00, 'credit', 'INV-001'),
        (user_uuid, CURRENT_DATE, 'Marketing Expense', 10000.00, 'debit', 'EXP-001'),
        (user_uuid, CURRENT_DATE, 'Subscription Payment', 6000.00, 'debit', 'EXP-002')
        ON CONFLICT DO NOTHING;

        -- Insert profit/loss summary for current month
        INSERT INTO profit_loss_summary (user_id, period_start, period_end, total_revenue, total_expenses, net_income) VALUES
        (user_uuid, DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day', 550.00, 18000.00, -17450.00)
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Sample data added for user: %', user_uuid;
    ELSE
        RAISE NOTICE 'No users found. Please create a user first through the application.';
    END IF;
END $$;

-- Verify the data was inserted
SELECT 'Sample accounting data added successfully!' as message;