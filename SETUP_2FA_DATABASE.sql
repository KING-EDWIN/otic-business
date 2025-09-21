-- Setup 2FA Database Tables and Functions
-- This script creates the necessary tables and functions for 2-step verification

-- 1. Create two_factor_codes table
CREATE TABLE IF NOT EXISTS two_factor_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add two_factor_enabled column to user_profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'two_factor_enabled'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_email ON two_factor_codes(email);
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_expires ON two_factor_codes(expires_at);

-- 4. Enable RLS on two_factor_codes table
ALTER TABLE two_factor_codes ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for two_factor_codes
CREATE POLICY "Users can manage their own 2FA codes" ON two_factor_codes
  FOR ALL USING (email = auth.jwt() ->> 'email');

-- 6. Create function to clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM two_factor_codes 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to send OTP email (placeholder - will be implemented via Edge Function)
CREATE OR REPLACE FUNCTION send_otp_email(
  user_email TEXT,
  otp_code TEXT,
  expiry_minutes INTEGER DEFAULT 10
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- This function will be called by the Edge Function
  -- For now, just return success
  result := json_build_object(
    'success', true,
    'message', 'OTP email function ready'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON two_factor_codes TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_2fa_codes() TO authenticated;
GRANT EXECUTE ON FUNCTION send_otp_email(TEXT, TEXT, INTEGER) TO authenticated;

-- 9. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_two_factor_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_two_factor_codes_updated_at
  BEFORE UPDATE ON two_factor_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_two_factor_codes_updated_at();

-- 10. Create Edge Function for sending OTP emails
-- Note: This will be created via Supabase Dashboard or CLI
-- The function will use SMTP to send emails

-- 11. Sample data for testing (optional)
-- INSERT INTO two_factor_codes (email, code, expires_at) 
-- VALUES ('test@example.com', '123456', NOW() + INTERVAL '10 minutes');

-- 12. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Success message
SELECT '2FA database setup completed successfully!' as status;
