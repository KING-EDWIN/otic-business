import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProfessionalSignupService } from '@/services/professionalSignup'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mail, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Clock,
  RefreshCw,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

interface ProfessionalEmailVerificationPromptProps {
  onVerificationComplete?: () => void
  userType?: 'business' | 'individual'
}

const ProfessionalEmailVerificationPrompt = ({ 
  onVerificationComplete,
  userType = 'business'
}: ProfessionalEmailVerificationPromptProps) => {
  const { user, profile } = useAuth()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<{
    needsVerification: boolean
    isVerified: boolean
  }>({ needsVerification: false, isVerified: false })
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      checkVerificationStatus()
      startCountdown()
    }
  }, [user])

  const checkVerificationStatus = async () => {
    if (!user) return

    try {
      const status = await ProfessionalSignupService.checkVerificationStatus(user.id)
      setVerificationStatus(status)
      
      if (status.isVerified) {
        onVerificationComplete?.()
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
    }
  }

  const startCountdown = () => {
    if (!user) return

    // Calculate time remaining (24 hours from signup)
    const createdAt = new Date(profile?.created_at || user.created_at)
    const twentyFourHoursLater = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
    const now = new Date()
    
    const remaining = Math.max(0, twentyFourHoursLater.getTime() - now.getTime())
    setTimeRemaining(remaining)

    const interval = setInterval(() => {
      const now = new Date()
      const remaining = Math.max(0, twentyFourHoursLater.getTime() - now.getTime())
      setTimeRemaining(remaining)
      
      if (remaining === 0) {
        clearInterval(interval)
        // Account will be cleaned up automatically
        toast.error('Verification time expired. Please sign up again.')
      }
    }, 1000)

    return () => clearInterval(interval)
  }

  const handleResendVerification = async () => {
    if (!user || !profile) return

    setIsResending(true)
    try {
      const result = await ProfessionalSignupService.resendVerificationEmail(
        user.email!,
        profile.user_type as 'business' | 'individual'
      )

      if (result.success) {
        toast.success('Verification email sent! Check your inbox.')
        startCountdown() // Restart countdown
      } else {
        toast.error(result.error || 'Failed to send verification email')
      }
    } catch (error) {
      toast.error('Failed to send verification email')
    } finally {
      setIsResending(false)
    }
  }

  const handleCheckVerification = async () => {
    if (!user) return

    setIsVerifying(true)
    try {
      await checkVerificationStatus()
      
      if (verificationStatus.isVerified) {
        toast.success('Email verified successfully!')
        onVerificationComplete?.()
      } else {
        toast.info('Email not yet verified. Please check your inbox and click the verification link.')
      }
    } catch (error) {
      toast.error('Failed to check verification status')
    } finally {
      setIsVerifying(false)
    }
  }

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  if (!verificationStatus.needsVerification) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#faa51a] to-[#040458] rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            {userType === 'business' 
              ? 'Complete your business account setup'
              : 'Complete your professional account setup'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              We've sent a verification link to <strong>{user?.email}</strong>
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ol className="text-sm text-blue-800 space-y-1 text-left">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Click the verification link in the email</li>
                <li>3. You'll be redirected back to complete setup</li>
              </ol>
            </div>

            {timeRemaining !== null && timeRemaining > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-orange-800">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Time remaining: {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
                <p className="text-xs text-orange-700 mt-1">
                  Your account will be removed if not verified within 24 hours
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleCheckVerification}
                disabled={isVerifying}
                className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
              >
                {isVerifying ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Checking...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>I've Verified My Email</span>
                  </div>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Resend Verification Email</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> You must verify your email within 24 hours or your account will be automatically removed for security reasons.
            </AlertDescription>
          </Alert>

          <div className="text-center text-sm text-gray-600">
            <p>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="text-[#faa51a] hover:underline font-medium"
              >
                resend verification email
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfessionalEmailVerificationPrompt
