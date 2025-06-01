
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const About = () => {
  const { ref, isVisible } = useScrollReveal();

  const features = [
    {
      icon: "💻",
      title: "Tech Expertise, Simplified",
      description: "We translate complex jargon into step-by-step guidance you can understand—and even teach you a trick or two along the way."
    },
    {
      icon: "❤️",
      title: "Genuine Care",
      description: "Every call is treated like work on our own devices. We listen first, explain every step, and follow up to make sure things stay running smoothly."
    },
    {
      icon: "🏙️",
      title: "Community Commitment",
      description: "As a local business, we're invested in our neighbors' success. Whether it's boosting your home Wi-Fi, removing stubborn malware, or setting up smart home devices, we deliver solutions built for your life and budget."
    }
  ];

  const whyChooseUs = [
    {
      icon: "🏆",
      title: "Experience",
      description: "Elite level experience with a focus on customer service and satisfaction."
    },
    {
      icon: "🎯",
      title: "Personalized",
      description: "Custom solutions tailored to your specific needs, not one-size-fits-all fixes."
    },
    {
      icon: "🔄",
      title: "Reliable",
      description: "Prompt, dependable service with clear communication every step of the way."
    },
    {
      icon: "💰",
      title: "Affordable",
      description: "Competitive pricing with no hidden fees or unnecessary upsells."
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
              <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-white mb-6">About Us</h1>
              <p className="text-xl text-white/80 font-light">
                Your friendly, hometown tech partner
              </p>
            </div>
          </div>
        </section>

        {/* Main About Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-transparent backdrop-blur-md"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-light tracking-tighter text-white mb-6">About Us</h2>
                <p className="text-lg text-white/80 leading-relaxed font-light">
                  SpyderNet IT is your friendly, hometown tech partner—run by a passionate computer science student who's spent years helping friends, family, and local businesses tackle their toughest tech challenges. We know how unsettling it can be when computers run slow, networks drop offline, or malware strikes, so our mission is simple: provide clear, honest, and reliable solutions that put you back in control.
                </p>
              </div>

              <div className="mb-16">
                <h3 className="text-2xl lg:text-3xl font-light tracking-tight text-white mb-8 text-center">What sets us apart?</h3>
                
                <div 
                  ref={ref}
                  className={`grid grid-cols-1 md:grid-cols-3 gap-8 scroll-reveal ${isVisible ? 'visible' : ''}`}
                >
                  {features.map((feature, index) => (
                    <div key={index} className="text-center glassmorphic rounded-xl p-6">
                      <div className="text-5xl mb-4">{feature.icon}</div>
                      <h4 className="text-xl font-light tracking-tight text-white mb-3">{feature.title}</h4>
                      <p className="text-white/80 leading-relaxed font-light">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glassmorphic rounded-xl p-8 text-center">
                <p className="text-lg text-white/80 leading-relaxed font-light">
                  At SpyderNet IT, you're never just a 'ticket number.' You're part of our community. Let us take the stress out of technology so you can focus on what matters most.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent backdrop-blur-xs"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-light tracking-tighter text-white mb-4">Why Choose Us</h2>
                <p className="text-xl text-white/80 font-light">
                  Experience the difference of working with a local IT partner who truly cares
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {whyChooseUs.map((item, index) => (
                  <div key={index} className="glassmorphic rounded-xl p-6 text-center hover:transform hover:-translate-y-2 transition-all duration-300">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-lg font-light tracking-tight text-white mb-3">{item.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed font-light">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-md"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-light tracking-tighter text-white mb-6">Our Mission</h2>
                  <p className="text-white/80 leading-relaxed mb-6 font-light">
                    To make technology accessible, understandable, and reliable for everyone in our community. We believe that technology should enhance your life, not complicate it.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                      <span className="text-white/80 font-light">Clear, jargon-free communication</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                      <span className="text-white/80 font-light">Honest, transparent pricing</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                      <span className="text-white/80 font-light">Long-term relationships over quick fixes</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                      <span className="text-white/80 font-light">Community-focused service</span>
                    </li>
                  </ul>
                </div>
                
                <div className="glassmorphic-dark rounded-xl p-8">
                  <h3 className="text-2xl font-light tracking-tight text-white mb-4">Local Expertise</h3>
                  <p className="text-white/80 mb-6 font-light">
                    Based in Orange County, we understand the unique technology needs of our local community. From small businesses to busy families, we're here to help.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-accent mr-2">✓</span>
                      <span className="text-white/80 font-light">Same-day service available</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-accent mr-2">✓</span>
                      <span className="text-white/80 font-light">Remote support nationwide</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-accent mr-2">✓</span>
                      <span className="text-white/80 font-light">Emergency support available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-md"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl lg:text-4xl font-light tracking-tighter text-white mb-4">Ready to Experience the Difference?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto font-light">
              Let us show you what it's like to work with an IT partner who truly cares about your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="neomorphic-btn text-lg px-8 py-4">
                <Link to="/contact">Get Started Today</Link>
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

export default About;
