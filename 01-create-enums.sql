-- Step 1: Create/Update Enums
-- Run this FIRST in your Supabase SQL Editor

-- Add new values to existing user_tier enum
DO $$ 
BEGIN
    -- Add new tier values to existing user_tier enum
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'free_trial' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_tier')) THEN
        ALTER TYPE user_tier ADD VALUE 'free_trial';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'start_smart' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_tier')) THEN
        ALTER TYPE user_tier ADD VALUE 'start_smart';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'grow_intelligence' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_tier')) THEN
        ALTER TYPE user_tier ADD VALUE 'grow_intelligence';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'enterprise_advantage' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_tier')) THEN
        ALTER TYPE user_tier ADD VALUE 'enterprise_advantage';
    END IF;
END $$;

-- Add new values to existing subscription_status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'trial' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_status')) THEN
        ALTER TYPE subscription_status ADD VALUE 'trial';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'suspended' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_status')) THEN
        ALTER TYPE subscription_status ADD VALUE 'suspended';
    END IF;
END $$;

-- Create payment status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
    END IF;
END $$;
