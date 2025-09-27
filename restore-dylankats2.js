#!/usr/bin/env node

// Simple script to restore dylankats2@gmail.com account
const SUPABASE_URL = 'https://jvgiyscchxxekcbdicco.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

async function restoreAccount() {
  try {
    console.log('🔄 Restoring dylankats2@gmail.com account...')
    
    // Step 1: Check deleted account
    const deletedResponse = await fetch(`${SUPABASE_URL}/rest/v1/deleted_users?email=eq.dylankats2@gmail.com`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    
    const deletedAccounts = await deletedResponse.json()
    console.log('📋 Deleted account found:', deletedAccounts[0]?.email)
    
    if (!deletedAccounts[0]) {
      console.log('❌ No deleted account found')
      return
    }
    
    const deletedAccount = deletedAccounts[0]
    
    // Step 2: Create new user profile
    const newUserId = crypto.randomUUID()
    console.log('🆕 New user ID:', newUserId)
    
    const profileData = {
      id: newUserId,
      email: deletedAccount.email,
      full_name: deletedAccount.full_name,
      business_name: deletedAccount.business_name,
      user_type: deletedAccount.user_type,
      tier: deletedAccount.tier,
      phone: deletedAccount.phone,
      address: deletedAccount.address,
      email_verified: true,
      verification_timestamp: deletedAccount.deleted_at,
      verified_by: '00000000-0000-0000-0000-000000000000',
      features_enabled: {},
      two_factor_enabled: false,
      individual_profession_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })
    
    if (!profileResponse.ok) {
      const error = await profileResponse.text()
      console.log('❌ Profile creation failed:', error)
      return
    }
    
    console.log('✅ User profile created successfully')
    
    // Step 3: Restore businesses
    if (deletedAccount.business_data && deletedAccount.business_data.length > 0) {
      for (const business of deletedAccount.business_data) {
        const businessData = {
          id: business.id,
          name: business.name,
          description: 'Restored business account',
          business_type: business.business_type,
          industry: 'general',
          website: null,
          phone: null,
          email: deletedAccount.email,
          address: null,
          city: business.city,
          state: null,
          country: business.country,
          postal_code: null,
          tax_id: null,
          registration_number: null,
          currency: business.currency,
          timezone: business.timezone,
          logo_url: null,
          status: 'active',
          settings: {},
          created_by: newUserId,
          created_at: business.created_at,
          updated_at: new Date().toISOString()
        }
        
        const businessResponse = await fetch(`${SUPABASE_URL}/rest/v1/businesses`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(businessData)
        })
        
        if (businessResponse.ok) {
          console.log('✅ Business restored:', business.name)
          
          // Create business membership
          const membershipData = {
            user_id: newUserId,
            business_id: business.id,
            role: 'owner',
            status: 'active',
            joined_at: business.created_at,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          const membershipResponse = await fetch(`${SUPABASE_URL}/rest/v1/business_memberships`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(membershipData)
          })
          
          if (membershipResponse.ok) {
            console.log('✅ Business membership created')
          }
        }
      }
    }
    
    // Step 4: Mark as recovered
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/deleted_users?id=eq.${deletedAccount.id}`, {
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
    
    if (updateResponse.ok) {
      console.log('✅ Account marked as recovered')
    }
    
    console.log('🎉 Account restoration completed!')
    console.log('📧 Email:', deletedAccount.email)
    console.log('🆔 New User ID:', newUserId)
    console.log('🔑 Password: Qwerty@21#')
    
  } catch (error) {
    console.error('❌ Restoration failed:', error)
  }
}

restoreAccount()
