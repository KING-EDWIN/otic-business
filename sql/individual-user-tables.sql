-- Individual User Tables for Time Tracking, Tasks, and Work Reports
-- This script creates tables specifically for individual users

-- 1. Time Tracking Table
CREATE TABLE IF NOT EXISTS individual_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE, -- Which business they're working for
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    description TEXT NOT NULL,
    task_category VARCHAR(50) DEFAULT 'general', -- 'pos', 'inventory', 'accounting', 'customers', 'general'
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Individual Tasks Table
CREATE TABLE IF NOT EXISTS individual_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(4,2) DEFAULT 0,
    actual_hours DECIMAL(4,2) DEFAULT 0,
    category VARCHAR(50) DEFAULT 'general',
    tags TEXT[],
    assigned_by UUID REFERENCES auth.users(id), -- Who assigned the task
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Work Reports Table
CREATE TABLE IF NOT EXISTS individual_work_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
    report_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    report_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    total_hours_worked DECIMAL(6,2) DEFAULT 0,
    total_tasks_completed INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    productivity_score DECIMAL(3,2) DEFAULT 0, -- 0-100 scale
    summary TEXT,
    detailed_breakdown JSONB, -- Store detailed breakdown of work
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Individual Work Sessions Table (for tracking active work)
CREATE TABLE IF NOT EXISTS individual_work_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    session_type VARCHAR(50) DEFAULT 'work' CHECK (session_type IN ('work', 'break', 'meeting')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Individual Productivity Metrics Table
CREATE TABLE IF NOT EXISTS individual_productivity_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_hours DECIMAL(6,2) DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_pending INTEGER DEFAULT 0,
    productivity_score DECIMAL(3,2) DEFAULT 0,
    efficiency_rating DECIMAL(3,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id, metric_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_individual_time_entries_user_id ON individual_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_time_entries_business_id ON individual_time_entries(business_id);
CREATE INDEX IF NOT EXISTS idx_individual_time_entries_start_time ON individual_time_entries(start_time);

CREATE INDEX IF NOT EXISTS idx_individual_tasks_user_id ON individual_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_tasks_business_id ON individual_tasks(business_id);
CREATE INDEX IF NOT EXISTS idx_individual_tasks_status ON individual_tasks(status);
CREATE INDEX IF NOT EXISTS idx_individual_tasks_due_date ON individual_tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_individual_work_reports_user_id ON individual_work_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_work_reports_business_id ON individual_work_reports(business_id);
CREATE INDEX IF NOT EXISTS idx_individual_work_reports_period ON individual_work_reports(report_period_start, report_period_end);

CREATE INDEX IF NOT EXISTS idx_individual_work_sessions_user_id ON individual_work_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_work_sessions_business_id ON individual_work_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_individual_work_sessions_active ON individual_work_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_individual_productivity_metrics_user_id ON individual_productivity_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_productivity_metrics_business_id ON individual_productivity_metrics(business_id);
CREATE INDEX IF NOT EXISTS idx_individual_productivity_metrics_date ON individual_productivity_metrics(metric_date);

-- Enable RLS (Row Level Security)
ALTER TABLE individual_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_work_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_productivity_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view their own time entries" ON individual_time_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries" ON individual_time_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" ON individual_time_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks" ON individual_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON individual_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON individual_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own work reports" ON individual_work_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work reports" ON individual_work_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own work sessions" ON individual_work_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work sessions" ON individual_work_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work sessions" ON individual_work_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own productivity metrics" ON individual_productivity_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own productivity metrics" ON individual_productivity_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own productivity metrics" ON individual_productivity_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- Business owners can view their employees' data
CREATE POLICY "Business owners can view employee time entries" ON individual_time_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_memberships bm 
            WHERE bm.business_id = individual_time_entries.business_id 
            AND bm.user_id = auth.uid() 
            AND bm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Business owners can view employee tasks" ON individual_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_memberships bm 
            WHERE bm.business_id = individual_tasks.business_id 
            AND bm.user_id = auth.uid() 
            AND bm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Business owners can view employee work reports" ON individual_work_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_memberships bm 
            WHERE bm.business_id = individual_work_reports.business_id 
            AND bm.user_id = auth.uid() 
            AND bm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Business owners can view employee work sessions" ON individual_work_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_memberships bm 
            WHERE bm.business_id = individual_work_sessions.business_id 
            AND bm.user_id = auth.uid() 
            AND bm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Business owners can view employee productivity metrics" ON individual_productivity_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_memberships bm 
            WHERE bm.business_id = individual_productivity_metrics.business_id 
            AND bm.user_id = auth.uid() 
            AND bm.role IN ('owner', 'admin')
        )
    );

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_individual_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
        IF NEW.hourly_rate > 0 THEN
            NEW.total_earnings = (NEW.duration_minutes / 60.0) * NEW.hourly_rate;
        END IF;
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_individual_time_entry_duration
    BEFORE UPDATE ON individual_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_individual_time_entry_duration();

CREATE OR REPLACE FUNCTION update_individual_work_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_individual_work_session_duration
    BEFORE UPDATE ON individual_work_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_individual_work_session_duration();
