
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="glassmorphic border-b border-white/10 text-white py-2 px-4 relative z-50">
        <div className="container mx-auto flex justify-between items-center text-sm font-light">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <i className="ph ph-phone mr-1"></i>
              <span>(949) 237-2612</span>
            </div>
            <div className="flex items-center">
              <i className="ph ph-envelope mr-1"></i>
              <span>spydernetit@gmail.com</span>
            </div>
          </div>
          <div className="hidden md:block">
            <span>Serving Orange County & Surrounding Areas</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="glassmorphic border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
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
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-light transition-colors ${
                    isActive(item.path)
                      ? "text-accent"
                      : "text-white/80 hover:text-accent"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Button asChild className="neomorphic-btn">
                <Link to="/contact">Get Help Today</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <i className="ph ph-x text-xl"></i> : <i className="ph ph-list text-xl"></i>}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block py-2 font-light transition-colors ${
                    isActive(item.path)
                      ? "text-accent"
                      : "text-white/80 hover:text-accent"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button asChild className="w-full mt-4 neomorphic-btn">
                <Link to="/contact" onClick={() => setIsOpen(false)}>
                  Get Help Today
                </Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
