-- FAQ System Database Schema
-- FAQ questions, categories, and search functionality
-- Run this script to create FAQ system tables

-- FAQ Categories Table
CREATE TABLE IF NOT EXISTS faq_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Questions Table
CREATE TABLE IF NOT EXISTS faq_questions (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[],
    tier_required TEXT REFERENCES tiers(name),
    feature_name TEXT,
    page_location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Search Logs Table
CREATE TABLE IF NOT EXISTS faq_search_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    clicked_question_id INTEGER REFERENCES faq_questions(id),
    search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT,
    user_agent TEXT,
    ip_address INET
);

-- Tier Questions Table
CREATE TABLE IF NOT EXISTS tier_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tier Responses Table
CREATE TABLE IF NOT EXISTS tier_responses (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES tier_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    response_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tier Usage Tracking Table
CREATE TABLE IF NOT EXISTS tier_usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    tier_id INTEGER REFERENCES tiers(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Types Table
CREATE TABLE IF NOT EXISTS user_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual Profiles Table
CREATE TABLE IF NOT EXISTS individual_profiles (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    profession TEXT,
    skills TEXT[],
    experience_years INTEGER,
    hourly_rate DECIMAL(10,2),
    availability_status TEXT DEFAULT 'available',
    bio TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Segments Table
CREATE TABLE IF NOT EXISTS customer_segments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    segment_name TEXT NOT NULL,
    criteria JSONB NOT NULL,
    customer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Communications Table
CREATE TABLE IF NOT EXISTS customer_communications (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    communication_type TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'sent'
);

-- Inventory Alerts Table
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    threshold_value INTEGER NOT NULL,
    current_value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    parent_category_id INTEGER REFERENCES product_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Suppliers Table
CREATE TABLE IF NOT EXISTS product_suppliers (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    supplier_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    payment_terms TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QuickBooks Integration Tables
CREATE TABLE IF NOT EXISTS quickbooks_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quickbooks_customer_mapping (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    pos_customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    qb_customer_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quickbooks_invoice_mapping (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    pos_sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    qb_invoice_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quickbooks_product_mapping (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    pos_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    qb_product_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quickbooks_sync_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL,
    records_synced INTEGER DEFAULT 0,
    sync_status TEXT NOT NULL,
    error_message TEXT,
    sync_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_completed_at TIMESTAMP WITH TIME ZONE
);

-- Test Auth Table (for testing purposes)
CREATE TABLE IF NOT EXISTS test_auth (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Two Factor Codes Table
CREATE TABLE IF NOT EXISTS two_factor_codes (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success message
SELECT 'FAQ system and additional tables created successfully!' as status;
