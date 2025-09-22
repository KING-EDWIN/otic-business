import { supabase } from '@/lib/supabaseClient'

export const checkAuthStatus = async () => {
  try {
    console.log('Checking auth status...')
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session check:', { session: !!session, error: sessionError })
    
    // Check user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('User check:', { user: !!user, error: userError })
    
    // Check if session is valid
    if (session && user) {
      const isExpired = new Date(session.expires_at) < new Date()
      console.log('Session expired:', isExpired)
      
      if (isExpired) {
        console.log('Session is expired, signing out...')
        await supabase.auth.signOut()
        return { valid: false, reason: 'expired' }
      }
      
      return { valid: true, user, session }
    }
    
    return { valid: false, reason: 'no_session' }
  } catch (error) {
    console.error('Error checking auth status:', error)
    return { valid: false, reason: 'error', error }
  }
}

export const refreshSession = async () => {
  try {
    console.log('Refreshing session...')
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('Error refreshing session:', error)
      return { success: false, error }
    }
    
    console.log('Session refreshed successfully')
    return { success: true, data }
  } catch (error) {
    console.error('Error in refreshSession:', error)
    return { success: false, error }
  }
}

export const clearAuth = async () => {
  try {
    console.log('Clearing auth...')
    await supabase.auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
    console.log('Auth cleared successfully')
    return { success: true }
  } catch (error) {
    console.error('Error clearing auth:', error)
    return { success: false, error }
  }
}




