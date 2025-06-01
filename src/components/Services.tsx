
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const Services = () => {
  const { ref, isVisible } = useScrollReveal();
  
  const services = [
    {
      icon: "ph ph-brain",
      title: "AI Consulting & Training",
      description: "Personalized workshops and senior-focused onboarding for AI tools and applications.",
      featured: true
    },
    {
      icon: "ph ph-laptop",
      title: "Computer Repair & Troubleshooting",
      description: "Fix slow performance, remove viruses, and resolve hardware/software issues."
    },
    {
      icon: "ph ph-globe",
      title: "Network Design & Implementation",
      description: "Create reliable, scalable networks with VPNs and secure remote access."
    },
    {
      icon: "ph ph-shield-check",
      title: "Malware Removal & Prevention",
      description: "Complete system cleaning and ongoing protection against threats."
    },
    {
      icon: "ph ph-house",
      title: "Home Network & WiFi Setup",
      description: "Eliminate dead zones and secure your home network."
    },
    {
      icon: "ph ph-robot",
      title: "Smart Home Installation",
      description: "Setup smart devices and create automation routines."
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent backdrop-blur-xs"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div 
          ref={ref}
          className={`text-center mb-16 scroll-reveal ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="text-4xl lg:text-6xl font-light tracking-tighter text-white mb-4">
            Our Services
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
            Comprehensive IT solutions for home and business. From troubleshooting to advanced implementations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`relative glassmorphic rounded-xl p-8 hover:bg-white/15 transition-all duration-500 group scroll-reveal ${
                service.featured 
                  ? "bg-gradient-to-br from-primary/20 to-secondary/20 border-accent/30" 
                  : ""
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {service.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent text-black px-4 py-1 rounded-full text-sm font-medium">
                  Featured
                </div>
              )}
              
              <div className="text-5xl mb-6 text-center">
                <i className={`${service.icon} text-accent`}></i>
              </div>
              <h3 className="text-xl font-light tracking-tight text-white mb-4 text-center">
                {service.title}
              </h3>
              <p className="text-white/70 leading-relaxed text-center font-light">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button asChild className="neomorphic-btn text-lg px-8 py-4">
            <Link to="/services">
              <i className="ph ph-arrow-right mr-2"></i>
              View All Services
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
