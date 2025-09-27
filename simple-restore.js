#!/usr/bin/env node

// Simple restoration by marking as recovered
const SUPABASE_URL = 'https://jvgiyscchxxekcbdicco.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

async function simpleRestore() {
  try {
    console.log('🔄 Simple restoration of dylankats2@gmail.com...')
    
    // Just mark the deleted account as recovered
    const response = await fetch(`${SUPABASE_URL}/rest/v1/deleted_users?id=eq.7e755e4c-7796-4cd9-9410-43bc732cbb9c`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_recovered: true,
        recovered_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })
    
    if (response.ok) {
      console.log('✅ Account marked as recovered')
      console.log('📧 Email: dylankats2@gmail.com')
      console.log('🔑 Password: Qwerty@21#')
      console.log('')
      console.log('🎯 Next steps:')
      console.log('1. The account is now marked as recovered')
      console.log('2. User can sign up again with the same email')
      console.log('3. Or we can create a new auth user manually')
    } else {
      const error = await response.text()
      console.log('❌ Failed:', error)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

simpleRestore()
