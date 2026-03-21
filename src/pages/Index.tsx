import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FooterSection />
    </div>
  );
};

export default Index;
