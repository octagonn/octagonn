
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const PrivacyPolicy = () => {
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
              <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-white mb-6">Privacy Policy</h1>
              <p className="text-xl text-white/80 font-light">
                Your privacy is important to us
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
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Information We Collect</h2>
                    <p className="text-white/80 font-light mb-4">
                      When you use our services, we may collect the following types of information:
                    </p>
                    <ul className="space-y-2 text-white/80 font-light">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span><strong>Contact Information:</strong> Name, email address, phone number, and address when you request services or contact us.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span><strong>Technical Information:</strong> Details about your devices and systems necessary to provide IT support and troubleshooting services.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span><strong>Service Information:</strong> Details about the services you request and our interactions with you.</span>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">How We Use Your Information</h2>
                    <p className="text-white/80 font-light mb-4">
                      We use the information we collect to:
                    </p>
                    <ul className="space-y-2 text-white/80 font-light">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Provide, maintain, and improve our IT services</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Communicate with you about our services</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Respond to your requests and provide customer support</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Send you important updates about our services</span>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Information Sharing</h2>
                    <p className="text-white/80 font-light mb-4">
                      We do not sell, trade, or otherwise transfer your personal information to third parties. We may share information only in the following circumstances:
                    </p>
                    <ul className="space-y-2 text-white/80 font-light">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>With your explicit consent</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>When required by law or to protect our rights</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>With trusted service providers who assist us in operating our business</span>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Data Security</h2>
                    <p className="text-white/80 font-light">
                      We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Your Rights</h2>
                    <p className="text-white/80 font-light mb-4">
                      You have the right to:
                    </p>
                    <ul className="space-y-2 text-white/80 font-light">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Access the personal information we hold about you</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Request correction of inaccurate information</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Request deletion of your personal information</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>Opt out of marketing communications</span>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-4">Contact Us</h2>
                    <p className="text-white/80 font-light">
                      If you have any questions about this Privacy Policy or our data practices, please contact us:
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

export default PrivacyPolicy;
