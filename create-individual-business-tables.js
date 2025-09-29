// Create individual business access tables using service role key
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createTables() {
  console.log('🔧 Creating individual business access tables...')
  
  try {
    // Read the SQL file
    const fs = await import('fs')
    const sql = fs.readFileSync('create-individual-business-tables.sql', 'utf8')
    
    // Execute the SQL
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql })
    
    if (error) {
      console.log('❌ Error creating tables:', error.message)
      return
    }
    
    console.log('✅ Tables created successfully!')
    
    // Verify tables exist
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['business_individual_access', 'business_invitations'])
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log('❌ Error verifying tables:', tablesError.message)
    } else {
      console.log('✅ Tables verified:', tables.map(t => t.table_name))
    }
    
  } catch (error) {
    console.error('❌ Create tables failed:', error)
  }
}

// Run the table creation
createTables()
