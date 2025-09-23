import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { EmailVerificationService } from '@/services/emailVerificationService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface EmailVerificationPromptProps {
  onVerificationComplete?: () => void
}

const EmailVerificationPrompt = ({ onVerificationComplete }: EmailVerificationPromptProps) => {
  const { user, profile } = useAuth()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<{
    needsVerification: boolean
    isVerified: boolean
  }>({ needsVerification: false, isVerified: false })

  useEffect(() => {
    if (user) {
      checkVerificationStatus()
    }
  }, [user])

  const checkVerificationStatus = async () => {
    if (!user) return

    const status = await EmailVerificationService.checkVerificationStatus(user.id)
    setVerificationStatus(status)
  }

  const handleResendVerification = async () => {
    if (!user || !profile) return

    setIsResending(true)
    try {
      const result = await EmailVerificationService.sendVerificationEmail(
        user.email!,
        profile.user_type as 'business' | 'individual'
      )

      if (result.success) {
        toast.success('Verification email sent! Check your inbox.')
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

  if (!verificationStatus.needsVerification) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <strong>{user?.email}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Please check your email and click the verification link to continue.</p>
            <p className="mt-2">If you don't see the email, check your spam folder.</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleCheckVerification}
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I've Verified My Email
                </>
              )}
            </Button>

            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Need help?</p>
                <p className="mt-1">
                  If you're having trouble receiving emails, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailVerificationPrompt
