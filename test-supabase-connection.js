// Test Supabase Connection
// Run this in your browser console to test the connection

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

const supabase = createClient(supabaseUrl, supabaseKey)

// Test 1: Check if we can connect
console.log('Testing Supabase connection...')

// Test 2: Check authentication
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    console.error('Auth error:', error)
  } else {
    console.log('Current session:', session)
    if (session) {
      console.log('User ID:', session.user.id)
    }
  }
})

// Test 3: Try to query user_profiles (this will fail if RLS is blocking)
supabase
  .from('user_profiles')
  .select('*')
  .then(({ data, error }) => {
    if (error) {
      console.error('user_profiles query error:', error)
    } else {
      console.log('user_profiles data:', data)
    }
  })

// Test 4: Try to query products
supabase
  .from('products')
  .select('*')
  .then(({ data, error }) => {
    if (error) {
      console.error('products query error:', error)
    } else {
      console.log('products data:', data)
    }
  })

