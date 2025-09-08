import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jvgiyscchxxekcbdicco.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8"

const supabase = createClient(supabaseUrl, supabaseKey)

async function getUserIds() {
  try {
    console.log('🔍 Getting user IDs from auth.users table...')

    // Try to get users from auth.users (this might not work due to RLS)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.log('❌ Cannot access auth.users directly:', usersError.message)
      console.log('💡 Let\'s try a different approach...')
      
      // Try to get user IDs from existing tables
      const tables = ['user_profiles', 'products', 'sales']
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('user_id')
            .limit(5)
          
          if (!error && data && data.length > 0) {
            console.log(`✅ Found user IDs in ${table}:`)
            const uniqueUserIds = [...new Set(data.map(row => row.user_id))]
            uniqueUserIds.forEach(id => console.log(`   - ${id}`))
            return uniqueUserIds[0] // Return the first user ID
          }
        } catch (err) {
          console.log(`❌ Error checking ${table}:`, err.message)
        }
      }
    } else {
      console.log('✅ Found users in auth.users:')
      users.users.forEach(user => {
        console.log(`   - ${user.id} (${user.email || 'No email'})`)
      })
      return users.users[0]?.id
    }

    console.log('❌ No user IDs found. You may need to:')
    console.log('   1. Create a user account in your app first')
    console.log('   2. Or temporarily disable RLS for testing')
    console.log('   3. Or use a service role key instead of anon key')

  } catch (error) {
    console.error('❌ Error getting user IDs:', error)
  }
}

getUserIds()

