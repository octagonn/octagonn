
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const WhyChooseUs = () => {
  const { ref, isVisible } = useScrollReveal();
  
  const features = [
    {
      icon: "ph ph-lightning",
      title: "Fast, Reliable Help — Right When You Need It",
      description: "No more waiting on hold or guessing what's wrong. Whether your Wi-Fi's down, your devices aren't syncing, or your network needs a pro setup, we show up fast and get the job done right the first time."
    },
    {
      icon: "ph ph-chat-circle",
      title: "Tech Made Simple — No Geek Speak",
      description: "We break down the fix in plain English, walk you through the process, and never upsell what you don't need. Our goal? Make your tech work for you, not the other way around."
    },
    {
      icon: "ph ph-phone-call",
      title: "Let's Get You Back Online — Today",
      description: "Reach out now for a free consultation or same-day service in your area. We're local, honest, and ready to help."
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent backdrop-blur-xs"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div 
          ref={ref}
          className={`text-center mb-16 scroll-reveal ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="text-4xl lg:text-6xl font-light tracking-tighter text-white mb-4">
            Why Choose SpyderNet IT?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
            Local expertise with a personal touch. We're not just your IT provider — we're your technology partners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glassmorphic rounded-xl p-8 hover:bg-white/15 transition-all duration-500 group scroll-reveal"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="text-5xl mb-6 text-center">
                <i className={`${feature.icon} text-accent`}></i>
              </div>
              <h3 className="text-xl font-light tracking-tight text-white mb-4 text-center">
                {feature.title}
              </h3>
              <p className="text-white/70 leading-relaxed text-center font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <h3 className="text-3xl font-light tracking-tighter text-white mb-6">
            Reliable Tech Solutions. Trusted Local Support.
          </h3>
          <a 
            href="#contact-form"
            className="neomorphic-btn inline-block px-8 py-4 text-lg"
          >
            <i className="ph ph-calendar mr-2"></i>
            Make An Appointment! ↓
          </a>
        </div>
      </div>
    </section>
  );
};
