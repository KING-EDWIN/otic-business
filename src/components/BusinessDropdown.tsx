import { useState } from 'react'
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
import { Building2, ChevronDown, ArrowRight, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const BusinessDropdown = () => {
  const { businesses, currentBusiness, switchBusiness, canCreateBusiness } = useBusinessManagement()
  const navigate = useNavigate()
  const [isSwitching, setIsSwitching] = useState(false)

  const handleSwitchBusiness = async (businessId: string) => {
    if (isSwitching) return
    
    try {
      setIsSwitching(true)
      const result = await switchBusiness(businessId)
      if (result.success) {
        toast.success('Switched business successfully')
        // Navigate to dashboard to refresh data
        navigate('/dashboard')
      } else {
        toast.error(result.error || 'Failed to switch business')
      }
    } catch (error) {
      console.error('Error switching business:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSwitching(false)
    }
  }

  const handleCreateBusiness = () => {
    navigate('/business-management/create')
  }

  const handleManageBusinesses = () => {
    navigate('/business-management')
  }

  if (!currentBusiness) {
    return (
      <Button
        variant="outline"
        onClick={handleManageBusinesses}
        className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300"
      >
        <Building2 className="h-4 w-4 mr-2" />
        Set Up Business
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
        >
          <Building2 className="h-4 w-4 mr-2" />
          <span className="max-w-32 truncate">{currentBusiness.name}</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Current Business</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentBusiness.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentBusiness.business_type} • {currentBusiness.industry}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {businesses.length > 1 && (
          <>
            <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-2 py-1.5">
              SWITCH BUSINESS
            </DropdownMenuLabel>
            {businesses
              .filter(business => business.id !== currentBusiness.id)
              .slice(0, 5)
              .map((business) => (
                <DropdownMenuItem
                  key={business.id}
                  onClick={() => handleSwitchBusiness(business.id)}
                  className="cursor-pointer"
                  disabled={isSwitching}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span className="truncate">{business.name}</span>
                </DropdownMenuItem>
              ))}
            {businesses.length > 6 && (
              <DropdownMenuItem
                onClick={handleManageBusinesses}
                className="cursor-pointer text-xs text-gray-500"
              >
                View all {businesses.length} businesses...
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleManageBusinesses} className="cursor-pointer">
          <Building2 className="mr-2 h-4 w-4" />
          <span>Manage Businesses</span>
        </DropdownMenuItem>
        
        {canCreateBusiness && (
          <DropdownMenuItem onClick={handleCreateBusiness} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Business</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default BusinessDropdown



