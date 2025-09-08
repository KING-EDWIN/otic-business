import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const OAuthCallback = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Clean up URL parameters
    if (window.location.hash.includes('access_token')) {
      // Remove the hash from URL to clean it up
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        console.log('OAuth callback successful, redirecting to dashboard')
        navigate('/dashboard')
      } else {
        // User is not authenticated, redirect to signin
        console.log('OAuth callback failed, redirecting to signin')
        navigate('/signin')
      }
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}

export default OAuthCallback

