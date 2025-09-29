import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Building2, ArrowRight, Eye, EyeOff, CheckCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { InputValidator } from '@/utils/inputValidation';
import { countries } from '@/data/countries';
import { supabase } from '@/lib/supabaseClient';
import { getOAuthConfig } from '@/config/oauth';
// Helper function to get URL
const getUrl = (path: string) => `${window.location.origin}${path}`;

const BusinessSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    industrySector: '',
    customIndustry: '',
    cityOfOperation: '',
    countryOfOperation: '',
    countryCode: '',
    emailAddress: '',
    physicalAddress: '',
    keyContactPerson: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    setFormData(prev => ({
      ...prev,
      countryOfOperation: country?.name || '',
      countryCode: country?.phoneCode || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors([]);

    try {
      // Validate form data
      const requiredFields = [
        'companyName', 'industrySector', 'cityOfOperation', 'countryOfOperation',
        'emailAddress', 'physicalAddress', 'keyContactPerson', 'phoneNumber',
        'password', 'confirmPassword'
      ];

      // Check consent
      if (!consentAccepted) {
        toast.error('Please accept the Data Privacy and Protection Policy to continue');
        setLoading(false);
        return;
      }
      
      // Add custom industry to validation if "Other" is selected
      if (formData.industrySector === 'Other') {
        requiredFields.push('customIndustry');
      }
      
      const validation = InputValidator.validateFormData(formData, requiredFields);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast.error('Please fix the validation errors');
        return;
      }

      // Use validated and sanitized data
      const sanitizedData = validation.sanitizedData;

      // Use the unified auth context for signup
      const { error } = await signUp(
        sanitizedData.emailAddress,
        sanitizedData.password,
        sanitizedData.companyName,
        'business'
      );

      if (error) {
        throw error;
      }

      // Create notification for profile completion
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { NotificationService } = await import('@/services/notificationService');
          await NotificationService.createNotification(
            'system', // businessId - using 'system' for new business users
            user.id, // userId
            'Complete Your Profile', // title
            'Please complete your business profile to access all features.', // message
            'info', // type
            'high', // priority
            '/complete-profile', // actionUrl
            { // metadata
              user_type: 'business',
              source: 'email_signup'
            }
          );
        }
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't throw - notification failure shouldn't break signup
      }

      // Show success state instead of navigating away
      setSignupSuccess(true);
      setCreatedAccount({
        companyName: sanitizedData.companyName,
        emailAddress: sanitizedData.emailAddress,
        industrySector: sanitizedData.industrySector === 'Other' ? sanitizedData.customIndustry : sanitizedData.industrySector,
        cityOfOperation: sanitizedData.cityOfOperation,
        countryOfOperation: sanitizedData.countryOfOperation
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create business account');
    } finally {
      setLoading(false);
    }
  };

  // Google signup handler with proper OAuth flow
  const handleGoogleSignup = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get OAuth configuration for current domain
      const oauthConfig = getOAuthConfig()
      
      // Use Supabase's built-in OAuth with proper configuration
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${oauthConfig.redirectUri}?user_type=business&action=signup`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            hd: 'oticbusiness.com', // Restrict to oticbusiness.com domain
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


  const industryOptions = [
    'Retail & E-commerce',
    'Food & Beverage',
    'Healthcare',
    'Manufacturing',
    'Technology',
    'Professional Services',
    'Education',
    'Real Estate',
    'Transportation & Logistics',
    'Agriculture',
    'Entertainment & Media',
    'Financial Services',
    'Other'
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/ otic Vision blue.png" 
                alt="Otic Vision Logo" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#040458]">Business Signup</h1>
                <p className="text-gray-600">Create your business account</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-[#040458]">
              Business Information
            </CardTitle>
            <CardDescription className="text-lg">
              Tell us about your business to get started with your free trial
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!signupSuccess && (
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  className="w-full"
                />
              </div>

              {/* Industry Sector */}
              <div className="space-y-2">
                <Label htmlFor="industrySector" className="text-sm font-medium">
                  Industry/Sector *
                </Label>
                <Select onValueChange={(value) => handleInputChange('industrySector', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Custom Industry Input - Only show when "Other" is selected */}
                {formData.industrySector === 'Other' && (
                  <div className="mt-2">
                    <Label htmlFor="customIndustry" className="text-sm font-medium text-gray-600">
                      Please specify your industry *
                    </Label>
                    <Input
                      id="customIndustry"
                      type="text"
                      required
                      value={formData.customIndustry}
                      onChange={(e) => handleInputChange('customIndustry', e.target.value)}
                      placeholder="Enter your specific industry or niche"
                      className="w-full mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cityOfOperation" className="text-sm font-medium">
                    City of Operation *
                  </Label>
                  <Input
                    id="cityOfOperation"
                    type="text"
                    required
                    value={formData.cityOfOperation}
                    onChange={(e) => handleInputChange('cityOfOperation', e.target.value)}
                    placeholder="e.g., Kampala"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryOfOperation" className="text-sm font-medium">
                    Country of Operation *
                  </Label>
                  <Select onValueChange={handleCountryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name} ({country.phoneCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="emailAddress" className="text-sm font-medium">
                  Email Address *
                </Label>
                <Input
                  id="emailAddress"
                  type="email"
                  required
                  value={formData.emailAddress}
                  onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                  placeholder="Enter your business email"
                  className="w-full"
                />
              </div>

              {/* Physical Address */}
              <div className="space-y-2">
                <Label htmlFor="physicalAddress" className="text-sm font-medium">
                  Physical Address *
                </Label>
                <Textarea
                  id="physicalAddress"
                  required
                  value={formData.physicalAddress}
                  onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
                  placeholder="Enter your complete business address"
                  className="w-full min-h-[80px]"
                />
              </div>

              {/* Key Contact Person */}
              <div className="space-y-2">
                <Label htmlFor="keyContactPerson" className="text-sm font-medium">
                  Key Contact Person (Manager) *
                </Label>
                <Input
                  id="keyContactPerson"
                  type="text"
                  required
                  value={formData.keyContactPerson}
                  onChange={(e) => handleInputChange('keyContactPerson', e.target.value)}
                  placeholder="Full name of the person who will manage the account"
                  className="w-full"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">
                  Phone Number *
                </Label>
                <div className="flex gap-2">
                  <div className="w-24">
                    <Input
                      type="text"
                      value={formData.countryCode}
                      placeholder="+256"
                      className="w-full"
                      readOnly
                    />
                  </div>
                <Input
                  id="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="700 123 456"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a strong password"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-red-600 font-medium">Please fix the following errors:</div>
                  <ul className="text-sm text-red-600 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-[#040458] hover:bg-[#faa51a] text-white text-lg py-6"
                disabled={loading || !consentAccepted}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create Business Account</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
              </form>
            )}

            {/* Success State */}
            {signupSuccess && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md mx-auto">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-600">
                      Account Created Successfully!
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Your business account has been created. Please confirm your email to continue.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Account Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Account Details:</h3>
                      <div className="space-y-1 text-sm text-blue-700">
                        <p><strong>Company:</strong> {createdAccount?.companyName}</p>
                        <p><strong>Email:</strong> {createdAccount?.emailAddress}</p>
                        <p><strong>Industry:</strong> {createdAccount?.industrySector}</p>
                        <p><strong>Location:</strong> {createdAccount?.cityOfOperation}, {createdAccount?.countryOfOperation}</p>
                      </div>
                    </div>

                    {/* Email Verification Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Mail className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Email Verification Required</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        We've sent a verification link to <strong>{createdAccount?.emailAddress}</strong>. 
                        Please check your inbox and click the verification link to activate your account.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button 
                        onClick={() => navigate('/business-signin')}
                        className="w-full bg-[#040458] hover:bg-[#030345] text-white"
                      >
                        I Confirmed My Email - Sign In
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/business-payment')}
                        className="w-full border-[#faa51a] text-[#faa51a] hover:bg-[#faa51a] hover:text-white"
                      >
                        Skip to Payment
                      </Button>
                    </div>

                    {/* Help Text */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        Didn't receive the email? Check your spam folder or{' '}
                        <button 
                          onClick={() => navigate('/business-signin')}
                          className="text-[#040458] hover:underline"
                        >
                          try signing in
                        </button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Alternative Signup Option */}
            {!signupSuccess && (
            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full border-[#faa51a] text-[#faa51a] hover:bg-[#faa51a] hover:text-white"
                  onClick={() => navigate('/individual-signup')}
                >
                  Create Personal Account
                </Button>
              </div>
            </div>
            )}

            {/* Terms */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-[#faa51a] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#faa51a] hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessSignup;
