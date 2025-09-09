import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FreeTrialSection from "@/components/FreeTrialSection";
import FreeTierSection from "@/components/FreeTierSection";
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
      <FreeTierSection />
      <Footer />
    </div>
  );
};

export default Index;
