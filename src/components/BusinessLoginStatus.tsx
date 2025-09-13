import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContextHybrid'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Settings, Building2, ArrowRight, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BusinessLoginStatus = () => {
  const { user, profile, signOut } = useAuth()
  const { businesses, currentBusiness, switchBusiness, canCreateBusiness } = useBusinessManagement()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleSettings = () => {
    navigate('/settings')
  }

  const handleDashboard = () => {
    navigate('/dashboard')
  }

  const handleBusinessManagement = () => {
    navigate('/business-management')
  }

  const handleCreateBusiness = () => {
    navigate('/business-management/create')
  }

  const handleSwitchBusiness = async (businessId: string) => {
    try {
      const result = await switchBusiness(businessId)
      if (result.success) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error switching business:', error)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={() => navigate('/business-signin')}
          className="text-[#040458] border-[#040458] hover:bg-[#040458] hover:text-white"
        >
          Sign In
        </Button>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const userInitials = getInitials(displayName)

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} alt={displayName} />
              <AvatarFallback className="bg-[#040458] text-white text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <Building2 className="h-3 w-3 text-[#040458]" />
                <span className="text-xs text-[#040458] font-medium">
                  {currentBusiness ? currentBusiness.name : 'Business Account'}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDashboard} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          
          {/* Business Management Section */}
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-2 py-1.5">
            BUSINESS MANAGEMENT
          </DropdownMenuLabel>
          
          {businesses.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs font-medium text-gray-700 px-2 py-1">
                Switch Business
              </DropdownMenuLabel>
              {businesses.slice(0, 3).map((business, index) => (
                <DropdownMenuItem
                  key={`business-${business.id}-${index}`}
                  onClick={() => handleSwitchBusiness(business.id)}
                  className="cursor-pointer pl-6"
                >
                  <Building2 className="mr-2 h-3 w-3" />
                  <span className="truncate">{business.name}</span>
                  {business.id === currentBusiness?.id && (
                    <ArrowRight className="ml-auto h-3 w-3 text-[#040458]" />
                  )}
                </DropdownMenuItem>
              ))}
              {businesses.length > 3 && (
                <DropdownMenuItem
                  onClick={handleBusinessManagement}
                  className="cursor-pointer pl-6 text-xs text-gray-500"
                >
                  View all {businesses.length} businesses...
                </DropdownMenuItem>
              )}
            </>
          )}
          
          <DropdownMenuItem onClick={handleBusinessManagement} className="cursor-pointer">
            <Building2 className="mr-2 h-4 w-4" />
            <span>Manage Businesses</span>
          </DropdownMenuItem>
          
          {canCreateBusiness && (
            <DropdownMenuItem onClick={handleCreateBusiness} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              <span>Create Business</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut} 
            className="cursor-pointer text-red-600 focus:text-red-600"
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default BusinessLoginStatus

