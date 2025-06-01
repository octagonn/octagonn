
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Services = () => {
  const { ref, isVisible } = useScrollReveal();

  const services = [
    {
      icon: "🧠",
      title: "AI Consulting & Training",
      description: "Personalized workshops with one-on-one needs assessment for writing, image generation, voice assistants, and more. Includes model selection and hands-on setup.",
      features: ["Personalized Workshops", "Senior-Focused Onboarding", "Large-print guides", "Follow-up sessions"],
      featured: true
    },
    {
      icon: "💻",
      title: "Computer Repair & Troubleshooting",
      description: "Fix slow performance, remove viruses, repair hardware issues, and resolve software problems for Windows and Mac systems.",
      features: ["Performance optimization", "Virus removal", "Hardware repair", "Software troubleshooting"]
    },
    {
      icon: "🌐",
      title: "Network Design & Implementation",
      description: "Create reliable, scalable networks for businesses of all sizes, including wired and wireless solutions, VPNs, and secure remote access.",
      features: ["Custom network design", "VPN setup", "Remote access", "Scalable solutions"]
    },
    {
      icon: "🛡️",
      title: "Malware Removal & Prevention",
      description: "Full system scans and removal of malware, installation and configuration of antivirus/anti-malware solutions, and ongoing best-practice hardening.",
      features: ["Complete malware removal", "Antivirus installation", "System hardening", "Prevention strategies"]
    },
    {
      icon: "🔒",
      title: "Network Security Audits",
      description: "Guest-WiFi isolation and device hardening to improve your network security posture and protect against threats.",
      features: ["Security assessments", "WiFi isolation", "Device hardening", "Threat analysis"]
    },
    {
      icon: "🏠",
      title: "Home Network Setup & WiFi Optimization",
      description: "Install and configure routers, extend WiFi coverage, eliminate dead zones, and secure your home network against unauthorized access.",
      features: ["Router configuration", "WiFi extension", "Dead zone elimination", "Network security"]
    },
    {
      icon: "🤖",
      title: "Smart Home Installation & Support",
      description: "Setup and configure smart devices, integrate with voice assistants, and create automation routines for convenience and security.",
      features: ["Smart device setup", "Voice assistant integration", "Home automation", "Security integration"]
    },
    {
      icon: "💾",
      title: "Data Recovery & Backup Solutions",
      description: "Recover lost files, set up automatic backups, and ensure your important documents, photos, and videos are protected.",
      features: ["File recovery", "Automatic backups", "Cloud integration", "Data protection"]
    },
    {
      icon: "🔧",
      title: "IT Consulting & Support",
      description: "Ongoing technical support and technology recommendations aligned with your business goals and budget.",
      features: ["Strategic planning", "Technology recommendations", "Ongoing support", "Budget optimization"]
    },
    {
      icon: "💡",
      title: "Specialized Installations",
      description: "Automotive ambient lighting (LED/acrylic dash & footwell installs, integration with factory lighting circuits) and home smart-device integration.",
      features: ["Automotive lighting", "Custom installations", "Factory integration", "Smart device setup"]
    }
  ];

  return (
    <div className="min-h-screen relative bg-black">
      {/* Spline Background */}
      <div className="spline-background">
        <spline-viewer url="https://prod.spline.design/XuOAzAxRvn23IgAq/scene.splinecode"></spline-viewer>
      </div>
      
      <div className="relative z-10">
        <Navigation />
        
        {/* Hero Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent backdrop-blur-xs"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-white mb-6">Our Services</h1>
              <p className="text-xl text-white/80 mb-8 font-light">
                Comprehensive IT Solutions for Home and Business
              </p>
              <p className="text-lg text-white/70 max-w-3xl mx-auto font-light">
                At SpyderNet IT, we offer a wide range of technology services designed to keep your systems running smoothly. 
                From troubleshooting and repairs to setup and security, our expert technicians provide reliable solutions for all your tech needs.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-transparent backdrop-blur-md"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div 
              ref={ref}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 scroll-reveal ${isVisible ? 'visible' : ''}`}
            >
              {services.map((service, index) => (
                <div
                  key={index}
                  className={`relative rounded-xl p-8 transition-all duration-300 hover:transform hover:-translate-y-2 ${
                    service.featured 
                      ? "glassmorphic border-accent/30 bg-gradient-to-br from-accent/20 to-primary/20" 
                      : "glassmorphic"
                  }`}
                >
                  {service.featured && (
                    <div className="absolute -top-4 left-8 bg-accent text-black px-4 py-1 rounded-full text-sm font-light">
                      Featured Service
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl flex-shrink-0">{service.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-light tracking-tight text-white mb-3">
                        {service.title}
                      </h3>
                      <p className="mb-4 leading-relaxed text-white/80 font-light">
                        {service.description}
                      </p>
                      
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm text-white/70 font-light">
                            <span className="w-2 h-2 rounded-full mr-3 bg-accent"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-md"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl lg:text-4xl font-light tracking-tighter text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto font-light">
              Contact us today for a free consultation and let us help you with your technology needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="neomorphic-btn text-lg px-8 py-4">
                <Link to="/contact">Get Free Consultation</Link>
              </Button>
              <Button asChild variant="outline" className="text-lg px-8 py-4">
                <a href="tel:(949) 237-2612">Call (949) 237-2612</a>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Services;
