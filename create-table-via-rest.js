// Create missing table using Supabase REST API
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createTableViaRest() {
  console.log('🔧 Creating business_individual_access table via REST API...')
  
  try {
    // First, let's check what tables exist
    console.log('Checking existing tables...')
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .in('tablename', ['business_individual_access', 'business_invitations'])
    
    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message)
    } else {
      console.log('✅ Existing tables:', tables.map(t => t.tablename))
    }
    
    // Try to create the table using a different approach
    // Let's try to insert a test record to see if we can create the table structure
    console.log('Attempting to create table structure...')
    
    // First, let's see if we can access the businesses table to get a valid business_id
    const { data: businesses, error: businessesError } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .limit(1)
    
    if (businessesError) {
      console.log('❌ Error accessing businesses table:', businessesError.message)
      return
    }
    
    if (!businesses || businesses.length === 0) {
      console.log('❌ No businesses found in database')
      return
    }
    
    const businessId = businesses[0].id
    console.log('✅ Found business ID:', businessId)
    
    // Now let's try to create a test record in business_individual_access
    // This will fail if the table doesn't exist, but might give us more info
    const testRecord = {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      business_id: businessId,
      access_level: 'limited',
      permissions: [],
      is_active: true
    }
    
    console.log('Testing table creation with dummy record...')
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('business_individual_access')
      .insert(testRecord)
      .select()
    
    if (insertError) {
      console.log('❌ Table creation test failed:', insertError.message)
      console.log('Error details:', insertError.details)
      console.log('Error hint:', insertError.hint)
    } else {
      console.log('✅ Table creation test succeeded:', insertData)
      
      // Clean up the test record
      await supabaseAdmin
        .from('business_individual_access')
        .delete()
        .eq('id', insertData[0].id)
      console.log('✅ Test record cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Create table failed:', error)
  }
}

// Run the table creation
createTableViaRest()
