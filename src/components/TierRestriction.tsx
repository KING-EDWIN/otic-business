import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Lock, Crown, Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface TierRestrictionProps {
  requiredTier: 'basic' | 'standard' | 'premium'
  feature: string
  children?: React.ReactNode
}

const tierInfo = {
  basic: {
    name: 'Basic',
    icon: <Lock className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  standard: {
    name: 'Standard',
    icon: <Star className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  premium: {
    name: 'Premium',
    icon: <Crown className="h-4 w-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
}

export const TierRestriction: React.FC<TierRestrictionProps> = ({ 
  requiredTier, 
  feature, 
  children 
}) => {
  const { appUser } = useAuth()
  
  // Check if user has access
  const hasAccess = () => {
    if (!appUser) return false
    
    const tierLevels = {
      'free_trial': 0,
      'basic': 1,
      'standard': 2,
      'premium': 3
    }
    
    const userLevel = tierLevels[appUser.tier as keyof typeof tierLevels] || 0
    const requiredLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 0
    
    return userLevel >= requiredLevel
  }

  if (hasAccess()) {
    return <>{children}</>
  }

  const tier = tierInfo[requiredTier]

  return (
    <div className="space-y-4">
      <Alert className={`${tier.bgColor} ${tier.borderColor} border-2`}>
        <div className="flex items-center space-x-2">
          {tier.icon}
          <AlertDescription className="font-medium">
            <span className={tier.color}>{tier.name} Tier Required</span>
          </AlertDescription>
        </div>
        <AlertDescription className="mt-2">
          {feature} is available with {tier.name} tier or higher. 
          Upgrade your plan to access this feature.
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-center">
        <Button 
          className="bg-[#040458] hover:bg-[#030345] text-white"
          onClick={() => window.location.href = '/dashboard?tab=subscriptions'}
        >
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to {tier.name}
        </Button>
      </div>
    </div>
  )
}

export default TierRestriction

