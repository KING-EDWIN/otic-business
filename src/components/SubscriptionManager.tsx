import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Check, X, Crown, Zap, Star, CreditCard } from 'lucide-react'
import { subscriptionService, SubscriptionTier, UserSubscription } from '@/services/subscriptionService'
import { paymentService, PaymentRequest } from '@/services/paymentService'
import PaymentInstructions from './PaymentInstructions'

interface SubscriptionManagerProps {
  userId: string
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ userId }) => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
  const [usage, setUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium' | null>(null)
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])

  useEffect(() => {
    loadSubscriptionData()
  }, [userId])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      const [tiersData, status, usageData, paymentData] = await Promise.all([
        subscriptionService.getTiers(),
        subscriptionService.checkSubscriptionStatus(userId),
        subscriptionService.getSubscriptionUsage(userId),
        paymentService.getPaymentRequests()
      ])
      
      setTiers(tiersData)
      setCurrentSubscription(status.subscription)
      setSubscriptionStatus(status)
      setUsage(usageData)
      setPaymentRequests(paymentData)
    } catch (error) {
      console.error('Error loading subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (tierId: string) => {
    setSelectedTier(tierId as 'basic' | 'standard' | 'premium')
    setShowPayment(true)
  }

  const handlePaymentProofUpload = async (file: File) => {
    if (!selectedTier) return

    try {
      const result = await paymentService.createPaymentRequest(selectedTier, 'mtn_mobile_money', file)
      
      if (result.success) {
        // Refresh payment requests
        const updatedPayments = await paymentService.getPaymentRequests()
        setPaymentRequests(updatedPayments)
        setShowPayment(false)
        setSelectedTier(null)
        alert('Payment request submitted! You will be notified once verified.')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error submitting payment:', error)
      alert('Failed to submit payment request')
    }
  }

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free-trial': return <Zap className="h-6 w-6 text-blue-500" />
      case 'basic': return <Star className="h-6 w-6 text-green-500" />
      case 'standard': return <Crown className="h-6 w-6 text-purple-500" />
      case 'premium': return <Crown className="h-6 w-6 text-yellow-500" />
      default: return <Star className="h-6 w-6 text-gray-500" />
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getUsagePercentage = (current: number, max: number) => {
    if (max === -1) return 0 // unlimited
    return Math.min((current / max) * 100, 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Instructions Modal */}
      {showPayment && selectedTier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#040458]">Complete Payment</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPayment(false)
                    setSelectedTier(null)
                  }}
                >
                  ✕
                </Button>
              </div>
              <PaymentInstructions
                tier={selectedTier}
                onPaymentProofUpload={handlePaymentProofUpload}
              />
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      {subscriptionStatus && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTierIcon(subscriptionStatus.tier?.id || '')}
              Current Subscription
            </CardTitle>
            <CardDescription>
              {subscriptionStatus.tier?.name} - {subscriptionStatus.daysRemaining} days remaining
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={subscriptionStatus.hasAccess ? "default" : "destructive"}>
                  {subscriptionStatus.subscription?.status || 'No Subscription'}
                </Badge>
              </div>
              
              {subscriptionStatus.hasAccess && usage && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Products</span>
                      <span>{usage.products} / {usage.limits.maxProducts === -1 ? '∞' : usage.limits.maxProducts}</span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage.products, usage.limits.maxProducts)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Users</span>
                      <span>{usage.users} / {usage.limits.maxUsers === -1 ? '∞' : usage.limits.maxUsers}</span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage.users, usage.limits.maxUsers)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage</span>
                      <span>{usage.storage}MB / {usage.limits.maxStorage}MB</span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(usage.storage, usage.limits.maxStorage)} 
                      className="h-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative ${
                currentSubscription?.tier_id === tier.id 
                  ? 'border-2 border-[#040458] shadow-lg' 
                  : 'hover:shadow-md transition-shadow'
              }`}
            >
              {currentSubscription?.tier_id === tier.id && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#040458] text-white">Current Plan</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getTierIcon(tier.id)}
                </div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <div className="text-3xl font-bold text-[#040458]">
                  {formatPrice(tier.price)}
                  {tier.price > 0 && <span className="text-sm font-normal text-gray-500">/month</span>}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={currentSubscription?.tier_id === tier.id ? "outline" : "default"}
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={currentSubscription?.tier_id === tier.id}
                  style={{
                    backgroundColor: currentSubscription?.tier_id === tier.id ? 'transparent' : '#040458',
                    color: currentSubscription?.tier_id === tier.id ? '#040458' : 'white',
                    borderColor: '#040458'
                  }}
                >
                  {currentSubscription?.tier_id === tier.id ? 'Current Plan' : 
                   tier.price === 0 ? 'Start Free Trial' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Requests */}
      {paymentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Requests
            </CardTitle>
            <CardDescription>Track your payment requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{request.tier.toUpperCase()} Plan</div>
                    <div className="text-sm text-gray-600">
                      UGX {request.amount.toLocaleString()} • {request.payment_method}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(request.created_at || '').toLocaleString()}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      request.status === 'verified' ? 'text-green-600 border-green-600' :
                      request.status === 'rejected' ? 'text-red-600 border-red-600' :
                      'text-yellow-600 border-yellow-600'
                    }
                  >
                    {request.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>Compare all features across different plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Feature</th>
                  {tiers.map((tier) => (
                    <th key={tier.id} className="text-center p-2">{tier.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Price</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center p-2">{formatPrice(tier.price)}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Max Products</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center p-2">
                      {tier.maxProducts === -1 ? 'Unlimited' : tier.maxProducts.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Max Users</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center p-2">
                      {tier.maxUsers === -1 ? 'Unlimited' : tier.maxUsers}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">AI Features</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center p-2">
                      {tier.aiFeatures ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Advanced Reporting</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center p-2">
                      {tier.advancedReporting ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 font-medium">Priority Support</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center p-2">
                      {tier.prioritySupport ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
