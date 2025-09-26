import React, { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Mail, X, CheckCircle } from 'lucide-react'
import { useVerification } from '@/contexts/VerificationContext'
import { toast } from 'sonner'

const VerificationBanner: React.FC = () => {
  const { isEmailVerified, resendVerificationEmail } = useVerification()
  const [isResending, setIsResending] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      const result = await resendVerificationEmail()
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

  // Don't show banner if email is verified or dismissed
  if (isEmailVerified || isDismissed) {
    return null
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <Mail className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-orange-800 font-medium">
            Please verify your email address to access all features
          </span>
          <span className="text-orange-600 text-sm">
            Check your inbox for a verification link
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            disabled={isResending}
            className="text-orange-600 border-orange-300 hover:bg-orange-100"
          >
            {isResending ? 'Sending...' : 'Resend Email'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-orange-600 hover:bg-orange-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default VerificationBanner
