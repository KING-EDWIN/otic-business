import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Building2, 
  Users, 
  Plus, 
  Search, 
  ArrowLeft,
  BarChart3,
  Package,
  ShoppingCart,
  Calculator,
  FileText,
  Settings,
  Mail,
  Crown,
  Shield,
  User,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import InvitationNotification from '@/components/InvitationNotification'

const BusinessDashboard: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const { 
    currentBusiness, 
    businessMembers, 
    loading, 
    inviteUser, 
    refreshMembers 
  } = useBusinessManagement()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'employee' | 'viewer'>('employee')
  const [inviteLoading, setInviteLoading] = useState(false)

  const filteredMembers = businessMembers.filter(member =>
    member && (
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />
      case 'manager': return <User className="h-4 w-4 text-green-600" />
      case 'employee': return <User className="h-4 w-4 text-gray-600" />
      case 'viewer': return <Eye className="h-4 w-4 text-gray-400" />
      default: return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'manager': return 'bg-green-100 text-green-800'
      case 'employee': return 'bg-gray-100 text-gray-800'
      case 'viewer': return 'bg-gray-100 text-gray-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Email is required')
      return
    }

    try {
      setInviteLoading(true)
      const result = await inviteUser(inviteEmail, inviteRole)
      
      if (result.success) {
        toast.success('Invitation sent successfully')
        setInviteEmail('')
        setInviteRole('employee')
        await refreshMembers()
      } else {
        toast.error(result.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error inviting user:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setInviteLoading(false)
    }
  }

  const businessFeatures = [
    {
      title: 'Dashboard',
      description: 'View business overview and analytics',
      icon: BarChart3,
      path: '/dashboard',
      color: 'bg-blue-500'
    },
    {
      title: 'Point of Sale',
      description: 'Manage sales and transactions',
      icon: ShoppingCart,
      path: '/pos',
      color: 'bg-green-500'
    },
    {
      title: 'Inventory',
      description: 'Track products and stock levels',
      icon: Package,
      path: '/inventory',
      color: 'bg-purple-500'
    },
    {
      title: 'Accounting',
      description: 'Financial management and reporting',
      icon: Calculator,
      path: '/accounting',
      color: 'bg-orange-500'
    },
    {
      title: 'Analytics',
      description: 'Business analytics and reports',
      icon: BarChart3,
      path: '/analytics',
      color: 'bg-indigo-500'
    },
    {
      title: 'Reports',
      description: 'Generate detailed business reports',
      icon: FileText,
      path: '/reports',
      color: 'bg-pink-500'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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

  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Business Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The business you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/business-management')}>
              Back to Businesses
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/business-management')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentBusiness.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentBusiness.description || 'Business Dashboard'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">
                {currentBusiness.business_type}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {currentBusiness.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">{businessMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Owners</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {businessMembers.filter(m => m.role === 'owner').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {businessMembers.filter(m => m.role === 'admin').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Team</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {businessMembers.filter(m => ['manager', 'employee', 'viewer'].includes(m.role)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Features */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Business Features</span>
                </CardTitle>
                <CardDescription>
                  Access all business management tools and features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businessFeatures.map((feature) => (
                    <Button
                      key={feature.path}
                      variant="outline"
                      onClick={() => {
                        if (feature.path === '/dashboard' && currentBusiness) {
                          // Set the business context before navigating to dashboard
                          localStorage.setItem('current_business_id', currentBusiness.id)
                        }
                        navigate(feature.path)
                      }}
                      className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center`}>
                          <feature.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-medium text-gray-900">{feature.title}</h3>
                          <p className="text-sm text-gray-500">{feature.description}</p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Management */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Team Management</span>
                </CardTitle>
                <CardDescription>
                  Manage your team members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Invite New Member */}
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleInviteUser}
                      disabled={inviteLoading}
                      size="sm"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                    All invited users will be employees with access to POS, Inventory, Accounting, and Customers pages.
                  </div>
                </div>

                {/* Team Members List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredMembers.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(member.role)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.full_name || member.business_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">{member.email || 'No email'}</p>
                        </div>
                      </div>
                      <Badge className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                  {businessMembers.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/business-management/${currentBusiness.id}/members`)}
                      className="w-full text-xs"
                    >
                      View all {businessMembers.length} members
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessDashboard

