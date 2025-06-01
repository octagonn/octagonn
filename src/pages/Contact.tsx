
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Contact = () => {
  const { ref, isVisible } = useScrollReveal();

  const contactCards = [
    {
      icon: <i className="ph ph-envelope text-4xl text-accent"></i>,
      title: "Email Us",
      description: "For general inquiries or to request a service:",
      contact: "spydernetit@gmail.com",
      link: "mailto:spydernetit@gmail.com"
    },
    {
      icon: <i className="ph ph-phone text-4xl text-accent"></i>,
      title: "Call or Text",
      description: "For immediate assistance or to schedule a service:",
      contact: "(949) 237-2612",
      link: "tel:(949) 237-2612"
    },
    {
      icon: <i className="ph ph-clock text-4xl text-accent"></i>,
      title: "Business Hours",
      description: "We're available during these hours:",
      contact: "Mon-Fri: 10AM–6PM\nSat-Sun: 11:30AM–4PM"
    },
    {
      icon: <i className="ph ph-map-pin text-4xl text-accent"></i>,
      title: "Service Area",
      description: "Serving Orange County and surrounding areas",
      contact: "Remote support available nationwide"
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
              <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-white mb-6">Contact Us</h1>
              <p className="text-xl text-white/80 mb-4 font-light">We're Here to Help</p>
              <p className="text-lg text-white/70 max-w-3xl mx-auto font-light">
                Have a question about our services or need technical support? We'd love to hear from you. 
                Reach out through any of the methods below, and we'll respond quickly to assist you with your IT needs.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-transparent backdrop-blur-md"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div 
              ref={ref}
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 scroll-reveal ${isVisible ? 'visible' : ''}`}
            >
              {contactCards.map((card, index) => (
                <div key={index} className="glassmorphic rounded-xl p-6 text-center hover:transform hover:-translate-y-2 transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-light tracking-tight text-white mb-3">{card.title}</h3>
                  <p className="text-white/70 mb-4 font-light">{card.description}</p>
                  {card.link ? (
                    <a 
                      href={card.link}
                      className="text-accent hover:text-accent/80 font-light transition-colors"
                    >
                      {card.contact}
                    </a>
                  ) : (
                    <div className="text-white/80 font-light whitespace-pre-line">
                      {card.contact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <ContactForm />

        {/* Emergency Contact */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-md"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl lg:text-4xl font-light tracking-tighter text-white mb-4">Need Urgent Help?</h2>
            <p className="text-xl text-white/80 mb-6 font-light">
              For emergency IT support or urgent technical issues, call us directly
            </p>
            <a 
              href="tel:(949) 237-2612"
              className="neomorphic-btn inline-block text-lg px-8 py-4 transition-all duration-300"
            >
              <i className="ph ph-phone mr-2"></i>
              Call (949) 237-2612 Now
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Contact;
