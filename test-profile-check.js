// Test Profile Check Logic
// Let's see exactly what happens with the profile existence check

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testProfileCheck() {
  console.log('🔍 Testing profile check logic...')
  
  // Use the same user ID from the previous test
  const testUserId = '1c10a175-6a3e-4aab-8d73-7119fe294892'
  
  try {
    // Step 1: Check if profile exists (this is what AuthContext does)
    console.log('\n📋 Step 1: Checking if profile exists...')
    const { data: existingProfile, error: checkError } = await supabaseAnon
      .from('user_profiles')
      .select('id')
      .eq('id', testUserId)
      .single()

    console.log('Check result:', { existingProfile, checkError })
    
    if (checkError) {
      console.log('❌ Check error:', checkError.message)
      console.log('Error code:', checkError.code)
      
      if (checkError.code === 'PGRST116') {
        console.log('✅ Profile does NOT exist (PGRST116 = no rows returned)')
      } else {
        console.log('❌ Unexpected check error')
      }
    } else if (existingProfile) {
      console.log('✅ Profile EXISTS:', existingProfile)
    }

    // Step 2: Try to create profile (this is what happens after the check)
    console.log('\n📋 Step 2: Attempting to create profile...')
    const { data: profileData, error: profileError } = await supabaseAnon
      .from('user_profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User',
        business_name: 'Test Business',
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

    // Step 3: Check again after creation attempt
    console.log('\n📋 Step 3: Checking profile existence again...')
    const { data: existingProfile2, error: checkError2 } = await supabaseAnon
      .from('user_profiles')
      .select('id, email, created_at')
      .eq('id', testUserId)
      .single()

    if (checkError2) {
      console.log('❌ Second check error:', checkError2.message)
    } else {
      console.log('✅ Profile now exists:', existingProfile2)
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testProfileCheck()
