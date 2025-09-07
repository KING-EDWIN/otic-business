import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Crown, Zap, Star, Building, Users, BarChart3, Shield, Phone, Check, X } from 'lucide-react'
import { tierService, TierComparison } from '@/services/tierService'
import { useAuth } from '@/contexts/AuthContext'

const PricingPage: React.FC = () => {
  const { appUser } = useAuth()
  const [tierComparison, setTierComparison] = useState<TierComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [isYearly, setIsYearly] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  useEffect(() => {
    loadTierComparison()
  }, [])

  const loadTierComparison = async () => {
    try {
      setLoading(true)
      const comparison = await tierService.getTierComparison(appUser?.id)
      setTierComparison(comparison)
    } catch (error) {
      console.error('Error loading tier comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierIcon = (tierType: string) => {
    switch (tierType) {
      case 'free_trial': return <Zap className="h-6 w-6 text-blue-500" />
      case 'start_smart': return <Star className="h-6 w-6 text-green-500" />
      case 'grow_intelligence': return <BarChart3 className="h-6 w-6 text-purple-500" />
      case 'enterprise_advantage': return <Crown className="h-6 w-6 text-yellow-500" />
      default: return <Star className="h-6 w-6 text-gray-500" />
    }
  }

  const getFeatureIcon = (category: string) => {
    switch (category) {
      case 'core': return <Building className="h-4 w-4 text-blue-500" />
      case 'analytics': return <BarChart3 className="h-4 w-4 text-purple-500" />
      case 'integration': return <Shield className="h-4 w-4 text-green-500" />
      case 'support': return <Phone className="h-4 w-4 text-orange-500" />
      case 'system': return <Users className="h-4 w-4 text-gray-500" />
      default: return <Check className="h-4 w-4 text-green-500" />
    }
  }

  const handleTierSelect = async (tierId: string) => {
    if (!appUser?.id) {
      // Redirect to sign up
      window.location.href = '/signup'
      return
    }

    try {
      setSelectedTier(tierId)
      const result = await tierService.createSubscription(appUser.id, tierId)
      
      if (result.success) {
        // Redirect to payment or dashboard
        window.location.href = '/dashboard?tab=subscriptions'
      } else {
        console.error('Error creating subscription:', result.error)
      }
    } catch (error) {
      console.error('Error selecting tier:', error)
    } finally {
      setSelectedTier(null)
    }
  }

  const getPrice = (tier: any) => {
    if (isYearly) {
      const yearlyPrice = tier.price_ugx * 12 * 0.8 // 20% discount for yearly
      return {
        amount: yearlyPrice,
        period: 'year',
        original: tier.price_ugx * 12
      }
    }
    return {
      amount: tier.price_ugx,
      period: 'month',
      original: null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start your business transformation journey today
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-[#040458]"
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-green-100 text-green-800 ml-2">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {tierComparison.map((comparison) => {
            const price = getPrice(comparison.tier)
            const isCurrentPlan = comparison.is_current
            
            return (
              <Card 
                key={comparison.tier.id} 
                className={`relative ${comparison.is_popular ? 'ring-2 ring-[#040458] scale-105' : ''} ${isCurrentPlan ? 'bg-green-50 border-green-200' : ''}`}
              >
                {comparison.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#040458] text-white">Most Popular</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 text-white">Current Plan</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getTierIcon(comparison.tier.tier_type)}
                  </div>
                  <CardTitle className="text-xl">{comparison.tier.display_name}</CardTitle>
                  
                  <div className="mt-4">
                    {comparison.tier.tier_type === 'free_trial' ? (
                      <div>
                        <span className="text-3xl font-bold text-green-600">Free</span>
                        <span className="text-gray-500 ml-2">for {comparison.tier.trial_days} days</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold">
                          {tierService.formatPrice(price.amount, 'UGX')}
                        </span>
                        <span className="text-gray-500">/{price.period}</span>
                        {price.original && (
                          <div className="text-sm text-gray-400 line-through mt-1">
                            {tierService.formatPrice(price.original, 'UGX')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2">
                    {comparison.tier.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Key Features */}
                  <ul className="space-y-3 mb-6">
                    {tierService.getTierBenefits(comparison.tier).map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* User Limit */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>
                        {comparison.tier.max_users === -1 
                          ? 'Unlimited users' 
                          : `Up to ${comparison.tier.max_users} user${comparison.tier.max_users > 1 ? 's' : ''}`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className={`w-full ${isCurrentPlan ? 'bg-gray-400' : 'bg-[#040458] hover:bg-[#030345]'} text-white`}
                    disabled={isCurrentPlan || selectedTier === comparison.tier.id}
                    onClick={() => handleTierSelect(comparison.tier.id)}
                  >
                    {isCurrentPlan ? 'Current Plan' : 
                     selectedTier === comparison.tier.id ? 'Processing...' :
                     comparison.tier.tier_type === 'free_trial' ? 'Start Free Trial' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Feature Comparison</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Features
                  </th>
                  {tierComparison.map((comparison) => (
                    <th key={comparison.tier.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {comparison.tier.display_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparison.features && comparison.features.length > 0 && comparison.features.map((feature) => (
                  <tr key={feature.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getFeatureIcon(feature.category)}
                        <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                      </div>
                    </td>
                    {tierComparison.map((comparison) => (
                      <td key={comparison.tier.id} className="px-6 py-4 whitespace-nowrap text-center">
                        {comparison.tier.features.includes(feature.name) ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan anytime?
              </h4>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600">
                We accept mobile money, bank transfers, and credit cards. All payments are processed securely.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-600">
                Yes, we offer a 30-day free trial with full access to all features. No credit card required.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h4>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage
