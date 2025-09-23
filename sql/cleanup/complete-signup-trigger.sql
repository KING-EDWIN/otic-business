-- Complete Signup Trigger
-- This trigger automatically creates all necessary records when a user signs up
-- Run this in your Supabase SQL Editor

-- Step 1: Create or replace the function that handles new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles table
  INSERT INTO public.user_profiles (
    id,
    email,
    business_name,
    tier,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'New Business'),
    'basic',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  -- Insert into subscriptions table
  INSERT INTO public.subscriptions (
    id,
    user_id,
    tier,
    status,
    expires_at,
    created_at
  )
  VALUES (
    gen_random_uuid(),
    NEW.id,
    'basic',
    'active',
    NOW() + INTERVAL '30 days',
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert into payment_requests table (optional - for tracking)
  INSERT INTO public.payment_requests (
    id,
    user_id,
    amount,
    currency,
    status,
    description,
    created_at
  )
  VALUES (
    gen_random_uuid(),
    NEW.id,
    0.00,
    'USD',
    'pending',
    'Initial account setup',
    NOW()
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 3: Create a function to handle user updates
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_profiles when auth user is updated
  UPDATE public.user_profiles
  SET
    email = NEW.email,
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_update();

-- Step 5: Create a function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete from user_profiles
  DELETE FROM public.user_profiles WHERE id = OLD.id;
  
  -- Delete from subscriptions
  DELETE FROM public.subscriptions WHERE user_id = OLD.id;
  
  -- Delete from payment_requests
  DELETE FROM public.payment_requests WHERE user_id = OLD.id;
  
  -- Delete from products
  DELETE FROM public.products WHERE user_id = OLD.id;
  
  -- Delete from sales
  DELETE FROM public.sales WHERE user_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_delete();

-- Step 7: Test the setup
SELECT 
  'Trigger Setup Complete' as status,
  'All triggers created successfully' as message;

-- Step 8: Verify triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';
