import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')

  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const email = searchParams.get('email')

  useEffect(() => {
    if (email) {
      setUserEmail(email)
    }
    
    if (token && type === 'signup') {
      verifyEmail()
    } else if (!token) {
      setVerificationStatus('error')
    }
  }, [token, type, email])

  const verifyEmail = async () => {
    if (!token) return

    setIsVerifying(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      })

      if (error) {
        console.error('Email verification error:', error)
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setVerificationStatus('expired')
        } else {
          setVerificationStatus('error')
        }
        toast.error('Email verification failed: ' + error.message)
      } else {
        setVerificationStatus('success')
        toast.success('Email verified successfully!')
        
        // Redirect to appropriate dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      }
    } catch (error: any) {
      console.error('Email verification error:', error)
      setVerificationStatus('error')
      toast.error('Email verification failed: ' + error.message)
    } finally {
      setIsVerifying(false)
    }
  }

  const resendVerificationEmail = async () => {
    if (!userEmail) {
      toast.error('Email address not found')
      return
    }

    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail
      })

      if (error) {
        console.error('Resend error:', error)
        toast.error('Failed to resend verification email: ' + error.message)
      } else {
        toast.success('Verification email sent! Please check your inbox.')
      }
    } catch (error: any) {
      console.error('Resend error:', error)
      toast.error('Failed to resend verification email: ' + error.message)
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return <Mail className="h-16 w-16 text-blue-500" />
    }
  }

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email Verified Successfully!'
      case 'expired':
        return 'Verification Link Expired'
      case 'error':
        return 'Verification Failed'
      default:
        return 'Verifying Your Email...'
    }
  }

  const getStatusDescription = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Your email has been verified successfully. You will be redirected to your dashboard shortly.'
      case 'expired':
        return 'This verification link has expired. Please request a new verification email.'
      case 'error':
        return 'There was an error verifying your email. Please try again or request a new verification email.'
      default:
        return 'Please wait while we verify your email address...'
    }
  }

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800">Verifying</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-bold text-[#040458]">
            {getStatusTitle()}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {getStatusDescription()}
          </CardDescription>
          <div className="flex justify-center mt-4">
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {userEmail && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Email: <span className="font-medium">{userEmail}</span>
              </p>
            </div>
          )}

          {verificationStatus === 'loading' && (
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-600">Verifying...</span>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center">
              <p className="text-sm text-green-600 mb-4">
                Redirecting to dashboard...
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {(verificationStatus === 'error' || verificationStatus === 'expired') && (
            <div className="space-y-3">
              <Button
                onClick={verifyEmail}
                disabled={isVerifying}
                className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>

              {userEmail && (
                <Button
                  onClick={resendVerificationEmail}
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              )}

              <Button
                onClick={() => navigate('/signin')}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          )}

          {verificationStatus === 'loading' && token && (
            <Button
              onClick={verifyEmail}
              disabled={isVerifying}
              className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailVerification
