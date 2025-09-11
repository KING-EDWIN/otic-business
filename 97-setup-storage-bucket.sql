-- Setup Storage Bucket for Payment Proofs
-- This script sets up RLS policies for the payment-proofs storage bucket

-- Note: The storage bucket itself must be created through Supabase Dashboard
-- Go to: Supabase Dashboard > Storage > Create Bucket
-- Bucket name: payment-proofs
-- Public: false (private bucket)
-- File size limit: 52428800 (50MB)
-- Allowed MIME types: image/*, application/pdf

-- Check if storage schema exists and is accessible
DO $$ 
BEGIN
    -- Test if we can access storage schema
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        RAISE NOTICE 'Storage schema is accessible';
    ELSE
        RAISE NOTICE 'Storage schema not accessible - this is normal for some Supabase setups';
    END IF;
END $$;

-- Create RLS policies for storage.objects (if storage schema is accessible)
DO $$ 
BEGIN
    -- Only create policies if storage.objects table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        
        -- Drop existing policies first to avoid conflicts
        DROP POLICY IF EXISTS "Allow uploads to payment-proofs" ON storage.objects;
        DROP POLICY IF EXISTS "Allow downloads from payment-proofs" ON storage.objects;
        DROP POLICY IF EXISTS "Allow updates to payment-proofs" ON storage.objects;
        DROP POLICY IF EXISTS "Allow deletes from payment-proofs" ON storage.objects;
        
        -- Create new policies
        CREATE POLICY "Allow uploads to payment-proofs" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');
        
        CREATE POLICY "Allow downloads from payment-proofs" ON storage.objects
        FOR SELECT USING (bucket_id = 'payment-proofs');
        
        CREATE POLICY "Allow updates to payment-proofs" ON storage.objects
        FOR UPDATE USING (bucket_id = 'payment-proofs');
        
        CREATE POLICY "Allow deletes from payment-proofs" ON storage.objects
        FOR DELETE USING (bucket_id = 'payment-proofs');
        
        RAISE NOTICE 'Storage RLS policies created successfully';
    ELSE
        RAISE NOTICE 'Storage.objects table not found - policies will be created through Supabase Dashboard';
    END IF;
END $$;

-- Final status
SELECT 
  'STORAGE SETUP COMPLETE' as info,
  'Please create payment-proofs bucket in Supabase Dashboard if not already created' as message;
