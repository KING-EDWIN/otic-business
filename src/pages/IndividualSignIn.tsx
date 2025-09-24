import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, User, Eye, EyeOff, Building2, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { getPasswordResetUrl, getUrl } from '@/services/environmentService'

const IndividualSignIn = () => {
  const navigate = useNavigate()
  const { signIn, user, profile, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [lastErrorTime, setLastErrorTime] = useState(0)

  // Optimized redirect check with useCallback
  const checkRedirect = useCallback(() => {
    if (!authLoading && user && profile && profile.user_type === 'individual') {
      navigate('/individual-dashboard')
    }
  }, [user, profile, navigate, authLoading])

  useEffect(() => {
    checkRedirect()
  }, [checkRedirect])

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#040458] to-[#faa51a]">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Optimized sign-in handler with debounced error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('IndividualSignIn: Starting sign in process for:', email)
      
      const { error } = await signIn(email, password, 'individual')

      if (error) {
        console.error('IndividualSignIn: Auth error:', error)
        
        // Debounce error messages to prevent rapid flashing
        const now = Date.now()
        if (now - lastErrorTime < 2000) {
          console.log('Debouncing error message to prevent flashing')
          return
        }
        setLastErrorTime(now)
        
        // Handle account type errors with clear messaging
        if (error.accountType && error.accountType !== 'individual') {
          setError(`This account is registered as a ${error.accountType} account. Please use the Business Sign In form.`)
        } else {
          setError(error.message || 'Failed to sign in. Please check your credentials.')
        }
        return
      }

      console.log('IndividualSignIn: Auth successful, redirecting to individual dashboard')
      toast.success('Welcome back, professional!')
      navigate('/individual-dashboard')
      
    } catch (error: any) {
      console.error('IndividualSignIn: Sign in error:', error)
      setError(error.message || 'Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Forgot password handler
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first')
      return
    }

    setForgotPasswordLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordResetUrl(),
      })

      if (error) {
        toast.error('Failed to send reset email. Please try again.')
      } else {
        toast.success('Password reset email sent! Check your inbox.')
      }
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  // Google sign-in handler with proper OAuth flow
  const handleGoogleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use Supabase's built-in OAuth with proper configuration
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getUrl(`/auth/callback?user_type=individual`),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid email profile',
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        toast.error('Google sign-in failed. Please try again.');
        setLoading(false);
      }
      // If successful, user will be redirected to Google OAuth
      // The callback will handle the rest
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      toast.error('Google sign-in failed. Please try again.');
      setLoading(false);
    }
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img 
                src="/Layer 2.png" 
                alt="Otic Business Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-[#040458]">Professional Sign In</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Access your professional account</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/')} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#faa51a] to-[#040458] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-[#040458]">
              Professional Sign In
            </CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Sign in to your professional account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                    {error.includes('business account') && (
                      <div className="mt-2">
                        <Link to="/business-signin" className="text-blue-600 hover:underline font-medium">
                          → Go to Business Sign In
                        </Link>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pr-10"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-[#faa51a] hover:bg-[#040458] text-white text-lg py-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In to Professional Account'
                )}
              </Button>

              {/* Forgot Password */}
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleForgotPassword}
                  disabled={forgotPasswordLoading || loading}
                  className="text-[#faa51a] hover:text-[#faa51a]/80 p-0 h-auto"
                >
                  {forgotPasswordLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Forgot your password?'
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-3">
              <div className="text-sm text-gray-600">
                Don't have a professional account?{' '}
                <Link to="/individual-signup" className="text-[#faa51a] hover:underline font-medium">
                  Sign up as a professional
                </Link>
              </div>
              
              <div className="text-sm text-gray-600">
                Are you a business owner?{' '}
                <Link to="/business-signin" className="text-[#040458] hover:underline font-medium">
                  Sign in to business account
                </Link>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-[#040458] to-[#faa51a] text-white rounded-lg">
              <h3 className="font-semibold text-base sm:text-lg mb-4">Professional Account Benefits:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span>Track multiple businesses you manage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span>Receive business invitations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span>Professional networking opportunities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span>Access to professional tools and insights</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default IndividualSignIn
