-- Create Fresh Authentication System
-- This script creates a clean, simple authentication system

-- Step 1: Drop existing user-related tables and constraints
-- (We'll recreate them with a clean structure)

-- Drop foreign key constraints first
ALTER TABLE IF EXISTS subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE IF EXISTS sales DROP CONSTRAINT IF EXISTS sales_user_id_fkey;
ALTER TABLE IF EXISTS products DROP CONSTRAINT IF EXISTS products_user_id_fkey;
ALTER TABLE IF EXISTS customers DROP CONSTRAINT IF EXISTS customers_user_id_fkey;
ALTER TABLE IF EXISTS suppliers DROP CONSTRAINT IF EXISTS suppliers_user_id_fkey;
ALTER TABLE IF EXISTS expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
ALTER TABLE IF EXISTS invoices DROP CONSTRAINT IF EXISTS invoices_user_id_fkey;
ALTER TABLE IF EXISTS payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE IF EXISTS analytics_data DROP CONSTRAINT IF EXISTS analytics_data_user_id_fkey;
ALTER TABLE IF EXISTS ai_forecasts DROP CONSTRAINT IF EXISTS ai_forecasts_user_id_fkey;
ALTER TABLE IF EXISTS email_notifications DROP CONSTRAINT IF EXISTS email_notifications_user_id_fkey;
ALTER TABLE IF EXISTS notification_settings DROP CONSTRAINT IF EXISTS notification_settings_user_id_fkey;
ALTER TABLE IF EXISTS payment_history DROP CONSTRAINT IF EXISTS payment_history_user_id_fkey;
ALTER TABLE IF EXISTS payment_requests DROP CONSTRAINT IF EXISTS payment_requests_user_id_fkey;
ALTER TABLE IF EXISTS quickbooks_tokens DROP CONSTRAINT IF EXISTS quickbooks_tokens_user_id_fkey;
ALTER TABLE IF EXISTS quickbooks_sync_log DROP CONSTRAINT IF EXISTS quickbooks_sync_log_user_id_fkey;
ALTER TABLE IF EXISTS quickbooks_customer_mapping DROP CONSTRAINT IF EXISTS quickbooks_customer_mapping_user_id_fkey;
ALTER TABLE IF EXISTS quickbooks_invoice_mapping DROP CONSTRAINT IF EXISTS quickbooks_invoice_mapping_user_id_fkey;
ALTER TABLE IF EXISTS quickbooks_product_mapping DROP CONSTRAINT IF EXISTS quickbooks_product_mapping_user_id_fkey;
ALTER TABLE IF EXISTS tier_usage_tracking DROP CONSTRAINT IF EXISTS tier_usage_tracking_user_id_fkey;
ALTER TABLE IF EXISTS user_business_summary DROP CONSTRAINT IF EXISTS user_business_summary_user_id_fkey;

-- Drop views that depend on user_profiles
DROP VIEW IF EXISTS user_verification_status CASCADE;
DROP VIEW IF EXISTS unverified_users CASCADE;

-- Drop user-related tables
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;

-- Step 2: Create fresh, clean user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    business_name TEXT,
    phone TEXT,
    tier TEXT DEFAULT 'free_trial' CHECK (tier IN ('free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage')),
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create fresh subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX idx_user_profiles_email_verified ON user_profiles(email_verified);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);

-- Step 5: Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 7: Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile when a new user signs up
    INSERT INTO public.user_profiles (id, email, business_name, tier, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        'New Business',
        'free_trial',
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    );
    
    -- Create initial subscription
    INSERT INTO public.subscriptions (user_id, tier, status, expires_at)
    VALUES (
        NEW.id,
        'free_trial',
        'active',
        CASE 
            WHEN NEW.email_confirmed_at IS NOT NULL THEN NOW() + INTERVAL '30 days'
            ELSE NULL
        END
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.subscriptions TO postgres, anon, authenticated, service_role;

-- Step 10: Create function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
    p_business_name TEXT,
    p_phone TEXT,
    p_tier TEXT DEFAULT 'free_trial'
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        business_name = p_business_name,
        phone = p_phone,
        tier = p_tier,
        updated_at = NOW()
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;

-- Step 12: Create function to get user subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription()
RETURNS TABLE (
    tier TEXT,
    status TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.tier,
        s.status,
        s.expires_at
    FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_subscription TO authenticated;

-- Step 14: Verify the setup
SELECT 'Fresh authentication system created successfully!' as status;

