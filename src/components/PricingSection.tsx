import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

const PricingSection = () => {
  const tiers = [
    {
      name: "Basic",
      price: "1,000,000",
      period: "per year",
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
      buttonText: "Start Basic Plan",
      buttonVariant: "outline" as const
    },
    {
      name: "Standard",
      price: "2,000,000",
      period: "per year",
      description: "Ideal for growing SMEs ready for advanced automation",
      badge: "Most Popular",
      features: [
        "Everything in Basic",
        "QuickBooks API integration",
        "Tax computation & VAT analysis",
        "AI sales trend analytics",
        "Multi-user access (up to 5 users)",
        "Role-based permissions",
        "Automated financial reports",
        "Priority support"
      ],
      buttonText: "Choose Standard",
      buttonVariant: "hero" as const
    },
    {
      name: "Premium",
      price: "5,000,000",
      period: "per year",
      description: "Enterprise solution for multi-branch operations",
      badge: "Enterprise",
      features: [
        "Everything in Standard",
        "Multi-branch synchronization",
        "AI financial forecasting",
        "Advanced compliance reporting",
        "Unlimited users",
        "Third-party API integrations",
        "Audit logs & advanced permissions",
        "Dedicated account manager",
        "24/7 phone support"
      ],
      buttonText: "Go Premium",
      buttonVariant: "success" as const
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Choose Your Growth Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transparent pricing designed for African SMEs. Scale your business with the right tools at the right price.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <Card 
              key={tier.name} 
              className={`relative shadow-card hover:shadow-business transition-all duration-300 ${
                tier.badge === "Most Popular" ? "ring-2 ring-primary scale-105" : ""
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge 
                    className={`px-4 py-1 ${
                      tier.badge === "Most Popular" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-success text-success-foreground"
                    }`}
                  >
                    {tier.badge === "Most Popular" && <Star className="w-3 h-3 mr-1" />}
                    {tier.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {tier.name}
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-primary">
                      {tier.price}
                    </span>
                    <span className="text-sm text-muted-foreground">UGX</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.period}</p>
                </div>
                <p className="text-muted-foreground text-sm mt-4">
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