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

async function comprehensiveUserDeletion() {
  console.log('🚀 Starting comprehensive user deletion...')
  
  try {
    // Step 1: Get all users from auth.users
    console.log('📋 Fetching all auth users...')
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }
    
    console.log(`📊 Found ${authUsers.users.length} users in auth.users`)
    
    // Step 2: Get all user profiles
    console.log('📋 Fetching all user profiles...')
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
    
    if (profileError) {
      console.error('❌ Error fetching user profiles:', profileError)
      return
    }
    
    console.log(`📊 Found ${profiles.length} users in user_profiles`)
    
    // Step 3: Delete from user_profiles first (this will cascade to most related tables)
    console.log('🗑️ Deleting from user_profiles...')
    let deletedProfiles = 0
    let failedProfiles = 0
    
    for (const profile of profiles) {
      try {
        // First, set individual_profession_id to NULL to avoid foreign key constraint
        await supabaseAdmin
          .from('user_profiles')
          .update({ individual_profession_id: null })
          .eq('id', profile.id)
        
        // Then delete the profile
        const { error } = await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('id', profile.id)
        
        if (error) {
          console.log(`❌ Failed to delete profile ${profile.email}:`, error.message)
          failedProfiles++
        } else {
          console.log(`✅ Deleted profile: ${profile.email}`)
          deletedProfiles++
        }
      } catch (error) {
        console.log(`❌ Exception deleting profile ${profile.email}:`, error.message)
        failedProfiles++
      }
    }
    
    console.log(`📊 Profile deletion summary: ${deletedProfiles} deleted, ${failedProfiles} failed`)
    
    // Step 4: Now delete from auth.users
    console.log('🗑️ Deleting from auth.users...')
    let deletedAuth = 0
    let failedAuth = 0
    
    for (const user of authUsers.users) {
      try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        
        if (error) {
          console.log(`❌ Failed to delete auth user ${user.email}:`, error.message)
          failedAuth++
        } else {
          console.log(`✅ Deleted auth user: ${user.email}`)
          deletedAuth++
        }
      } catch (error) {
        console.log(`❌ Exception deleting auth user ${user.email}:`, error.message)
        failedAuth++
      }
    }
    
    console.log(`📊 Auth deletion summary: ${deletedAuth} deleted, ${failedAuth} failed`)
    
    // Step 5: Clean up any remaining data
    console.log('🧹 Cleaning up remaining data...')
    
    // Delete from deleted_users table
    const { error: deletedUsersError } = await supabaseAdmin
      .from('deleted_users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (deletedUsersError) {
      console.log('❌ Error cleaning deleted_users:', deletedUsersError.message)
    } else {
      console.log('✅ Cleaned deleted_users table')
    }
    
    // Delete from businesses table (orphaned businesses)
    const { error: businessesError } = await supabaseAdmin
      .from('businesses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (businessesError) {
      console.log('❌ Error cleaning businesses:', businessesError.message)
    } else {
      console.log('✅ Cleaned businesses table')
    }
    
    console.log('🎉 Comprehensive user deletion completed!')
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

// Run the deletion
comprehensiveUserDeletion()
