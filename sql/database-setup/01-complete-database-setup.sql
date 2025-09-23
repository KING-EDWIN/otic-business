-- COMPLETE DATABASE SETUP
-- This file contains the final, clean database structure
-- Run this to set up the entire database properly

-- ==============================================
-- 1. CORE TABLES
-- ==============================================

-- User Profiles Table (Main user data)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    business_name TEXT,
    phone TEXT,
    address TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('business', 'individual')),
    tier TEXT DEFAULT 'free_trial' CHECK (tier IN ('free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Memberships Table
CREATE TABLE IF NOT EXISTS business_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- Orders Table (for payments)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'UGX',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method TEXT,
    tx_ref TEXT,
    transaction_id TEXT,
    flutterwave_tx_id TEXT,
    flutterwave_reference TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_ref TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'UGX',
    status TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    description TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    flutterwave_tx_id TEXT,
    flutterwave_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. RLS POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses Policies
CREATE POLICY "Users can view businesses they own" ON businesses
    FOR SELECT USING (
        auth.uid() = created_by OR 
        auth.uid() IN (SELECT user_id FROM business_memberships WHERE business_id = id)
    );

CREATE POLICY "Users can create businesses" ON businesses
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update businesses they own" ON businesses
    FOR UPDATE USING (auth.uid() = created_by);

-- Business Memberships Policies
CREATE POLICY "Users can view memberships for their businesses" ON business_memberships
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT created_by FROM businesses WHERE id = business_id)
    );

CREATE POLICY "Business owners can manage memberships" ON business_memberships
    FOR ALL USING (
        auth.uid() IN (SELECT created_by FROM businesses WHERE id = business_id)
    );

-- Orders Policies
CREATE POLICY "Users can view their orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Payment Transactions Policies
CREATE POLICY "Users can view their transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- 3. RPC FUNCTIONS
-- ==============================================

-- Function to get user dashboard route
CREATE OR REPLACE FUNCTION get_user_dashboard_route()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_type TEXT;
BEGIN
    SELECT up.user_type INTO user_type
    FROM user_profiles up
    WHERE up.id = auth.uid();
    
    IF user_type = 'business' THEN
        RETURN '/dashboard';
    ELSIF user_type = 'individual' THEN
        RETURN '/individual-dashboard';
    ELSE
        RETURN '/login-type';
    END IF;
END;
$$;

-- Function to check if user has admin privileges
CREATE OR REPLACE FUNCTION is_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- For now, allow all authenticated users to be admins
    -- This can be changed later to check specific roles
    RETURN auth.uid() IS NOT NULL;
END;
$$;

-- Function to search users by email (for admin)
CREATE OR REPLACE FUNCTION search_user_by_email(email_param TEXT)
RETURNS TABLE(
    id UUID,
    email TEXT,
    full_name TEXT,
    business_name TEXT,
    user_type TEXT,
    tier TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.full_name,
        up.business_name,
        up.user_type,
        up.tier,
        up.created_at
    FROM user_profiles up
    WHERE up.email ILIKE '%' || email_param || '%'
    ORDER BY up.created_at DESC
    LIMIT 10;
END;
$$;

-- Function to delete user completely (for admin)
CREATE OR REPLACE FUNCTION delete_user_completely(user_id_param UUID)
RETURNS TABLE(
    deleted_records BIGINT,
    deletion_summary TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_deleted BIGINT := 0;
    summary_text TEXT := '';
    deleted_count BIGINT;
BEGIN
    -- Delete from payment_transactions
    DELETE FROM payment_transactions WHERE user_id = user_id_param;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    summary_text := summary_text || 'Payment Transactions: ' || deleted_count || ', ';
    
    -- Delete from orders
    DELETE FROM orders WHERE user_id = user_id_param;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    summary_text := summary_text || 'Orders: ' || deleted_count || ', ';
    
    -- Delete from business_memberships
    DELETE FROM business_memberships WHERE user_id = user_id_param;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    summary_text := summary_text || 'Business Memberships: ' || deleted_count || ', ';
    
    -- Delete from businesses (where user is creator)
    DELETE FROM businesses WHERE created_by = user_id_param;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    summary_text := summary_text || 'Businesses: ' || deleted_count || ', ';
    
    -- Finally, delete from user_profiles
    DELETE FROM user_profiles WHERE id = user_id_param;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    summary_text := summary_text || 'User Profiles: ' || deleted_count;
    
    RETURN QUERY SELECT total_deleted, summary_text;
END;
$$;

-- ==============================================
-- 4. GRANT PERMISSIONS
-- ==============================================

-- Grant permissions on tables
GRANT ALL ON user_profiles TO anon, authenticated, service_role;
GRANT ALL ON businesses TO anon, authenticated, service_role;
GRANT ALL ON business_memberships TO anon, authenticated, service_role;
GRANT ALL ON orders TO anon, authenticated, service_role;
GRANT ALL ON payment_transactions TO anon, authenticated, service_role;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION get_user_dashboard_route() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_user_by_email(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO anon, authenticated, service_role;

-- ==============================================
-- 5. INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_businesses_created_by ON businesses(created_by);
CREATE INDEX IF NOT EXISTS idx_business_memberships_user_id ON business_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_business_memberships_business_id ON business_memberships(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_tx_ref ON payment_transactions(tx_ref);

-- ==============================================
-- 6. TRIGGERS FOR UPDATED_AT
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Database setup completed successfully!' as status;
