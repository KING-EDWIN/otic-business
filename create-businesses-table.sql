-- Create businesses table to match the foreign key reference
-- Run this in Supabase Dashboard SQL Editor

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  business_type TEXT DEFAULT 'business',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for businesses
CREATE POLICY "Anyone can view businesses" ON businesses
  FOR SELECT USING (true);

CREATE POLICY "Business owners can manage their businesses" ON businesses
  FOR ALL USING (
    id IN (
      SELECT business_id FROM business_signups 
      WHERE user_id = auth.uid()
    )
  );

-- Insert businesses from business_signups if they don't exist
INSERT INTO businesses (id, business_name, business_type)
SELECT 
  id,
  COALESCE(business_name, company_name) as business_name,
  'business' as business_type
FROM business_signups
WHERE NOT EXISTS (
  SELECT 1 FROM businesses WHERE businesses.id = business_signups.id
);

-- Verify the table was created and populated
SELECT COUNT(*) as business_count FROM businesses;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'businesses' ORDER BY ordinal_position;
