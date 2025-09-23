import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { getPasswordResetUrl } from '@/services/environmentService';

const BusinessSignIn = () => {
  const navigate = useNavigate();
  const { signIn, user, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  // Optimized redirect check - only run once when component mounts
  useEffect(() => {
    if (user && profile && profile.user_type === 'business') {
      navigate('/dashboard');
    }
  }, [user?.id, profile?.user_type, navigate]); // Only depend on stable values

  // Optimized sign-in handler with better error handling
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { error: signInError } = await signIn(email, password, 'business');
      
      if (signInError) {
        // Handle account type errors with clear messaging
        if (signInError.accountType && signInError.accountType !== 'business') {
          setError(`This account is registered as an ${signInError.accountType} account. Please use the Individual Sign In form.`);
        } else {
        setError(signInError.message || 'Failed to sign in. Please check your credentials.');
        }
        return;
      }

      toast.success('Welcome back to your business dashboard!');
      navigate('/dashboard');
      
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, signIn, navigate]);

  // Forgot password handler
  const handleForgotPassword = useCallback(async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordResetUrl(),
      });

      if (error) {
        toast.error('Failed to send reset email. Please try again.');
      } else {
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  }, [email]);

  // Google sign-in handler with proper OAuth flow
  const handleGoogleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use Supabase's built-in OAuth with proper configuration
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?user_type=business`,
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
    <div className="min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a] flex items-center justify-center p-4">
      {/* Return Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/login-type')}
          className="flex items-center space-x-2 bg-white/90 hover:bg-white backdrop-blur-sm"
        >
              <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
            </Button>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-[#040458]" />
            </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Business Sign In</CardTitle>
          <CardDescription className="text-gray-600">
            Access your business dashboard
            </CardDescription>
          </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                {error.includes('individual account') && (
                  <div className="mt-2">
                    <Link to="/individual-signin" className="text-blue-600 hover:underline font-medium">
                      → Go to Individual Sign In
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                placeholder="business@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-white"
                />
              </div>

              <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white pr-10"
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

              <Button
                type="submit"
              className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                'Sign In'
              )}
            </Button>
          </form>

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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
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
          
          <div className="text-center text-sm space-y-2">
            <div>
              <span className="text-gray-600">Don't have a business account? </span>
              <Link to="/business-signup" className="text-[#faa51a] hover:underline font-medium">
                Sign up
              </Link>
            </div>
            
            <div>
              <span className="text-gray-600">Are you an individual professional? </span>
              <Link to="/individual-signin" className="text-[#040458] hover:underline font-medium">
                Sign in as individual
                </Link>
              </div>
          </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default BusinessSignIn;
