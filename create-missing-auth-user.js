// Script to create missing auth user for dylankatamba80@gmail.com
// Run this in Node.js or browser console

const { createClient } = require('@supabase/supabase-js')

// You need the service role key for admin operations
const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE' // Replace with your service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createMissingAuthUser() {
  try {
    console.log('Creating missing auth user for dylankatamba80@gmail.com...')
    
    // Create the auth user using admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'dylankatamba80@gmail.com',
      password: '123qazx',
      email_confirm: true, // Mark as confirmed since admin verified it
      user_metadata: {
        business_name: 'Demo Business Store'
      }
    })

    if (error) {
      console.error('Error creating auth user:', error)
      return
    }

    console.log('Auth user created successfully:', data)
    
    // Now update the user_profiles table to match the auth user ID
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        id: data.user.id, // Use the auth user ID
        email_verified: true,
        verification_timestamp: new Date().toISOString(),
        verified_by: '00000000-0000-0000-0000-000000000000'
      })
      .eq('email', 'dylankatamba80@gmail.com')

    if (updateError) {
      console.error('Error updating user profile:', updateError)
    } else {
      console.log('User profile updated successfully')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the function
createMissingAuthUser()
