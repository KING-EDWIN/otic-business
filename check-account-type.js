// Check account type for dylankats2@gmail.com
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkAccountType() {
  console.log('🔍 Checking account type for dylankats2@gmail.com...')
  
  try {
    // Check user_profiles table
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', 'dylankats2@gmail.com')
    
    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message)
      return
    }
    
    console.log('📋 User profiles found:', profiles)
    
    if (profiles && profiles.length > 0) {
      const profile = profiles[0]
      console.log('✅ Profile details:', {
        id: profile.id,
        email: profile.email,
        user_type: profile.user_type,
        business_name: profile.business_name,
        full_name: profile.full_name,
        created_at: profile.created_at
      })
      
      // Check if there are multiple profiles for this email
      if (profiles.length > 1) {
        console.log('⚠️ Multiple profiles found for this email!')
        profiles.forEach((p, index) => {
          console.log(`Profile ${index + 1}:`, {
            id: p.id,
            user_type: p.user_type,
            business_name: p.business_name,
            created_at: p.created_at
          })
        })
      }
    } else {
      console.log('❌ No profiles found for dylankats2@gmail.com')
    }
    
    // Also check auth.users table
    console.log('\n📋 Checking auth.users table...')
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authUsersError) {
      console.log('❌ Error fetching auth users:', authUsersError.message)
    } else {
      const authUser = authUsers.users.find(u => u.email === 'dylankats2@gmail.com')
      if (authUser) {
        console.log('✅ Auth user found:', {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          email_confirmed_at: authUser.email_confirmed_at
        })
      } else {
        console.log('❌ No auth user found for dylankats2@gmail.com')
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

// Run the check
checkAccountType()
