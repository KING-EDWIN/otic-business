-- Enhanced Business Monitoring Tables
-- Run this in your Supabase SQL Editor to add advanced business monitoring features

-- Business Alerts Table
CREATE TABLE IF NOT EXISTS business_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'high_expense', 'payment_due', 'sales_target', 'inventory_value'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_read BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    threshold_value DECIMAL(15,2),
    current_value DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Business KPIs Table
CREATE TABLE IF NOT EXISTS business_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kpi_name VARCHAR(100) NOT NULL,
    kpi_value DECIMAL(15,2) NOT NULL,
    target_value DECIMAL(15,2),
    unit VARCHAR(20) NOT NULL, -- 'UGX', 'count', 'percentage', 'days'
    period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    previous_value DECIMAL(15,2),
    change_percentage DECIMAL(5,2),
    trend VARCHAR(10) CHECK (trend IN ('up', 'down', 'stable'))
);

-- Customer Segments Table
CREATE TABLE IF NOT EXISTS customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    segment_name VARCHAR(100) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL, -- Store segment criteria as JSON
    customer_count INTEGER DEFAULT 0,
    total_value DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Communications Table
CREATE TABLE IF NOT EXISTS customer_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'call', 'meeting', 'note'
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'failed', 'read')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Goals Table
CREATE TABLE IF NOT EXISTS business_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_name VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type VARCHAR(50) NOT NULL, -- 'revenue', 'sales', 'customers', 'inventory', 'custom'
    target_value DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Alerts Table
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'out_of_stock', 'overstock', 'expiring_soon'
    current_stock INTEGER NOT NULL,
    threshold_stock INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Sales Targets Table
CREATE TABLE IF NOT EXISTS sales_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_name VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    target_value DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Insights Table
CREATE TABLE IF NOT EXISTS business_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- 'sales_trend', 'customer_behavior', 'inventory_optimization', 'financial_health'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    impact_level VARCHAR(20) CHECK (impact_level IN ('low', 'medium', 'high')),
    actionable BOOLEAN DEFAULT false,
    action_items JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL,
    calculation_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    category VARCHAR(50) NOT NULL, -- 'sales', 'inventory', 'customers', 'financial'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_alerts_user_id ON business_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_business_alerts_type ON business_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_business_alerts_active ON business_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_business_kpis_user_id ON business_kpis(user_id);
CREATE INDEX IF NOT EXISTS idx_business_kpis_period ON business_kpis(period);
CREATE INDEX IF NOT EXISTS idx_customer_segments_user_id ON customer_segments(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_user_id ON customer_communications(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_business_goals_user_id ON business_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_business_goals_status ON business_goals(status);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_user_id ON inventory_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_targets_user_id ON sales_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_business_insights_user_id ON business_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(calculation_date);

-- Enable RLS (Row Level Security)
ALTER TABLE business_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own business alerts" ON business_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own business alerts" ON business_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business alerts" ON business_alerts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own business KPIs" ON business_kpis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own business KPIs" ON business_kpis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business KPIs" ON business_kpis FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own customer segments" ON customer_segments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own customer segments" ON customer_segments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own customer segments" ON customer_segments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own customer communications" ON customer_communications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own customer communications" ON customer_communications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own customer communications" ON customer_communications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own business goals" ON business_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own business goals" ON business_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business goals" ON business_goals FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own inventory alerts" ON inventory_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own inventory alerts" ON inventory_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory alerts" ON inventory_alerts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sales targets" ON sales_targets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sales targets" ON sales_targets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales targets" ON sales_targets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own business insights" ON business_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own business insights" ON business_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business insights" ON business_insights FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own performance metrics" ON performance_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own performance metrics" ON performance_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own performance metrics" ON performance_metrics FOR UPDATE USING (auth.uid() = user_id);
