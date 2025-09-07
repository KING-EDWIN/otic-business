import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BarChart3, Smartphone, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-business.jpg";
// Import the woman selling fruits image - add this file to your assets folder
// import womanSellingFruits from "@/assets/woman-selling-fruits.jpg";

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

  const handleGetStartedGuide = () => {
    // Navigate to get started page
    navigate('/get-started');
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a] overflow-hidden">
      {/* Background Image - Woman selling fruits */}
      <div className="absolute inset-0">
        {/* Place your woman selling fruits image here */}
        {/* Replace 'woman-selling-fruits.jpg' with your actual image filename */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            // Uncomment the line below when you add the woman-selling-fruits.jpg image to your assets folder
            // backgroundImage: `url(${womanSellingFruits})`,
            // Fallback gradient - this will show until you add the image
            background: 'linear-gradient(135deg, #040458 0%, #040458 50%, #faa51a 100%)'
          }}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040458]/90 to-[#faa51a]/90"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#040458]/80 to-[#faa51a]/80"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Column - Text Content */}
          <div className="text-white space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-8xl font-bold leading-tight">
                Transform Your 
                <span className="text-[#faa51a] block">Business</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-2xl">
                Experience business management that feels as natural as messaging. 
                AI-powered automation, real-time insights, and instant growth for African SMEs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="text-lg px-8 py-4 h-auto bg-[#faa51a] text-white hover:bg-[#040458] hover:text-white font-semibold rounded-lg shadow-xl transition-all duration-300"
                onClick={handleGetStarted}
              >
                {user ? 'Go to Dashboard' : 'Start Free Trial'}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4 h-auto border-2 border-white text-white hover:bg-white hover:text-[#040458] font-semibold rounded-lg transition-all duration-300"
                onClick={handleGetStartedGuide}
              >
                Get Started
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#faa51a]">80%</div>
                <div className="text-sm text-white/80">Cost Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#faa51a]">2000+</div>
                <div className="text-sm text-white/80">SMEs Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#faa51a]">24/7</div>
                <div className="text-sm text-white/80">AI Support</div>
              </div>
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="space-y-6">
            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-2xl rounded-2xl hover:bg-white/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#faa51a] p-4 rounded-xl shadow-lg">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-2 text-white">Mobile POS System</h3>
                    <p className="text-white/90 leading-relaxed">
                      Barcode scanning, instant sales recording, and real-time inventory updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-2xl rounded-2xl hover:bg-white/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#faa51a] p-4 rounded-xl shadow-lg">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-2 text-white">AI-Powered Analytics</h3>
                    <p className="text-white/90 leading-relaxed">
                      Smart forecasting, anomaly detection, and business insights to drive growth.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-2xl rounded-2xl hover:bg-white/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#faa51a] p-4 rounded-xl shadow-lg">
                    <ShieldCheck className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-2 text-white">Automated Compliance</h3>
                    <p className="text-white/90 leading-relaxed">
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