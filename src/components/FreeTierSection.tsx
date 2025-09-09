import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const FreeTierSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/user-type');
    }
  };

  const features = [
    "Full access to all features",
    "POS system with barcode scanning",
    "Complete inventory management",
    "AI analytics and insights",
    "Multi-user access (up to 3 users)",
    "All payment methods",
    "Priority support during trial",
    "Mobile app access",
    "Basic reporting",
    "Email support"
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#040458]">
            Get Started Today
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the full power of our platform. No credit card required.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="relative shadow-2xl border-2 border-[#faa51a]">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="px-4 py-1 bg-[#faa51a] text-white">
                <Star className="w-3 h-3 mr-1" />
                Free
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-3xl font-bold text-[#040458]">
                Free Trial
              </CardTitle>
              <div className="space-y-2">
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-5xl font-bold text-[#faa51a]">
                    0
                  </span>
                  <span className="text-2xl text-gray-600">UGX</span>
                </div>
                <p className="text-lg text-gray-600">14 days free</p>
              </div>
              <p className="text-gray-600 mt-4">
                Full access to all features
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="space-y-3">
                <Button 
                  variant="hero" 
                  className="w-full text-lg py-4 h-auto"
                  size="lg"
                  onClick={handleGetStarted}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-lg py-4 h-auto border-[#040458] text-[#040458] hover:bg-[#040458] hover:text-white"
                  size="lg"
                  onClick={() => navigate('/pricing')}
                >
                  View Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Full support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreeTierSection;
