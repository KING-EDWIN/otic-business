import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, User, ArrowRight, CheckCircle, Star, Users, BarChart3, Smartphone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleTypeSelection = (type: string) => {
    setSelectedType(type);
    if (type === 'business') {
      navigate('/business-signup');
    } else if (type === 'individual') {
      navigate('/individual-signup');
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
                <h1 className="text-2xl font-bold text-[#040458]">Otic Business</h1>
                <p className="text-gray-600">Choose your account type</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#040458] mb-4">
            How would you like to get started?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the account type that best fits your needs. You can always change this later.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Business Option */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
              selectedType === 'business' 
                ? 'ring-2 ring-[#faa51a] scale-105' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleTypeSelection('business')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#040458]">
                Business Account
              </CardTitle>
              <CardDescription className="text-lg">
                For business owners and organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Perfect if you own or manage a business
                </p>
                <p className="text-sm text-blue-700">
                  Get access to our complete business management suite including POS, 
                  inventory management, analytics, and team collaboration tools. 
                  Start with a 14-day free trial and choose the plan that fits your business size.
                </p>
              </div>
              
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span>Complete business management tools</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span>POS and inventory management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span>Team collaboration features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span>Advanced analytics and reporting</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span>14-day free trial</span>
                </li>
              </ul>

              <Button 
                className="w-full bg-[#040458] hover:bg-[#faa51a] text-white"
                onClick={() => handleTypeSelection('business')}
              >
                Choose Business Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Individual Option */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
              selectedType === 'individual' 
                ? 'ring-2 ring-[#faa51a] scale-105' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleTypeSelection('individual')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#faa51a] to-[#040458] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#040458]">
                Individual Account
              </CardTitle>
              <CardDescription className="text-lg">
                For professionals and managers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-800 font-medium mb-2">
                  Perfect for finance professionals and managers
                </p>
                <p className="text-sm text-orange-700">
                  Access multiple businesses you manage, track your professional activities, 
                  and collaborate with business owners. Get invited to manage businesses 
                  or request access to specific organizations.
                </p>
              </div>
              
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span>Track multiple businesses</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span>Receive business invitations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span>Profile management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span>Professional networking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span>Free to join</span>
                </li>
              </ul>

              <Button 
                className="w-full bg-[#faa51a] hover:bg-[#040458] text-white"
                onClick={() => handleTypeSelection('individual')}
              >
                Choose Individual Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Steps Section */}
        <div className="mt-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#faa51a]/10 text-[#faa51a] border-[#faa51a]/20">
              How It Works
            </Badge>
            <h2 className="text-4xl font-bold text-[#040458] mb-6">
              Your Journey to Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these simple steps to get started with Otic Business and transform your business operations.
            </p>
          </div>

          {/* Detailed Steps */}
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#040458] mb-4">Landing Page - Start Your Journey</h3>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg">When you visit our landing page, you'll see a beautiful hero section with our main value proposition and a prominent "Start Free Trial" button.</p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">What happens when you click "Start Free Trial":</h4>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>You'll be redirected to this account type selection page</li>
                        <li>No registration required at this stage</li>
                        <li>You can explore both account types before deciding</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#faa51a] to-[#040458] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#040458] mb-4">Choose Your Account Type</h3>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg">Select the account type that best fits your needs. This determines which features and dashboard you'll have access to.</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Business Account:</h4>
                        <ul className="list-disc list-inside space-y-1 text-orange-800 text-sm">
                          <li>Complete business management suite</li>
                          <li>POS system and inventory management</li>
                          <li>Team collaboration features</li>
                          <li>Advanced analytics and reporting</li>
                          <li>14-day free trial with full access</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Individual Account:</h4>
                        <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                          <li>Track multiple businesses you manage</li>
                          <li>Receive business invitations</li>
                          <li>Professional profile management</li>
                          <li>Access to business dashboards you're invited to</li>
                          <li>Free to join and use</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#040458] mb-4">Sign Up & Verification</h3>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg">Create your account with a simple and secure sign-up process designed for African businesses.</p>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Sign-up process includes:</h4>
                      <ul className="list-disc list-inside space-y-1 text-green-800">
                        <li>Email address and password creation</li>
                        <li>Account type confirmation (Business or Individual)</li>
                        <li>Email verification for security</li>
                        <li>Basic profile information setup</li>
                        <li>Terms of service acceptance</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">Security features:</h4>
                      <ul className="list-disc list-inside space-y-1 text-yellow-800">
                        <li>Bank-level encryption for all data</li>
                        <li>Two-factor authentication available</li>
                        <li>Secure password requirements</li>
                        <li>Email verification required</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#faa51a] to-[#040458] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#040458] mb-4">Access Your Dashboard</h3>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg">Once verified, you'll be redirected to your personalized dashboard with all the tools you need to manage your business effectively.</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Business Dashboard Features:</h4>
                        <ul className="list-disc list-inside space-y-1 text-purple-800 text-sm">
                          <li>Sales analytics and performance metrics</li>
                          <li>Inventory management system</li>
                          <li>POS system for transactions</li>
                          <li>Team management and permissions</li>
                          <li>Financial reports and insights</li>
                          <li>Customer relationship management</li>
                        </ul>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-indigo-900 mb-2">Individual Dashboard Features:</h4>
                        <ul className="list-disc list-inside space-y-1 text-indigo-800 text-sm">
                          <li>Track multiple business accounts</li>
                          <li>View business performance metrics</li>
                          <li>Manage your professional profile</li>
                          <li>Receive business invitations</li>
                          <li>Access business-specific tools</li>
                          <li>Professional networking features</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Getting Started Tips:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Complete your profile setup for better experience</li>
                        <li>Explore the tutorial section for feature guidance</li>
                        <li>Set up your first business data (for business accounts)</li>
                        <li>Invite team members (for business accounts)</li>
                        <li>Customize your dashboard preferences</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Not sure which account type is right for you?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="ghost" className="text-[#faa51a] hover:bg-orange-50">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;

