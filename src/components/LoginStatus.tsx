import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, LogOut, Mail, CheckCircle, Clock, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const LoginStatus: React.FC = () => {
  const { appUser, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!appUser) {
    return null
  }

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free_trial': return <Clock className="h-3 w-3 text-blue-500" />
      case 'start_smart': return <User className="h-3 w-3 text-green-500" />
      case 'grow_intelligence': return <Crown className="h-3 w-3 text-purple-500" />
      case 'enterprise_advantage': return <Crown className="h-3 w-3 text-yellow-500" />
      default: return <User className="h-3 w-3 text-gray-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free_trial': return 'bg-blue-100 text-blue-800'
      case 'start_smart': return 'bg-green-100 text-green-800'
      case 'grow_intelligence': return 'bg-purple-100 text-purple-800'
      case 'enterprise_advantage': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTierName = (tier: string) => {
    return tier
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#040458] text-white text-xs">
              {getInitials(appUser.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <p className="font-medium text-sm">{appUser.email}</p>
              {appUser.email_verified ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            
            {appUser.business_name && (
              <p className="text-xs text-gray-500">{appUser.business_name}</p>
            )}
            
            <div className="flex items-center space-x-2 mt-1">
              {getTierIcon(appUser.tier)}
              <Badge className={`text-xs ${getTierColor(appUser.tier)}`}>
                {formatTierName(appUser.tier)}
              </Badge>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => {
            // Navigate to profile or settings
            window.location.href = '/settings'
          }}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LoginStatus
