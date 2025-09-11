import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowRight, Shield, Clock, Users, Zap, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePlanSelection = (tier: string) => {
    if (user) {
      // Navigate to payments page with the selected tier
      navigate(`/payments?tier=${tier}`);
    } else {
      // For non-logged in users, go to signup first
      navigate('/user-type');
    }
  };

  const tiers = [
    {
      name: "Free Trial",
      price: "0",
      period: "14 days free",
      description: "Try everything for free - no credit card required",
      badge: "Free",
      popular: false,
      features: [
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
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "hero" as const,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Start Smart",
      price: "1,000,000",
      currency: "UGX",
      period: "Per Month",
      description: "Perfect for small businesses starting their digital transformation",
      badge: null,
      popular: false,
      features: [
        "Mobile POS with barcode scanning",
        "Basic inventory management",
        "Sales reporting (daily, weekly, monthly)",
        "Single user dashboard",
        "Receipt generation",
        "CSV/PDF exports",
        "Email support",
        "Basic analytics",
        "Mobile app access",
        "Data backup"
      ],
      buttonText: "Choose Start Smart",
      buttonVariant: "outline" as const,
      color: "from-green-500 to-green-600"
    },
    {
      name: "Grow with Intelligence",
      price: "3,000,000",
      currency: "UGX",
      period: "Per Month",
      description: "Ideal for growing SMEs ready for advanced automation",
      badge: "Most Popular",
      popular: true,
      features: [
        "Everything in Start Smart",
        "Tax computation & VAT analysis",
        "AI sales trend analytics",
        "Multi-user access (up to 5 users)",
        "Role-based permissions",
        "Automated financial reports",
        "Priority support",
        "Advanced analytics dashboard",
        "Custom reporting",
        "API access",
        "Phone support"
      ],
      buttonText: "Choose Grow with Intelligence",
      buttonVariant: "hero" as const,
      color: "from-[#faa51a] to-orange-600"
    },
    {
      name: "Enterprise Advantage",
      price: "5,000,000",
      currency: "UGX",
      period: "Per Month",
      description: "Enterprise solution for multi-branch operations",
      badge: "Enterprise",
      popular: false,
      features: [
        "Everything in Grow with Intelligence",
        "Multi-branch synchronization",
        "AI financial forecasting",
        "Advanced compliance reporting",
        "Unlimited users",
        "Third-party API integrations",
        "Audit logs & advanced permissions",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom integrations",
        "White-label options",
        "SLA guarantee"
      ],
      buttonText: "Choose Enterprise Advantage",
      buttonVariant: "success" as const,
      color: "from-purple-500 to-purple-600"
    }
  ];

  const faqs = [
    {
      question: "Can I change my plan later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Mobile Money (MTN, Airtel), Mastercard, Visa, Flutterwave, and PayPal. All payments are processed securely."
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fees for any plan. You only pay the monthly subscription fee. The Free Trial has no charges at all."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
    },
    {
      question: "Do you offer discounts for annual payments?",
      answer: "Yes, we offer 2 months free when you pay annually. Contact our sales team for more information."
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "Your data is safely stored for 90 days after cancellation. You can export all your data before the retention period expires."
    }
  ];

  const comparisonFeatures = [
    {
      feature: "POS System",
      free: true,
      startSmart: true,
      grow: true,
      enterprise: true
    },
    {
      feature: "Inventory Management",
      free: true,
      startSmart: true,
      grow: true,
      enterprise: true
    },
    {
      feature: "AI Analytics",
      free: true,
      startSmart: false,
      grow: true,
      enterprise: true
    },
    {
      feature: "Multi-User Access",
      free: "3 users",
      startSmart: "1 user",
      grow: "5 users",
      enterprise: "Unlimited"
    },
    {
      feature: "QuickBooks Integration",
      free: false,
      startSmart: false,
      grow: true,
      enterprise: true
    },
    {
      feature: "Tax Computation",
      free: false,
      startSmart: false,
      grow: true,
      enterprise: true
    },
    {
      feature: "Multi-Branch Support",
      free: false,
      startSmart: false,
      grow: false,
      enterprise: true
    },
    {
      feature: "API Access",
      free: false,
      startSmart: false,
      grow: true,
      enterprise: true
    },
    {
      feature: "Priority Support",
      free: true,
      startSmart: false,
      grow: true,
      enterprise: true
    },
    {
      feature: "Dedicated Account Manager",
      free: false,
      startSmart: false,
      grow: false,
      enterprise: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 bg-gradient-to-br from-[#040458] via-purple-600 to-[#faa51a] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-90 px-4">
              Choose the perfect plan for your business. Start free, scale as you grow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-8 text-xs sm:text-sm px-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>14-day free trial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {tiers.map((tier, index) => (
              <Card 
                key={tier.name} 
                className={`relative shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#faa51a]/30 ${
                  tier.popular ? "ring-2 ring-[#faa51a] scale-105" : ""
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge 
                      className={`px-4 py-1 ${
                        tier.badge === "Most Popular" 
                          ? "bg-[#faa51a] text-white" 
                          : tier.badge === "Enterprise"
                          ? "bg-purple-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {tier.badge === "Most Popular" && <Star className="w-3 h-3 mr-1" />}
                      {tier.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4 pt-8">
                  <CardTitle className="text-2xl font-bold text-[#040458]">
                    {tier.name}
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-4xl font-bold text-[#faa51a]">
                        {tier.price}
                      </span>
                      {tier.currency && (
                        <span className="text-lg text-gray-600">{tier.currency}</span>
                      )}
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
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
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
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#040458] mb-6">
              Compare All Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-[#040458]">Features</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#040458]">Free Trial</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#040458]">Start Smart</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#040458]">Grow with Intelligence</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#040458]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium text-gray-700">{item.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof item.free === 'boolean' ? (
                        item.free ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-400">—</span>
                      ) : (
                        <span className="text-sm text-gray-600">{item.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof item.startSmart === 'boolean' ? (
                        item.startSmart ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-400">—</span>
                      ) : (
                        <span className="text-sm text-gray-600">{item.startSmart}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof item.grow === 'boolean' ? (
                        item.grow ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-400">—</span>
                      ) : (
                        <span className="text-sm text-gray-600">{item.grow}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof item.enterprise === 'boolean' ? (
                        item.enterprise ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-400">—</span>
                      ) : (
                        <span className="text-sm text-gray-600">{item.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#040458] mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-lg font-semibold text-[#040458] mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#040458] to-[#faa51a] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="text-lg px-8 py-4 h-auto bg-white text-[#040458] hover:bg-gray-100 font-semibold rounded-lg shadow-xl"
              onClick={() => handlePlanSelection('free trial')}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 h-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#040458] font-semibold rounded-lg"
              onClick={() => navigate('/contact')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
