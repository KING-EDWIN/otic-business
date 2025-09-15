import React, { useState } from 'react'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Building2, 
  Plus, 
  Search, 
  Settings, 
  Users, 
  MoreHorizontal,
  Crown,
  Shield,
  User,
  Eye,
  Trash2,
  Edit,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const BusinessManagement: React.FC = () => {
  const { 
    businesses, 
    currentBusiness, 
    loading, 
    canCreateBusiness, 
    deleteBusiness, 
    switchBusiness 
  } = useBusinessManagement()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingBusiness, setDeletingBusiness] = useState<string | null>(null)

  const filteredBusinesses = businesses
    .filter(business => business && business.name) // Remove null/undefined businesses
    .filter(business =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.business_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  // Identify the main business (first business or the one with is_main flag)
  const mainBusinessId = businesses.length > 0 ? businesses[0].id : null

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />
      case 'manager': return <User className="h-4 w-4 text-green-600" />
      case 'employee': return <User className="h-4 w-4 text-gray-600" />
      case 'viewer': return <Eye className="h-4 w-4 text-gray-400" />
      default: return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'manager': return 'bg-green-100 text-green-800'
      case 'employee': return 'bg-gray-100 text-gray-800'
      case 'viewer': return 'bg-gray-100 text-gray-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteBusiness = async (businessId: string, businessName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingBusiness(businessId)
      console.log('Deleting business:', businessId, businessName)
      const result = await deleteBusiness(businessId)
      
      if (result.success) {
        console.log('Business deleted successfully, refreshing list...')
        toast.success('Business deleted successfully')
        // Force a page refresh to ensure the list is updated
        window.location.reload()
      } else {
        console.error('Failed to delete business:', result.error)
        toast.error(result.error || 'Failed to delete business')
      }
    } catch (error) {
      console.error('Error deleting business:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setDeletingBusiness(null)
    }
  }

  const handleSwitchBusiness = async (businessId: string) => {
    try {
      const result = await switchBusiness(businessId)
      if (result.success) {
        toast.success('Switched business successfully')
        // Navigate to dashboard instead of reloading
        navigate('/dashboard')
      } else {
        toast.error(result.error || 'Failed to switch business')
      }
    } catch (error) {
      console.error('Error switching business:', error)
      toast.error('An unexpected error occurred')
    }
  }

  const handleManageMembers = (businessId: string) => {
    navigate(`/business-management/${businessId}/members`)
  }

  const handleEditBusiness = (businessId: string) => {
    navigate(`/business-management/${businessId}/edit`)
  }

  const handleSelectBusiness = (businessId: string) => {
    navigate(`/business-management/${businessId}/dashboard`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage your businesses and switch between them
                </p>
              </div>
            </div>
            {canCreateBusiness && (
              <Button
                onClick={() => navigate('/business-management/create')}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Business</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Stats */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                    <p className="text-2xl font-bold text-gray-900">{businesses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Owned</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {businesses.filter(b => b.user_role === 'owner').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admin</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {businesses.filter(b => b.user_role === 'admin').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Member</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {businesses.filter(b => ['manager', 'employee', 'viewer'].includes(b.user_role || '')).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Businesses List */}
        {filteredBusinesses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No businesses found' : 'No businesses yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first business to get started'
                }
              </p>
              {!searchTerm && canCreateBusiness && (
                <Button onClick={() => navigate('/business-management/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Business
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{business.name}</CardTitle>
                        <CardDescription className="capitalize">
                          {business.business_type} • {business.industry}
                        </CardDescription>
                      </div>
                    </div>
                    {business.id === currentBusiness?.id && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Your Role</span>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(business.user_role)}
                        <Badge className={getRoleColor(business.user_role)}>
                          {business.user_role}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge className={getStatusColor(business.status)}>
                        {business.status}
                      </Badge>
                    </div>
                    
                    {business.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {business.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>Members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {business.id === currentBusiness?.id ? (
                          <Button size="sm" variant="outline" disabled>
                            Current
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleSwitchBusiness(business.id)}
                            className="flex items-center space-x-1"
                          >
                            <ArrowRight className="h-3 w-3" />
                            <span>Switch</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleSelectBusiness(business.id)}
                        className="flex-1 bg-[#040458] hover:bg-[#faa51a] text-white"
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Dashboard
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageMembers(business.id)}
                      >
                        <Users className="h-3 w-3" />
                      </Button>
                      {business.id !== mainBusinessId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBusiness(business.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {business.user_role === 'owner' && business.id !== mainBusinessId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBusiness(business.id, business.name)}
                          disabled={deletingBusiness === business.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessManagement
