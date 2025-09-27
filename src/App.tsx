import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BusinessManagementProvider } from "@/contexts/BusinessManagementContext";
import VerifiedRoute from "@/components/VerifiedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import CacheService from "@/services/cacheService";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import GetStarted from "./pages/GetStarted";
import CompleteProfile from "./pages/CompleteProfile";
import AIInsightsPage from "./pages/AIInsights";
import AIChat from "./pages/AIChat";
import Dashboard from "./pages/Dashboard";
import MainDashboard from "./pages/MainDashboard";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import CommodityRegistration from "./pages/CommodityRegistration";
import Analytics from "./pages/Analytics";
import Accounting from "./pages/AccountingNew";
import QuickBooksCallback from "./pages/QuickBooksCallback";
import GoogleCallback from "./pages/GoogleCallback";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import SimpleTest from "./pages/SimpleTest";
import ProfileTest from "./pages/ProfileTest";
import AdminApp from "./AdminApp";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ContactManagement from "./pages/ContactManagement";
import BusinessManagement from "./pages/BusinessManagement";
import BusinessMembers from "./pages/BusinessMembers";
import CreateBusiness from "./pages/CreateBusiness";
import Invoices from "./pages/Invoices";
import EmailVerification from "./pages/EmailVerification";
import PasswordReset from "./pages/PasswordReset";
import EmailTest from "./pages/EmailTest";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import UserTypeSelection from "./pages/UserTypeSelection";
import BusinessSignup from "./pages/BusinessSignup";
import IndividualSignup from "./pages/IndividualSignup";
import PaymentSuccess from "./pages/PaymentSuccess";
import MyExtras from "./pages/MyExtras";
import FAQ from "./pages/FAQ";
import TrialConfirmation from "./pages/TrialConfirmation";
import TierSelection from "./pages/TierSelection";
import TierGuide from "./pages/TierGuide";
import IndividualDashboard from "./pages/IndividualDashboard";
import IndividualSettings from "./pages/IndividualSettings";
import LoginTypeSelection from "./pages/LoginTypeSelection";
import BusinessSignIn from "./pages/BusinessSignIn";
import IndividualSignIn from "./pages/IndividualSignIn";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./components/OAuthCallback";
import ResetPassword from "./pages/ResetPassword";
// Branch Management Components
import MultiBranchManagement from "./pages/MultiBranchManagement";
import BranchAnalytics from "./pages/BranchAnalytics";
import BranchAccounting from "./pages/BranchAccounting";
import BranchSales from "./pages/BranchSales";
import BranchStaff from "./pages/BranchStaff";
import BranchInventory from "./pages/BranchInventory";
import BranchAIInsights from "./pages/BranchAIInsights";
import Notifications from "./pages/Notifications";
import OTICVision from "./pages/OTICVision";
import Restock from "./pages/Restock";
import StorageTest from "./pages/StorageTest";
import MultiBusinessTest from "./pages/MultiBusinessTest";
import BusinessPOSForIndividual from "./pages/BusinessPOSForIndividual";
import TimeTracking from "./pages/TimeTracking";
import TaskManagement from "./pages/TaskManagement";
import WorkReports from "./pages/WorkReports";
import CacheTest from "./pages/CacheTest";
import SystemHealthTest from "./pages/SystemHealthTest";

// Create QueryClient with professional cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default cache settings
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes (renamed from cacheTime in newer versions)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Always refetch on component mount
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Initialize cache service
CacheService.initialize(queryClient);

// Protected Route Component with manual email verification gate
// Individual Protected Route
const IndividualProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !profile || profile.user_type !== 'individual') {
    return <Navigate to="/individual-signin" />;
  }

  return <>{children}</>;
};

// Business Protected Route
const BusinessProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !profile || profile.user_type !== 'business') {
    return <Navigate to="/business-signin" />;
  }

  return <>{children}</>;
};

// Public Route Component - simplified for now
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
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
                <Route path="/business-signup" element={<PublicRoute><BusinessSignup /></PublicRoute>} />
                <Route path="/individual-signup" element={<PublicRoute><IndividualSignup /></PublicRoute>} />
                <Route path="/trial-confirmation" element={<TrialConfirmation />} />
                <Route path="/tier-selection" element={<TierSelection />} />
                <Route path="/tier-guide" element={<TierGuide />} />
                <Route path="/individual-dashboard" element={<IndividualProtectedRoute><IndividualDashboard /></IndividualProtectedRoute>} />
                <Route path="/individual-settings" element={<IndividualProtectedRoute><IndividualSettings /></IndividualProtectedRoute>} />
                <Route path="/time-tracking" element={<IndividualProtectedRoute><TimeTracking /></IndividualProtectedRoute>} />
                <Route path="/tasks" element={<IndividualProtectedRoute><TaskManagement /></IndividualProtectedRoute>} />
                <Route path="/reports" element={<IndividualProtectedRoute><WorkReports /></IndividualProtectedRoute>} />
                <Route path="/login-type" element={<LoginTypeSelection />} />
                <Route path="/business-signin" element={<PublicRoute><BusinessSignIn /></PublicRoute>} />
                <Route path="/individual-signin" element={<PublicRoute><IndividualSignIn /></PublicRoute>} />
                <Route path="/payments/success" element={<PaymentSuccess />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/oauth-callback" element={<OAuthCallback />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/ai-insights" element={<AIInsightsPage />} />
                <Route path="/ai-chat" element={<BusinessProtectedRoute><AIChat /></BusinessProtectedRoute>} />
                <Route path="/dashboard" element={<BusinessProtectedRoute><Dashboard /></BusinessProtectedRoute>} />
                <Route path="/my-extras" element={<BusinessProtectedRoute><MyExtras /></BusinessProtectedRoute>} />
                <Route path="/simple-dashboard" element={<BusinessProtectedRoute><Dashboard /></BusinessProtectedRoute>} />
                <Route path="/pos" element={<BusinessProtectedRoute><VerifiedRoute><POS /></VerifiedRoute></BusinessProtectedRoute>} />
                <Route path="/inventory" element={<BusinessProtectedRoute><VerifiedRoute><Inventory /></VerifiedRoute></BusinessProtectedRoute>} />
                <Route path="/commodity-registration" element={<BusinessProtectedRoute><VerifiedRoute><CommodityRegistration /></VerifiedRoute></BusinessProtectedRoute>} />
                <Route path="/analytics" element={<BusinessProtectedRoute><VerifiedRoute><Analytics /></VerifiedRoute></BusinessProtectedRoute>} />
                <Route path="/accounting" element={<BusinessProtectedRoute><VerifiedRoute><Accounting /></VerifiedRoute></BusinessProtectedRoute>} />
                <Route path="/quickbooks/callback" element={<QuickBooksCallback />} />
                <Route path="/auth/google-callback" element={<GoogleCallback />} />
                <Route path="/payments" element={<BusinessProtectedRoute><VerifiedRoute><Payments /></VerifiedRoute></BusinessProtectedRoute>} />
                <Route path="/customers" element={<BusinessProtectedRoute><VerifiedRoute><Customers /></VerifiedRoute></BusinessProtectedRoute>} />
                <Route path="/reports" element={<BusinessProtectedRoute><VerifiedRoute><Reports /></VerifiedRoute></BusinessProtectedRoute>} />
                <Route path="/settings" element={<BusinessProtectedRoute><VerifiedRoute><Settings /></VerifiedRoute></BusinessProtectedRoute>} />
                <Route path="/notifications" element={<BusinessProtectedRoute><Notifications /></BusinessProtectedRoute>} />
                <Route path="/otic-vision" element={<BusinessProtectedRoute><OTICVision /></BusinessProtectedRoute>} />
                <Route path="/restock" element={<BusinessProtectedRoute><Restock /></BusinessProtectedRoute>} />
                <Route path="/storage-test" element={<StorageTest />} />
                <Route path="/business-management" element={<BusinessProtectedRoute><BusinessManagement /></BusinessProtectedRoute>} />
                <Route path="/business-management/create" element={<BusinessProtectedRoute><CreateBusiness /></BusinessProtectedRoute>} />
                <Route path="/business-management/:businessId/members" element={<BusinessProtectedRoute><BusinessMembers /></BusinessProtectedRoute>} />
                <Route path="/invoices" element={<BusinessProtectedRoute><Invoices /></BusinessProtectedRoute>} />
                {/* Email Verification and Password Reset Routes */}
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/reset-password" element={<PasswordReset />} />
                <Route path="/email-test" element={<EmailTest />} />
                {/* Branch Management Routes */}
                <Route path="/multi-branch-management" element={<BusinessProtectedRoute><MultiBranchManagement /></BusinessProtectedRoute>} />
                <Route path="/branch/:branchId/analytics" element={<BusinessProtectedRoute><BranchAnalytics /></BusinessProtectedRoute>} />
                <Route path="/branch/:branchId/accounting" element={<BusinessProtectedRoute><BranchAccounting /></BusinessProtectedRoute>} />
                <Route path="/branch/:branchId/sales" element={<BusinessProtectedRoute><BranchSales /></BusinessProtectedRoute>} />
                <Route path="/branch/:branchId/staff" element={<BusinessProtectedRoute><BranchStaff /></BusinessProtectedRoute>} />
                <Route path="/branch/:branchId/inventory" element={<BusinessProtectedRoute><BranchInventory /></BusinessProtectedRoute>} />
                <Route path="/branch/:branchId/ai-insights" element={<BusinessProtectedRoute><BranchAIInsights /></BusinessProtectedRoute>} />
                <Route path="/simple-test" element={<SimpleTest />} />
                <Route path="/profile-test" element={<ProfileTest />} />
                <Route path="/multi-business-test" element={<BusinessProtectedRoute><MultiBusinessTest /></BusinessProtectedRoute>} />
                <Route path="/cache-test" element={<CacheTest />} />
                <Route path="/system-health-test" element={<SystemHealthTest />} />
                
                {/* Individual Business Access Routes */}
                <Route path="/business/:businessId/pos" element={<IndividualProtectedRoute><BusinessPOSForIndividual /></IndividualProtectedRoute>} />
                <Route path="/business/:businessId/inventory" element={<IndividualProtectedRoute><BusinessPOSForIndividual /></IndividualProtectedRoute>} />
                <Route path="/business/:businessId/accounting" element={<IndividualProtectedRoute><BusinessPOSForIndividual /></IndividualProtectedRoute>} />
                <Route path="/business/:businessId/payments" element={<IndividualProtectedRoute><BusinessPOSForIndividual /></IndividualProtectedRoute>} />
                <Route path="/business/:businessId/customers" element={<IndividualProtectedRoute><BusinessPOSForIndividual /></IndividualProtectedRoute>} />
                <Route path="/business/:businessId/dashboard" element={<IndividualProtectedRoute><BusinessPOSForIndividual /></IndividualProtectedRoute>} />
                
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
