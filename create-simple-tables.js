// Create individual business access tables using direct SQL
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createTables() {
  console.log('🔧 Creating individual business access tables...')
  
  try {
    // First, let's check if the tables already exist
    console.log('Checking existing tables...')
    const { data: existingTables, error: checkError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['business_individual_access', 'business_invitations'])
      .eq('table_schema', 'public')
    
    if (checkError) {
      console.log('❌ Error checking tables:', checkError.message)
      return
    }
    
    console.log('Existing tables:', existingTables.map(t => t.table_name))
    
    // If tables don't exist, we need to create them
    // Since we can't execute raw SQL directly, let's try to insert a test record
    // This will fail gracefully if the table doesn't exist
    
    console.log('Testing business_individual_access table...')
    const { error: accessTestError } = await supabaseAdmin
      .from('business_individual_access')
      .select('id')
      .limit(1)
    
    if (accessTestError) {
      console.log('❌ business_individual_access table does not exist:', accessTestError.message)
    } else {
      console.log('✅ business_individual_access table exists')
    }
    
    console.log('Testing business_invitations table...')
    const { error: invitationsTestError } = await supabaseAdmin
      .from('business_invitations')
      .select('id')
      .limit(1)
    
    if (invitationsTestError) {
      console.log('❌ business_invitations table does not exist:', invitationsTestError.message)
    } else {
      console.log('✅ business_invitations table exists')
    }
    
    // Since we can't create tables via the client, let's modify the service to handle missing tables gracefully
    console.log('📝 Recommendation: Create these tables manually in Supabase dashboard or via SQL editor')
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

// Run the check
createTables()
