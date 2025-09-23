import { supabase } from '@/lib/supabaseClient'

export const clearProblematicSession = async () => {
  try {
    console.log('🧹 Clearing problematic session...')
    await supabase.auth.signOut()
    
    // Clear any local storage items
    localStorage.removeItem('sb-jvgiyscchxxekcbdicco-auth-token')
    localStorage.removeItem('otic_user')
    localStorage.removeItem('otic_profile')
    
    // Clear session storage
    sessionStorage.clear()
    
    console.log('✅ Session cleared successfully')
    return true
  } catch (error) {
    console.error('❌ Error clearing session:', error)
    return false
  }
}

export const checkForProblematicSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      // Check if profile exists
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()
      
      if (error || !profile) {
        console.log('🚨 Problematic session detected - user exists but no profile')
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('Error checking session:', error)
    return false
  }
}
