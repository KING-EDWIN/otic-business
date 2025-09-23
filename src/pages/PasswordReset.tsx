import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Lock, RefreshCw, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const PasswordReset: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [resetStatus, setResetStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'form'>('loading')
  const [isResetting, setIsResetting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const email = searchParams.get('email')

  useEffect(() => {
    if (email) {
      setUserEmail(email)
    }
    
    if (token && type === 'recovery') {
      setResetStatus('form')
    } else if (!token) {
      setResetStatus('error')
    }
  }, [token, type, email])

  const resetPassword = async () => {
    if (!token || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setIsResetting(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      })

      if (error) {
        console.error('Token verification error:', error)
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setResetStatus('expired')
        } else {
          setResetStatus('error')
        }
        toast.error('Password reset failed: ' + error.message)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        setResetStatus('error')
        toast.error('Password update failed: ' + updateError.message)
      } else {
        setResetStatus('success')
        toast.success('Password reset successfully!')
        
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          navigate('/signin')
        }, 2000)
      }
    } catch (error: any) {
      console.error('Password reset error:', error)
      setResetStatus('error')
      toast.error('Password reset failed: ' + error.message)
    } finally {
      setIsResetting(false)
    }
  }

  const resendResetEmail = async () => {
    if (!userEmail) {
      toast.error('Email address not found')
      return
    }

    setIsResending(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        console.error('Resend error:', error)
        toast.error('Failed to resend reset email: ' + error.message)
      } else {
        toast.success('Password reset email sent! Please check your inbox.')
      }
    } catch (error: any) {
      console.error('Resend error:', error)
      toast.error('Failed to resend reset email: ' + error.message)
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (resetStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return <Lock className="h-16 w-16 text-blue-500" />
    }
  }

  const getStatusTitle = () => {
    switch (resetStatus) {
      case 'success':
        return 'Password Reset Successfully!'
      case 'expired':
        return 'Reset Link Expired'
      case 'error':
        return 'Reset Failed'
      case 'form':
        return 'Reset Your Password'
      default:
        return 'Processing...'
    }
  }

  const getStatusDescription = () => {
    switch (resetStatus) {
      case 'success':
        return 'Your password has been reset successfully. You will be redirected to sign in shortly.'
      case 'expired':
        return 'This reset link has expired. Please request a new password reset email.'
      case 'error':
        return 'There was an error resetting your password. Please try again or request a new reset email.'
      case 'form':
        return 'Enter your new password below to complete the reset process.'
      default:
        return 'Please wait while we process your request...'
    }
  }

  const getStatusBadge = () => {
    switch (resetStatus) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'form':
        return <Badge className="bg-blue-100 text-blue-800">Ready</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Processing</Badge>
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

          {resetStatus === 'form' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={resetPassword}
                disabled={isResetting}
                className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </div>
          )}

          {resetStatus === 'success' && (
            <div className="text-center">
              <p className="text-sm text-green-600 mb-4">
                Redirecting to sign in...
              </p>
              <Button
                onClick={() => navigate('/signin')}
                className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
              >
                Go to Sign In
              </Button>
            </div>
          )}

          {(resetStatus === 'error' || resetStatus === 'expired') && (
            <div className="space-y-3">
              {userEmail && (
                <Button
                  onClick={resendResetEmail}
                  disabled={isResending}
                  className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Reset Email'
                  )}
                </Button>
              )}

              <Button
                onClick={() => navigate('/signin')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PasswordReset
