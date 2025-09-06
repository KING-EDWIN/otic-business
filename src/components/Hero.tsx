import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BarChart3, Smartphone, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-business.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleWatchDemo = () => {
    // For now, just navigate to signup. Later we can add a demo page
    navigate('/signup');
  };

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="African business transformation" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero/90"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Column - Text Content */}
          <div className="text-primary-foreground space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Transform Your 
                <span className="text-secondary block">SME Business</span>
              </h1>
              <p className="text-xl lg:text-2xl text-primary-foreground/90 leading-relaxed">
                End-to-end AI-powered business management platform designed for African SMEs. 
                Replace manual processes, reduce costs, and boost profitability.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="business" 
                size="lg"
                className="text-lg px-8 py-4 h-auto"
                onClick={handleGetStarted}
              >
                {user ? 'Go to Dashboard' : 'Start Free Trial'}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4 h-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => navigate('/demo')}
              >
                Try Interactive Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">80%</div>
                <div className="text-sm text-primary-foreground/80">Cost Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">2000+</div>
                <div className="text-sm text-primary-foreground/80">SMEs Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">24/7</div>
                <div className="text-sm text-primary-foreground/80">AI Support</div>
              </div>
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <Smartphone className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="text-primary-foreground">
                    <h3 className="text-xl font-semibold mb-2">Mobile POS System</h3>
                    <p className="text-primary-foreground/80">
                      Barcode scanning, instant sales recording, and real-time inventory updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-success/20 p-3 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-success" />
                  </div>
                  <div className="text-primary-foreground">
                    <h3 className="text-xl font-semibold mb-2">AI-Powered Analytics</h3>
                    <p className="text-primary-foreground/80">
                      Smart forecasting, anomaly detection, and business insights to drive growth.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-accent/20 p-3 rounded-lg">
                    <ShieldCheck className="h-8 w-8 text-accent" />
                  </div>
                  <div className="text-primary-foreground">
                    <h3 className="text-xl font-semibold mb-2">Automated Compliance</h3>
                    <p className="text-primary-foreground/80">
                      Tax computation, VAT analysis, and regulatory reporting made simple.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;