-- Admin System Database Schema
-- Admin users, logs, and system management tables
-- Run this script to create admin system tables

-- Admin Auth Table
CREATE TABLE IF NOT EXISTS admin_auth (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Logs Table
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_user_id UUID REFERENCES admin_users(user_id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES user_profiles(id),
    target_business_id INTEGER REFERENCES businesses(id),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Error Logs Table
CREATE TABLE IF NOT EXISTS system_error_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    request_data JSONB,
    status TEXT DEFAULT 'unresolved',
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Troubleshoot Logs Table
CREATE TABLE IF NOT EXISTS system_troubleshoot_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    issue_type TEXT NOT NULL,
    description TEXT NOT NULL,
    resolution TEXT,
    status TEXT DEFAULT 'open',
    resolved_by UUID REFERENCES user_profiles(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Business Alerts Table
CREATE TABLE IF NOT EXISTS business_alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Goals Table
CREATE TABLE IF NOT EXISTS business_goals (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    target_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Insights Table
CREATE TABLE IF NOT EXISTS business_insights (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    data JSONB,
    confidence_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business KPIs Table
CREATE TABLE IF NOT EXISTS business_kpis (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    kpi_name TEXT NOT NULL,
    kpi_value DECIMAL(10,2) NOT NULL,
    target_value DECIMAL(10,2),
    period TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Page Templates Table
CREATE TABLE IF NOT EXISTS business_page_templates (
    id SERIAL PRIMARY KEY,
    template_name TEXT UNIQUE NOT NULL,
    profession_type TEXT NOT NULL,
    template_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    calculation_date DATE NOT NULL,
    period_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Targets Table
CREATE TABLE IF NOT EXISTS sales_targets (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    target_name TEXT NOT NULL,
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    target_period TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    budget_name TEXT NOT NULL,
    budget_amount DECIMAL(10,2) NOT NULL,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    budget_period TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts Table (Chart of Accounts)
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    parent_account_id INTEGER REFERENCES accounts(id),
    balance DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank Accounts Table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_type TEXT NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table (General ledger)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id),
    bank_account_id INTEGER REFERENCES bank_accounts(id),
    transaction_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chart of Accounts Table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    parent_account_id INTEGER REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profit Loss Summary Table
CREATE TABLE IF NOT EXISTS profit_loss_summary (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_expenses DECIMAL(10,2) DEFAULT 0,
    gross_profit DECIMAL(10,2) DEFAULT 0,
    net_profit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success message
SELECT 'Admin system database schema created successfully!' as status;
