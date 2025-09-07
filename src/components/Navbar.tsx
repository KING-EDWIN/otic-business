import { Button } from "@/components/ui/button";
import { Menu, X, Building2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white backdrop-blur-sm border-b border-[#040458]/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/Otic icon@2x.png" 
              alt="Otic Business Logo" 
              className="h-10 w-10"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#040458]">Otic</span>
              <span className="text-sm text-[#faa51a] -mt-1">Business</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-[#040458] hover:text-[#faa51a] transition-colors font-medium">
              Features
            </a>
            <a href="#pricing" className="text-[#040458] hover:text-[#faa51a] transition-colors font-medium">
              Pricing
            </a>
            <a href="#about" className="text-[#040458] hover:text-[#faa51a] transition-colors font-medium">
              About
            </a>
            <a href="#contact" className="text-[#040458] hover:text-[#faa51a] transition-colors font-medium">
              Contact
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-[#040458] hover:text-[#faa51a]">
                  Dashboard
                </Button>
                <Button variant="outline" onClick={signOut} className="border-[#040458] text-[#040458] hover:bg-[#040458] hover:text-white">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/signin')} className="text-[#040458] hover:text-[#faa51a]">
                  Sign In
                </Button>
                <Button variant="hero" onClick={() => navigate('/signup')} className="bg-[#040458] hover:bg-[#faa51a] text-white">
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-[#040458]" />
            ) : (
              <Menu className="h-6 w-6 text-[#040458]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-[#040458] hover:text-[#faa51a] px-4 py-2 transition-colors font-medium">
                Features
              </a>
              <a href="#pricing" className="text-[#040458] hover:text-[#faa51a] px-4 py-2 transition-colors font-medium">
                Pricing
              </a>
              <a href="#about" className="text-[#040458] hover:text-[#faa51a] px-4 py-2 transition-colors font-medium">
                About
              </a>
              <a href="#contact" className="text-[#040458] hover:text-[#faa51a] px-4 py-2 transition-colors font-medium">
                Contact
              </a>
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Button variant="ghost" className="justify-start text-[#040458] hover:text-[#faa51a]" onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </Button>
                    <Button variant="outline" className="justify-start border-[#040458] text-[#040458] hover:bg-[#040458] hover:text-white" onClick={signOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start text-[#040458] hover:text-[#faa51a]" onClick={() => navigate('/signin')}>
                      Sign In
                    </Button>
                    <Button variant="hero" className="justify-start bg-[#040458] hover:bg-[#faa51a] text-white" onClick={() => navigate('/signup')}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;