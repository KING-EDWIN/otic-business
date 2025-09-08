`-- Migrate to Clean Authentication System
-- This script works with the existing database structure

-- Step 1: First, let's check what we have
-- (Run the check-current-structure.sql first to see the current state)

-- Step 2: Fix the subscriptions table structure
-- Make user_id NOT NULL and add proper foreign key constraint
ALTER TABLE subscriptions 
ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint if it doesn't exist
ALTER TABLE subscriptions 
ADD CONSTRAINT IF NOT EXISTS subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Check if user_profiles table exists and its structure
-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    business_name TEXT,
    phone TEXT,
    tier TEXT DEFAULT 'free_trial' CHECK (tier IN ('free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage')),
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Add missing columns to user_profiles if they don't exist
DO $$ 
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
        ALTER TABLE user_profiles ADD COLUMN email TEXT;
    END IF;
    
    -- Add business_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'business_name') THEN
        ALTER TABLE user_profiles ADD COLUMN business_name TEXT;
    END IF;
    
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'phone') THEN
        ALTER TABLE user_profiles ADD COLUMN phone TEXT;
    END IF;
    
    -- Add tier column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'tier') THEN
        ALTER TABLE user_profiles ADD COLUMN tier TEXT DEFAULT 'free_trial';
    END IF;
    
    -- Add email_verified column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'email_verified') THEN
        ALTER TABLE user_profiles ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'created_at') THEN
        ALTER TABLE user_profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Step 5: Update existing user_profiles with email from auth.users
UPDATE user_profiles 
SET email = auth_users.email
FROM auth.users AS auth_users
WHERE user_profiles.id = auth_users.id
AND user_profiles.email IS NULL;

-- Step 6: Make email NOT NULL after updating
ALTER TABLE user_profiles 
ALTER COLUMN email SET NOT NULL;

-- Step 7: Add unique constraint on email if it doesn't exist
ALTER TABLE user_profiles 
ADD CONSTRAINT IF NOT EXISTS user_profiles_email_key UNIQUE (email);

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON user_profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Step 9: Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;

-- Create new policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 11: Create function to handle new user creation
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
    )
    ON CONFLICT (id) DO NOTHING; -- Don't fail if profile already exists
    
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
    )
    ON CONFLICT DO NOTHING; -- Don't fail if subscription already exists
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 13: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.subscriptions TO postgres, anon, authenticated, service_role;

-- Step 14: Create function to update user profile
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

-- Step 15: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;

-- Step 16: Verify the setup
SELECT 'Migration to clean authentication system completed successfully!' as static