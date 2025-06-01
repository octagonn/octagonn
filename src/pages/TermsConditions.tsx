
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TermsConditions = () => {
  const { ref, isVisible } = useScrollReveal();

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
              <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-white mb-6">Terms & Conditions</h1>
              <p className="text-xl text-white/80 font-light">
                Our terms of service and conditions
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-transparent backdrop-blur-md"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div 
              ref={ref}
              className={`max-w-4xl mx-auto glassmorphic rounded-xl p-8 scroll-reveal ${isVisible ? 'visible' : ''}`}
            >
              <div className="prose prose-invert max-w-none">
                <p className="text-white/80 font-light mb-6">
                  <strong>Last updated:</strong> January 1, 2025
                </p>
                
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Acceptance of Terms</h2>
                    <p className="text-white/80 font-light">
                      By using SpyderNet IT services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Services</h2>
                    <p className="text-white/80 font-light mb-4">
                      SpyderNet IT provides IT support services including but not limited to:
                    </p>
                    <ul className="space-y-2 text-white/80 font-light">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Computer repair and troubleshooting</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Network setup and configuration</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Malware removal and system security</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>AI consulting and training</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Smart home installation and support</span>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Service Hours</h2>
                    <p className="text-white/80 font-light mb-4">
                      Our standard business hours are:
                    </p>
                    <ul className="space-y-2 text-white/80 font-light">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Monday - Friday: 10:00 AM - 6:00 PM</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Saturday - Sunday: 11:30 AM - 4:00 PM</span>
                      </li>
                    </ul>
                    <p className="text-white/80 font-light mt-4">
                      Emergency support may be available outside these hours for urgent issues.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Payment Terms</h2>
                    <ul className="space-y-2 text-white/80 font-light">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Payment is due upon completion of services unless other arrangements have been made</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>We accept cash, check, and major credit cards</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Estimates are provided free of charge</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>No hidden fees or unexpected charges</span>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Warranties and Disclaimers</h2>
                    <p className="text-white/80 font-light mb-4">
                      We stand behind our work with the following guarantees:
                    </p>
                    <ul className="space-y-2 text-white/80 font-light">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>30-day warranty on repair services</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Follow-up support included for consulting services</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>We are not responsible for data loss due to hardware failure</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Regular data backups are recommended and available upon request</span>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Limitation of Liability</h2>
                    <p className="text-white/80 font-light">
                      SpyderNet IT's liability is limited to the cost of the services provided. We are not liable for indirect, incidental, or consequential damages. We recommend maintaining regular backups of important data.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Privacy and Confidentiality</h2>
                    <p className="text-white/80 font-light">
                      We respect your privacy and maintain strict confidentiality of your data and systems. Please refer to our Privacy Policy for detailed information about how we handle your personal information.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Termination</h2>
                    <p className="text-white/80 font-light">
                      Either party may terminate services at any time with reasonable notice. Payment for completed work is due upon termination.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Contact Information</h2>
                    <p className="text-white/80 font-light">
                      For questions about these Terms and Conditions, please contact us:
                    </p>
                    <div className="mt-4 text-white/80 font-light">
                      <p>Email: <a href="mailto:spydernetit@gmail.com" className="text-accent hover:text-accent/80 transition-colors">spydernetit@gmail.com</a></p>
                      <p>Phone: <a href="tel:(949) 237-2612" className="text-accent hover:text-accent/80 transition-colors">(949) 237-2612</a></p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default TermsConditions;
