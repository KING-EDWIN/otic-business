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
                src="/ otic Vision blue.png" 
                alt="Otic Vision Logo" 
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

        {/* How It Works Section */}
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
        </div>

        {/* System Header */}
        <div className="mt-12 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-2xl p-8 text-white text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/ otic Vision blue.png" 
              alt="Otic Vision Logo" 
              className="h-16 w-16 mr-4"
            />
            <div>
                <h3 className="text-3xl font-bold mb-2">Otic Vision System</h3>
              <p className="text-lg opacity-90">The AI-Powered Business Platform</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">14-Day</div>
              <div className="text-sm opacity-90">Free Trial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">24/7</div>
              <div className="text-sm opacity-90">Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">100%</div>
              <div className="text-sm opacity-90">Secure</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;

