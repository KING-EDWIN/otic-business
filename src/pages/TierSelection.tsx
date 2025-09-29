import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Star, HelpCircle, Check } from 'lucide-react';

const TierSelection = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const tiers = [
    {
      name: "Start Smart",
      price: "200,000 UGX",
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
      price: "400,000 UGX",
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
      name: "Enterprise Advantage: Your Custom Solution",
      price: "Flexible Pricing",
      period: "",
      description: "Your challenges are unique. We partner with your leadership to deliver solutions tailored to your strategic roadmap, security, and growth goals. Every engagement begins with a deep-dive discovery session to map your ecosystem and define a clear path forward.",
      badge: "Enterprise",
      features: [
        "Multi-branch operations",
        "AI-driven financial forecasting",
        "Advanced compliance reporting",
        "Unlimited users & third-party API integrations",
        "Audit logs & advanced permissions",
        "Dedicated account manager",
        "24/7 support",
        "Flexible, negotiable pricing for larger implementations",
        "➡️ Get a Quote: +256 706 867547",
        "➡️ Schedule a Call: +256 706 867547"
      ],
      buttonText: "Contact Us",
      buttonVariant: "success" as const
    }
  ];

  const handleTierSelection = (tierName: string) => {
    setSelectedTier(tierName);
  };

  const handleContinue = () => {
    if (selectedTier) {
      if (selectedTier === "Enterprise Advantage: Your Custom Solution") {
        // For Enterprise tier, open contact options
        window.open('tel:+256706867547', '_self');
      } else {
        navigate('/business-signup', { 
          state: { 
            selectedTier: selectedTier,
            tierDetails: tiers.find(t => t.name === selectedTier)
          } 
        });
      }
    }
  };

  const handleTierGuide = () => {
    navigate('/tier-guide');
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
                <h1 className="text-2xl font-bold text-[#040458]">Choose Your Plan</h1>
                <p className="text-gray-600">Select the perfect plan for your business</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#040458]">
            Choose Your Growth Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparent pricing designed for African businesses. Scale your business with the right tools at the right price.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {tiers.map((tier, index) => (
            <Card 
              key={tier.name} 
              className={`relative shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#faa51a]/30 cursor-pointer ${
                tier.badge === "Most Popular" ? "ring-2 ring-[#faa51a] scale-105" : ""
              } ${
                selectedTier === tier.name ? "ring-2 ring-[#040458] scale-105" : ""
              }`}
              onClick={() => handleTierSelection(tier.name)}
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
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    selectedTier === tier.name
                      ? "bg-[#040458] text-white"
                      : tier.badge === "Most Popular"
                      ? "bg-[#faa51a] text-white hover:bg-[#040458]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTierSelection(tier.name);
                  }}
                >
                  {selectedTier === tier.name ? (
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4" />
                      <span>Selected</span>
                    </div>
                  ) : (
                    tier.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Not Sure Section */}
        <div className="text-center mb-8">
          <Card className="max-w-md mx-auto bg-gradient-to-r from-[#040458] to-[#faa51a] text-white">
            <CardContent className="p-6">
              <HelpCircle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Not sure which tier to choose?</h3>
              <p className="text-sm mb-4 opacity-90">
                Answer a few questions and we'll recommend the perfect plan for your business.
              </p>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-[#040458] bg-white/10 backdrop-blur-sm"
                onClick={handleTierGuide}
              >
                Get Personalized Recommendation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        {selectedTier && (
          <div className="text-center">
            <Button 
              onClick={handleContinue}
              className="bg-[#040458] hover:bg-[#faa51a] text-white text-lg px-8 py-6"
            >
              Continue with {selectedTier === "Enterprise Advantage: Your Custom Solution" ? "Contact Us" : selectedTier}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <h3 className="font-semibold text-[#040458]">14-Day Free Trial</h3>
              <p className="text-sm text-gray-600">Try any plan risk-free for 14 days</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-[#040458]">Cancel Anytime</h3>
              <p className="text-sm text-gray-600">No long-term contracts or hidden fees</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-[#040458]">24/7 Support</h3>
              <p className="text-sm text-gray-600">Get help whenever you need it</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierSelection;
