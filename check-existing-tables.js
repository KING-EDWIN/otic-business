import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jvgiyscchxxekcbdicco.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8"

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  try {
    console.log('🔍 Checking existing tables...')

    // Try to access different tables to see what exists
    const tables = ['reports', 'report_schedules', 'report_views', 'users', 'products', 'sales']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`)
        } else {
          console.log(`✅ Table '${table}': Exists (${data?.length || 0} rows)`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`)
      }
    }

    // Check auth.users
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.log('❌ Auth check:', error.message)
      } else {
        console.log('✅ Auth system: Working')
        if (user) {
          console.log(`   Current user: ${user.id}`)
        }
      }
    } catch (err) {
      console.log('❌ Auth check:', err.message)
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error)
  }
}

checkTables()
