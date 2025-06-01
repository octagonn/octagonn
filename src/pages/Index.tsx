
import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Services } from "@/components/Services";
import { ContactForm } from "@/components/ContactForm";
import { Reviews } from "@/components/Reviews";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen relative bg-black">
      {/* Spline Background */}
      <div className="spline-background">
        <spline-viewer url="https://prod.spline.design/XuOAzAxRvn23IgAq/scene.splinecode"></spline-viewer>
      </div>
      
      {/* Main Content */}
      <div className={`relative z-10 transition-all duration-1000 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <Navigation />
        <Hero />
        <WhyChooseUs />
        <Services />
        <ContactForm />
        <Reviews />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
