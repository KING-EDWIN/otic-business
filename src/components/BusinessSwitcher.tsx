import React, { useState } from 'react'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Settings, 
  Users,
  Crown,
  Shield,
  User,
  Eye
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BusinessSwitcher: React.FC = () => {
  const { 
    businesses, 
    currentBusiness, 
    loading, 
    canCreateBusiness, 
    switchBusiness 
  } = useBusinessManagement()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3 text-yellow-600" />
      case 'admin': return <Shield className="h-3 w-3 text-blue-600" />
      case 'manager': return <User className="h-3 w-3 text-green-600" />
      case 'employee': return <User className="h-3 w-3 text-gray-600" />
      case 'viewer': return <Eye className="h-3 w-3 text-gray-400" />
      default: return <User className="h-3 w-3 text-gray-600" />
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

  const handleBusinessSwitch = async (businessId: string) => {
    const result = await switchBusiness(businessId)
    if (result.success) {
      setIsOpen(false)
      // Refresh the page to update all business-specific data
      window.location.reload()
    }
  }

  const handleCreateBusiness = () => {
    navigate('/business-management/create')
    setIsOpen(false)
  }

  const handleManageBusinesses = () => {
    navigate('/business-management')
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <Building2 className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    )
  }

  if (!currentBusiness) {
    return (
      <Button
        onClick={handleCreateBusiness}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <Plus className="h-4 w-4" />
        <span>Create Business</span>
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 min-w-0 max-w-xs"
        >
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{currentBusiness.name}</span>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-80">
        <div className="px-3 py-2 border-b">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">Switch Business</span>
          </div>
        </div>

        {businesses.map((business) => (
          <DropdownMenuItem
            key={business.id}
            onClick={() => handleBusinessSwitch(business.id)}
            className="flex items-center justify-between px-3 py-2 cursor-pointer"
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {business.name}
                  </span>
                  {business.id === currentBusiness.id && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  {getRoleIcon(business.user_role)}
                  <span className="text-xs text-gray-500 capitalize">
                    {business.user_role}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getRoleColor(business.user_role)}`}
                  >
                    {business.business_type}
                  </Badge>
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {canCreateBusiness && (
          <DropdownMenuItem
            onClick={handleCreateBusiness}
            className="flex items-center space-x-2 px-3 py-2 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Create New Business</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={handleManageBusinesses}
          className="flex items-center space-x-2 px-3 py-2 cursor-pointer"
        >
          <Settings className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">Manage Businesses</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default BusinessSwitcher