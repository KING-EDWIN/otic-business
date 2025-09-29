// Check RLS Policies on user_profiles table
// The issue is likely RLS policies blocking profile creation with anon key

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

// Create both clients
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies and permissions...')
  
  try {
    // 1. Test profile creation with anon key (this should fail)
    console.log('\n📋 1. Testing profile creation with ANON key:')
    const { data: anonTest, error: anonError } = await supabaseAnon
      .from('user_profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'anon-test@example.com',
        user_type: 'individual',
        full_name: 'Anon Test'
      })
      .select()
    
    if (anonError) {
      console.log('❌ Anon key cannot create profile (expected):', anonError.message)
      console.log('Error code:', anonError.code)
      console.log('Error details:', anonError.details)
    } else {
      console.log('✅ Anon key can create profile (unexpected):', anonTest)
    }

    // 2. Test profile creation with service role key (this should work)
    console.log('\n📋 2. Testing profile creation with SERVICE ROLE key:')
    const { data: serviceTest, error: serviceError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'service-test@example.com',
        user_type: 'individual',
        full_name: 'Service Test'
      })
      .select()
    
    if (serviceError) {
      console.log('❌ Service role cannot create profile:', serviceError.message)
    } else {
      console.log('✅ Service role can create profile:', serviceTest)
      
      // Clean up
      await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000001')
      console.log('🧹 Cleaned up service test profile')
    }

    // 3. Check if RLS is enabled on user_profiles
    console.log('\n📋 3. Checking RLS status:')
    const { data: rlsStatus, error: rlsStatusError } = await supabaseAdmin
      .rpc('check_rls_enabled', { table_name: 'user_profiles' })
    
    if (rlsStatusError) {
      console.log('❌ Cannot check RLS status:', rlsStatusError.message)
    } else {
      console.log('✅ RLS status:', rlsStatus)
    }

    // 4. Try to get RLS policies using a different approach
    console.log('\n📋 4. Checking RLS policies:')
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'user_profiles')
    
    if (policiesError) {
      console.log('❌ Cannot get RLS policies:', policiesError.message)
    } else {
      console.log('✅ RLS policies:', policies)
    }

    // 5. Test with a real auth user ID (simulate signup flow)
    console.log('\n📋 5. Testing with real auth user (simulating signup):')
    
    // Get a real auth user
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authUsersError) {
      console.log('❌ Cannot get auth users:', authUsersError.message)
    } else if (authUsers.users.length > 0) {
      const realUserId = authUsers.users[0].id
      console.log(`Testing with real user ID: ${realUserId}`)
      
      // Try to create profile with anon key (this simulates the signup flow)
      const { data: realAnonTest, error: realAnonError } = await supabaseAnon
        .from('user_profiles')
        .insert({
          id: realUserId,
          email: 'real-anon-test@example.com',
          user_type: 'individual',
          full_name: 'Real Anon Test'
        })
        .select()
      
      if (realAnonError) {
        console.log('❌ Anon key cannot create profile for real user:', realAnonError.message)
        console.log('Error code:', realAnonError.code)
        console.log('Error details:', realAnonError.details)
        
        // This is likely the same error we're seeing in signup!
        if (realAnonError.code === '23503') {
          console.log('🎯 FOUND THE ISSUE: Foreign key constraint violation with anon key')
          console.log('This suggests RLS is blocking access to auth.users table')
        }
      } else {
        console.log('✅ Anon key can create profile for real user:', realAnonTest)
        
        // Clean up
        await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('id', realUserId)
        console.log('🧹 Cleaned up real anon test profile')
      }
    }

  } catch (error) {
    console.error('❌ Investigation failed:', error)
  }
}

// Run the investigation
checkRLSPolicies()
