#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function cleanupExpiredAccounts() {
  console.log('🧹 Starting 30-day cleanup process...')
  
  try {
    // Step 1: Get accounts that need manual deletion
    console.log('📋 Checking for expired accounts...')
    const { data: expiredAccounts, error: fetchError } = await supabaseAdmin
      .from('accounts_needing_manual_deletion')
      .select('*')
    
    if (fetchError) {
      console.error('❌ Error fetching expired accounts:', fetchError)
      return
    }
    
    if (expiredAccounts.length === 0) {
      console.log('✅ No expired accounts found. Cleanup complete!')
      return
    }
    
    console.log(`📊 Found ${expiredAccounts.length} expired accounts`)
    
    // Step 2: Clean up all data for expired accounts
    console.log('🗑️ Cleaning up expired account data...')
    const { data: cleanupResult, error: cleanupError } = await supabaseAdmin
      .rpc('mark_accounts_for_manual_deletion')
    
    if (cleanupError) {
      console.error('❌ Error during cleanup:', cleanupError)
      return
    }
    
    console.log(`✅ Cleaned up data for ${cleanupResult} accounts`)
    
    // Step 3: Show accounts that need manual auth.users deletion
    console.log('📋 Accounts that need manual deletion from auth.users:')
    expiredAccounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.email} (${account.full_name}) - Expired ${account.days_expired} days ago`)
    })
    
    // Step 4: Provide instructions for manual deletion
    console.log('\n📝 Manual deletion required:')
    console.log('1. Go to Supabase Dashboard → Authentication → Users')
    console.log('2. Search for each email listed above')
    console.log('3. Select and delete each user')
    console.log('4. Or use the Supabase Admin API with the service role key')
    
    // Step 5: Optional - Try to delete from auth.users programmatically
    console.log('\n🤖 Attempting programmatic deletion from auth.users...')
    let successCount = 0
    let failureCount = 0
    
    for (const account of expiredAccounts) {
      try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(account.user_id)
        
        if (error) {
          console.log(`❌ Failed to delete ${account.email}: ${error.message}`)
          failureCount++
        } else {
          console.log(`✅ Successfully deleted ${account.email}`)
          successCount++
        }
      } catch (error) {
        console.log(`❌ Exception deleting ${account.email}: ${error.message}`)
        failureCount++
      }
    }
    
    console.log(`\n📊 Programmatic deletion summary:`)
    console.log(`✅ Successfully deleted: ${successCount}`)
    console.log(`❌ Failed to delete: ${failureCount}`)
    
    if (failureCount > 0) {
      console.log('\n⚠️ Some accounts still need manual deletion through Supabase dashboard')
    }
    
    console.log('\n🎉 30-day cleanup process completed!')
    
  } catch (error) {
    console.error('💥 Fatal error during cleanup:', error)
  }
}

// Run the cleanup
cleanupExpiredAccounts()
