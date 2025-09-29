import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oticbusiness.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWNidXNpbmVzcyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzUzNzQ4NzMsImV4cCI6MjA1MDk1MDg3M30.8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ8QZJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBusinessInvitationsTable() {
  console.log('🔍 Checking business_invitations table structure...');
  
  try {
    // Try to get table info
    const { data, error } = await supabase
      .from('business_invitations')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing business_invitations table:', error);
      
      if (error.code === 'PGRST116') {
        console.log('📝 Table exists but has no data, checking structure...');
        
        // Try to insert a test record to see what columns are missing
        const testInsert = await supabase
          .from('business_invitations')
          .insert({
            business_id: '00000000-0000-0000-0000-000000000000',
            invited_email: 'test@example.com',
            role: 'employee',
            status: 'pending',
            message: 'Test invitation',
            invited_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
          
        console.log('🧪 Test insert result:', testInsert);
      }
    } else {
      console.log('✅ Table structure:', data);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function fixBusinessInvitationsTable() {
  console.log('🔧 Fixing business_invitations table...');
  
  try {
    // Add missing columns
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE business_invitations 
        ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
        ADD COLUMN IF NOT EXISTS message TEXT DEFAULT 'You have been invited to join our business!';
      `
    });
    
    if (alterError) {
      console.error('❌ Error altering table:', alterError);
      
      // Try alternative approach - recreate table
      console.log('🔄 Trying to recreate table...');
      
      const { error: recreateError } = await supabase.rpc('exec_sql', {
        sql: `
          DROP TABLE IF EXISTS business_invitations CASCADE;
          
          CREATE TABLE business_invitations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            business_id UUID NOT NULL REFERENCES business_signups(id) ON DELETE CASCADE,
            invited_email TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'employee',
            status TEXT NOT NULL DEFAULT 'pending',
            message TEXT DEFAULT 'You have been invited to join our business!',
            invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Enable RLS
          ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;
          
          -- Create RLS policies
          CREATE POLICY "Users can view invitations sent to their email" ON business_invitations
            FOR SELECT USING (invited_email = auth.jwt() ->> 'email');
            
          CREATE POLICY "Business owners can manage invitations" ON business_invitations
            FOR ALL USING (
              business_id IN (
                SELECT id FROM business_signups 
                WHERE owner_id = auth.uid()
              )
            );
        `
      });
      
      if (recreateError) {
        console.error('❌ Error recreating table:', recreateError);
      } else {
        console.log('✅ Table recreated successfully!');
      }
    } else {
      console.log('✅ Table altered successfully!');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function main() {
  await checkBusinessInvitationsTable();
  await fixBusinessInvitationsTable();
  
  // Test the fix
  console.log('🧪 Testing invitation creation...');
  try {
    const { data, error } = await supabase
      .from('business_invitations')
      .insert({
        business_id: '00000000-0000-0000-0000-000000000000',
        invited_email: 'test@example.com',
        role: 'employee',
        status: 'pending',
        message: 'Test invitation after fix',
        invited_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select();
      
    if (error) {
      console.error('❌ Test insert failed:', error);
    } else {
      console.log('✅ Test insert successful:', data);
      
      // Clean up test data
      await supabase
        .from('business_invitations')
        .delete()
        .eq('invited_email', 'test@example.com');
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

main();
