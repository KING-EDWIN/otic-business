import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Star, Zap, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FreeTrialSection = () => {
  const navigate = useNavigate();

  const handleStartTrial = () => {
    navigate('/user-type');
  };

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-[#faa51a]" />,
      title: "Mobile POS System",
      description: "Complete point-of-sale with barcode scanning and real-time inventory updates"
    },
    {
      icon: <Shield className="h-6 w-6 text-[#faa51a]" />,
      title: "AI-Powered Analytics",
      description: "Smart insights and forecasting to help you make better business decisions"
    },
    {
      icon: <Users className="h-6 w-6 text-[#faa51a]" />,
      title: "Customer Management",
      description: "Track customer interactions, purchase history, and loyalty programs"
    },
    {
      icon: <Star className="h-6 w-6 text-[#faa51a]" />,
      title: "Automated Reporting",
      description: "Generate comprehensive reports for sales, inventory, and financial tracking"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-[#faa51a] text-white text-sm px-4 py-2 mb-4">
            14-Day Free Trial
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#040458] mb-6">
            Experience the Full Power of Otic Business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Try all premium features for 14 days completely free. No credit card required. 
            See how our platform can transform your business operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 p-3 bg-[#faa51a]/10 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg text-[#040458]">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What's Included */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-[#040458] text-center mb-8">
            What's Included in Your Free Trial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#040458]">Core Features</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Mobile POS with barcode scanning
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Real-time inventory management
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Customer database & CRM
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Basic analytics & reporting
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#040458]">Advanced Features</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  AI-powered business insights
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Automated tax calculations
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Multi-location support
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Advanced reporting suite
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#040458]">Support & Training</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  24/7 customer support
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Onboarding assistance
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Video tutorials & guides
                </li>
                <li className="flex items-center text-gray-600">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Data migration help
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of African SMEs who have already revolutionized their operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-[#040458] hover:bg-gray-100 text-lg px-8 py-4 h-auto font-semibold"
                onClick={handleStartTrial}
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[#040458] text-lg px-8 py-4 h-auto font-semibold"
                onClick={() => navigate('/tier-selection')}
              >
                View Pricing Plans
              </Button>
            </div>
            <p className="text-sm text-white/80 mt-4">
              No credit card required • Cancel anytime • Full access to all features
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreeTrialSection;

