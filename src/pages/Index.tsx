import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StepByStepGuide from "@/components/StepByStepGuide";
import FeaturesOverview from "@/components/FeaturesOverview";
import Footer from "@/components/Footer";

const Index = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <StepByStepGuide />
      <FeaturesOverview />
      <Footer />
    </div>
  );
};

export default Index;
