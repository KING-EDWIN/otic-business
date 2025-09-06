import { Building2, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-secondary p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-secondary-foreground" />
              </div>
              <span className="text-2xl font-bold">Otic Business</span>
            </div>
            <p className="text-primary-foreground/80">
              Empowering African SMEs with AI-driven business automation and growth solutions.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#features" className="hover:text-secondary transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-secondary transition-colors">Pricing</a></li>
              <li><a href="#integrations" className="hover:text-secondary transition-colors">Integrations</a></li>
              <li><a href="#mobile-app" className="hover:text-secondary transition-colors">Mobile App</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#about" className="hover:text-secondary transition-colors">About Us</a></li>
              <li><a href="#careers" className="hover:text-secondary transition-colors">Careers</a></li>
              <li><a href="#blog" className="hover:text-secondary transition-colors">Blog</a></li>
              <li><a href="#contact" className="hover:text-secondary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3 text-primary-foreground/80">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-secondary" />
                <span>hello@oticbusiness.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-secondary" />
                <span>+256 700 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-secondary" />
                <span>Kampala, Uganda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60">
            © 2024 Otic Business Solution. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#privacy" className="text-primary-foreground/60 hover:text-secondary transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-primary-foreground/60 hover:text-secondary transition-colors">
              Terms of Service
            </a>
            <a href="#cookies" className="text-primary-foreground/60 hover:text-secondary transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;