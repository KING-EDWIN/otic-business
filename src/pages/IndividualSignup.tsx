import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { InputValidator } from '@/utils/inputValidation';
import { countries } from '@/data/countries';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
// Helper function to get URL
const getUrl = (path: string) => `${window.location.origin}${path}`;

const IndividualSignup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    profession: '',
    country: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Google signup handler with proper OAuth flow
  const handleGoogleSignup = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use Supabase's built-in OAuth with proper configuration
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getUrl(`/auth/callback?user_type=individual&action=signup`),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid email profile',
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        toast.error('Google signup failed. Please try again.');
        setLoading(false);
      }
      // If successful, user will be redirected to Google OAuth
      // The callback will handle the rest
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      toast.error('Google signup failed. Please try again.');
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Check consent
      if (!consentAccepted) {
        toast.error('Please accept the Data Privacy and Protection Policy to continue');
        setLoading(false);
        return;
      }

      // Validate inputs
      const validation = InputValidator.validateIndividualSignup(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      const sanitizedData = validation.sanitizedData;

      // Use the auth context signUp function for consistency
      const result: { error: any; needsEmailVerification?: boolean } = await signUp(
        sanitizedData.email,
        sanitizedData.password,
        sanitizedData.fullName,
        'individual'
      );

      const { error: authError, needsEmailVerification = false } = result;

      if (authError) throw authError;

      // Create notification for profile completion
      try {
        const { NotificationService } = await import('@/services/notificationService');
        await NotificationService.createNotification(
          'system', // businessId - using 'system' for individual users
          'current-user', // userId - will be resolved by the service
          'Complete Your Profile', // title
          'Please complete your individual profile to access all features.', // message
          'info', // type
          'medium' // priority
        );
      } catch (notificationError) {
        console.warn('Failed to create notification:', notificationError);
        // Don't fail signup if notification creation fails
      }

      if (needsEmailVerification) {
        // Navigate to email verification success page
        navigate('/verify-email-success?type=individual');
      } else {
        toast.success('Account created successfully! Welcome to your dashboard.');
        navigate('/individual-dashboard');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040458] to-[#faa51a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link 
            to="/user-type" 
            className="inline-flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Account Type
          </Link>
      </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Create Individual Account</CardTitle>
            <CardDescription className="text-gray-600">
              Join as an individual professional
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Select value={formData.profession} onValueChange={(value) => handleInputChange('profession', value)}>
                  <SelectTrigger className={errors.profession ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your profession" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.profession && <p className="text-sm text-red-500">{errors.profession}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter your phone number"
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                />
                {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                <Input
                  id="password"
                    type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                <Input
                  id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              {/* Google Signup Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 border-gray-300 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </Button>

              {/* Privacy Policy Consent */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
                <Checkbox
                  id="privacy-consent"
                  checked={consentAccepted}
                  onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="privacy-consent" className="text-sm font-medium text-gray-700 cursor-pointer">
                    I agree to the{' '}
                    <Link to="/privacy" target="_blank" className="text-[#040458] hover:underline">
                      Data Privacy and Protection Policy
                    </Link>
                    {' '}and consent to the collection, processing, and storage of my personal data as outlined in the policy.
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    By checking this box, you acknowledge that you have read and understood our privacy policy.
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#040458] to-[#faa51a] hover:from-[#030347] hover:to-[#e6940f] text-white font-medium py-2.5"
                disabled={loading || !consentAccepted}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/individual-signin" className="text-[#040458] hover:text-[#030347] font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IndividualSignup;
