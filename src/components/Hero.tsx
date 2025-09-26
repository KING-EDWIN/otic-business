import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BarChart3, Smartphone, ShieldCheck, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/female-african-store-attendant-smiling-600nw-1897406392.jpg.webp";

const Hero = () => {
  const navigate = useNavigate();
  const { getDashboardRoute, user, profile, loading } = useAuth();

  const handleGetStarted = () => {
    console.log('🔍 Hero: Dashboard button clicked');
    console.log('🔍 Hero: Auth state:', { user: !!user, profile: !!profile, loading });
    
    // If still loading, wait a bit
    if (loading) {
      console.log('🔍 Hero: Still loading, waiting...');
      setTimeout(() => {
        const dashboardRoute = getDashboardRoute();
        console.log('🔍 Hero: Navigating to:', dashboardRoute);
        navigate(dashboardRoute);
      }, 500);
      return;
    }
    
    const dashboardRoute = getDashboardRoute();
    console.log('🔍 Hero: Navigating to:', dashboardRoute);
    navigate(dashboardRoute);
  };

  const handleGetStartedGuide = () => {
    // Navigate to get started guide
    navigate('/get-started');
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
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-8 sm:pb-16">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          {/* Top Headline */}
          <div className="text-[#faa51a] text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            Streamline Your Business Operations
          </div>
          
          {/* Main Headline */}
          <h1 className="text-6xl sm:text-6xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6 max-w-4xl px-4">
            The First Intelligent Eye for Your Business
          </h1>
          
          {/* Sub-headline */}
          <p className="text-xl sm:text-2xl md:text-2xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mb-8 sm:mb-12 px-4">
            The AI-Powered Business Platform That Sees, Understands, and Automates.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16 px-4">
            <Button 
              size="lg"
              className="text-xl sm:text-2xl px-8 sm:px-9 py-5 sm:py-5 h-auto bg-[#faa51a] text-white hover:bg-[#faa51a]/90 font-semibold rounded-lg shadow-xl transition-all duration-300 w-full sm:w-auto"
              onClick={handleGetStarted}
            >
              Start Free Trial
              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-xl sm:text-2xl px-8 sm:px-9 py-5 sm:py-5 h-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#040458] font-semibold rounded-lg shadow-xl transition-all duration-300 w-full sm:w-auto"
              onClick={handleGetStartedGuide}
            >
              Get Started
              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Stats removed per request */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
