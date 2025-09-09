import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BarChart3, Smartphone, ShieldCheck, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/landingimage.jpeg";

const Hero = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/user-type');
    }
  };

  const handleGetStartedGuide = () => {
    // Navigate to user type selection
    navigate('/user-type');
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image - Market scene */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundPosition: 'center center'
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          {/* Top Headline */}
          <div className="text-[#faa51a] text-lg font-semibold mb-4">
            Streamline Your Business Operations
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 max-w-4xl">
            The Complete AI-Powered Business Platform
          </h1>
          
          {/* Sub-headline */}
          <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mb-12">
            Transform your African SME with our comprehensive business management solution. 
            From mobile POS to intelligent analytics, everything you need in one platform.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button 
              size="lg"
              className="text-lg px-8 py-4 h-auto bg-[#faa51a] text-white hover:bg-[#faa51a]/90 font-semibold rounded-lg shadow-xl transition-all duration-300"
              onClick={handleGetStarted}
            >
              Start Free Trial
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 h-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-semibold rounded-lg transition-all duration-300"
              onClick={() => navigate('/pricing')}
            >
              <ChevronRight className="mr-2 h-5 w-5" />
              View Pricing
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
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
      </div>
    </section>
  );
};

export default Hero;