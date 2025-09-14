import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BusinessManagementProvider } from "@/contexts/BusinessManagementContext";
import "@/utils/errorHandler";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import SignIn from "./pages/SignInClean";
import SignUp from "./pages/SignUpClean";
import GetStarted from "./pages/GetStarted";
import CompleteProfile from "./pages/CompleteProfile";
import AIInsightsPage from "./pages/AIInsights";
import AIChat from "./pages/AIChat";
import Dashboard from "./pages/Dashboard";
import MainDashboard from "./pages/MainDashboard";
import POS from "./pages/POS";
import Inventory from "./pages/ComprehensiveInventory";
import CommodityRegistration from "./pages/CommodityRegistration";
import Restock from "./pages/Restock";
import Analytics from "./pages/Analytics";
import Accounting from "./pages/AccountingNew";
import QuickBooksCallback from "./pages/QuickBooksCallback";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import TestAuth from "./pages/TestAuth";
import SimpleTest from "./pages/SimpleTest";
import AuthTest from "./pages/AuthTest";
import ProfileTest from "./pages/ProfileTest";
import AdminApp from "./AdminApp";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import UserTypeSelection from "./pages/UserTypeSelection";
import BusinessSignup from "./pages/BusinessSignup";
import IndividualSignup from "./pages/IndividualSignup";
import MyExtras from "./pages/MyExtras";
import FAQ from "./pages/FAQ";
import TrialConfirmation from "./pages/TrialConfirmation";
import TierSelection from "./pages/TierSelection";
import TierGuide from "./pages/TierGuide";
import IndividualDashboard from "./pages/IndividualDashboard";
import IndividualSettings from "./pages/IndividualSettings";
import BusinessDashboardForIndividual from "./pages/BusinessDashboardForIndividual";
import LoginTypeSelection from "./pages/LoginTypeSelection";
import BusinessSignIn from "./pages/BusinessSignIn";
import IndividualSignIn from "./pages/IndividualSignIn";
import BusinessManagement from "./pages/BusinessManagement";
import CreateBusiness from "./pages/CreateBusiness";
import BusinessMembers from "./pages/BusinessMembers";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessInvitationManager from "./components/BusinessInvitationManager";
import NetworkStatusIndicator from "./components/NetworkStatusIndicator";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./components/OAuthCallback";

const queryClient = new QueryClient();

// Protected Route Component with manual email verification gate
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();

  console.log('ProtectedRoute: user:', user?.id, 'loading:', loading, 'profile:', profile);

  if (loading) {
    console.log('ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in → go to sign in
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to /login-type');
    return <Navigate to="/login-type" />;
  }

  // Logged in but not yet admin-verified → block with friendly screen
  if (profile && profile.email_verified === false) {
    console.log('ProtectedRoute: Email not verified, showing approval screen');
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center space-y-4">
          <img src="/Otic icon@2x.png" alt="Otic Business Logo" className="h-12 w-12 mx-auto" />
          <h2 className="text-2xl font-bold text-[#040458]">Pending Admin Approval</h2>
          <p className="text-gray-600">
            Your account was created successfully, but it hasn't been verified by an admin yet. 
            Once approved, you'll be able to access the system.
          </p>
          <p className="text-sm text-gray-500">If you believe this is a mistake, please contact your administrator.</p>
          <a
            href="/login-type"
            className="inline-flex items-center justify-center w-full rounded-lg bg-[#faa51a] text-white font-semibold py-2 hover:bg-[#040458] transition-colors"
          >
            Return to Sign In
          </a>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute: Access granted, rendering children');
  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    // Check user type and redirect accordingly
    if (profile) {
      if (profile.user_type === 'individual') {
        return <Navigate to="/individual-dashboard" />;
      } else {
        return <Navigate to="/dashboard" />;
      }
    }
    // If no profile yet, redirect to dashboard (will be handled by AuthContext)
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Check if we're on the admin route
  if (window.location.pathname.startsWith('/internal-admin-portal')) {
    return <AdminApp />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AuthProvider>
            <BusinessManagementProvider>
              <NetworkStatusIndicator />
                <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/user-type" element={<UserTypeSelection />} />
                <Route path="/business-signup" element={<BusinessSignup />} />
                <Route path="/individual-signup" element={<IndividualSignup />} />
                <Route path="/trial-confirmation" element={<TrialConfirmation />} />
                <Route path="/tier-selection" element={<TierSelection />} />
                <Route path="/tier-guide" element={<TierGuide />} />
                <Route path="/individual-dashboard" element={<ProtectedRoute><IndividualDashboard /></ProtectedRoute>} />
                <Route path="/individual-settings" element={<ProtectedRoute><IndividualSettings /></ProtectedRoute>} />
                <Route path="/business-dashboard/:businessId" element={<ProtectedRoute><BusinessDashboardForIndividual /></ProtectedRoute>} />
                <Route path="/login-type" element={<LoginTypeSelection />} />
                <Route path="/business-signin" element={<PublicRoute><BusinessSignIn /></PublicRoute>} />
                <Route path="/individual-signin" element={<PublicRoute><IndividualSignIn /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/ai-insights" element={<AIInsightsPage />} />
                <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/my-extras" element={<ProtectedRoute><MyExtras /></ProtectedRoute>} />
                <Route path="/simple-dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                <Route path="/commodity-registration" element={<ProtectedRoute><CommodityRegistration /></ProtectedRoute>} />
                <Route path="/restock" element={<ProtectedRoute><Restock /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
                <Route path="/quickbooks/callback" element={<QuickBooksCallback />} />
                <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/business-management" element={<ProtectedRoute><BusinessManagement /></ProtectedRoute>} />
                <Route path="/business-management/create" element={<ProtectedRoute><CreateBusiness /></ProtectedRoute>} />
                <Route path="/business-management/:businessId" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
                <Route path="/business-management/:businessId/dashboard" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
                <Route path="/business-management/:businessId/members" element={<ProtectedRoute><BusinessMembers /></ProtectedRoute>} />
                <Route path="/business-management/:businessId/invitations" element={<ProtectedRoute><BusinessInvitationManager /></ProtectedRoute>} />
                <Route path="/test-auth" element={<TestAuth />} />
                <Route path="/simple-test" element={<SimpleTest />} />
                <Route path="/auth-test" element={<AuthTest />} />
                <Route path="/profile-test" element={<ProfileTest />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BusinessManagementProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
