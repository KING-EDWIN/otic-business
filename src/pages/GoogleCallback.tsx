import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleAuthService } from '@/services/googleAuthService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, UserPlus, LogIn } from 'lucide-react'
import { toast } from 'sonner'

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'new-user'>('loading')
  const [message, setMessage] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    handleGoogleCallback()
  }, [])

  const handleGoogleCallback = async () => {
    try {
      setStatus('loading')
      setMessage('Processing your Google account...')

      const result = await GoogleAuthService.handleGoogleCallback()

      if (!result.success) {
        setStatus('error')
        setMessage(result.error || 'Authentication failed')
        GoogleAuthService.showAuthResultToast(result)
        return
      }

      if (result.isNewUser) {
        setStatus('new-user')
        setIsNewUser(true)
        setUserInfo(result.user)
        setMessage(`Welcome! We've created your account with ${result.user?.email}`)
        GoogleAuthService.showAuthResultToast(result)
      } else {
        setStatus('success')
        setIsNewUser(false)
        setUserInfo(result.user)
        setMessage(`Welcome back! You're now signed in as ${result.user?.email}`)
        GoogleAuthService.showAuthResultToast(result)
      }

      // Redirect after a short delay
      setTimeout(() => {
        if (result.isNewUser) {
          // New users need to complete their profile
          navigate('/complete-profile', { 
            replace: true,
            state: { 
              userType: result.profile?.user_type || 'business',
              isGoogleSignup: true,
              googleUser: result.user
            }
          })
        } else {
          // Existing users go directly to dashboard
          const dashboardRoute = result.profile?.user_type === 'individual' ? '/dashboard-main' : '/dashboard'
          navigate(dashboardRoute, { replace: true })
        }
      }, 2000)

    } catch (error) {
      console.error('Callback handling error:', error)
      setStatus('error')
      setMessage('An unexpected error occurred. Please try signing in again.')
      toast.error('Authentication failed. Please try again.')
    }
  }

  const handleRetry = () => {
    navigate('/signin', { replace: true })
  }

  const handleContinue = () => {
    const dashboardRoute = userInfo?.user_metadata?.user_type === 'individual' ? '/dashboard-main' : '/dashboard'
    navigate(dashboardRoute, { replace: true })
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      case 'success':
        return <LogIn className="h-8 w-8 text-green-500" />
      case 'new-user':
        return <UserPlus className="h-8 w-8 text-blue-500" />
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />
      default:
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'new-user':
        return 'border-blue-200 bg-blue-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl font-semibold">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Sign In Successful'}
            {status === 'new-user' && 'Account Created'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription className="text-sm">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Please wait while we verify your Google account...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-green-700">
                  You'll be redirected to your dashboard shortly.
                </p>
              </div>
              <Button 
                onClick={handleContinue}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                Continue to Dashboard
              </Button>
            </div>
          )}

          {status === 'new-user' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-blue-700">
                  Your account has been created successfully! You'll be redirected to complete your profile setup.
                </p>
              </div>
              <Button 
                onClick={handleContinue}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Complete Setup
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-red-700">
                  Something went wrong during authentication. Please try again.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Go Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default GoogleCallback
