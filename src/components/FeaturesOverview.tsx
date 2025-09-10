import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Smartphone, 
  ShieldCheck, 
  Users,
  TrendingUp,
  CreditCard,
  FileText,
  Zap
} from "lucide-react";

const FeaturesOverview = () => {
  const features = [
    {
      title: "Smart POS System",
      description: "Complete point-of-sale with barcode scanning, receipt printing, and payment processing",
      icon: ShoppingCart,
      image: "/pos-demo.jpg",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Inventory Management", 
      description: "Real-time stock tracking, low-stock alerts, and automated reordering",
      icon: Package,
      image: "/inventory-demo.jpg",
      color: "from-green-500 to-green-600"
    },
    {
      title: "AI Analytics",
      description: "Predictive insights, sales forecasting, and business intelligence",
      icon: BarChart3,
      image: "/analytics-demo.jpg", 
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Mobile App",
      description: "Manage your business on-the-go with our intuitive mobile application",
      icon: Smartphone,
      image: "/mobile-demo.jpg",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Secure & Reliable",
      description: "Bank-level security with 99.9% uptime guarantee",
      icon: ShieldCheck,
      image: "/security-demo.jpg",
      color: "from-red-500 to-red-600"
    },
    {
      title: "Team Collaboration",
      description: "Multi-user access with role-based permissions and team management",
      icon: Users,
      image: "/team-demo.jpg",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Financial Reports",
      description: "Comprehensive financial reporting and tax preparation tools",
      icon: FileText,
      image: "/reports-demo.jpg",
      color: "from-teal-500 to-teal-600"
    },
    {
      title: "Payment Processing",
      description: "Accept all payment methods including mobile money and cards",
      icon: CreditCard,
      image: "/payments-demo.jpg",
      color: "from-pink-500 to-pink-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#faa51a]/10 text-[#faa51a] border-[#faa51a]/20">
            Powerful Features
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#040458] mb-6">
            Everything You Need to Grow
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive business management platform includes all the tools you need to streamline operations and boost profitability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={feature.title} className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
              <div className="relative">
                {/* Placeholder for feature image */}
                <div className={`h-48 bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="h-16 w-16 text-white opacity-80" />
                </div>
                <div className="absolute top-4 right-4">
                  <div className={`w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-[#040458] group-hover:text-[#faa51a] transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 text-[#040458]">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-[#faa51a]" />
              <span className="font-semibold">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Proven Results</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Secure & Reliable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesOverview;
