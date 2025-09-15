import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const BusinessSignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials') || signInError.message.includes('Email not confirmed')) {
          setError('Wrong account type or account doesn\'t exist. Please check your credentials or use the individual sign-in form.');
          toast.error('Wrong account type or account doesn\'t exist!');
        } else {
          setError(signInError.message || 'Failed to sign in. Please check your credentials.');
          toast.error(signInError.message || 'Failed to sign in.');
        }
        return;
      }

      if (data.user) {
        console.log('BusinessSignIn: Auth successful, checking user type...')
        
        // Check user profile to determine user type
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('BusinessSignIn: Profile error:', profileError)
          setError('Failed to load user profile')
          return
        }
        
        if (profile.user_type === 'business') {
          console.log('BusinessSignIn: User is business, redirecting to business dashboard')
          toast.success('Welcome back to your business dashboard!')
          navigate('/dashboard')
        } else {
          console.log('BusinessSignIn: User is not business, showing error')
          setError('Wrong account type or account doesn\'t exist. This email is registered as an individual account. Please use the individual sign-in form.')
          toast.error('Wrong account type! Please use the individual sign-in form.')
          return
        }
      }
      
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="text-2xl font-bold text-[#040458]">Business Sign In</h1>
                <p className="text-gray-600">Access your business account</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/login-type')} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Login Type</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#faa51a] to-[#040458] rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-[#040458]">
              Business Account Login
            </CardTitle>
            <CardDescription className="text-lg">
              Sign in to manage your business operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-red-500 text-sm text-center">
                  <p>{error}</p>
                  {error.includes('individual account') && (
                    <div className="mt-2">
                      <Link to="/individual-signin" className="text-blue-600 hover:underline font-medium">
                        → Go to Individual Sign In
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your business email"
                  className="w-full"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                />
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
                  <div className="flex items-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <Link to="/business-signup" className="text-[#faa51a] hover:underline">
                  Sign Up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessSignIn;