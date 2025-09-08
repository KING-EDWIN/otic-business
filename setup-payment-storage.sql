-- Setup payment storage bucket
-- Run this in your Supabase SQL Editor

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true);

-- Create storage policy for payment proofs
CREATE POLICY "Users can upload their own payment proofs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-proofs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own payment proofs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-proofs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all payment proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-proofs');

-- Create policy for public access to payment proofs (for admin verification)
CREATE POLICY "Public access to payment proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-proofs');

