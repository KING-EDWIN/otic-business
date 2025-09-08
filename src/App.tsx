import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContextClean";
import Index from "./pages/Index";
import SignIn from "./pages/SignInClean";
import SignUp from "./pages/SignUpClean";
import GetStarted from "./pages/GetStarted";
import CompleteProfile from "./pages/CompleteProfile";
import AIInsightsPage from "./pages/AIInsights";
import AIChat from "./pages/AIChat";
import Dashboard from "./pages/Dashboard";
import MainDashboard from "./pages/MainDashboard";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import Accounting from "./pages/Accounting";
import QuickBooksCallback from "./pages/QuickBooksCallback";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import AdminApp from "./AdminApp";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./components/OAuthCallback";

const queryClient = new QueryClient();

// Protected Route Component with manual email verification gate
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in → go to sign in
  if (!user) return <Navigate to="/signin" />;

  // Logged in but not yet admin-verified → block with friendly screen
  if (profile && profile.email_verified === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center space-y-4">
          <img src="/Otic icon@2x.png" alt="Otic Business Logo" className="h-12 w-12 mx-auto" />
          <h2 className="text-2xl font-bold text-[#040458]">Pending Admin Approval</h2>
          <p className="text-gray-600">
            Your account was created successfully, but it hasn’t been verified by an admin yet. 
            Once approved, you’ll be able to access the system.
          </p>
          <p className="text-sm text-gray-500">If you believe this is a mistake, please contact your administrator.</p>
          <a
            href="/signin"
            className="inline-flex items-center justify-center w-full rounded-lg bg-[#faa51a] text-white font-semibold py-2 hover:bg-[#040458] transition-colors"
          >
            Return to Sign In
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
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
        <BrowserRouter>
          <AuthProvider>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/ai-insights" element={<AIInsightsPage />} />
                <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
                <Route path="/quickbooks/callback" element={<QuickBooksCallback />} />
                <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
