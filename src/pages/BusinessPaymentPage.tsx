import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Coins,
  Gift,
  Shield,
  Clock,
  Star
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'

interface TokenDetails {
  id: string
  code: string
  value: number
  description: string
  is_active: boolean
  is_used: boolean
}

interface CouponDetails {
  id: string
  code: string
  discount_percentage?: number
  discount_amount?: number
  description: string
  is_active: boolean
  is_used: boolean
}

const BusinessPaymentPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('tokens')
  
  // Token payment state
  const [tokenCode, setTokenCode] = useState('')
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null)
  const [verifyingToken, setVerifyingToken] = useState(false)
  
  // Coupon payment state
  const [couponCode, setCouponCode] = useState('')
  const [couponDetails, setCouponDetails] = useState<CouponDetails | null>(null)
  const [verifyingCoupon, setVerifyingCoupon] = useState(false)

  // Pricing tiers
  const pricingTiers = [
    {
      name: 'Start Smart',
      price: 1000000,
      period: 'Per Month',
      description: 'Perfect for small businesses starting their digital transformation',
      features: ['POS System', 'Basic Inventory', 'Customer Management', 'Basic Reports'],
      popular: false
    },
    {
      name: 'Grow Fast',
      price: 2000000,
      period: 'Per Month',
      description: 'Ideal for growing businesses that need advanced features',
      features: ['Everything in Start Smart', 'Advanced Analytics', 'Multi-location', 'API Access'],
      popular: true
    },
    {
      name: 'Scale Up',
      price: 5000000,
      period: 'Per Month',
      description: 'For established businesses ready to scale',
      features: ['Everything in Grow Fast', 'Custom Integrations', 'Priority Support', 'White-label'],
      popular: false
    }
  ]

  const selectedTier = location.state?.selectedTier || pricingTiers[0]

  const handleTokenVerification = async () => {
    if (!tokenCode.trim()) {
      toast.error('Please enter a token code')
      return
    }

    if (tokenCode.length < 6) {
      toast.error('Token code must be at least 6 characters')
      return
    }

    setVerifyingToken(true)
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('code', tokenCode.toUpperCase())
        .eq('is_used', false)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        toast.error('Invalid or expired token')
        setTokenDetails(null)
      } else {
        setTokenDetails(data)
        toast.success('Token verified successfully!')
      }
    } catch (error) {
      console.error('Error verifying token:', error)
      toast.error('Error verifying token')
      setTokenDetails(null)
    } finally {
      setVerifyingToken(false)
    }
  }

  const handleCouponVerification = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    if (couponCode.length !== 5) {
      toast.error('Coupon code must be exactly 5 characters')
      return
    }

    setVerifyingCoupon(true)
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_used', false)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        toast.error('Invalid or expired coupon code')
        setCouponDetails(null)
      } else {
        setCouponDetails(data)
        toast.success('Coupon verified successfully!')
      }
    } catch (error) {
      console.error('Error verifying coupon:', error)
      toast.error('Error verifying coupon')
      setCouponDetails(null)
    } finally {
      setVerifyingCoupon(false)
    }
  }

  const calculateFinalPrice = () => {
    let finalPrice = selectedTier.price

    if (couponDetails) {
      if (couponDetails.discount_percentage) {
        finalPrice = finalPrice * (1 - couponDetails.discount_percentage / 100)
      } else if (couponDetails.discount_amount) {
        finalPrice = Math.max(0, finalPrice - couponDetails.discount_amount)
      }
    }

    if (tokenDetails) {
      finalPrice = Math.max(0, finalPrice - tokenDetails.value)
    }

    return Math.round(finalPrice)
  }

  const handlePayment = async () => {
    if (!tokenDetails && !couponDetails) {
      toast.error('Please verify a token or coupon code')
      return
    }

    setLoading(true)
    try {
      const finalPrice = calculateFinalPrice()
      
      if (finalPrice <= 0) {
        // Free subscription
        await createFreeSubscription()
      } else {
        // Paid subscription with discount
        await createPaidSubscription(finalPrice)
      }

      toast.success('Payment processed successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createFreeSubscription = async () => {
    // Create subscription record
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user?.id,
        plan_name: selectedTier.name,
        price: 0,
        status: 'active',
        payment_method: couponDetails ? 'coupon' : 'token',
        payment_reference: couponDetails?.code || tokenDetails?.code,
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (error) throw error

    // Mark token/coupon as used
    if (tokenDetails) {
      await supabase
        .from('tokens')
        .update({ is_used: true, used_by: user?.id, used_at: new Date().toISOString() })
        .eq('id', tokenDetails.id)
    }

    if (couponDetails) {
      await supabase
        .from('coupons')
        .update({ is_used: true, used_by: user?.id, used_at: new Date().toISOString() })
        .eq('id', couponDetails.id)
    }
  }

  const createPaidSubscription = async (finalPrice: number) => {
    // For now, just create the subscription record
    // In production, you'd integrate with Flutterwave here
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user?.id,
        plan_name: selectedTier.name,
        price: finalPrice,
        status: 'pending',
        payment_method: 'flutterwave',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (error) throw error

    toast.info('Payment integration coming soon. Subscription created with pending status.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040458] to-[#faa51a]">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Complete Your Payment</h1>
                <p className="text-white/80">Choose your preferred payment method</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/business-signin')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Selected Plan */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-[#faa51a]" />
                <span>Selected Plan</span>
                {selectedTier.popular && (
                  <Badge className="bg-[#faa51a] text-white">Most Popular</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#040458]">{selectedTier.name}</h3>
                <div className="text-3xl font-bold text-[#faa51a] mt-2">
                  {selectedTier.price.toLocaleString()} UGX
                </div>
                <p className="text-gray-600">{selectedTier.period}</p>
              </div>
              
              <p className="text-gray-600 text-center">{selectedTier.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-[#040458]">Features included:</h4>
                <ul className="space-y-1">
                  {selectedTier.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-[#040458]" />
                <span>Payment Options</span>
              </CardTitle>
              <CardDescription>
                Choose your preferred payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tokens" className="flex items-center space-x-2">
                    <Coins className="h-4 w-4" />
                    <span>Tokens</span>
                  </TabsTrigger>
                  <TabsTrigger value="coupons" className="flex items-center space-x-2">
                    <Gift className="h-4 w-4" />
                    <span>Coupons</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tokens" className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="tokenCode">Token Code</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="tokenCode"
                        placeholder="Enter your token code"
                        value={tokenCode}
                        onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleTokenVerification}
                        disabled={verifyingToken || !tokenCode.trim()}
                        variant="outline"
                      >
                        {verifyingToken ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                    
                    {tokenDetails && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">Token Verified</span>
                        </div>
                        <p className="text-sm text-green-700">
                          <strong>{tokenDetails.code}</strong> - {tokenDetails.value.toLocaleString()} UGX value
                        </p>
                        <p className="text-xs text-green-600">{tokenDetails.description}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="coupons" className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="couponCode">Coupon Code</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="couponCode"
                        placeholder="Enter 5-digit coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        maxLength={5}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleCouponVerification}
                        disabled={verifyingCoupon || !couponCode.trim()}
                        variant="outline"
                      >
                        {verifyingCoupon ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                    
                    {couponDetails && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">Coupon Verified</span>
                        </div>
                        <p className="text-sm text-green-700">
                          <strong>{couponDetails.code}</strong> - 
                          {couponDetails.discount_percentage 
                            ? ` ${couponDetails.discount_percentage}% discount`
                            : ` ${couponDetails.discount_amount?.toLocaleString()} UGX off`
                          }
                        </p>
                        <p className="text-xs text-green-600">{couponDetails.description}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Price Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Original Price:</span>
                  <span>{selectedTier.price.toLocaleString()} UGX</span>
                </div>
                
                {couponDetails && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount:</span>
                    <span>
                      -{couponDetails.discount_percentage 
                        ? `${couponDetails.discount_percentage}%`
                        : `${couponDetails.discount_amount?.toLocaleString()} UGX`
                      }
                    </span>
                  </div>
                )}
                
                {tokenDetails && (
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Token Value:</span>
                    <span>-{tokenDetails.value.toLocaleString()} UGX</span>
                  </div>
                )}
                
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Final Price:</span>
                    <span className={calculateFinalPrice() <= 0 ? 'text-green-600' : 'text-[#040458]'}>
                      {calculateFinalPrice() <= 0 ? 'FREE' : `${calculateFinalPrice().toLocaleString()} UGX`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handlePayment}
                  disabled={(!tokenDetails && !couponDetails) || loading}
                  className="w-full bg-[#040458] hover:bg-[#030345] text-white"
                >
                  {loading ? 'Processing...' : 'Complete Payment'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Skip for Now
                </Button>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Secure Payment</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Your payment information is encrypted and secure. We never store your payment details.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BusinessPaymentPage
