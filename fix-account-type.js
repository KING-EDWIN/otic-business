// Fix account type for dylankats2@gmail.com
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function fixAccountType() {
  console.log('🔧 Fixing account type for dylankats2@gmail.com...')
  
  try {
    // Update the user profile
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        user_type: 'individual',
        business_name: null,
        full_name: 'Individual User',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'dylankats2@gmail.com')
      .select()
    
    if (updateError) {
      console.log('❌ Error updating profile:', updateError.message)
      return
    }
    
    console.log('✅ Profile updated successfully:', updateData)
    
    // Verify the change
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', 'dylankats2@gmail.com')
      .single()
    
    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError.message)
    } else {
      console.log('✅ Verification successful:', {
        id: verifyData.id,
        email: verifyData.email,
        user_type: verifyData.user_type,
        business_name: verifyData.business_name,
        full_name: verifyData.full_name,
        updated_at: verifyData.updated_at
      })
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error)
  }
}

// Run the fix
fixAccountType()
