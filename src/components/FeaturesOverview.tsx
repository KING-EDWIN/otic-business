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
  Calculator,
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
    },
    {
      title: "Accounting & Bookkeeping",
      description: "Automated accounting with QuickBooks integration, expense tracking, and invoice management. Keep your books organized and tax-ready year-round.",
      icon: Calculator,
      image: "https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      color: "from-blue-500 to-blue-600",
      features: ["QuickBooks Sync", "Expense Tracking", "Invoice Management", "Tax Preparation"]
    },
    {
      title: "Budget & Forecasting",
      description: "Smart budgeting tools with AI-powered forecasting and financial planning. Plan for growth and make informed business decisions.",
      icon: TrendingUp,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      color: "from-purple-500 to-purple-600",
      features: ["Budget Planning", "AI Forecasting", "Financial Goals", "Growth Projections"]
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="mb-4 bg-[#faa51a]/10 text-[#faa51a] border-[#faa51a]/20">
            Complete Business Solution
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#040458] mb-4 sm:mb-6 px-4">
            Everything You Need to Grow Your Business
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            From sales to analytics, inventory to accounting - one platform that grows with your business. 
            Join 2000+ African businesses already transforming their operations.
          </p>
        </div>

        {/* Sales & Operations Section */}
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#040458] mb-8 text-center">
            🛒 Sales & Operations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.slice(0, 3).map((feature, index) => (
              <Card key={feature.title} className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="relative">
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
        </div>

        {/* Management & Analytics Section */}
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#040458] mb-8 text-center">
            📊 Management & Analytics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.slice(3, 6).map((feature, index) => (
              <Card key={feature.title} className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="relative">
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
        </div>

        {/* Financial & Reporting Section */}
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#040458] mb-8 text-center">
            💰 Financial & Reporting
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.slice(6).map((feature, index) => (
              <Card key={feature.title} className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="relative">
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
        </div>

        {/* Business Problem Section */}
        <div className="text-center mt-12 sm:mt-16 lg:mt-20 mb-8 sm:mb-12">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4 text-[#040458]">
                Are You Struggling With These Business Challenges?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-red-500 font-semibold mb-2">❌ Manual Processes</div>
                  <div className="text-sm text-gray-600">Losing time and money with paper-based systems and manual calculations</div>
                </div>
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-red-500 font-semibold mb-2">❌ Stock Shortages</div>
                  <div className="text-sm text-gray-600">Running out of popular items and missing sales opportunities</div>
                </div>
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-red-500 font-semibold mb-2">❌ Poor Visibility</div>
                  <div className="text-sm text-gray-600">Not knowing your real profits, best-selling products, or customer trends</div>
                </div>
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-red-500 font-semibold mb-2">❌ Accounting Headaches</div>
                  <div className="text-sm text-gray-600">Struggling with tax calculations, invoicing, and financial reporting</div>
                </div>
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-red-500 font-semibold mb-2">❌ Limited Growth</div>
                  <div className="text-sm text-gray-600">Unable to scale efficiently due to outdated business processes</div>
                </div>
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-red-500 font-semibold mb-2">❌ Data Loss Risk</div>
                  <div className="text-sm text-gray-600">Vulnerable to losing important business data and customer information</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solution Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4 text-[#040458]">
                Transform Your Business With Otic Business
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                Join 2000+ African businesses that have already transformed their operations and increased profits by 80% using our AI-powered platform.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-green-500 font-semibold mb-2">✅ Automated Everything</div>
                  <div className="text-sm text-gray-600">POS, inventory, accounting, and reporting all work together seamlessly</div>
                </div>
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-green-500 font-semibold mb-2">✅ Smart Inventory</div>
                  <div className="text-sm text-gray-600">Never run out of stock with AI-powered predictions and automated reordering</div>
                </div>
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-green-500 font-semibold mb-2">✅ Real-time Insights</div>
                  <div className="text-sm text-gray-600">Know exactly what's selling, what's profitable, and what your customers want</div>
                </div>
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-green-500 font-semibold mb-2">✅ Easy Accounting</div>
                  <div className="text-sm text-gray-600">Automated invoicing, tax calculations, and QuickBooks integration</div>
                </div>
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-green-500 font-semibold mb-2">✅ Scale Fast</div>
                  <div className="text-sm text-gray-600">Grow your business with tools that grow with you, from startup to enterprise</div>
                </div>
                <div className="text-left p-4 bg-white/60 rounded-lg">
                  <div className="text-green-500 font-semibold mb-2">✅ Bank-level Security</div>
                  <div className="text-sm text-gray-600">Your data is protected with enterprise-grade security and automatic backups</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 sm:top-8 left-4 sm:left-8 w-16 sm:w-32 h-16 sm:h-32 border-2 border-white/30 rounded-full"></div>
              <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 w-12 sm:w-24 h-12 sm:h-24 border-2 border-white/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-48 h-24 sm:h-48 border border-white/10 rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Join thousands of successful African businesses. Start your free trial today - no credit card required for 14 days.
              </p>
              
              {/* Both buttons together */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/user-type">
                  <Button 
                    size="lg"
                    className="bg-white text-[#040458] hover:bg-white/90 font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg transition-all duration-300 shadow-xl w-full sm:w-auto"
                  >
                    Start Free Trial
                    <ChevronRight className="ml-2 h-4 w-4 sm:h-6 sm:w-6" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#040458] font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg transition-all duration-300 shadow-xl w-full sm:w-auto"
                  >
                    View Pricing Plans
                    <ChevronRight className="ml-2 h-4 w-4 sm:h-6 sm:w-6" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-[#040458]">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[#faa51a]" />
              <span className="text-sm sm:text-base font-semibold">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <span className="text-sm sm:text-base font-semibold">Proven Results</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <span className="text-sm sm:text-base font-semibold">Secure & Reliable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesOverview;
