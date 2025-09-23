-- Core Database Schema for OTIC Business
-- This file contains the essential table structures based on your actual database
-- Run this script to recreate the core tables if needed

-- User Profiles Table (Core user information)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    business_name TEXT,
    user_type CHARACTER VARYING(20) DEFAULT 'individual',
    tier CHARACTER VARYING(20) DEFAULT 'free_trial',
    phone TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_timestamp TIMESTAMP WITH TIME ZONE,
    individual_profession_id INTEGER REFERENCES individual_professions(id)
);

-- Individual Professions Table
CREATE TABLE IF NOT EXISTS individual_professions (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual Signups Table
CREATE TABLE IF NOT EXISTS individual_signups (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    profession_id INTEGER REFERENCES individual_professions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Signups Table
CREATE TABLE IF NOT EXISTS business_signups (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_type TEXT,
    business_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses Table (Multi-level business structure)
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    business_type TEXT,
    business_level INTEGER DEFAULT 1,
    parent_business_id INTEGER REFERENCES businesses(id),
    created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Memberships Table
CREATE TABLE IF NOT EXISTS business_memberships (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- Business Invitations Table
CREATE TABLE IF NOT EXISTS business_invitations (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invitation_token TEXT UNIQUE NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual Business Access Table
CREATE TABLE IF NOT EXISTS individual_business_access (
    id SERIAL PRIMARY KEY,
    individual_id INTEGER REFERENCES individual_signups(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES business_signups(id) ON DELETE CASCADE,
    invitation_id INTEGER REFERENCES business_invitations(id) ON DELETE CASCADE,
    access_level TEXT DEFAULT 'basic',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Access Permissions Table
CREATE TABLE IF NOT EXISTS business_access_permissions (
    id SERIAL PRIMARY KEY,
    business_individual_access_id INTEGER REFERENCES individual_business_access(id) ON DELETE CASCADE,
    page_name TEXT NOT NULL,
    can_view BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_individual_access_id, page_name)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    barcode TEXT UNIQUE,
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    category TEXT,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id),
    total_amount DECIMAL(10,2),
    receipt_number TEXT UNIQUE,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale Items Table
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2),
    due_date DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Transactions Table (Flutterwave integration)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    tx_ref TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'UGX',
    payment_method TEXT,
    status TEXT DEFAULT 'pending',
    flutterwave_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table (Payment orders)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    tx_ref TEXT UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    business_id INTEGER REFERENCES businesses(id),
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'UGX',
    order_status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES user_subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'UGX',
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    tier_id INTEGER REFERENCES tiers(id),
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tiers Table
CREATE TABLE IF NOT EXISTS tiers (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    tier_type TEXT UNIQUE NOT NULL,
    price DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Features Table
CREATE TABLE IF NOT EXISTS features (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tier Features Table
CREATE TABLE IF NOT EXISTS tier_features (
    id SERIAL PRIMARY KEY,
    tier_id INTEGER REFERENCES tiers(id) ON DELETE CASCADE,
    feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tier_id, feature_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id),
    notification_type TEXT NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id, notification_type)
);

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Notifications Table
CREATE TABLE IF NOT EXISTS email_notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    title TEXT NOT NULL,
    data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Views Table
CREATE TABLE IF NOT EXISTS report_views (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Schedules Table
CREATE TABLE IF NOT EXISTS report_schedules (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    frequency TEXT NOT NULL,
    next_run_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense Categories Table
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success message
SELECT 'Core database schema created successfully!' as status;
