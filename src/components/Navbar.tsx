import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, getDashboardRoute, loading } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const handleDashboardClick = () => {
    console.log('🔍 Navbar: Dashboard clicked, auth state:', { user: !!user, profile: !!profile, loading });
    
    // If still loading, wait a bit
    if (loading) {
      console.log('🔍 Navbar: Still loading, waiting...');
      setTimeout(() => {
        const dashboardRoute = getDashboardRoute();
        console.log('🔍 Navbar: Navigating to:', dashboardRoute);
        navigate(dashboardRoute);
      }, 500);
      return;
    }
    
    const dashboardRoute = getDashboardRoute();
    console.log('🔍 Navbar: Navigating to:', dashboardRoute);
    navigate(dashboardRoute);
  };

  const userInitial = (user?.email || "").trim().charAt(0).toUpperCase() || "U";

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white backdrop-blur-sm border-b border-[#040458]/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/Layer 2.png" 
              alt="Otic Business Logo" 
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-[#040458] hover:text-[#faa51a] transition-colors font-medium">
              Features
            </Link>
            <Link to="/pricing" className="text-[#040458] hover:text-[#faa51a] transition-colors font-medium">
              Pricing
            </Link>
            <Link to="/faq" className="text-[#040458] hover:text-[#faa51a] transition-colors font-medium">
              FAQ
            </Link>
            <Link to="/about" className="text-[#040458] hover:text-[#faa51a] transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-[#040458] hover:text-[#faa51a] transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={handleDashboardClick} className="text-[#040458] hover:text-[#faa51a]">
                  Dashboard
                </Button>
                <div className="relative" ref={userMenuRef}>
                  <button
                    aria-label="User menu"
                    className="h-9 w-9 rounded-full bg-[#040458] text-white flex items-center justify-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#faa51a]"
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                  >
                    {userInitial}
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
                      <div className="px-4 py-2">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-[#040458] truncate">{user.email}</p>
                      </div>
                      <div className="h-px bg-gray-200 my-2" />
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-[#040458] hover:bg-gray-50"
                        onClick={() => { setIsUserMenuOpen(false); handleDashboardClick(); }}
                      >
                        Dashboard
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        onClick={() => { setIsUserMenuOpen(false); signOut(); }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login-type')} className="text-[#040458] hover:text-[#faa51a]">
                  Sign In
                </Button>
                <Button variant="hero" onClick={() => navigate('/user-type')} className="bg-[#040458] hover:bg-[#faa51a] text-white">
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
              <Link to="/features" className="text-[#040458] hover:text-[#faa51a] px-4 py-2 transition-colors font-medium">
                Features
              </Link>
              <Link to="/pricing" className="text-[#040458] hover:text-[#faa51a] px-4 py-2 transition-colors font-medium">
                Pricing
              </Link>
              <Link to="/faq" className="text-[#040458] hover:text-[#faa51a] px-4 py-2 transition-colors font-medium">
                FAQ
              </Link>
              <Link to="/about" className="text-[#040458] hover:text-[#faa51a] px-4 py-2 transition-colors font-medium">
                About
              </Link>
              <Link to="/contact" className="text-[#040458] hover:text-[#faa51a] px-4 py-2 transition-colors font-medium">
                Contact
              </Link>
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Button variant="ghost" className="justify-start text-[#040458] hover:text-[#faa51a]" onClick={handleDashboardClick}>
                      Dashboard
                    </Button>
                    <div className="flex items-center space-x-3 py-2">
                      <div className="h-9 w-9 rounded-full bg-[#040458] text-white flex items-center justify-center font-semibold">
                        {userInitial}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#040458] truncate">{user.email}</p>
                        <Button variant="outline" className="mt-2 w-full border-[#040458] text-[#040458] hover:bg-[#040458] hover:text-white" onClick={signOut}>
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start text-[#040458] hover:text-[#faa51a]" onClick={() => navigate('/login-type')}>
                      Sign In
                    </Button>
                    <Button variant="hero" className="justify-start bg-[#040458] hover:bg-[#faa51a] text-white" onClick={() => navigate('/user-type')}>
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