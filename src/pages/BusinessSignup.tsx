import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { InputValidator } from '@/utils/inputValidation';
import { countries } from '@/data/countries';

const BusinessSignup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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

        toast.success('Business account created successfully! Please check your email to verify your account.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create business account');
    } finally {
      setLoading(false);
    }
  };

  // Google signup removed - using unified auth context only


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

              {/* Google signup removed - using unified auth context only */}

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
