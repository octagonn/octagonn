
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="relative py-16">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-md"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/ec3d1918-9de3-4b97-b9ca-ea9acffeb450.png" 
                alt="SpyderNet IT Logo" 
                className="w-10 h-10"
              />
              <div>
                <span className="text-xl font-light tracking-tighter text-white">SpyderNet</span>
                <span className="text-xl font-light tracking-tighter text-accent"> IT</span>
                <div className="text-xs text-white/60 font-light">Your IT Solutions Provider</div>
              </div>
            </div>
            <p className="text-white/70 mb-4 font-light">
              Your trusted IT solutions provider serving Orange County and surrounding areas.
            </p>
            <div className="text-sm text-white/50 font-light">
              © 2025 SpyderNet IT - All Rights Reserved
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-light tracking-tight text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-white/70 hover:text-accent transition-colors font-light">Home</Link></li>
              <li><Link to="/services" className="text-white/70 hover:text-accent transition-colors font-light">Services</Link></li>
              <li><Link to="/about" className="text-white/70 hover:text-accent transition-colors font-light">About</Link></li>
              <li><Link to="/contact" className="text-white/70 hover:text-accent transition-colors font-light">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-light tracking-tight text-white mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <i className="ph ph-phone text-accent mr-2"></i>
                <span className="text-white/70 font-light">(949) 237-2612</span>
              </li>
              <li className="flex items-center">
                <i className="ph ph-envelope text-accent mr-2"></i>
                <span className="text-white/70 font-light">spydernetit@gmail.com</span>
              </li>
              <li className="flex items-center">
                <i className="ph ph-map-pin text-accent mr-2"></i>
                <span className="text-white/70 font-light">Orange County, CA</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-lg font-light tracking-tight text-white mb-4">Business Hours</h3>
            <ul className="space-y-2 text-white/70 font-light">
              <li className="flex justify-between">
                <span>Mon-Fri:</span>
                <span>10AM–6PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span>11:30AM–4PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span>11:30AM–4PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 text-sm mb-4 md:mb-0 font-light">
              Professional IT services for homes and businesses
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-white/60 hover:text-accent text-sm transition-colors font-light">
                Privacy Policy
              </Link>
              <Link to="/terms-conditions" className="text-white/60 hover:text-accent text-sm transition-colors font-light">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
