import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Zap, Star, Building, Users, BarChart3, Shield, Phone } from 'lucide-react'
import { tierService, Tier, TierComparison } from '@/services/tierService'
import { useAuth } from '@/contexts/AuthContext'

interface TierRestrictionProps {
  requiredTier: 'free_trial' | 'start_smart' | 'grow_intelligence' | 'enterprise_advantage'
  feature: string
  children: React.ReactNode
  showUpgradeModal?: boolean
  onUpgradeClick?: () => void
}

const TierRestrictionNew: React.FC<TierRestrictionProps> = ({ 
  requiredTier, 
  feature, 
  children,
  showUpgradeModal = false,
  onUpgradeClick
}) => {
  const { appUser } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentTier, setCurrentTier] = useState<Tier | null>(null)
  const [tierComparison, setTierComparison] = useState<TierComparison[]>([])
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [appUser, requiredTier])

  const checkAccess = async () => {
    if (!appUser?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const subscription = await tierService.getUserSubscription(appUser.id)
      
      if (subscription?.tier) {
        setCurrentTier(subscription.tier)
        
        // Check if user has access to the required tier or higher
        const tierOrder = ['free_trial', 'start_smart', 'grow_intelligence', 'enterprise_advantage']
        const currentTierIndex = tierOrder.indexOf(subscription.tier.tier_type)
        const requiredTierIndex = tierOrder.indexOf(requiredTier)
        
        setHasAccess(currentTierIndex >= requiredTierIndex)
      } else {
        setHasAccess(false)
      }
    } catch (error) {
      console.error('Error checking tier access:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  const loadTierComparison = async () => {
    try {
      const comparison = await tierService.getTierComparison(appUser?.id)
      setTierComparison(comparison)
    } catch (error) {
      console.error('Error loading tier comparison:', error)
    }
  }

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick()
    } else if (showUpgradeModal) {
      loadTierComparison()
      setShowComparison(true)
    } else {
      window.location.href = '/dashboard?tab=subscriptions'
    }
  }

  const getTierInfo = (tierType: string) => {
    const tierInfo = {
      free_trial: {
        name: 'Free Trial',
        icon: <Zap className="h-5 w-5 text-blue-500" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      start_smart: {
        name: 'Start Smart',
        icon: <Star className="h-5 w-5 text-green-500" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      grow_intelligence: {
        name: 'Grow with Intelligence',
        icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      enterprise_advantage: {
        name: 'Enterprise Advantage',
        icon: <Crown className="h-5 w-5 text-yellow-500" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      }
    }

    return tierInfo[tierType as keyof typeof tierInfo] || tierInfo.free_trial
  }

  const getTierIcon = (tierType: string) => {
    switch (tierType) {
      case 'free_trial': return <Zap className="h-4 w-4" />
      case 'start_smart': return <Star className="h-4 w-4" />
      case 'grow_intelligence': return <BarChart3 className="h-4 w-4" />
      case 'enterprise_advantage': return <Crown className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        {children}
      </div>
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  const requiredTierInfo = getTierInfo(requiredTier)
  const currentTierInfo = currentTier ? getTierInfo(currentTier.tier_type) : null

  return (
    <div className="space-y-4">
      <Alert className={`${requiredTierInfo.bgColor} ${requiredTierInfo.borderColor} border-2`}>
        <div className="flex items-center space-x-2">
          {requiredTierInfo.icon}
          <AlertDescription className="font-medium">
            <span className={requiredTierInfo.color}>{requiredTierInfo.name} Tier Required</span>
          </AlertDescription>
        </div>
        <AlertDescription className="mt-2">
          <strong>{feature}</strong> is available with {requiredTierInfo.name} tier or higher.
          {currentTier && (
            <span className="block mt-1 text-sm">
              Your current plan: <Badge variant="outline" className="ml-1">
                {getTierIcon(currentTier.tier_type)}
                <span className="ml-1">{currentTierInfo?.name}</span>
              </Badge>
            </span>
          )}
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-center">
        <Button 
          className="bg-[#040458] hover:bg-[#030345] text-white"
          onClick={handleUpgradeClick}
        >
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to {requiredTierInfo.name}
        </Button>
      </div>

      {showComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-[#040458]">Choose Your Plan</h2>
              <Button variant="outline" onClick={() => setShowComparison(false)}>
                Close
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tierComparison.map((comparison) => (
                  <Card 
                    key={comparison.tier.id} 
                    className={`relative ${comparison.is_popular ? 'ring-2 ring-[#040458]' : ''} ${comparison.is_current ? 'bg-green-50' : ''}`}
                  >
                    {comparison.is_popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-[#040458] text-white">Most Popular</Badge>
                      </div>
                    )}
                    {comparison.is_current && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-green-600 text-white">Current Plan</Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-2">
                        {getTierIcon(comparison.tier.tier_type)}
                      </div>
                      <CardTitle className="text-lg">{comparison.tier.display_name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">
                          {tierService.formatPrice(comparison.tier.price_ugx, 'UGX')}
                        </span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      {comparison.tier.trial_days > 0 && (
                        <Badge variant="outline" className="mt-2">
                          {comparison.tier.trial_days} days free trial
                        </Badge>
                      )}
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{comparison.tier.description}</p>
                      
                      <ul className="space-y-2 text-sm">
                        {tierService.getTierBenefits(comparison.tier).slice(0, 6).map((benefit, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                            <span>{benefit}</span>
                          </li>
                        ))}
                        {tierService.getTierBenefits(comparison.tier).length > 6 && (
                          <li className="text-gray-500 text-xs">
                            +{tierService.getTierBenefits(comparison.tier).length - 6} more features
                          </li>
                        )}
                      </ul>

                      <Button 
                        className={`w-full mt-4 ${comparison.is_current ? 'bg-gray-400' : 'bg-[#040458] hover:bg-[#030345]'} text-white`}
                        disabled={comparison.is_current}
                        onClick={() => {
                          // Handle tier selection
                          console.log('Selected tier:', comparison.tier.tier_type)
                          setShowComparison(false)
                        }}
                      >
                        {comparison.is_current ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TierRestrictionNew
