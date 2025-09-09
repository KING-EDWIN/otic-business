import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PricingSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePlanSelection = (tier: string) => {
    if (user) {
      // User is logged in, redirect to dashboard
      navigate('/dashboard');
    } else {
      // User not logged in, redirect to signup with tier pre-selected
      navigate('/signup', { state: { selectedTier: tier } });
    }
  };

  const tiers = [
    {
      name: "Free Trial",
      price: "0",
      period: "30 days free",
      description: "Try everything for free - no credit card required",
      badge: "Free",
      features: [
        "Full access to all features",
        "POS system with barcode scanning",
        "Complete inventory management",
        "AI analytics and insights",
        "Multi-user access",
        "All payment methods",
        "Priority support during trial"
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "hero" as const
    },
    {
      name: "Start Smart",
      price: "1m UGX",
      period: "Per Month",
      description: "Perfect for small businesses starting their digital transformation",
      badge: null,
      features: [
        "Mobile POS with barcode scanning",
        "Basic inventory management",
        "Sales reporting (daily, weekly, monthly)",
        "Single user dashboard",
        "Receipt generation",
        "CSV/PDF exports",
        "Email support"
      ],
      buttonText: "Choose Start Smart",
      buttonVariant: "outline" as const
    },
    {
      name: "Grow with Intelligence",
      price: "3m UGX",
      period: "Per Month",
      description: "Ideal for growing SMEs ready for advanced automation",
      badge: "Most Popular",
      features: [
        "Everything in Start Smart",
        "QuickBooks API integration",
        "Tax computation & VAT analysis",
        "AI sales trend analytics",
        "Multi-user access (up to 5 users)",
        "Role-based permissions",
        "Automated financial reports",
        "Priority support"
      ],
      buttonText: "Choose Grow with Intelligence",
      buttonVariant: "hero" as const
    },
    {
      name: "Enterprise Advantage",
      price: "5m UGX",
      period: "Per Month",
      description: "Enterprise solution for multi-branch operations",
      badge: "Enterprise",
      features: [
        "Everything in Grow with Intelligence",
        "Multi-branch synchronization",
        "AI financial forecasting",
        "Advanced compliance reporting",
        "Unlimited users",
        "Third-party API integrations",
        "Audit logs & advanced permissions",
        "Dedicated account manager",
        "24/7 phone support"
      ],
      buttonText: "Choose Enterprise Advantage",
      buttonVariant: "success" as const
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#040458]">
            Choose Your Growth Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparent pricing designed for African businesses. Scale your business with the right tools at the right price.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <Card 
              key={tier.name} 
              className={`relative shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#faa51a]/30 ${
                tier.badge === "Most Popular" ? "ring-2 ring-[#faa51a] scale-105" : ""
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge 
                    className={`px-4 py-1 ${
                      tier.badge === "Most Popular" 
                        ? "bg-[#faa51a] text-white" 
                        : "bg-[#040458] text-white"
                    }`}
                  >
                    {tier.badge === "Most Popular" && <Star className="w-3 h-3 mr-1" />}
                    {tier.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-[#040458]">
                  {tier.name}
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-[#faa51a]">
                      {tier.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{tier.period}</p>
                </div>
                <p className="text-gray-600 text-sm mt-4">
                  {tier.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={tier.buttonVariant} 
                  className="w-full"
                  size="lg"
                  onClick={() => handlePlanSelection(tier.name.toLowerCase())}
                >
                  {tier.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-muted-foreground">Secure payment options available</p>
          <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
            <span>Mobile Money (MTN, Airtel)</span>
            <span>•</span>
            <span>Mastercard/Visa</span>
            <span>•</span>
            <span>Flutterwave</span>
            <span>•</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;