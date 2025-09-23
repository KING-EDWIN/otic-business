-- RLS Policies for OTIC Business
-- Row Level Security policies for all major tables
-- Run this script to set up proper RLS

-- Enable RLS on all major tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_business_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalised_visual_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_filter_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE vft_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses RLS Policies
DROP POLICY IF EXISTS "Users can view own businesses" ON businesses;
CREATE POLICY "Users can view own businesses" ON businesses
    FOR SELECT USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own businesses" ON businesses;
CREATE POLICY "Users can update own businesses" ON businesses
    FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert own businesses" ON businesses;
CREATE POLICY "Users can insert own businesses" ON businesses
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Business Memberships RLS Policies
DROP POLICY IF EXISTS "Users can view business memberships" ON business_memberships;
CREATE POLICY "Users can view business memberships" ON business_memberships
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT created_by FROM businesses WHERE id = business_id)
    );

DROP POLICY IF EXISTS "Users can update business memberships" ON business_memberships;
CREATE POLICY "Users can update business memberships" ON business_memberships
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT created_by FROM businesses WHERE id = business_id)
    );

DROP POLICY IF EXISTS "Users can insert business memberships" ON business_memberships;
CREATE POLICY "Users can insert business memberships" ON business_memberships
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT created_by FROM businesses WHERE id = business_id)
    );

-- Products RLS Policies
DROP POLICY IF EXISTS "Users can view own products" ON products;
CREATE POLICY "Users can view own products" ON products
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT created_by FROM businesses WHERE id = business_id)
    );

DROP POLICY IF EXISTS "Users can update own products" ON products;
CREATE POLICY "Users can update own products" ON products
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT created_by FROM businesses WHERE id = business_id)
    );

DROP POLICY IF EXISTS "Users can insert own products" ON products;
CREATE POLICY "Users can insert own products" ON products
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT created_by FROM businesses WHERE id = business_id)
    );

-- Sales RLS Policies
DROP POLICY IF EXISTS "Users can view own sales" ON sales;
CREATE POLICY "Users can view own sales" ON sales
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sales" ON sales;
CREATE POLICY "Users can update own sales" ON sales
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sales" ON sales;
CREATE POLICY "Users can insert own sales" ON sales
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Customers RLS Policies
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
CREATE POLICY "Users can view own customers" ON customers
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own customers" ON customers;
CREATE POLICY "Users can update own customers" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
CREATE POLICY "Users can insert own customers" ON customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Invoices RLS Policies
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
CREATE POLICY "Users can update own invoices" ON invoices
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
CREATE POLICY "Users can insert own invoices" ON invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment Transactions RLS Policies
DROP POLICY IF EXISTS "Users can view own payment transactions" ON payment_transactions;
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payment transactions" ON payment_transactions;
CREATE POLICY "Users can update own payment transactions" ON payment_transactions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payment transactions" ON payment_transactions;
CREATE POLICY "Users can insert own payment transactions" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions RLS Policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications RLS Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- OTIC Vision RLS Policies
DROP POLICY IF EXISTS "Users can view own visual bank" ON personalised_visual_bank;
CREATE POLICY "Users can view own visual bank" ON personalised_visual_bank
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own visual bank" ON personalised_visual_bank;
CREATE POLICY "Users can update own visual bank" ON personalised_visual_bank
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own visual bank" ON personalised_visual_bank;
CREATE POLICY "Users can insert own visual bank" ON personalised_visual_bank
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Visual Filter Tags RLS Policies
DROP POLICY IF EXISTS "Users can view own visual tags" ON visual_filter_tags;
CREATE POLICY "Users can view own visual tags" ON visual_filter_tags
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own visual tags" ON visual_filter_tags;
CREATE POLICY "Users can update own visual tags" ON visual_filter_tags
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own visual tags" ON visual_filter_tags;
CREATE POLICY "Users can insert own visual tags" ON visual_filter_tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- VFT Products RLS Policies
DROP POLICY IF EXISTS "Users can view own vft products" ON vft_products;
CREATE POLICY "Users can view own vft products" ON vft_products
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own vft products" ON vft_products;
CREATE POLICY "Users can update own vft products" ON vft_products
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own vft products" ON vft_products;
CREATE POLICY "Users can insert own vft products" ON vft_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Detected Objects RLS Policies
DROP POLICY IF EXISTS "Users can view own detected objects" ON detected_objects;
CREATE POLICY "Users can view own detected objects" ON detected_objects
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own detected objects" ON detected_objects;
CREATE POLICY "Users can update own detected objects" ON detected_objects
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own detected objects" ON detected_objects;
CREATE POLICY "Users can insert own detected objects" ON detected_objects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Detection Sessions RLS Policies
DROP POLICY IF EXISTS "Users can view own detection sessions" ON detection_sessions;
CREATE POLICY "Users can view own detection sessions" ON detection_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own detection sessions" ON detection_sessions;
CREATE POLICY "Users can update own detection sessions" ON detection_sessions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own detection sessions" ON detection_sessions;
CREATE POLICY "Users can insert own detection sessions" ON detection_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reports RLS Policies
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reports" ON reports;
CREATE POLICY "Users can update own reports" ON reports
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
CREATE POLICY "Users can insert own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Expenses RLS Policies
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
CREATE POLICY "Users can insert own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categories RLS Policies
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Suppliers RLS Policies
DROP POLICY IF EXISTS "Users can view own suppliers" ON suppliers;
CREATE POLICY "Users can view own suppliers" ON suppliers
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
CREATE POLICY "Users can update own suppliers" ON suppliers
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own suppliers" ON suppliers;
CREATE POLICY "Users can insert own suppliers" ON suppliers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Success message
SELECT 'RLS policies created successfully!' as status;
