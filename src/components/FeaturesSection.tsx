import { Card, CardContent } from "@/components/ui/card";
import { 
  Smartphone, 
  BarChart3, 
  Shield, 
  Users, 
  Zap, 
  Globe,
  CreditCard,
  FileText
} from "lucide-react";
import posImage from "@/assets/pos-system.jpg";
import dashboardImage from "@/assets/dashboard-analytics.jpg";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile POS System",
      description: "Scan barcodes with your phone camera, process sales instantly, and generate digital receipts.",
      color: "text-primary"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "AI-Powered Analytics",
      description: "Smart forecasting, trend analysis, and actionable insights to drive business growth.",
      color: "text-success"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Automated Compliance",
      description: "Tax computation, VAT analysis, and regulatory reporting with zero manual effort.",
      color: "text-accent"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-User Management",
      description: "Role-based access for business owners, accountants, cashiers, and managers.",
      color: "text-secondary"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-Time Inventory",
      description: "Auto-updating stock levels, low-stock alerts, and demand prediction.",
      color: "text-primary"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Multi-Branch Support",
      description: "Synchronize operations across multiple locations with consolidated reporting.",
      color: "text-success"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Payment Integration",
      description: "Accept Mobile Money, cards, and digital payments with automated reconciliation.",
      color: "text-accent"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "QuickBooks Integration",
      description: "Seamlessly sync with QuickBooks for professional accounting and reporting.",
      color: "text-secondary"
    }
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Everything Your SME Needs
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Replace manual processes with AI-driven automation. 
            One platform for POS, inventory, accounting, and business intelligence.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-card hover:shadow-business transition-all duration-300 group">
              <CardContent className="p-6 text-center space-y-4">
                <div className={`${feature.color} flex justify-center group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Showcases */}
        <div className="space-y-20">
          {/* POS Feature */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-foreground">
                Transform Your Point of Sale
              </h3>
              <p className="text-lg text-muted-foreground">
                Say goodbye to manual cash registers and spreadsheets. Our mobile POS system 
                turns any smartphone into a powerful sales terminal with barcode scanning, 
                real-time inventory updates, and instant receipt generation.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Barcode scanning via camera</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Instant sales recording</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Digital receipt generation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Real-time inventory sync</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <img 
                src={posImage} 
                alt="Modern POS system interface"
                className="w-full rounded-lg shadow-business"
              />
            </div>
          </div>

          {/* Analytics Feature */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <img 
                src={dashboardImage} 
                alt="Business analytics dashboard"
                className="w-full rounded-lg shadow-business"
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h3 className="text-3xl font-bold text-foreground">
                AI-Driven Business Intelligence
              </h3>
              <p className="text-lg text-muted-foreground">
                Make data-driven decisions with our advanced analytics engine. 
                Get insights into sales trends, customer behavior, inventory optimization, 
                and financial forecasting powered by artificial intelligence.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-foreground">Sales trend prediction</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-foreground">Customer behavior analysis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-foreground">Inventory demand forecasting</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-foreground">Anomaly detection alerts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;