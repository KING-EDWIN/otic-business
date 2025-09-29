// Investigate Database Structure for Signup Issues
// Using Supabase Service Role Key to understand the actual database structure

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function investigateDatabaseStructure() {
  console.log('🔍 Investigating database structure...')
  
  try {
    // 1. Check auth.users table structure
    console.log('\n📋 1. Checking auth.users table structure:')
    const { data: authUsersStructure, error: authError } = await supabaseAdmin
      .from('auth.users')
      .select('*')
      .limit(1)
    
    if (authError) {
      console.log('❌ Error accessing auth.users:', authError.message)
    } else {
      console.log('✅ auth.users accessible, sample record:', authUsersStructure)
    }

    // 2. Check user_profiles table structure
    console.log('\n📋 2. Checking user_profiles table structure:')
    const { data: profilesStructure, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.log('❌ Error accessing user_profiles:', profilesError.message)
    } else {
      console.log('✅ user_profiles accessible, sample record:', profilesStructure)
    }

    // 3. Check foreign key constraints on user_profiles
    console.log('\n📋 3. Checking foreign key constraints:')
    const { data: constraints, error: constraintsError } = await supabaseAdmin
      .rpc('get_foreign_keys', { table_name: 'user_profiles' })
    
    if (constraintsError) {
      console.log('❌ Error getting constraints:', constraintsError.message)
      // Try alternative approach
      const { data: altConstraints, error: altError } = await supabaseAdmin
        .from('information_schema.table_constraints')
        .select('*')
        .eq('table_name', 'user_profiles')
        .eq('constraint_type', 'FOREIGN KEY')
      
      if (altError) {
        console.log('❌ Alternative constraint check failed:', altError.message)
      } else {
        console.log('✅ Foreign key constraints:', altConstraints)
      }
    } else {
      console.log('✅ Foreign key constraints:', constraints)
    }

    // 4. Check recent auth.users entries
    console.log('\n📋 4. Checking recent auth.users entries:')
    const { data: recentUsers, error: recentUsersError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (recentUsersError) {
      console.log('❌ Error getting recent users:', recentUsersError.message)
    } else {
      console.log('✅ Recent auth.users:', recentUsers)
    }

    // 5. Check recent user_profiles entries
    console.log('\n📋 5. Checking recent user_profiles entries:')
    const { data: recentProfiles, error: recentProfilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (recentProfilesError) {
      console.log('❌ Error getting recent profiles:', recentProfilesError.message)
    } else {
      console.log('✅ Recent user_profiles:', recentProfiles)
    }

    // 6. Test if we can create a profile for an existing auth user
    console.log('\n📋 6. Testing profile creation for existing auth user:')
    if (recentUsers && recentUsers.length > 0) {
      const testUserId = recentUsers[0].id
      console.log(`Testing with user ID: ${testUserId}`)
      
      const { data: testProfile, error: testError } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('id', testUserId)
        .single()
      
      if (testError && testError.code === 'PGRST116') {
        console.log('✅ No existing profile found for this user (expected)')
      } else if (testError) {
        console.log('❌ Error checking existing profile:', testError.message)
      } else {
        console.log('✅ Profile already exists for this user:', testProfile)
      }
    }

    // 7. Check if there are any RLS policies affecting user_profiles
    console.log('\n📋 7. Checking RLS policies:')
    const { data: rlsPolicies, error: rlsError } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'user_profiles')
    
    if (rlsError) {
      console.log('❌ Error getting RLS policies:', rlsError.message)
    } else {
      console.log('✅ RLS policies on user_profiles:', rlsPolicies)
    }

  } catch (error) {
    console.error('❌ Investigation failed:', error)
  }
}

// Run the investigation
investigateDatabaseStructure()
