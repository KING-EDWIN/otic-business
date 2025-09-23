import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Clock, ArrowRight, Gift } from 'lucide-react';

const TrialConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const { companyName, email } = location.state || {};

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const trialEnd = new Date(now + 14 * 24 * 60 * 60 * 1000).getTime();
      const distance = trialEnd - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const trialFeatures = [
    'Use camera to register stock',
    'Full inventory management',
    'Sales reporting and analytics',
    'Multi-user access (up to 5 users)',
    'Customer management',
    'Receipt generation and printing',
    'Data export (CSV/PDF)',
    'Email support',
    'Mobile app access',
    'Real-time synchronization'
  ];

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
                <h1 className="text-2xl font-bold text-[#040458]">Trial Confirmation</h1>
                <p className="text-gray-600">Your free trial is now active</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-4xl font-bold text-[#040458] mb-4">
            Welcome to Otic Business!
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            Your business account for <strong>{companyName || 'Your Company'}</strong> has been created successfully.
          </p>
          <p className="text-lg text-gray-500">
            A verification email has been sent to <strong>{email || 'your email'}</strong>
          </p>
        </div>

        {/* Trial Timer */}
        <Card className="mb-8 border-2 border-[#faa51a]">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
              <Gift className="h-6 w-6 text-[#faa51a]" />
              <span>Your 14-Day Free Trial</span>
            </CardTitle>
            <CardDescription className="text-lg">
              Full access to all features - no credit card required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                <div className="bg-[#040458] text-white rounded-lg p-4">
                  <div className="text-3xl font-bold">{timeLeft.days}</div>
                  <div className="text-sm opacity-90">Days</div>
                </div>
                <div className="bg-[#faa51a] text-white rounded-lg p-4">
                  <div className="text-3xl font-bold">{timeLeft.hours}</div>
                  <div className="text-sm opacity-90">Hours</div>
                </div>
                <div className="bg-[#040458] text-white rounded-lg p-4">
                  <div className="text-3xl font-bold">{timeLeft.minutes}</div>
                  <div className="text-sm opacity-90">Minutes</div>
                </div>
                <div className="bg-[#faa51a] text-white rounded-lg p-4">
                  <div className="text-3xl font-bold">{timeLeft.seconds}</div>
                  <div className="text-sm opacity-90">Seconds</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <Clock className="h-4 w-4 inline mr-1" />
                Trial ends automatically - no charges until you choose a plan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trial Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#040458]">
              What's Included in Your Trial
            </CardTitle>
            <CardDescription>
              Experience the full power of Otic Business for 14 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {trialFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#040458]">
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-[#040458] text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Check Your Email</h3>
                <p className="text-gray-600">Verify your email address to activate your account</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-[#faa51a] text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Explore Your Dashboard</h3>
                <p className="text-gray-600">Set up your products, customers, and start using POS</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-[#040458] text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Choose Your Plan</h3>
                <p className="text-gray-600">Select the perfect plan for your business before trial ends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/signin')}
            className="bg-[#040458] hover:bg-[#faa51a] text-white text-lg px-8 py-6"
          >
            Sign In to Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/tier-selection')}
            className="border-[#040458] text-[#040458] hover:bg-[#040458] hover:text-white text-lg px-8 py-6"
          >
            Choose Your Plan
          </Button>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Need help getting started?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="ghost" className="text-[#faa51a] hover:bg-orange-50">
              Contact Support
            </Button>
            <Button variant="ghost" className="text-[#040458] hover:bg-blue-50">
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialConfirmation;
