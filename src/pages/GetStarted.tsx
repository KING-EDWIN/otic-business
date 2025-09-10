import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Smartphone, 
  BarChart3, 
  Calculator, 
  Brain, 
  Users, 
  CreditCard,
  Settings,
  FileText,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

const GetStarted = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: "welcome",
      title: "Welcome to Otic Business",
      subtitle: "Your AI-Powered Business Management Platform",
      icon: <Zap className="h-8 w-8 text-[#faa51a]" />,
      content: (
        <div className="text-center space-y-6">
          <div className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your African SME with our comprehensive business management solution. 
            From mobile POS to intelligent analytics, everything you need in one platform.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-[#faa51a]">80%</div>
              <div className="text-sm text-gray-600">Cost Reduction</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-[#faa51a]">2000+</div>
              <div className="text-sm text-gray-600">SMEs Served</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-[#faa51a]">24/7</div>
              <div className="text-sm text-gray-600">AI Support</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "choose-tier",
      title: "Choose Your Plan",
      subtitle: "Select the perfect plan for your business needs",
      icon: <CreditCard className="h-8 w-8 text-[#faa51a]" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-[#faa51a] relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#faa51a] text-white">
                Recommended
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Free Trial</CardTitle>
                <div className="text-3xl font-bold text-[#faa51a]">0 UGX</div>
                <div className="text-sm text-gray-600">30 days free</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Full access to all features</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />POS system with barcode scanning</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Complete inventory management</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />AI analytics and insights</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Start Smart</CardTitle>
                <div className="text-3xl font-bold text-[#faa51a]">1M UGX</div>
                <div className="text-sm text-gray-600">Per Month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Mobile POS with barcode scanning</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Basic inventory management</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Sales reporting</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Single user dashboard</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Grow with Intelligence</CardTitle>
                <div className="text-3xl font-bold text-[#faa51a]">3M UGX</div>
                <div className="text-sm text-gray-600">Per Month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Advanced AI analytics</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Multi-user access</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />QuickBooks integration</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Priority support</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Scale Enterprise</CardTitle>
                <div className="text-3xl font-bold text-[#faa51a]">5M UGX</div>
                <div className="text-sm text-gray-600">Per Month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Unlimited users</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Advanced reporting</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />API access</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Dedicated support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "signup",
      title: "Create Your Account",
      subtitle: "Sign up in just a few simple steps",
      icon: <Users className="h-8 w-8 text-[#faa51a]" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 1: Choose User Type</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-[#faa51a] rounded-full mr-3"></div>
                  <span>Business Owner</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                  <span>Employee/Staff</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 2: Enter Details</h3>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-600">Email Address</div>
                  <div className="text-sm">your@email.com</div>
                </div>
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-600">Password</div>
                  <div className="text-sm">••••••••</div>
                </div>
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-600">Business Name</div>
                  <div className="text-sm">Your Business Name</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-sm text-green-700">Account created successfully! You'll receive a verification email.</div>
          </div>
        </div>
      )
    },
    {
      id: "dashboard",
      title: "Your Business Dashboard",
      subtitle: "Overview of all your business operations in one place",
      icon: <BarChart3 className="h-8 w-8 text-[#faa51a]" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-lg text-gray-600">
              Your main dashboard shows real-time insights and quick access to all features
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center p-4">
              <TrendingUp className="h-8 w-8 text-[#faa51a] mx-auto mb-2" />
              <div className="font-semibold">Sales Today</div>
              <div className="text-2xl font-bold text-[#faa51a]">45,000 UGX</div>
            </Card>
            <Card className="text-center p-4">
              <FileText className="h-8 w-8 text-[#faa51a] mx-auto mb-2" />
              <div className="font-semibold">Orders</div>
              <div className="text-2xl font-bold text-[#faa51a]">23</div>
            </Card>
            <Card className="text-center p-4">
              <Users className="h-8 w-8 text-[#faa51a] mx-auto mb-2" />
              <div className="font-semibold">Customers</div>
              <div className="text-2xl font-bold text-[#faa51a]">156</div>
            </Card>
            <Card className="text-center p-4">
              <Shield className="h-8 w-8 text-[#faa51a] mx-auto mb-2" />
              <div className="font-semibold">Inventory</div>
              <div className="text-2xl font-bold text-[#faa51a]">89%</div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <div className="flex items-center p-2 border rounded-lg">
                  <Smartphone className="h-5 w-5 text-[#faa51a] mr-3" />
                  <span>Start POS Sale</span>
                </div>
                <div className="flex items-center p-2 border rounded-lg">
                  <BarChart3 className="h-5 w-5 text-[#faa51a] mr-3" />
                  <span>View Analytics</span>
                </div>
                <div className="flex items-center p-2 border rounded-lg">
                  <Calculator className="h-5 w-5 text-[#faa51a] mr-3" />
                  <span>Check Inventory</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">Recent Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-gray-50 rounded-lg">New sale: 5,000 UGX</div>
                <div className="p-2 bg-gray-50 rounded-lg">Low stock alert: Rice</div>
                <div className="p-2 bg-gray-50 rounded-lg">New customer registered</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "pos",
      title: "Point of Sale (POS)",
      subtitle: "Sell products quickly with barcode scanning and multiple payment options",
      icon: <Smartphone className="h-8 w-8 text-[#faa51a]" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">How to Make a Sale</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#faa51a] text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <div className="font-medium">Scan or Add Product</div>
                    <div className="text-sm text-gray-600">Use barcode scanner or manually add items</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#faa51a] text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <div className="font-medium">Review Order</div>
                    <div className="text-sm text-gray-600">Check quantities and prices</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#faa51a] text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <div className="font-medium">Process Payment</div>
                    <div className="text-sm text-gray-600">Cash, card, mobile money, or bank transfer</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#faa51a] text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <div className="font-medium">Print Receipt</div>
                    <div className="text-sm text-gray-600">Generate and print customer receipt</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">POS Features</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Barcode scanning</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Multiple payment methods</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Receipt printing</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Customer management</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Discounts and promotions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "inventory",
      title: "Inventory Management",
      subtitle: "Track stock levels, manage products, and get low stock alerts",
      icon: <FileText className="h-8 w-8 text-[#faa51a]" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Inventory Features</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Real-time stock tracking</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Barcode generation</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Low stock alerts</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Product categories</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Bulk import/export</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sample Inventory</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border rounded-lg">
                  <span className="font-medium">Rice (50kg)</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <span className="text-sm">75%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 border rounded-lg">
                  <span className="font-medium">Cooking Oil</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                    <span className="text-sm text-yellow-600">30%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 border rounded-lg">
                  <span className="font-medium">Sugar</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '10%'}}></div>
                    </div>
                    <span className="text-sm text-red-600">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "accounting",
      title: "Accounting & Finance",
      subtitle: "Manage your finances with QuickBooks integration and automated reporting",
      icon: <Calculator className="h-8 w-8 text-[#faa51a]" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Accounting Features</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>QuickBooks integration</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Automated invoicing</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Expense tracking</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Tax calculations</span>
                </div>
                <div className="flex items-center p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Financial reports</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Financial Overview</h3>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="text-xl font-bold text-green-600">125,000 UGX</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">Total Expenses</div>
                  <div className="text-xl font-bold text-red-600">45,000 UGX</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">Net Profit</div>
                  <div className="text-xl font-bold text-[#faa51a]">80,000 UGX</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "ai-insights",
      title: "AI Analytics & Insights",
      subtitle: "Get intelligent business insights powered by artificial intelligence",
      icon: <Brain className="h-8 w-8 text-[#faa51a]" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-lg text-gray-600">
              Our AI analyzes your business data to provide actionable insights and predictions
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-[#faa51a] mr-2" />
                <h3 className="font-semibold">Sales Predictions</h3>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                AI predicts your sales for the next 30 days based on historical data
              </div>
              <div className="text-2xl font-bold text-[#faa51a]">+15% Expected Growth</div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-6 w-6 text-[#faa51a] mr-2" />
                <h3 className="font-semibold">Customer Insights</h3>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Understand customer behavior and preferences
              </div>
              <div className="text-2xl font-bold text-[#faa51a]">85% Retention Rate</div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-[#faa51a] mr-2" />
                <h3 className="font-semibold">Inventory Optimization</h3>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                AI suggests optimal stock levels to reduce waste
              </div>
              <div className="text-2xl font-bold text-[#faa51a]">20% Less Waste</div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Brain className="h-6 w-6 text-[#faa51a] mr-2" />
                <h3 className="font-semibold">Smart Recommendations</h3>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Get personalized business advice and tips
              </div>
              <div className="text-2xl font-bold text-[#faa51a]">5 New Tips</div>
            </Card>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/user-type');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-[#040458] hover:text-[#faa51a]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#faa51a] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <div>
                <div className="font-bold text-[#040458]">Otic</div>
                <div className="text-xs text-gray-600">Business</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
        </div>
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-[#faa51a]' : 'bg-gray-300'
                  }`}
                />
            ))}
          </div>
        </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
              <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {steps[currentStep].icon}
              </div>
              <CardTitle className="text-2xl text-[#040458]">
                {steps[currentStep].title}
              </CardTitle>
              <p className="text-gray-600">
                {steps[currentStep].subtitle}
              </p>
              </CardHeader>
              <CardContent>
              {steps[currentStep].content}
              </CardContent>
            </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{currentStep === 0 ? 'Back to Home' : 'Previous'}</span>
            </Button>
            
            <Button
              onClick={nextStep}
              className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started Now' : 'Next'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;