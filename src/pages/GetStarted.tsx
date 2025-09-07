import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ChevronRight, 
  Smartphone, 
  BarChart3, 
  Package, 
  CreditCard, 
  Settings, 
  Users, 
  ShieldCheck,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  PlayCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const GetStarted = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile POS System",
      description: "Complete point-of-sale solution with barcode scanning, receipt printing, and real-time inventory updates.",
      steps: [
        "Set up your business profile",
        "Add products with barcodes",
        "Start processing sales",
        "Generate receipts and reports"
      ]
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Inventory Management",
      description: "Track stock levels, manage suppliers, and get low-stock alerts automatically.",
      steps: [
        "Import your product catalog",
        "Set minimum stock levels",
        "Track incoming/outgoing stock",
        "Receive automated alerts"
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "AI Analytics & Insights",
      description: "Get smart business insights, sales forecasting, and performance analytics powered by AI.",
      steps: [
        "View real-time dashboards",
        "Analyze sales trends",
        "Get AI-powered forecasts",
        "Make data-driven decisions"
      ]
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Payment Processing",
      description: "Accept multiple payment methods including mobile money, cards, and cash with automatic reconciliation.",
      steps: [
        "Connect payment methods",
        "Process transactions",
        "Track payment history",
        "Reconcile accounts"
      ]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-User Access",
      description: "Add team members with role-based permissions for secure collaboration.",
      steps: [
        "Invite team members",
        "Assign roles and permissions",
        "Set access levels",
        "Monitor user activity"
      ]
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: "Compliance & Reporting",
      description: "Automated tax computation, VAT analysis, and regulatory reporting for African markets.",
      steps: [
        "Configure tax settings",
        "Generate compliance reports",
        "Export for accounting",
        "Stay audit-ready"
      ]
    }
  ];

  const quickStartSteps = [
    {
      step: 1,
      title: "Create Your Account",
      description: "Sign up with your business email and complete your profile setup.",
      icon: <Users className="h-6 w-6" />
    },
    {
      step: 2,
      title: "Choose Your Plan",
      description: "Select the tier that best fits your business needs and budget.",
      icon: <Target className="h-6 w-6" />
    },
    {
      step: 3,
      title: "Set Up Your Business",
      description: "Add your business information, products, and configure basic settings.",
      icon: <Settings className="h-6 w-6" />
    },
    {
      step: 4,
      title: "Start Selling",
      description: "Begin processing sales, managing inventory, and growing your business.",
      icon: <TrendingUp className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-[#040458]">Get Started Guide</h1>
            </div>
            <Button
              onClick={() => user ? navigate('/dashboard') : navigate('/signup')}
              className="bg-[#040458] hover:bg-[#030345] text-white"
            >
              {user ? 'Go to Dashboard' : 'Start Free Trial'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#040458] mb-4">
            Welcome to Otic Business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your complete business management solution. Learn how to use all the powerful features 
            to transform your business operations and drive growth.
          </p>
        </div>

        {/* Quick Start Steps */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-[#040458] mb-8 text-center">Quick Start (4 Steps)</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStartSteps.map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-[#040458] text-white rounded-full p-3">
                      {item.icon}
                    </div>
                  </div>
                  <div className="bg-[#faa51a] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 font-bold">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-[#040458] mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Overview */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-[#040458] mb-8 text-center">Feature Overview</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-[#faa51a] text-white p-2 rounded-lg">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-[#040458]">{feature.title}</CardTitle>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <h5 className="font-semibold text-[#040458] mb-3">How to use:</h5>
                  <ul className="space-y-2">
                    {feature.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-[#040458] mb-8 text-center">Choose Your Plan</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-[#040458]">Free Trial</CardTitle>
                <div className="text-3xl font-bold text-[#faa51a]">0 UGX</div>
                <p className="text-sm text-gray-600">30 days free</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Full access to all features</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>POS system with barcode scanning</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Complete inventory management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI analytics and insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#040458] relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#faa51a] text-white">
                Most Popular
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-[#040458]">Start Smart</CardTitle>
                <div className="text-3xl font-bold text-[#faa51a]">$300</div>
                <p className="text-sm text-gray-600">per month</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Mobile POS with barcode scanning</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic inventory management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Sales reporting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Single user dashboard</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-[#040458]">Grow with Intelligence</CardTitle>
                <div className="text-3xl font-bold text-[#faa51a]">$852.45</div>
                <p className="text-sm text-gray-600">per month</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Everything in Start Smart</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>QuickBooks API integration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI sales trend analytics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Multi-user access (up to 5)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-[#040458]">Enterprise Advantage</CardTitle>
                <div className="text-3xl font-bold text-[#faa51a]">$1,420</div>
                <p className="text-sm text-gray-600">per month</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Everything in Grow with Intelligence</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Multi-branch synchronization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited users</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>24/7 phone support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-[#040458] rounded-2xl p-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of African SMEs who are already growing with Otic Business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#faa51a] hover:bg-[#e0940a] text-white text-lg px-8 py-4"
              onClick={() => user ? navigate('/dashboard') : navigate('/signup')}
            >
              {user ? 'Go to Dashboard' : 'Start Free Trial'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-[#040458] text-lg px-8 py-4"
              onClick={() => navigate('/')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
