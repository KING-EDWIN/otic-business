import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const BusinessSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    industrySector: '',
    cityOfOperation: '',
    countryOfOperation: '',
    emailAddress: '',
    physicalAddress: '',
    keyContactPerson: '',
    phoneNumber: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.emailAddress,
        password: 'temp_password_123', // Temporary password, user will reset
        options: {
          data: {
            full_name: formData.keyContactPerson,
            company_name: formData.companyName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Use upsert to handle both insert and update cases gracefully
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: authData.user.id, // Use 'id' not 'user_id'
            email: formData.emailAddress,
            business_name: formData.companyName,
            full_name: formData.keyContactPerson,
            phone: formData.phoneNumber,
            address: formData.physicalAddress,
            user_type: 'business',
            email_verified: false,
            tier: 'free_trial',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id' // Handle conflicts on the id field
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        toast.success('Business account created successfully! Please check your email to verify your account.');
        navigate('/signin');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create business account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth-callback?user_type=business&action=signup`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google signup error:', error);
      toast.error(error.message || 'Google signup failed');
      setLoading(false);
    }
  };


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

  const countryOptions = [
    'Uganda',
    'Kenya',
    'Tanzania',
    'Rwanda',
    'Burundi',
    'South Sudan',
    'Ethiopia',
    'Ghana',
    'Nigeria',
    'South Africa',
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
                src="/Layer 2.png" 
                alt="Otic Business Logo" 
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
                  <Select onValueChange={(value) => handleInputChange('countryOfOperation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
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
                <Input
                  id="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="e.g., +256 700 123 456"
                  className="w-full"
                />
              </div>

              {/* Google Sign Up */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignUp}
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
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-[#040458] hover:bg-[#faa51a] text-white text-lg py-6"
                disabled={loading}
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
