import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { enableDemoMode, user } = useAuth();

  useEffect(() => {
    // Enable demo mode when visiting home page if no real user is logged in
    if (!user || user.email === 'demo@oticbusiness.com') {
      enableDemoMode();
    }
  }, [enableDemoMode, user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
