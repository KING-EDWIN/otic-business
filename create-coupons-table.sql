-- Create coupons table for tier upgrades
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,
    tier VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_used BOOLEAN DEFAULT false,
    used_by UUID REFERENCES auth.users(id),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_tier ON coupons(tier);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_used ON coupons(is_used);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to read active coupons" ON coupons
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Allow service role to manage coupons" ON coupons
    FOR ALL USING (auth.role() = 'service_role');

-- Function to generate random 5-digit coupon code
CREATE OR REPLACE FUNCTION generate_coupon_code()
RETURNS VARCHAR(5) AS $$
DECLARE
    code VARCHAR(5);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate random 5-digit code
        code := LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
        
        -- Check if code already exists
        SELECT COUNT(*) INTO exists_count FROM coupons WHERE coupons.code = code;
        
        -- If code doesn't exist, return it
        IF exists_count = 0 THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a coupon
CREATE OR REPLACE FUNCTION create_coupon(
    p_tier VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    code VARCHAR(5),
    tier VARCHAR(50),
    description TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    new_code VARCHAR(5);
BEGIN
    -- Generate unique code
    new_code := generate_coupon_code();
    
    -- Insert coupon
    INSERT INTO coupons (code, tier, description, expires_at, created_by)
    VALUES (new_code, p_tier, p_description, p_expires_at, p_created_by);
    
    -- Return the created coupon
    RETURN QUERY
    SELECT c.id, c.code, c.tier, c.description, c.expires_at
    FROM coupons c
    WHERE c.code = new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use a coupon
CREATE OR REPLACE FUNCTION use_coupon(
    p_code VARCHAR(5),
    p_user_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    tier VARCHAR(50),
    message TEXT
) AS $$
DECLARE
    coupon_record RECORD;
BEGIN
    -- Get coupon details
    SELECT * INTO coupon_record
    FROM coupons
    WHERE code = p_code AND is_active = true AND is_used = false;
    
    -- Check if coupon exists and is valid
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::VARCHAR(50), 'Invalid or expired coupon code'::TEXT;
        RETURN;
    END IF;
    
    -- Check if coupon has expired
    IF coupon_record.expires_at IS NOT NULL AND coupon_record.expires_at < NOW() THEN
        RETURN QUERY SELECT false, NULL::VARCHAR(50), 'Coupon has expired'::TEXT;
        RETURN;
    END IF;
    
    -- Mark coupon as used
    UPDATE coupons
    SET is_used = true, used_by = p_user_id, used_at = NOW()
    WHERE id = coupon_record.id;
    
    -- Return success
    RETURN QUERY SELECT true, coupon_record.tier, 'Coupon applied successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample coupons for testing
INSERT INTO coupons (code, tier, description, created_by) VALUES
('12345', 'premium', 'Premium tier upgrade coupon', NULL),
('67890', 'standard', 'Standard tier upgrade coupon', NULL),
('11111', 'basic', 'Basic tier upgrade coupon', NULL),
('22222', 'premium', 'Premium tier upgrade coupon', NULL),
('33333', 'standard', 'Standard tier upgrade coupon', NULL);

-- Grant permissions
GRANT SELECT ON coupons TO authenticated;
GRANT ALL ON coupons TO service_role;
GRANT EXECUTE ON FUNCTION generate_coupon_code() TO service_role;
GRANT EXECUTE ON FUNCTION create_coupon(VARCHAR, TEXT, TIMESTAMP WITH TIME ZONE, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION use_coupon(VARCHAR, UUID) TO service_role;
