-- Email Verification and Password Reset System
-- This script creates tables and functions to properly handle email verification
-- and password reset flows with Supabase auth integration

-- Email Verification Logs Table
CREATE TABLE IF NOT EXISTS email_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('signup', 'password_reset', 'email_change')),
    token_hash TEXT, -- Store hashed version of token for security
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    ip_address INET,
    user_agent TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'failed')),
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Templates Table (for tracking which templates were used)
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    template_name TEXT UNIQUE NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('verification', 'password_reset', 'welcome', 'notification')),
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Delivery Status Table
CREATE TABLE IF NOT EXISTS email_delivery_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_log_id UUID REFERENCES email_verification_logs(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'supabase', 'resend', 'sendgrid', etc.
    provider_message_id TEXT,
    delivery_status TEXT NOT NULL CHECK (delivery_status IN ('sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked')),
    status_details JSONB,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_verification_logs_user_id ON email_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_logs_email ON email_verification_logs(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_logs_status ON email_verification_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_verification_logs_expires_at ON email_verification_logs(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_delivery_status_log_id ON email_delivery_status(verification_log_id);

-- Function to log email verification attempts
CREATE OR REPLACE FUNCTION log_email_verification(
    p_user_id UUID,
    p_email TEXT,
    p_verification_type TEXT,
    p_token_hash TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO email_verification_logs (
        user_id,
        email,
        verification_type,
        token_hash,
        ip_address,
        user_agent,
        expires_at
    ) VALUES (
        p_user_id,
        p_email,
        p_verification_type,
        p_token_hash,
        p_ip_address,
        p_user_agent,
        NOW() + INTERVAL '24 hours'
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify email and update user status
CREATE OR REPLACE FUNCTION verify_email_token(
    p_user_id UUID,
    p_token_hash TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    verification_record RECORD;
    user_record RECORD;
BEGIN
    -- Find the verification record
    SELECT * INTO verification_record
    FROM email_verification_logs
    WHERE user_id = p_user_id
    AND token_hash = p_token_hash
    AND status = 'pending'
    AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Check if verification record exists and is valid
    IF NOT FOUND THEN
        -- Update attempts for security
        UPDATE email_verification_logs
        SET attempts = attempts + 1,
            status = CASE 
                WHEN attempts >= 3 THEN 'failed'
                ELSE 'pending'
            END
        WHERE user_id = p_user_id
        AND token_hash = p_token_hash;
        
        RETURN FALSE;
    END IF;
    
    -- Mark verification as completed
    UPDATE email_verification_logs
    SET status = 'verified',
        verified_at = NOW(),
        updated_at = NOW()
    WHERE id = verification_record.id;
    
    -- Update user profile email verification status
    UPDATE user_profiles
    SET email_verified = TRUE,
        verification_timestamp = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Update auth.users email_confirmed_at (if we have access)
    -- Note: This might require service_role key or RPC function
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired verification tokens
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Mark expired verifications as expired
    UPDATE email_verification_logs
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'pending'
    AND expires_at < NOW();
    
    -- Get count of expired records
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Optionally delete old expired records (older than 30 days)
    DELETE FROM email_verification_logs
    WHERE status = 'expired'
    AND expires_at < NOW() - INTERVAL '30 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get verification status for a user
CREATE OR REPLACE FUNCTION get_user_verification_status(p_user_id UUID)
RETURNS TABLE (
    email_verified BOOLEAN,
    verification_timestamp TIMESTAMP WITH TIME ZONE,
    pending_verifications INTEGER,
    last_verification_sent TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.email_verified,
        up.verification_timestamp,
        COUNT(evl.id)::INTEGER as pending_verifications,
        MAX(evl.sent_at) as last_verification_sent
    FROM user_profiles up
    LEFT JOIN email_verification_logs evl ON up.id = evl.user_id 
        AND evl.status = 'pending' 
        AND evl.expires_at > NOW()
    WHERE up.id = p_user_id
    GROUP BY up.email_verified, up.verification_timestamp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resend verification email (with rate limiting)
CREATE OR REPLACE FUNCTION can_resend_verification(
    p_user_id UUID,
    p_verification_type TEXT DEFAULT 'signup'
) RETURNS BOOLEAN AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    -- Check if user has sent verification emails in the last 5 minutes
    SELECT COUNT(*) INTO recent_count
    FROM email_verification_logs
    WHERE user_id = p_user_id
    AND verification_type = p_verification_type
    AND sent_at > NOW() - INTERVAL '5 minutes';
    
    -- Allow resend if no recent attempts
    RETURN recent_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_email_verification_logs_updated_at
    BEFORE UPDATE ON email_verification_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default email templates
INSERT INTO email_templates (template_name, template_type, subject_template, body_template) VALUES
('signup_verification', 'verification', 'Verify your OTIC Business account', 
 'Welcome to OTIC Business! Please verify your email by clicking the link below.'),
('password_reset', 'password_reset', 'Reset your OTIC Business password',
 'You requested a password reset. Click the link below to reset your password.'),
('welcome_verified', 'welcome', 'Welcome to OTIC Business!',
 'Your email has been verified. Welcome to OTIC Business!')
ON CONFLICT (template_name) DO NOTHING;

-- RLS Policies for email verification tables
ALTER TABLE email_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_delivery_status ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verification logs
CREATE POLICY "Users can view own verification logs" ON email_verification_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own verification logs
CREATE POLICY "Users can insert own verification logs" ON email_verification_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification logs
CREATE POLICY "Users can update own verification logs" ON email_verification_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Delivery status policies
CREATE POLICY "Users can view own delivery status" ON email_delivery_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM email_verification_logs evl 
            WHERE evl.id = email_delivery_status.verification_log_id 
            AND evl.user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON email_verification_logs TO anon, authenticated;
GRANT SELECT ON email_delivery_status TO anon, authenticated;
GRANT SELECT ON email_templates TO anon, authenticated;
GRANT EXECUTE ON FUNCTION log_email_verification TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_email_token TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_verification_status TO anon, authenticated;
GRANT EXECUTE ON FUNCTION can_resend_verification TO anon, authenticated;

-- Create a scheduled job to clean up expired verifications (if pg_cron is available)
-- SELECT cron.schedule('cleanup-expired-verifications', '0 */6 * * *', 'SELECT cleanup_expired_verifications();');

COMMENT ON TABLE email_verification_logs IS 'Tracks all email verification attempts and their status';
COMMENT ON TABLE email_templates IS 'Stores email templates for different verification types';
COMMENT ON TABLE email_delivery_status IS 'Tracks email delivery status from various providers';
COMMENT ON FUNCTION log_email_verification IS 'Logs email verification attempts with security features';
COMMENT ON FUNCTION verify_email_token IS 'Verifies email tokens and updates user status';
COMMENT ON FUNCTION cleanup_expired_verifications IS 'Cleans up expired verification tokens';
COMMENT ON FUNCTION get_user_verification_status IS 'Returns comprehensive verification status for a user';
COMMENT ON FUNCTION can_resend_verification IS 'Checks if user can resend verification email (rate limiting)';
