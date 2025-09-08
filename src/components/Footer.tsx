import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#040458] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-10 w-10"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">Otic</span>
                <span className="text-sm text-[#faa51a] -mt-1">Business</span>
              </div>
            </div>
            <p className="text-white/80">
              Empowering African businesses with AI-driven business automation and growth solutions.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Product</h3>
            <ul className="space-y-2 text-white/80">
              <li><a href="#features" className="hover:text-[#faa51a] transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-[#faa51a] transition-colors">Pricing</a></li>
              <li><a href="#integrations" className="hover:text-[#faa51a] transition-colors">Integrations</a></li>
              <li><a href="#mobile-app" className="hover:text-[#faa51a] transition-colors">Mobile App</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Company</h3>
            <ul className="space-y-2 text-white/80">
              <li><Link to="/about" className="hover:text-[#faa51a] transition-colors">About Us</Link></li>
              <li><a href="#careers" className="hover:text-[#faa51a] transition-colors">Careers</a></li>
              <li><a href="#blog" className="hover:text-[#faa51a] transition-colors">Blog</a></li>
              <li><a href="#contact" className="hover:text-[#faa51a] transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <div className="space-y-3 text-white/80">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#faa51a]" />
                <span>hello@oticbusiness.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#faa51a]" />
                <span>+256 700 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-[#faa51a]" />
                <span>Kampala, Uganda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60">
            © 2024 Otic Business Solution. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-white/60 hover:text-[#faa51a] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/60 hover:text-[#faa51a] transition-colors">
              Terms of Service
            </Link>
            <a href="#cookies" className="text-white/60 hover:text-[#faa51a] transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;