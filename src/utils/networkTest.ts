// Network connectivity test utility
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://jvgiyscchxxekcbdicco.supabase.co/auth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test'
      })
    })
    
    // Even if auth fails, if we get a response, the connection is working
    return response.status === 200 || response.status === 400 || response.status === 401
  } catch (error) {
    console.error('Network test failed:', error)
    return false
  }
}

export const clearAuthStorage = () => {
  try {
    // Clear all auth-related storage
    localStorage.removeItem('sb-jvgiyscchxxekcbdicco-auth-token')
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('supabase.auth.session')
    
    // Clear session storage
    sessionStorage.removeItem('sb-jvgiyscchxxekcbdicco-auth-token')
    sessionStorage.removeItem('supabase.auth.token')
    sessionStorage.removeItem('supabase.auth.session')
    
    console.log('✅ Auth storage cleared')
  } catch (error) {
    console.error('Error clearing auth storage:', error)
  }
}
