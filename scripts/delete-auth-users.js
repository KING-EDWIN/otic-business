// Script to delete users from auth.users table using Supabase Admin API
// This requires the service role key (not the anon key)

import { createClient } from '@supabase/supabase-js'

// You need to get your service role key from Supabase Dashboard
// Go to: Settings → API → service_role key (not anon key)
const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// List of emails to delete (from your deleted_users table)
const emailsToDelete = [
  'damanifesta0@gmail.com',
  'elijahmukiibi18@gmail.com',
  'montagelegacy@gmail.com',
  'test@example.com',
  'shafiqkasajja@gmail.com',
  'nestakatende20@gmail.com',
  'nestachrist5@gmail.com',
  'dylankatamba@gmail.com',
  'byaruhangadaniel89@gmail.com',
  'mukirirehijack@gmail.com',
  'manifestnvtc@gmail.com',
  'rukundoblessed9@gmail.com',
  'malvy2931@gmail.com',
  'danielbyaruhanga89@gmail.com',
  'dylankats2@gmail.com',
  'kiwanapaul50@gmail.com',
  'nevilleakoragye@gmail.com',
  'qerozyko@fxzig.com',
  'mukisa.traders.test@gmail.com',
  'test.verification@gmail.com',
  'akoneville1@gmail.com',
  'dylan.individual.test@gmail.com',
  'katoemma23@gmail.com',
  'dylankatamba800@gmail.com',
  'kiviiriemma2@gmail.com',
  'dylan.individual.new@gmail.com',
  'kiviiriemma@gmail.com',
  'individual@gmail.com',
  'dylankatamba123@gmail.com',
  'damanifesa0@gmail.com',
  'demo@oticbusiness.com',
  'test@oticbusiness.com',
  'dylankatamba80@gmail.com',
  'kuchdeo@gmail.com',
  'dylanindividual@gmail.com',
  'dylankatambad@gmail.com',
  'kirabodresses@gmail.com'
]

async function deleteAuthUsers() {
  console.log('🚀 Starting auth user deletion...')
  
  let successCount = 0
  let errorCount = 0
  
  for (const email of emailsToDelete) {
    try {
      console.log(`🗑️ Deleting auth user: ${email}`)
      
      // First, get the user ID
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      })
      
      if (listError) {
        console.error(`❌ Error listing users:`, listError)
        continue
      }
      
      const user = users.users.find(u => u.email === email)
      
      if (!user) {
        console.log(`⚠️ User not found in auth.users: ${email}`)
        continue
      }
      
      // Delete the user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      
      if (deleteError) {
        console.error(`❌ Error deleting ${email}:`, deleteError)
        errorCount++
      } else {
        console.log(`✅ Successfully deleted auth user: ${email}`)
        successCount++
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error(`❌ Exception deleting ${email}:`, error)
      errorCount++
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`✅ Successfully deleted: ${successCount}`)
  console.log(`❌ Failed to delete: ${errorCount}`)
  console.log(`📝 Total processed: ${emailsToDelete.length}`)
}

// Run the deletion
deleteAuthUsers().catch(console.error)
