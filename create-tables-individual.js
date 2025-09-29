// Create individual business access tables using individual SQL statements
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createTables() {
  console.log('🔧 Creating individual business access tables...')
  
  try {
    // Create business_individual_access table
    console.log('Creating business_individual_access table...')
    const { error: accessError } = await supabaseAdmin.rpc('create_business_individual_access_table')
    
    if (accessError) {
      console.log('❌ Error creating business_individual_access:', accessError.message)
    } else {
      console.log('✅ business_individual_access table created')
    }
    
    // Create business_invitations table
    console.log('Creating business_invitations table...')
    const { error: invitationsError } = await supabaseAdmin.rpc('create_business_invitations_table')
    
    if (invitationsError) {
      console.log('❌ Error creating business_invitations:', invitationsError.message)
    } else {
      console.log('✅ business_invitations table created')
    }
    
    // Check if tables exist
    console.log('Checking if tables exist...')
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['business_individual_access', 'business_invitations'])
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message)
    } else {
      console.log('✅ Tables found:', tables.map(t => t.table_name))
    }
    
  } catch (error) {
    console.error('❌ Create tables failed:', error)
  }
}

// Run the table creation
createTables()
