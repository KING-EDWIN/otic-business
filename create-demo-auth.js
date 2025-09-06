// Script to create demo user in Supabase Auth
// Run this in the browser console on your Supabase project

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createDemoUser() {
  try {
    // Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email: 'demo@oticbusiness.com',
      password: 'demo123456',
    })

    if (error) {
      console.error('Error creating demo user:', error)
      return
    }

    console.log('Demo user created successfully:', data)
    
    // The user profile and subscription will be created by the signup process
    // since we modified the AuthContext to handle this automatically
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the function
createDemoUser()


