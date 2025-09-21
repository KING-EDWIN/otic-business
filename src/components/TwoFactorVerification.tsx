import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail, Shield, Clock } from 'lucide-react'
import { TwoFactorAuthService } from '@/services/twoFactorAuthService'
import { toast } from 'sonner'

interface TwoFactorVerificationProps {
  email: string
  onVerificationSuccess: (user: any) => void
  onBack: () => void
  onResend?: () => void
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  email,
  onVerificationSuccess,
  onBack,
  onResend
}) => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter a 6-digit verification code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await TwoFactorAuthService.verifyOTP(email, code)
      
      if (result.success) {
        toast.success('Verification successful!')
        onVerificationSuccess(result.user)
      } else {
        setError(result.error || 'Verification failed')
        toast.error(result.error || 'Verification failed')
      }
    } catch (error) {
      console.error('2FA verification error:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setError('')

    try {
      const result = await TwoFactorAuthService.sendOTP(email)
      
      if (result.success) {
        toast.success('New verification code sent!')
        setTimeLeft(600) // Reset timer
        setCanResend(false)
        setCode('') // Clear current code
      } else {
        setError(result.error || 'Failed to resend code')
        toast.error(result.error || 'Failed to resend code')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError('Failed to resend verification code')
      toast.error('Failed to resend verification code')
    } finally {
      setResendLoading(false)
    }
  }

  const handleCodeChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6)
    setCode(digitsOnly)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a] flex items-center justify-center p-4">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-white hover:text-[#faa51a] hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-12 w-12"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#040458]">Otic</span>
                <span className="text-sm text-[#faa51a] -mt-1">Business</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#040458] flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Email Display */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{email}</span>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Code expires in: {formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#faa51a] hover:bg-[#040458] text-white font-semibold" 
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>

            {/* Resend Code */}
            <div className="text-center">
              {canResend ? (
                <Button
                  variant="link"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  className="text-[#faa51a] hover:text-[#040458]"
                >
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </Button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend code available in {formatTime(timeLeft)}
                </p>
              )}
            </div>

            {/* Help Text */}
            <div className="text-center text-xs text-gray-500">
              <p>Check your email inbox and spam folder</p>
              <p>Code is valid for 10 minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
