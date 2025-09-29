// Debug Signup Flow - Investigate the actual issue
// Let's trace exactly what happens during signup

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

// Create both clients
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function debugSignupFlow() {
  console.log('🔍 Debugging signup flow...')
  
  const testEmail = `test-signup-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testBusinessName = 'Test Business'
  
  try {
    // Step 1: Create auth user (simulating the frontend signup)
    console.log('\n📋 Step 1: Creating auth user...')
    const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'http://localhost:8080/verify-email'
      }
    })

    if (authError) {
      console.log('❌ Auth signup failed:', authError.message)
      return
    }

    if (!authData.user) {
      console.log('❌ No user returned from signup')
      return
    }

    console.log('✅ Auth user created:', {
      id: authData.user.id,
      email: authData.user.email,
      created_at: authData.user.created_at
    })

    // Step 2: Check if user exists in auth.users via admin API
    console.log('\n📋 Step 2: Checking if user exists in auth.users...')
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authUsersError) {
      console.log('❌ Cannot list auth users:', authUsersError.message)
    } else {
      const foundUser = authUsers.users.find(u => u.id === authData.user.id)
      if (foundUser) {
        console.log('✅ User found in auth.users:', {
          id: foundUser.id,
          email: foundUser.email,
          created_at: foundUser.created_at
        })
      } else {
        console.log('❌ User NOT found in auth.users!')
        console.log('Available users:', authUsers.users.map(u => ({ id: u.id, email: u.email })))
      }
    }

    // Step 3: Wait and check session
    console.log('\n📋 Step 3: Checking session...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const { data: { session }, error: sessionError } = await supabaseAnon.auth.getSession()
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message)
    } else if (session) {
      console.log('✅ Session exists:', {
        user_id: session.user.id,
        expires_at: session.expires_at
      })
    } else {
      console.log('❌ No session found')
    }

    // Step 4: Try to create profile (this should fail)
    console.log('\n📋 Step 4: Attempting to create profile...')
    const { data: profileData, error: profileError } = await supabaseAnon
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: testEmail,
        full_name: testBusinessName,
        business_name: testBusinessName,
        tier: 'free_trial',
        user_type: 'business',
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (profileError) {
      console.log('❌ Profile creation failed:', profileError.message)
      console.log('Error code:', profileError.code)
      console.log('Error details:', profileError.details)
    } else {
      console.log('✅ Profile created successfully:', profileData)
    }

    // Step 5: Try with service role key (this should work)
    console.log('\n📋 Step 5: Testing with service role key...')
    const { data: serviceProfileData, error: serviceProfileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: testEmail,
        full_name: testBusinessName,
        business_name: testBusinessName,
        tier: 'free_trial',
        user_type: 'business',
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (serviceProfileError) {
      console.log('❌ Service role profile creation failed:', serviceProfileError.message)
    } else {
      console.log('✅ Service role profile creation succeeded:', serviceProfileData)
      
      // Clean up
      await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', authData.user.id)
      console.log('🧹 Cleaned up test profile')
    }

    // Step 6: Check the actual constraint
    console.log('\n📋 Step 6: Checking constraint details...')
    const { data: constraintInfo, error: constraintError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_schema AS foreign_schema,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
          FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = 'user_profiles'
            AND tc.table_schema = 'public'
        `
      })
    
    if (constraintError) {
      console.log('❌ Cannot get constraint info:', constraintError.message)
    } else {
      console.log('✅ Constraint info:', constraintInfo)
    }

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Run the debug
debugSignupFlow()
