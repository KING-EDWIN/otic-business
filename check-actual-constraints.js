// Check Actual Database Constraints
// Using Supabase Service Role Key to see the real constraint structure

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkActualConstraints() {
  console.log('🔍 Checking actual database constraints...')
  
  try {
    // 1. Check if we can access auth schema directly
    console.log('\n📋 1. Testing direct auth schema access:')
    const { data: authTest, error: authTestError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email')
      .limit(1)
    
    if (authTestError) {
      console.log('❌ Cannot access auth.users directly:', authTestError.message)
    } else {
      console.log('✅ Can access auth.users directly:', authTest)
    }

    // 2. Try to get table information using SQL
    console.log('\n📋 2. Getting table information via SQL:')
    const { data: tableInfo, error: tableInfoError } = await supabaseAdmin
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
    
    if (tableInfoError) {
      console.log('❌ Error getting constraint info via SQL:', tableInfoError.message)
    } else {
      console.log('✅ Foreign key constraints on user_profiles:', tableInfo)
    }

    // 3. Check if there's a trigger or function handling the constraint
    console.log('\n📋 3. Checking for triggers on user_profiles:')
    const { data: triggers, error: triggersError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            trigger_name,
            event_manipulation,
            action_timing,
            action_statement
          FROM information_schema.triggers 
          WHERE event_object_table = 'user_profiles'
        `
      })
    
    if (triggersError) {
      console.log('❌ Error getting triggers:', triggersError.message)
    } else {
      console.log('✅ Triggers on user_profiles:', triggers)
    }

    // 4. Test creating a profile with a known auth user ID
    console.log('\n📋 4. Testing profile creation with existing auth user:')
    
    // First, let's see if we can get auth users via a different method
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authUsersError) {
      console.log('❌ Error getting auth users via admin API:', authUsersError.message)
    } else {
      console.log('✅ Found auth users via admin API:', authUsers.users.length, 'users')
      
      if (authUsers.users.length > 0) {
        const testUserId = authUsers.users[0].id
        console.log(`Testing profile creation for user: ${testUserId}`)
        
        // Try to create a test profile
        const { data: testProfile, error: testProfileError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: testUserId,
            email: 'test@example.com',
            user_type: 'individual',
            full_name: 'Test User'
          })
          .select()
        
        if (testProfileError) {
          console.log('❌ Error creating test profile:', testProfileError.message)
          console.log('Error code:', testProfileError.code)
          console.log('Error details:', testProfileError.details)
        } else {
          console.log('✅ Successfully created test profile:', testProfile)
          
          // Clean up the test profile
          await supabaseAdmin
            .from('user_profiles')
            .delete()
            .eq('id', testUserId)
          console.log('🧹 Cleaned up test profile')
        }
      }
    }

  } catch (error) {
    console.error('❌ Investigation failed:', error)
  }
}

// Run the investigation
checkActualConstraints()
