import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Building2, 
  BarChart3, 
  Users, 
  Settings, 
  Zap, 
  Shield, 
  Globe, 
  CreditCard, 
  FileText,
  Smartphone,
  Package,
  Calculator,
  TrendingUp,
  Brain,
  Lock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessManagement } from '@/contexts/BusinessManagementContext';
import { toast } from 'sonner';

interface TierFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'core' | 'analytics' | 'integration' | 'support' | 'system';
  availableIn: string[];
  isPremium: boolean;
  action?: () => void;
  showCondition?: () => boolean;
}

const MyExtras = () => {
  const { user, profile } = useAuth();
  const { currentBusiness, businesses: userBusinesses, canCreateBusiness } = useBusinessManagement();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('features');
  
  // Safely get business management context
  let businesses = []
  try {
    const businessContext = useBusinessManagement()
    businesses = businessContext.businesses
  } catch (error) {
    console.log('BusinessManagementProvider not available, using empty array')
  }

  // Define all features with their tier availability
  const allFeatures: TierFeature[] = [
    // Core Features
    {
      id: 'pos_system',
      name: 'POS System',
      description: 'Point of Sale system with barcode scanning',
      icon: <Smartphone className="h-6 w-6" />,
      category: 'core',
      availableIn: ['free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: false,
      action: () => navigate('/pos')
    },
    {
      id: 'inventory_management',
      name: 'Inventory Management',
      description: 'Complete inventory management system',
      icon: <Package className="h-6 w-6" />,
      category: 'core',
      availableIn: ['free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: false,
      action: () => navigate('/inventory')
    },
    {
      id: 'sales_reporting',
      name: 'Sales Reporting',
      description: 'Daily, weekly, monthly sales reports',
      icon: <BarChart3 className="h-6 w-6" />,
      category: 'core',
      availableIn: ['start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/reports')
    },
    {
      id: 'receipt_generation',
      name: 'Receipt Generation',
      description: 'Generate and print receipts',
      icon: <FileText className="h-6 w-6" />,
      category: 'core',
      availableIn: ['start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/pos')
    },
    {
      id: 'csv_pdf_exports',
      name: 'Data Export',
      description: 'Export data in CSV and PDF formats',
      icon: <FileText className="h-6 w-6" />,
      category: 'core',
      availableIn: ['start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/reports')
    },

    // Analytics Features
    {
      id: 'ai_analytics',
      name: 'AI Analytics',
      description: 'AI-powered analytics and insights',
      icon: <Brain className="h-6 w-6" />,
      category: 'analytics',
      availableIn: ['free_trial', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/analytics')
    },
    {
      id: 'ai_sales_trends',
      name: 'AI Sales Trends',
      description: 'AI sales trend analytics',
      icon: <TrendingUp className="h-6 w-6" />,
      category: 'analytics',
      availableIn: ['grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/analytics')
    },
    {
      id: 'ai_forecasting',
      name: 'AI Forecasting',
      description: 'AI financial forecasting',
      icon: <TrendingUp className="h-6 w-6" />,
      category: 'analytics',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/analytics')
    },
    {
      id: 'financial_reports',
      name: 'Financial Reports',
      description: 'Automated financial reports',
      icon: <BarChart3 className="h-6 w-6" />,
      category: 'analytics',
      availableIn: ['grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/reports')
    },
    {
      id: 'tax_computation',
      name: 'Tax Computation',
      description: 'Tax computation and VAT analysis',
      icon: <Calculator className="h-6 w-6" />,
      category: 'analytics',
      availableIn: ['grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/accounting')
    },
    {
      id: 'compliance_reporting',
      name: 'Compliance Reporting',
      description: 'Advanced compliance reporting',
      icon: <Shield className="h-6 w-6" />,
      category: 'analytics',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/accounting')
    },

    // Integration Features
    {
      id: 'multi_branch_management',
      name: 'Multi-Branch Management',
      description: 'Manage multiple business locations and branches',
      icon: <Building2 className="h-6 w-6" />,
      category: 'system',
      availableIn: ['grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/multi-branch-management'),
      showCondition: () => (profile as any)?.features_enabled?.multi_branch === true
    },
    {
      id: 'multi_branch_sync',
      name: 'Multi-Branch Sync',
      description: 'Multi-branch synchronization',
      icon: <Globe className="h-6 w-6" />,
      category: 'integration',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/settings')
    },
    {
      id: 'third_party_apis',
      name: 'Third-Party APIs',
      description: 'Third-party API integrations',
      icon: <Zap className="h-6 w-6" />,
      category: 'integration',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/settings')
    },

    // System Features
    {
      id: 'multi_user_access',
      name: 'Multi-User Access',
      description: 'Invite individual users to access your business dashboard',
      icon: <Users className="h-6 w-6" />,
      category: 'system',
      availableIn: ['free_trial', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => {
        // Check if user has businesses, if not go to business management first
        if (businesses.length === 0) {
          navigate('/business-management')
        } else if (currentBusiness) {
          navigate(`/business-management/${currentBusiness.id}/members`)
        } else {
          navigate('/business-management')
        }
      }
    },
    {
      id: 'role_based_permissions',
      name: 'Role-Based Permissions',
      description: 'User roles and permission management',
      icon: <Shield className="h-6 w-6" />,
      category: 'system',
      availableIn: ['grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/settings')
    },
    {
      id: 'multi_business_management',
      name: 'Multi-Business Management',
      description: 'Create and manage multiple businesses',
      icon: <Building2 className="h-6 w-6" />,
      category: 'system',
      availableIn: ['start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/business-management'),
      // Only show if user has more than one business or can create more
      showCondition: () => businesses.length > 1 || canCreateBusiness
    },
    {
      id: 'audit_logs',
      name: 'Audit Logs',
      description: 'Audit logs and advanced permissions',
      icon: <Shield className="h-6 w-6" />,
      category: 'system',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/settings')
    },

    // Support Features
    {
      id: 'email_support',
      name: 'Email Support',
      description: 'Email support',
      icon: <FileText className="h-6 w-6" />,
      category: 'support',
      availableIn: ['start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: false,
      action: () => navigate('/contact')
    },
    {
      id: 'priority_support',
      name: 'Priority Support',
      description: 'Priority support during trial',
      icon: <Zap className="h-6 w-6" />,
      category: 'support',
      availableIn: ['free_trial', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: false,
      action: () => navigate('/contact')
    },
    {
      id: 'dedicated_manager',
      name: 'Dedicated Manager',
      description: 'Dedicated account manager',
      icon: <Users className="h-6 w-6" />,
      category: 'support',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/contact')
    },
    {
      id: 'phone_support',
      name: '24/7 Phone Support',
      description: '24/7 phone support',
      icon: <CreditCard className="h-6 w-6" />,
      category: 'support',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/contact')
    }
  ];

  const currentTier = (profile?.tier as 'free_trial' | 'start_smart' | 'grow_intelligence' | 'enterprise_advantage') || 'free_trial';
  const userFeatures = allFeatures.filter(feature => 
    feature.availableIn.includes(currentTier) && 
    (!feature.showCondition || feature.showCondition())
  );
  const lockedFeatures = allFeatures.filter(feature => 
    !feature.availableIn.includes(currentTier) ||
    (feature.showCondition && !feature.showCondition())
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free_trial': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'standard': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'start_smart': return 'bg-green-100 text-green-800';
      case 'grow_intelligence': return 'bg-purple-100 text-purple-800';
      case 'enterprise_advantage': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'free_trial': return 'Free Trial';
      case 'start_smart': return 'Start Smart';
      case 'grow_intelligence': return 'Grow with Intelligence';
      case 'enterprise_advantage': return 'Enterprise Advantage';
      default: return 'Unknown';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'analytics': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'integration': return 'bg-green-50 border-green-200 text-green-800';
      case 'system': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'support': return 'bg-gray-50 border-gray-200 text-gray-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <img 
                  src="/ otic Vision blue.png" 
                  alt="Otic Vision Logo" 
                  className="h-10 w-10 object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-[#040458]">Otic</span>
                  <span className="text-sm text-[#faa51a] -mt-1">Business</span>
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-2 ml-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#040458] hover:border-[#040458]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#040458] hover:border-[#040458]"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className={`${getTierColor(currentTier)} px-3 py-1`}>
                {getTierDisplayName(currentTier)}
              </Badge>
              {currentTier !== 'enterprise_advantage' && (
                <Button 
                  onClick={handleUpgrade}
                  className="bg-[#faa51a] hover:bg-[#040458] text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden space-y-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <img 
                  src="/ otic Vision blue.png" 
                  alt="Otic Vision Logo" 
                  className="h-8 w-8 object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[#040458]">Otic</span>
                  <span className="text-xs text-[#faa51a] -mt-1">Business</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={`${getTierColor(currentTier)} px-2 py-1 text-xs`}>
                  {getTierDisplayName(currentTier)}
                </Badge>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#040458] hover:border-[#040458] flex-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#040458] hover:border-[#040458] flex-1"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
              {currentTier !== 'enterprise_advantage' && (
                <Button 
                  onClick={handleUpgrade}
                  className="bg-[#faa51a] hover:bg-[#040458] text-white flex-1"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
          
          {/* Page Title */}
          <div className="mt-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#040458]">My Extras</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Features and tools available with your {getTierDisplayName(currentTier)} plan
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features">Available Features</TabsTrigger>
            <TabsTrigger value="locked">Premium Features</TabsTrigger>
            <TabsTrigger value="businesses">My Businesses</TabsTrigger>
          </TabsList>

          {/* Available Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userFeatures.map((feature) => (
                <Card 
                  key={feature.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={feature.action}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${getCategoryColor(feature.category)}`}>
                        {feature.icon}
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Available</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-[#040458] group-hover:text-white transition-colors"
                    >
                      Use Feature
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Premium Features Tab */}
          <TabsContent value="locked" className="space-y-6">
            <div className="text-center mb-8">
              <Crown className="h-16 w-16 text-[#faa51a] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#040458] mb-2">Unlock Premium Features</h2>
              <p className="text-gray-600">
                Upgrade your plan to access these powerful features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedFeatures.map((feature) => (
                <Card 
                  key={feature.id}
                  className="relative opacity-75 hover:opacity-90 transition-opacity"
                >
                  <div className="absolute top-4 right-4">
                    <Crown className="h-5 w-5 text-[#faa51a]" />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${getCategoryColor(feature.category)}`}>
                        {feature.icon}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Lock className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Locked</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleUpgrade}
                    >
                      <Crown className="h-3 w-3 mr-2" />
                      Upgrade to Unlock
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Businesses Tab */}
          <TabsContent value="businesses" className="space-y-6">
            {currentTier === 'enterprise_advantage' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#040458]">My Businesses</h2>
                  <Button 
                    className="bg-[#040458] hover:bg-[#faa51a] text-white"
                    onClick={() => toast.info('Business creation coming soon!')}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Add Business
                  </Button>
                </div>
                
                {userBusinesses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userBusinesses.map((business) => (
                      <Card key={business.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Building2 className="h-5 w-5 mr-2 text-[#040458]" />
                            {business.name}
                          </CardTitle>
                          <CardDescription>
                            {business.description || 'No description available'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              <strong>Type:</strong> {business.business_type}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Created:</strong> {new Date(business.created_at).toLocaleDateString()}
                            </p>
                            {currentBusiness?.id === business.id && (
                              <Badge className="bg-green-100 text-green-800">Current</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Businesses Yet</h3>
                      <p className="text-gray-600 mb-4">
                        Create your first business to get started with multi-business management
                      </p>
                      <Button 
                        onClick={() => toast.info('Business creation coming soon!')}
                        className="bg-[#040458] hover:bg-[#faa51a] text-white"
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Create Your First Business
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Crown className="h-16 w-16 text-[#faa51a] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#040458] mb-2">Multi-Business Management</h2>
                <p className="text-gray-600 mb-6">
                  Upgrade to Enterprise Advantage to create and manage multiple businesses
                </p>
                <Button 
                  onClick={handleUpgrade}
                  className="bg-[#faa51a] hover:bg-[#040458] text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Enterprise Advantage
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyExtras;
