import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, User, Mail, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { tierService } from '@/services/tierService'

const TestFlow: React.FC = () => {
  const { appUser } = useAuth()
  const [userSubscription, setUserSubscription] = useState<any>(null)
  const [tiers, setTiers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (appUser?.id) {
      loadUserData()
    }
  }, [appUser])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const [subscription, tiersData] = await Promise.all([
        tierService.getUserSubscription(appUser!.id),
        tierService.getTiers()
      ])
      setUserSubscription(subscription)
      setTiers(tiersData)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVerificationStatus = () => {
    if (!appUser) return { status: 'Not logged in', color: 'gray' }
    
    if (appUser.email_verified) {
      return { status: 'Verified', color: 'green' }
    } else {
      return { status: 'Pending Verification', color: 'yellow' }
    }
  }

  const getTierBadge = (tier: string) => {
    const tierColors = {
      free_trial: 'bg-gray-100 text-gray-800',
      start_smart: 'bg-green-100 text-green-800',
      grow_intelligence: 'bg-blue-100 text-blue-800',
      enterprise_advantage: 'bg-purple-100 text-purple-800'
    }
    return (
      <Badge className={tierColors[tier as keyof typeof tierColors] || 'bg-gray-100 text-gray-800'}>
        <Crown className="h-3 w-3 mr-1" />
        {tier.charAt(0).toUpperCase() + tier.slice(1).replace('_', ' ')}
      </Badge>
    )
  }

  const verificationStatus = getVerificationStatus()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040458]"></div>
              <span className="ml-2">Loading test data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Test Flow: User Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appUser ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Email:</span>
                <span>{appUser.email}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Verification Status:</span>
                <Badge className={`${
                  verificationStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                  verificationStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {verificationStatus.color === 'green' ? <CheckCircle className="h-3 w-3 mr-1" /> :
                   verificationStatus.color === 'yellow' ? <Clock className="h-3 w-3 mr-1" /> :
                   <XCircle className="h-3 w-3 mr-1" />}
                  {verificationStatus.status}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-medium">Current Tier:</span>
                {getTierBadge(appUser.tier)}
              </div>

              {userSubscription && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Subscription Status:</span>
                  <Badge className={
                    userSubscription.status === 'active' ? 'bg-green-100 text-green-800' :
                    userSubscription.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {userSubscription.status}
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Please log in to see your status</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div key={tier.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{tier.display_name}</h3>
                  {getTierBadge(tier.tier_type)}
                </div>
                <div className="text-sm text-gray-600">
                  {tierService.formatPrice(tier.price_ugx, 'UGX')}/month
                </div>
                <div className="text-xs text-gray-500">
                  {tier.description}
                </div>
                <div className="text-xs">
                  Max Users: {tier.max_users === -1 ? 'Unlimited' : tier.max_users}
                </div>
                {tier.trial_days > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {tier.trial_days} days free trial
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">1. Email Verification Flow:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• User signs up with email</li>
              <li>• Admin manually verifies email in admin console</li>
              <li>• User can now log in and access features</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Tier Selection Flow:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Verified user can select a tier</li>
              <li>• Free trial gives 30 days full access</li>
              <li>• Paid tiers require payment verification</li>
              <li>• Admin can manage tier upgrades</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Admin Management:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Go to /internal-admin-portal</li>
              <li>• Use "Manage Email Verification" to verify users</li>
              <li>• Use "Open Tier Management" to manage upgrades</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TestFlow
