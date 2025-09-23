-- OTIC Vision Database Schema
-- Visual Fingerprinting Technology (VFT) tables
-- Run this script to create OTIC Vision related tables

-- VFT Categories Table
CREATE TABLE IF NOT EXISTS vft_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visual Filter Tags Table
CREATE TABLE IF NOT EXISTS visual_filter_tags (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    category_id INTEGER REFERENCES vft_categories(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tag_name)
);

-- VFT Products Table
CREATE TABLE IF NOT EXISTS vft_products (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    vft_id INTEGER REFERENCES visual_filter_tags(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    barcode TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personalised Visual Bank Table
CREATE TABLE IF NOT EXISTS personalised_visual_bank (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    image_data BYTEA,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Visual Fingerprints Table
CREATE TABLE IF NOT EXISTS product_visual_fingerprints (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES vft_products(id) ON DELETE CASCADE,
    angle_type TEXT NOT NULL,
    fingerprint_data BYTEA NOT NULL,
    confidence_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detection Sessions Table
CREATE TABLE IF NOT EXISTS detection_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_name TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Detected Objects Table
CREATE TABLE IF NOT EXISTS detected_objects (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES detection_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    object_class TEXT NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    bounding_box JSONB,
    image_data BYTEA,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Object Matches Table
CREATE TABLE IF NOT EXISTS object_matches (
    id SERIAL PRIMARY KEY,
    detected_object_id INTEGER REFERENCES detected_objects(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES personalised_visual_bank(id) ON DELETE CASCADE,
    match_score DECIMAL(5,4) NOT NULL,
    match_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visual Scan History Table
CREATE TABLE IF NOT EXISTS visual_scan_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES vft_products(id) ON DELETE CASCADE,
    scan_type TEXT NOT NULL,
    scan_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recognition Sessions Table
CREATE TABLE IF NOT EXISTS recognition_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_name TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Product Similarity Log Table
CREATE TABLE IF NOT EXISTS product_similarity_log (
    id SERIAL PRIMARY KEY,
    product1_id INTEGER REFERENCES vft_products(id) ON DELETE CASCADE,
    product2_id INTEGER REFERENCES vft_products(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5,4) NOT NULL,
    comparison_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token Similarity Log Table
CREATE TABLE IF NOT EXISTS token_similarity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES personalised_visual_bank(id) ON DELETE CASCADE,
    matched_token_hash TEXT NOT NULL,
    similarity_score DECIMAL(5,4) NOT NULL,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Color Analysis Cache Table
CREATE TABLE IF NOT EXISTS color_analysis_cache (
    image_hash TEXT PRIMARY KEY,
    dominant_colors JSONB NOT NULL,
    color_distribution JSONB NOT NULL,
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VFT Analytics Table
CREATE TABLE IF NOT EXISTS vft_analytics (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    scan_date DATE NOT NULL,
    total_scans INTEGER DEFAULT 0,
    successful_matches INTEGER DEFAULT 0,
    failed_matches INTEGER DEFAULT 0,
    average_confidence DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VFT Usage Stats Table
CREATE TABLE IF NOT EXISTS vft_usage_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    vft_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, vft_name)
);

-- VFT Time Patterns Table
CREATE TABLE IF NOT EXISTS vft_time_patterns (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    vft_name TEXT NOT NULL,
    hour_of_day INTEGER NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, vft_name, hour_of_day, day_of_week)
);

-- VFT Profit Analysis Table
CREATE TABLE IF NOT EXISTS vft_profit_analysis (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_costs DECIMAL(10,2) DEFAULT 0,
    profit_margin DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success message
SELECT 'OTIC Vision database schema created successfully!' as status;
