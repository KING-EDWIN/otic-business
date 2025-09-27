-- Create Individual User Tables for System Health Monitoring
-- These tables are needed for the individual user functionality

-- Individual Time Entries Table
CREATE TABLE IF NOT EXISTS individual_time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    earnings DECIMAL(12,2) DEFAULT 0.00,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual Tasks Table
CREATE TABLE IF NOT EXISTS individual_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    category VARCHAR(50),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Individual Work Reports Table
CREATE TABLE IF NOT EXISTS individual_work_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_hours_worked DECIMAL(10,2),
    total_earnings DECIMAL(12,2),
    task_summary JSONB,
    category_breakdown JSONB,
    report_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual Work Sessions Table
CREATE TABLE IF NOT EXISTS individual_work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual Productivity Metrics Table
CREATE TABLE IF NOT EXISTS individual_productivity_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_hours_logged DECIMAL(10,2) DEFAULT 0.00,
    tasks_completed INTEGER DEFAULT 0,
    average_task_completion_time_minutes INTEGER,
    productivity_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, metric_date)
);

-- Enable RLS on all tables
ALTER TABLE individual_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_work_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_productivity_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own time entries" ON individual_time_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries" ON individual_time_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" ON individual_time_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" ON individual_time_entries
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks" ON individual_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON individual_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON individual_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON individual_tasks
    FOR DELETE USING (auth.uid() = user_id);

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
