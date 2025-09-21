-- Create missing tables that RPC functions need

-- 1. system_error_logs table
CREATE TABLE IF NOT EXISTS system_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_details JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_error_logs_status ON system_error_logs(status);
CREATE INDEX IF NOT EXISTS idx_system_error_logs_created_at ON system_error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_error_logs_user_id ON system_error_logs(user_id);

-- 3. Enable RLS
ALTER TABLE system_error_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Users can view their own error logs" ON system_error_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own error logs" ON system_error_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own error logs" ON system_error_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Grant permissions
GRANT ALL ON system_error_logs TO authenticated;
GRANT ALL ON system_error_logs TO anon;

-- 6. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_error_logs_updated_at 
    BEFORE UPDATE ON system_error_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert some sample error logs for testing
INSERT INTO system_error_logs (error_type, error_message, error_details, user_id, status) VALUES
('AUTH_ERROR', 'User authentication failed', '{"reason": "invalid_credentials", "timestamp": "2024-01-01T10:00:00Z"}', NULL, 'active'),
('RPC_ERROR', 'RPC function not found', '{"function": "get_user_businesses", "error_code": "PGRST202"}', NULL, 'resolved'),
('DB_ERROR', 'Connection timeout', '{"table": "user_profiles", "duration": "30s"}', NULL, 'active');

SELECT 'Missing tables created successfully' as status;



