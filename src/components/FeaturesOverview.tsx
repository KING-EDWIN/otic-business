import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Smartphone, 
  ShieldCheck, 
  Users,
  TrendingUp,
  FileText,
  Zap,
  ChevronRight
} from "lucide-react";

const FeaturesOverview = () => {
  const features = [
    {
      title: "Smart POS System",
      description: "Complete point-of-sale solution with barcode scanning, receipt printing, and multi-payment support. Process transactions instantly with our intuitive interface designed for African businesses.",
      icon: ShoppingCart,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      color: "from-blue-500 to-blue-600",
      features: ["Barcode Scanning", "Receipt Printing", "Multi-Currency Support", "Offline Mode"]
    },
    {
      title: "Inventory Management", 
      description: "Advanced inventory tracking with real-time stock monitoring, automated low-stock alerts, and intelligent reordering. Never run out of stock again with our predictive analytics.",
      icon: Package,
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      color: "from-green-500 to-green-600",
      features: ["Real-time Tracking", "Low Stock Alerts", "Automated Reordering", "Bulk Import/Export"]
    },
    {
      title: "AI Analytics",
      description: "Powerful business intelligence with predictive insights, sales forecasting, and customer behavior analysis. Make data-driven decisions with our advanced AI algorithms.",
      icon: BarChart3,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", 
      color: "from-purple-500 to-purple-600",
      features: ["Sales Forecasting", "Customer Insights", "Performance Metrics", "Custom Reports"]
    },
    {
      title: "Mobile App",
      description: "Full-featured mobile application that lets you manage your business anywhere. Sync data in real-time and access all features on your smartphone or tablet.",
      icon: Smartphone,
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      color: "from-orange-500 to-orange-600",
      features: ["Real-time Sync", "Offline Access", "Push Notifications", "Touch ID Login"]
    },
    {
      title: "Secure & Reliable",
      description: "Enterprise-grade security with bank-level encryption, 99.9% uptime guarantee, and automatic backups. Your data is protected with industry-leading security measures.",
      icon: ShieldCheck,
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      color: "from-red-500 to-red-600",
      features: ["Bank-level Security", "99.9% Uptime", "Auto Backups", "Data Encryption"]
    },
    {
      title: "Team Collaboration",
      description: "Multi-user access with role-based permissions, team management, and collaboration tools. Assign different access levels to staff members and track their activities.",
      icon: Users,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      color: "from-indigo-500 to-indigo-600",
      features: ["Role-based Access", "Team Management", "Activity Tracking", "Permission Controls"]
    },
    {
      title: "Financial Reports",
      description: "Comprehensive financial reporting with tax preparation tools, profit & loss statements, and cash flow analysis. Stay compliant with local tax regulations.",
      icon: FileText,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      color: "from-teal-500 to-teal-600",
      features: ["P&L Statements", "Tax Reports", "Cash Flow Analysis", "Export to Excel"]
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={feature.title} className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
              <div className="relative">
                {/* Clear feature image only */}
                <div className="h-56 relative overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-[#040458] group-hover:text-[#faa51a] transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                <CardDescription className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </CardDescription>
                
                {/* Feature highlights */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-[#040458]">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#faa51a] rounded-full"></div>
                        <span className="text-xs text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Pricing Section */}
        <div className="text-center mt-20 mb-16">
          <div className="bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-3xl p-12 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 left-8 w-32 h-32 border-2 border-white/30 rounded-full"></div>
              <div className="absolute bottom-8 right-8 w-24 h-24 border-2 border-white/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-4xl font-bold mb-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Choose the perfect plan for your business needs and start your free trial today. 
                No credit card required for the first 14 days.
              </p>
              <Link to="/pricing">
                <Button 
                  size="lg"
                  className="bg-white text-[#040458] hover:bg-white/90 font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-300 shadow-xl"
                >
                  View Pricing Plans
                  <ChevronRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
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
