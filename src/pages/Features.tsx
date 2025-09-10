import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  BarChart3, 
  Shield, 
  Users, 
  Zap, 
  Globe,
  CreditCard,
  FileText,
  Brain,
  TrendingUp,
  Package,
  Calculator,
  Clock,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Features = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/user-type');
    }
  };

  const mainFeatures = [
    {
      icon: <Smartphone className="h-12 w-12" />,
      title: "Mobile POS System",
      description: "Transform any smartphone into a powerful point-of-sale terminal with advanced barcode scanning, instant sales processing, and digital receipt generation.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      highlights: [
        "Camera-based barcode scanning",
        "Real-time inventory updates",
        "Digital receipt generation",
        "Offline sales capability",
        "Multi-payment method support",
        "Sales analytics dashboard"
      ],
      benefits: [
        "Reduce checkout time by 70%",
        "Eliminate manual data entry errors",
        "Access sales data anywhere, anytime",
        "Professional receipt presentation"
      ]
    },
    {
      icon: <BarChart3 className="h-12 w-12" />,
      title: "AI-Powered Analytics",
      description: "Leverage artificial intelligence to gain deep insights into your business performance, predict trends, and make data-driven decisions.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      highlights: [
        "Sales trend prediction",
        "Customer behavior analysis",
        "Inventory demand forecasting",
        "Anomaly detection alerts",
        "Performance benchmarking",
        "Custom report generation"
      ],
      benefits: [
        "Increase revenue by 25% through better insights",
        "Reduce inventory costs by 30%",
        "Identify growth opportunities",
        "Prevent stockouts and overstocking"
      ]
    },
    {
      icon: <Package className="h-12 w-12" />,
      title: "Smart Inventory Management",
      description: "Automate your inventory tracking with intelligent stock management, automated reordering, and demand prediction capabilities.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      highlights: [
        "Real-time stock level tracking",
        "Automated low-stock alerts",
        "Supplier management system",
        "Bulk import/export functionality",
        "Category and brand organization",
        "Cost tracking and profit analysis"
      ],
      benefits: [
        "Reduce inventory holding costs",
        "Prevent stockouts and lost sales",
        "Optimize purchasing decisions",
        "Track product profitability"
      ]
    },
    {
      icon: <CreditCard className="h-12 w-12" />,
      title: "Payment Integration",
      description: "Accept all payment methods including Mobile Money, cards, and digital payments with automated reconciliation and reporting.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      highlights: [
        "Mobile Money integration (MTN, Airtel)",
        "Card payment processing",
        "Digital wallet support",
        "Automated reconciliation",
        "Payment analytics",
        "Refund management"
      ],
      benefits: [
        "Increase sales by accepting all payment types",
        "Reduce cash handling risks",
        "Automate financial reconciliation",
        "Improve cash flow visibility"
      ]
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Multi-User Management",
      description: "Manage your team with role-based access control, ensuring security while enabling collaboration across your organization.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      highlights: [
        "Role-based permissions",
        "User activity tracking",
        "Department management",
        "Access level controls",
        "Team collaboration tools",
        "Audit trail logging"
      ],
      benefits: [
        "Secure data access control",
        "Improve team productivity",
        "Maintain data integrity",
        "Enable remote work capabilities"
      ]
    },
    {
      icon: <Shield className="h-12 w-12" />,
      title: "Automated Compliance",
      description: "Stay compliant with local regulations through automated tax computation, VAT analysis, and regulatory reporting.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      highlights: [
        "Automated tax calculations",
        "VAT analysis and reporting",
        "Regulatory compliance checks",
        "Audit trail maintenance",
        "Financial statement generation",
        "Government reporting formats"
      ],
      benefits: [
        "Reduce compliance costs by 80%",
        "Eliminate manual tax calculations",
        "Avoid regulatory penalties",
        "Maintain accurate financial records"
      ]
    },
    {
      icon: <Globe className="h-12 w-12" />,
      title: "Multi-Branch Support",
      description: "Synchronize operations across multiple locations with centralized management and consolidated reporting.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      highlights: [
        "Centralized inventory management",
        "Cross-branch sales tracking",
        "Unified reporting dashboard",
        "Branch performance comparison",
        "Resource allocation optimization",
        "Consolidated financial reporting"
      ],
      benefits: [
        "Scale operations efficiently",
        "Maintain consistent operations",
        "Optimize resource allocation",
        "Gain enterprise-wide visibility"
      ]
    },
  ];

  const additionalFeatures = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Business Assistant",
      description: "Get personalized business advice and insights powered by advanced AI technology.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Performance Tracking",
      description: "Monitor key performance indicators and track business growth over time.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: "Financial Forecasting",
      description: "Predict future revenue and expenses with AI-powered forecasting models.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Real-Time Notifications",
      description: "Get instant alerts for important business events and opportunities.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-[#040458] via-purple-600 to-[#faa51a] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Powerful Features for Modern Business
            </h1>
            <p className="text-xl lg:text-2xl mb-8 opacity-90">
              Everything you need to run, grow, and scale your business with AI-powered automation and intelligent insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="text-lg px-8 py-4 h-auto bg-white text-[#040458] hover:bg-gray-100 font-semibold rounded-lg shadow-xl"
                onClick={handleGetStarted}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 h-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#040458] font-semibold rounded-lg"
                onClick={() => navigate('/pricing')}
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#040458] mb-6">
              Core Business Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed to streamline every aspect of your business operations
            </p>
          </div>

          <div className="space-y-24">
            {mainFeatures.map((feature, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-[#faa51a] rounded-xl text-white">
                      {feature.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-[#040458]">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-[#040458] mb-3">Key Features:</h4>
                      <ul className="space-y-2">
                        {feature.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-600">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-[#040458] mb-3">Business Benefits:</h4>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-[#faa51a] flex-shrink-0" />
                            <span className="text-gray-600">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className={`relative ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#040458] mb-6">
              Additional Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Even more tools to help you succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="p-0 text-center hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <div className="absolute top-4 right-4 p-2 bg-[#faa51a] rounded-lg text-white">
                    {feature.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#040458] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#040458] to-[#faa51a] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform to streamline operations and drive growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="text-lg px-8 py-4 h-auto bg-white text-[#040458] hover:bg-gray-100 font-semibold rounded-lg shadow-xl"
              onClick={handleGetStarted}
            >
              Start Your Free Trial
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

export default Features;
