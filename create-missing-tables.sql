-- Create Missing Individual User Activity Tables
-- Run this in Supabase SQL Editor

-- 1. Individual Time Entries Table
CREATE TABLE IF NOT EXISTS individual_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    description TEXT NOT NULL,
    task_category VARCHAR(50) DEFAULT 'general',
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
    assigned_by UUID REFERENCES auth.users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE individual_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for individual_time_entries
CREATE POLICY "Users can view their own time entries" ON individual_time_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries" ON individual_time_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" ON individual_time_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for individual_tasks
CREATE POLICY "Users can view their own tasks" ON individual_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON individual_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON individual_tasks
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_individual_time_entries_user_id ON individual_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_time_entries_business_id ON individual_time_entries(business_id);
CREATE INDEX IF NOT EXISTS idx_individual_time_entries_start_time ON individual_time_entries(start_time);

CREATE INDEX IF NOT EXISTS idx_individual_tasks_user_id ON individual_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_tasks_business_id ON individual_tasks(business_id);
CREATE INDEX IF NOT EXISTS idx_individual_tasks_status ON individual_tasks(status);
CREATE INDEX IF NOT EXISTS idx_individual_tasks_due_date ON individual_tasks(due_date);
