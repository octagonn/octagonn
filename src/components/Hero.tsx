
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const Hero = () => {
  const { ref, isVisible } = useScrollReveal();

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-form');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white py-20 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-primary/20 to-secondary/30 backdrop-blur-xs"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div 
          ref={ref}
          className={`max-w-4xl mx-auto text-center scroll-reveal ${isVisible ? 'visible' : ''}`}
        >
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/lovable-uploads/ec3d1918-9de3-4b97-b9ca-ea9acffeb450.png" 
              alt="SpyderNet IT Logo" 
              className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl"
            />
          </div>

          <h1 className="text-4xl lg:text-7xl font-light tracking-tighter mb-6 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">SpyderNet IT</span>
          </h1>
          <p className="text-xl lg:text-3xl mb-4 font-light tracking-tight opacity-90">
            Your IT Solutions Provider
          </p>
          <p className="text-lg lg:text-xl mb-12 opacity-70 max-w-2xl mx-auto font-light">
            Fast, reliable tech support for Orange County homes and businesses. 
            We make technology work for you, not the other way around.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              className="neomorphic-btn px-8 py-4 text-lg"
              onClick={scrollToContact}
            >
              <i className="ph ph-lightning mr-2"></i>
              GET EXPERT HELP TODAY
            </button>
            
            <button className="glassmorphic hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl text-lg font-light transition-all duration-300">
              <i className="ph ph-phone mr-2"></i>
              (949) 237-2612
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="glassmorphic rounded-xl p-6">
              <div className="text-3xl font-light tracking-tighter text-accent mb-2">5+</div>
              <div className="opacity-80 font-light">Years Experience</div>
            </div>
            <div className="glassmorphic rounded-xl p-6">
              <div className="text-3xl font-light tracking-tighter text-accent mb-2">100%</div>
              <div className="opacity-80 font-light">Customer Satisfaction</div>
            </div>
            <div className="glassmorphic rounded-xl p-6">
              <div className="text-3xl font-light tracking-tighter text-accent mb-2">24/7</div>
              <div className="opacity-80 font-light">Remote Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
