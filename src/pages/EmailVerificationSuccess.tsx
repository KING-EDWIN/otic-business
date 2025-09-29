import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Mail, ArrowLeft, Clock } from 'lucide-react'
import { toast } from 'sonner'

const EmailVerificationSuccess: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)
  const [userEmail, setUserEmail] = useState<string>('')

  const type = searchParams.get('type') || 'business'

  useEffect(() => {
    // Get email from URL params or try to get from auth
    const email = searchParams.get('email')
    if (email) {
      setUserEmail(email)
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Redirect to appropriate dashboard
          if (type === 'individual') {
            navigate('/individual-dashboard')
          } else {
            navigate('/dashboard')
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate, searchParams, type])

  const handleSignInNow = () => {
    navigate('/login-type')
  }

  const handleGoToDashboard = () => {
    if (type === 'individual') {
      navigate('/individual-dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040458] to-[#faa51a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Account Created Successfully!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your {type} account has been created. Please check your email to verify your account.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Email Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Verification Email Sent</span>
            </div>
            <p className="text-sm text-blue-700">
              We've sent a verification link to your email address. Please check your inbox and click the verification link to activate your account.
            </p>
            {userEmail && (
              <p className="text-xs text-blue-600 mt-1 font-mono">
                {userEmail}
              </p>
            )}
          </div>

          {/* Countdown */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Redirecting to Sign In</span>
            </div>
            <p className="text-sm text-gray-600">
              You'll be redirected to the sign-in page in{' '}
              <span className="font-bold text-[#040458]">{countdown}</span> seconds
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleSignInNow}
              className="w-full bg-[#040458] hover:bg-[#030345] text-white"
            >
              Sign In Now
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGoToDashboard}
              className="w-full border-[#faa51a] text-[#faa51a] hover:bg-[#faa51a] hover:text-white"
            >
              Go to Dashboard
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => navigate('/login-type')}
                className="text-[#040458] hover:underline"
              >
                try signing in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailVerificationSuccess
