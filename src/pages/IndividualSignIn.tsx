import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, User, Eye, EyeOff, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const IndividualSignIn = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Check if user is an individual
        const { data: profile } = await supabase
          .from('individual_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          navigate('/individual-dashboard')
        } else {
          // User is not an individual, redirect to business dashboard
          navigate('/dashboard')
        }
      }
    }
    checkSession()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('IndividualSignIn: Starting sign in process for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('IndividualSignIn: Auth error:', error)
        throw error
      }

      console.log('IndividualSignIn: Auth successful, user:', data.user?.id)

      if (data.user) {
        // First check user_profiles to validate account type
        console.log('IndividualSignIn: Checking user_profiles for user:', data.user.id)
        const { data: userProfile, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single()

        console.log('IndividualSignIn: userProfile result:', userProfile, 'error:', userProfileError)

        if (userProfileError && userProfileError.code !== 'PGRST116') {
          console.error('IndividualSignIn: userProfile error:', userProfileError)
          throw userProfileError
        }

        if (userProfile && userProfile.user_type === 'business') {
          // This is a business account, show error
          console.log('IndividualSignIn: Business account detected, showing error')
          setError('This account is a business account. Please use the business sign-in instead.')
          toast.error('This account is a business account. Please use the business sign-in instead.')
          // Sign out the user since they used the wrong form
          await supabase.auth.signOut()
          return
        }

        // Check if user has individual profile (handle 406 error gracefully)
        console.log('IndividualSignIn: Checking individual_profiles for user:', data.user.id)
        let individualProfile = null
        let profileError = null
        
        try {
          const { data: profileData, error: profileErr } = await supabase
            .from('individual_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
          
          individualProfile = profileData
          profileError = profileErr
        } catch (err) {
          console.log('IndividualSignIn: individual_profiles table error (406 or similar):', err)
          // Continue without individual profile - this is expected if table doesn't exist
          profileError = { code: 'PGRST116' } // Treat as "not found"
        }

        console.log('IndividualSignIn: individualProfile result:', individualProfile, 'error:', profileError)

        // If user is not a business account, treat them as individual
        if (!userProfile || userProfile.user_type !== 'business') {
          // User is an individual (or no specific type), redirect to individual dashboard
          console.log('IndividualSignIn: Treating as individual user, redirecting to individual dashboard')
          toast.success('Welcome back, professional!')
          console.log('IndividualSignIn: Forcing navigation to /individual-dashboard');
          
          // Try immediate navigation first
          navigate('/individual-dashboard')
          
          // Also try with timeout as backup
          setTimeout(() => {
            console.log('IndividualSignIn: Timeout navigation to /individual-dashboard')
            navigate('/individual-dashboard')
          }, 100);
        } else {
          // User is a business account, show error
          console.log('IndividualSignIn: Business account detected, showing error')
          setError('This account is a business account. Please use the business sign-in instead.')
          toast.error('This account is a business account. Please use the business sign-in instead.')
          // Sign out the user since they used the wrong form
          await supabase.auth.signOut()
          return
        }
      }
    } catch (error: any) {
      console.error('IndividualSignIn: Sign in error:', error)
      setError(error.message || 'Failed to sign in')
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth-callback?user_type=individual`
        }
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Google sign in error:', error)
      setError(error.message || 'Google sign-in failed')
      toast.error(error.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-10 w-10"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#040458]">Professional Sign In</h1>
                <p className="text-gray-600">Access your professional account</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#faa51a] to-[#040458] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-[#040458]">
              Professional Sign In
            </CardTitle>
            <CardDescription className="text-lg">
              Sign in to your professional account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
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

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-[#faa51a] hover:bg-[#040458] text-white text-lg py-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In to Professional Account'
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-4">
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

              <div className="text-sm">
                <Link to="/forgot-password" className="text-[#faa51a] hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[#040458] to-[#faa51a] text-white rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Professional Account Benefits:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Track multiple businesses you manage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Receive business invitations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Professional networking opportunities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
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
