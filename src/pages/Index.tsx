import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StepByStepGuide from "@/components/StepByStepGuide";
import FeaturesOverview from "@/components/FeaturesOverview";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";

const Index = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturesOverview />
      <Footer />
    </div>
  );
};

export default Index;
