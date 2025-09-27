import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { IndividualBusinessAccessService, BusinessAccess } from '@/services/individualBusinessAccessService'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, ChevronDown, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface IndividualBusinessSwitcherProps {
  onBusinessSelect?: (business: BusinessAccess) => void
}

const IndividualBusinessSwitcher: React.FC<IndividualBusinessSwitcherProps> = ({ onBusinessSelect }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState<BusinessAccess[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessAccess | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadBusinesses()
    }
  }, [user?.id])

  const loadBusinesses = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const accessibleBusinesses = await IndividualBusinessAccessService.getAccessibleBusinesses(user.id)
      setBusinesses(accessibleBusinesses)
      
      // Set the most recently accessed business as selected
      if (accessibleBusinesses.length > 0) {
        setSelectedBusiness(accessibleBusinesses[0])
        onBusinessSelect?.(accessibleBusinesses[0])
      }
    } catch (error) {
      console.error('Error loading businesses:', error)
      toast.error('Failed to load accessible businesses')
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessSelect = async (business: BusinessAccess) => {
    try {
      // Update last accessed time
      await IndividualBusinessAccessService.updateLastAccessed(business.business_id, user!.id)
      
      setSelectedBusiness(business)
      onBusinessSelect?.(business)
      
      // Update the businesses list to reflect the new last_accessed time
      setBusinesses(prev => 
        prev.map(b => 
          b.business_id === business.business_id 
            ? { ...b, last_accessed: new Date().toISOString() }
            : b
        ).sort((a, b) => {
          // Sort by last_accessed, with most recent first
          if (!a.last_accessed && !b.last_accessed) return 0
          if (!a.last_accessed) return 1
          if (!b.last_accessed) return -1
          return new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime()
        })
      )
    } catch (error) {
      console.error('Error selecting business:', error)
    }
  }

  const formatLastAccessed = (lastAccessed?: string) => {
    if (!lastAccessed) return 'Never'
    
    const date = new Date(lastAccessed)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Loading businesses...</span>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">No business access</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-2 text-gray-700 hover:text-[#040458] hover:border-[#faa51a]"
        >
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">
            {selectedBusiness ? selectedBusiness.business_name : 'Select Business'}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">Accessible Businesses</p>
            <p className="text-xs text-muted-foreground">
              {businesses.length} business{businesses.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {businesses.map((business) => (
          <DropdownMenuItem
            key={business.business_id}
            onClick={() => handleBusinessSelect(business)}
            className={`cursor-pointer ${
              selectedBusiness?.business_id === business.business_id 
                ? 'bg-[#040458]/10 text-[#040458]' 
                : ''
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{business.business_name}</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {business.business_type} • {business.access_level}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {selectedBusiness?.business_id === business.business_id && (
                  <CheckCircle className="h-3 w-3 text-[#040458]" />
                )}
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatLastAccessed(business.last_accessed)}</span>
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => navigate('/business-management')}
          className="cursor-pointer text-center justify-center"
        >
          <span className="text-sm font-medium text-[#040458]">Manage Access →</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default IndividualBusinessSwitcher
