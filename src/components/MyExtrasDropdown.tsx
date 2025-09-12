import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Sparkles, 
  ChevronDown, 
  Smartphone, 
  Package, 
  BarChart3, 
  FileText, 
  Brain, 
  TrendingUp, 
  Calculator, 
  Shield, 
  Globe, 
  Zap, 
  Users, 
  Building2,
  Crown,
  CheckCircle,
  Lock
} from 'lucide-react'

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

const MyExtrasDropdown = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  
  // Safely get business management context
  let businesses = []
  let canCreateBusiness = false
  try {
    const businessContext = useBusinessManagement()
    businesses = businessContext.businesses
    canCreateBusiness = businessContext.canCreateBusiness
  } catch (error) {
    console.log('BusinessManagementProvider not available, using empty array')
  }

  const currentTier = profile?.tier || 'free_trial'

  // Define all features with their tier availability
  const allFeatures: TierFeature[] = [
    // Core Features
    {
      id: 'pos_system',
      name: 'POS System',
      description: 'Point of Sale system with barcode scanning',
      icon: <Smartphone className="h-4 w-4" />,
      category: 'core',
      availableIn: ['free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: false,
      action: () => navigate('/pos')
    },
    {
      id: 'inventory_management',
      name: 'Inventory Management',
      description: 'Complete inventory management system',
      icon: <Package className="h-4 w-4" />,
      category: 'core',
      availableIn: ['free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: false,
      action: () => navigate('/inventory')
    },
    {
      id: 'sales_reporting',
      name: 'Sales Reporting',
      description: 'Daily, weekly, monthly sales reports',
      icon: <BarChart3 className="h-4 w-4" />,
      category: 'core',
      availableIn: ['start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/reports')
    },
    {
      id: 'receipt_generation',
      name: 'Receipt Generation',
      description: 'Generate and print receipts',
      icon: <FileText className="h-4 w-4" />,
      category: 'core',
      availableIn: ['start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/pos')
    },
    {
      id: 'csv_pdf_exports',
      name: 'Data Export',
      description: 'Export data in CSV and PDF formats',
      icon: <FileText className="h-4 w-4" />,
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
      icon: <Brain className="h-4 w-4" />,
      category: 'analytics',
      availableIn: ['free_trial', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/analytics')
    },
    {
      id: 'ai_sales_trends',
      name: 'AI Sales Trends',
      description: 'AI sales trend analytics',
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'analytics',
      availableIn: ['grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/analytics')
    },
    {
      id: 'ai_forecasting',
      name: 'AI Forecasting',
      description: 'AI financial forecasting',
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'analytics',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/analytics')
    },
    {
      id: 'financial_reports',
      name: 'Financial Reports',
      description: 'Automated financial reports',
      icon: <BarChart3 className="h-4 w-4" />,
      category: 'analytics',
      availableIn: ['grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/reports')
    },
    {
      id: 'tax_computation',
      name: 'Tax Computation',
      description: 'Tax computation and VAT analysis',
      icon: <Calculator className="h-4 w-4" />,
      category: 'analytics',
      availableIn: ['grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/accounting')
    },
    {
      id: 'compliance_reporting',
      name: 'Compliance Reporting',
      description: 'Advanced compliance reporting',
      icon: <Shield className="h-4 w-4" />,
      category: 'analytics',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/accounting')
    },

    // Integration Features
    {
      id: 'multi_branch_sync',
      name: 'Multi-Branch Sync',
      description: 'Multi-branch synchronization',
      icon: <Globe className="h-4 w-4" />,
      category: 'integration',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/settings')
    },
    {
      id: 'third_party_apis',
      name: 'Third-Party APIs',
      description: 'Third-party API integrations',
      icon: <Zap className="h-4 w-4" />,
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
      icon: <Users className="h-4 w-4" />,
      category: 'system',
      availableIn: ['free_trial', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/business-management/members')
    },
    {
      id: 'role_based_permissions',
      name: 'Role-Based Permissions',
      description: 'User roles and permission management',
      icon: <Shield className="h-4 w-4" />,
      category: 'system',
      availableIn: ['grow_intelligence', 'enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/settings')
    },
    {
      id: 'multi_business_management',
      name: 'Multi-Business Management',
      description: 'Create and manage multiple businesses',
      icon: <Building2 className="h-4 w-4" />,
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
      icon: <Shield className="h-4 w-4" />,
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
      icon: <FileText className="h-4 w-4" />,
      category: 'support',
      availableIn: ['start_smart', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: false,
      action: () => navigate('/contact')
    },
    {
      id: 'priority_support',
      name: 'Priority Support',
      description: 'Priority support during trial',
      icon: <Zap className="h-4 w-4" />,
      category: 'support',
      availableIn: ['free_trial', 'grow_intelligence', 'enterprise_advantage'],
      isPremium: false,
      action: () => navigate('/contact')
    },
    {
      id: 'dedicated_manager',
      name: 'Dedicated Manager',
      description: 'Dedicated account manager',
      icon: <Users className="h-4 w-4" />,
      category: 'support',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/contact')
    },
    {
      id: 'phone_support',
      name: '24/7 Phone Support',
      description: '24/7 phone support',
      icon: <Crown className="h-4 w-4" />,
      category: 'support',
      availableIn: ['enterprise_advantage'],
      isPremium: true,
      action: () => navigate('/contact')
    }
  ]

  const userFeatures = allFeatures.filter(feature => 
    feature.availableIn.includes(currentTier) && 
    (!feature.showCondition || feature.showCondition())
  )

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'free_trial': return 'Free Trial'
      case 'start_smart': return 'Start Smart'
      case 'grow_intelligence': return 'Grow with Intelligence'
      case 'enterprise_advantage': return 'Enterprise Advantage'
      default: return 'Unknown'
    }
  }

  const handleMoreFeatures = () => {
    navigate('/my-extras')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          <span>My Extras</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto" align="start">
        <DropdownMenuLabel className="font-normal sticky top-0 bg-white z-10">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Available Features</p>
            <p className="text-xs leading-none text-muted-foreground">
              {getTierDisplayName(currentTier)} Plan
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Core Features */}
        {userFeatures.filter(f => f.category === 'core').length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-2 py-1.5 sticky top-12 bg-white z-10">
              CORE FEATURES
            </DropdownMenuLabel>
            {userFeatures.filter(f => f.category === 'core').map((feature) => (
              <DropdownMenuItem
                key={feature.id}
                onClick={feature.action}
                className="cursor-pointer"
              >
                {feature.icon}
                <span className="ml-2">{feature.name}</span>
                <CheckCircle className="ml-auto h-3 w-3 text-green-500" />
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {/* Analytics Features */}
        {userFeatures.filter(f => f.category === 'analytics').length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-2 py-1.5 sticky top-12 bg-white z-10">
              ANALYTICS
            </DropdownMenuLabel>
            {userFeatures.filter(f => f.category === 'analytics').map((feature) => (
              <DropdownMenuItem
                key={feature.id}
                onClick={feature.action}
                className="cursor-pointer"
              >
                {feature.icon}
                <span className="ml-2">{feature.name}</span>
                <CheckCircle className="ml-auto h-3 w-3 text-green-500" />
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {/* System Features */}
        {userFeatures.filter(f => f.category === 'system').length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-2 py-1.5 sticky top-12 bg-white z-10">
              SYSTEM
            </DropdownMenuLabel>
            {userFeatures.filter(f => f.category === 'system').map((feature) => (
              <DropdownMenuItem
                key={feature.id}
                onClick={feature.action}
                className="cursor-pointer"
              >
                {feature.icon}
                <span className="ml-2">{feature.name}</span>
                <CheckCircle className="ml-auto h-3 w-3 text-green-500" />
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {/* Support Features */}
        {userFeatures.filter(f => f.category === 'support').length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-2 py-1.5 sticky top-12 bg-white z-10">
              SUPPORT
            </DropdownMenuLabel>
            {userFeatures.filter(f => f.category === 'support').map((feature) => (
              <DropdownMenuItem
                key={feature.id}
                onClick={feature.action}
                className="cursor-pointer"
              >
                {feature.icon}
                <span className="ml-2">{feature.name}</span>
                <CheckCircle className="ml-auto h-3 w-3 text-green-500" />
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleMoreFeatures}
          className="cursor-pointer text-center justify-center sticky bottom-0 bg-white z-10"
        >
          <span className="text-sm font-medium text-[#040458]">More Features →</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MyExtrasDropdown
