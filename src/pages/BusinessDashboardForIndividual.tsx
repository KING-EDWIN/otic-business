import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { IndividualBusinessAccessService, BusinessAccess } from '@/services/individualBusinessAccessService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Building2,
  ShoppingCart,
  Package,
  DollarSign,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import POS from './POS'
import Inventory from './Inventory'
import AccountingNew from './AccountingNew'
import Payments from './Payments'
import Customers from './Customers'
import Dashboard from './Dashboard'

const BusinessDashboardForIndividual: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [businessInfo, setBusinessInfo] = useState<BusinessAccess | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<string>('dashboard')

  // Extract current page from URL path
  useEffect(() => {
    const pathSegments = location.pathname.split('/')
    const page = pathSegments[pathSegments.length - 1]
    setCurrentPage(page)
  }, [location.pathname])

  useEffect(() => {
    if (user?.id && businessId) {
      checkAccess()
    }
  }, [user?.id, businessId])

  // Add refresh mechanism when component mounts or when permissions might have changed
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id && businessId) {
        // Refresh data when user returns to the tab
        checkAccess()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user?.id, businessId])

  const checkAccess = async () => {
    if (!user?.id || !businessId) return

    try {
      setLoading(true)
      
      // Get business access info with fresh data
      const accessibleBusinesses = await IndividualBusinessAccessService.getAccessibleBusinesses(user.id)
      const businessAccess = accessibleBusinesses.find(b => b.business_id === businessId)
      
      if (businessAccess) {
        setHasAccess(true)
        setBusinessInfo(businessAccess)
        
        console.log('🔍 Business access loaded:', {
          business_name: businessAccess.business_name,
          invitation_type: businessAccess.invitation_type,
          permission_settings: businessAccess.permission_settings
        })
        
        // Show toast if permissions were refreshed
        toast.success('Permissions refreshed successfully!')
        
        // Update last accessed time
        await IndividualBusinessAccessService.updateLastAccessed(businessId, user.id)
      } else {
        setHasAccess(false)
        toast.error('You do not have access to this business')
      }
    } catch (error) {
      console.error('Error checking access:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  const getPageIcon = (page: string) => {
    switch (page) {
      case 'dashboard': return <Home className="h-5 w-5" />
      case 'pos': return <ShoppingCart className="h-5 w-5" />
      case 'inventory': return <Package className="h-5 w-5" />
      case 'accounting': return <DollarSign className="h-5 w-5" />
      case 'payments': return <CreditCard className="h-5 w-5" />
      case 'customers': return <Users className="h-5 w-5" />
      default: return <Building2 className="h-5 w-5" />
    }
  }

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard': return 'Dashboard'
      case 'pos': return 'Point of Sale'
      case 'inventory': return 'Inventory Management'
      case 'accounting': return 'Accounting'
      case 'payments': return 'Payments'
      case 'customers': return 'Customer Management'
      default: return 'Business System'
    }
  }

  const hasPageAccess = (page: string) => {
    if (!businessInfo) return false
    
    // Check if permission_settings exists and use it
    if (businessInfo.permission_settings) {
      return businessInfo.permission_settings[page] === true
    }
    
    // Fallback to old logic
    return businessInfo.invitation_type === 'manager' || 
           (businessInfo.invitation_type === 'viewer' && page === 'pos')
  }

  const renderPageContent = () => {
    if (!hasPageAccess(currentPage)) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Access Restricted</span>
            </CardTitle>
            <CardDescription>
              You do not have permission to access {getPageTitle(currentPage)} for this business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate(`/business/${businessId}/dashboard`)}
              className="bg-[#040458] hover:bg-[#030345] text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      )
    }

    // Render the actual business page component
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'pos':
        return <POS />
      case 'inventory':
        return <Inventory />
      case 'accounting':
        return <AccountingNew />
      case 'payments':
        return <Payments />
      case 'customers':
        return <Customers />
      default:
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Business System</CardTitle>
              <CardDescription>
                Welcome to {businessInfo?.business_name} business system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is a placeholder for the business system.</p>
            </CardContent>
          </Card>
        )
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Access Denied</span>
            </CardTitle>
            <CardDescription>
              You do not have permission to access this business system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/individual-dashboard')}
              className="w-full bg-[#040458] hover:bg-[#030345] text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/individual-dashboard')}
                className="text-gray-600 hover:text-[#040458]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-[#040458]" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {businessInfo?.business_name}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {businessInfo?.access_level}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {businessInfo?.invitation_type}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Last accessed: {businessInfo?.last_accessed ? 
                  new Date(businessInfo.last_accessed).toLocaleDateString() : 
                  'Never'
                }
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkAccess}
                className="text-gray-500 hover:text-[#040458]"
                title="Refresh permissions"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['dashboard', 'pos', 'inventory', 'accounting', 'payments', 'customers'].map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                onClick={() => navigate(`/business/${businessId}/${page}`)}
                className={`flex items-center space-x-2 ${
                  currentPage === page 
                    ? 'bg-[#040458] text-white' 
                    : 'text-gray-600 hover:text-[#040458]'
                } ${
                  !hasPageAccess(page) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!hasPageAccess(page)}
              >
                {getPageIcon(page)}
                <span>{getPageTitle(page)}</span>
                {hasPageAccess(page) ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPageContent()}
      </div>
    </div>
  )
}

export default BusinessDashboardForIndividual
