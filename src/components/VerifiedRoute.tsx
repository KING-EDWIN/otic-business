import React from 'react'
import { Navigate } from 'react-router-dom'
import { useVerification } from '@/contexts/VerificationContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface VerifiedRouteProps {
  children: React.ReactNode
  fallbackPath?: string
}

const VerifiedRoute: React.FC<VerifiedRouteProps> = ({ 
  children, 
  fallbackPath = '/dashboard' 
}) => {
  const { isEmailVerified, isLoading, resendVerificationEmail } = useVerification()

  // Show loading while checking verification status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040458]"></div>
      </div>
    )
  }

  // If email is verified, render the protected content
  if (isEmailVerified) {
    return <>{children}</>
  }

  // If not verified, show verification required page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
            <Mail className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Email Verification Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              To access this page, please verify your email address first.
            </p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2 text-orange-800">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Security Feature</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                This protects your account and ensures you receive important notifications.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={async () => {
                  const result = await resendVerificationEmail()
                  if (result.success) {
                    toast.success('Verification email sent! Check your inbox.')
                  } else {
                    toast.error(result.error || 'Failed to send verification email')
                  }
                }}
                className="w-full bg-[#040458] hover:bg-[#030347]"
              >
                <Mail className="h-4 w-4 mr-2" />
                Resend Verification Email
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = fallbackPath}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <AlertTriangle className="h-3 w-3" />
              <span>Check your spam folder if you don't see the email</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifiedRoute
