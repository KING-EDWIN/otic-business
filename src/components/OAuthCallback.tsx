import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { EnhancedEmailVerificationService } from '@/services/enhancedEmailVerificationWithDB'
import { toast } from 'sonner'

const OAuthCallback = () => {
  const { user, loading, getDashboardRoute } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isHandlingVerification, setIsHandlingVerification] = useState(false)

  useEffect(() => {
    // Clean up URL parameters
    if (window.location.hash.includes('access_token')) {
      // Remove the hash from URL to clean it up
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!user || loading || isHandlingVerification) return

      setIsHandlingVerification(true)
      
      try {
        console.log('OAuth callback - user authenticated:', user.email)
        
        // Check if this is a Google OAuth user (they don't need email verification)
        const isGoogleUser = user.app_metadata?.provider === 'google'
        
        if (isGoogleUser) {
          console.log('Google OAuth user detected, skipping email verification')
          // Google users are already verified, go straight to dashboard
          const dashboardRoute = getDashboardRoute()
          console.log('Redirecting Google user to dashboard:', dashboardRoute)
          navigate(dashboardRoute)
          return
        }
        
        // For regular signup users, handle email verification
        console.log('Regular user detected, handling email verification')
        const result = await EnhancedEmailVerificationService.handleVerificationCallback()
        
        if (result.success) {
          console.log('Email verification successful')
          const dashboardRoute = getDashboardRoute()
          console.log('Redirecting to dashboard:', dashboardRoute)
          navigate(dashboardRoute)
        } else {
          console.error('Email verification failed:', result.error)
          toast.error(result.error || 'Email verification failed')
          // Still redirect to dashboard as user is authenticated
          const dashboardRoute = getDashboardRoute()
          navigate(dashboardRoute)
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error)
        // Still redirect to dashboard as user is authenticated
        const dashboardRoute = getDashboardRoute()
        navigate(dashboardRoute)
      } finally {
        setIsHandlingVerification(false)
      }
    }

    if (!loading && user) {
      handleOAuthCallback()
    } else if (!loading && !user) {
      // User is not authenticated, redirect to login type selection
      console.log('OAuth callback failed, redirecting to login type selection')
      navigate('/login-type')
    }
  }, [user, loading, navigate, getDashboardRoute, isHandlingVerification])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {isHandlingVerification ? 'Setting up your account...' : 'Completing sign in...'}
        </p>
      </div>
    </div>
  )
}

export default OAuthCallback

