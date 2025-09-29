import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oticbusiness.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWNidXNpbmVzcyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzUzNzQ4NzMsImV4cCI6MjA1MDk1MDg3M30.8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCouponsTable() {
  try {
    console.log('Creating coupons table...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (error) {
      console.error('Error creating table:', error);
      return;
    }

    console.log('✅ Coupons table created successfully!');

    // Insert sample coupons
    console.log('Inserting sample coupons...');
    const sampleCoupons = [
      { code: '12345', tier: 'premium', description: 'Premium tier upgrade coupon' },
      { code: '67890', tier: 'standard', description: 'Standard tier upgrade coupon' },
      { code: '11111', tier: 'basic', description: 'Basic tier upgrade coupon' },
      { code: '22222', tier: 'premium', description: 'Premium tier upgrade coupon' },
      { code: '33333', tier: 'standard', description: 'Standard tier upgrade coupon' }
    ];

    const { data: insertData, error: insertError } = await supabase
      .from('coupons')
      .insert(sampleCoupons);

    if (insertError) {
      console.error('Error inserting sample coupons:', insertError);
    } else {
      console.log('✅ Sample coupons inserted successfully!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createCouponsTable();
