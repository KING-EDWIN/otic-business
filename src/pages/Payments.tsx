import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Receipt,
  TrendingUp,
  Users,
  ArrowLeft,
  Building2
} from 'lucide-react'
import { toast } from 'sonner'

interface Subscription {
  id: string
  tier: 'basic' | 'standard' | 'premium'
  status: 'active' | 'expired' | 'cancelled'
  expires_at: string
  created_at: string
}

interface Payment {
  id: string
  amount: number
  method: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  description: string
}

const Payments = () => {
  const { appUser } = useAuth()
  const navigate = useNavigate()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('basic')

  const tierPricing = {
    basic: { price: 1000000, name: 'Basic Plan', features: ['POS System', 'Basic Reports', 'Single User'] },
    standard: { price: 3000000, name: 'Standard Plan', features: ['Everything in Basic', 'QuickBooks Integration', 'AI Analytics', 'Multi-user Access'] },
    premium: { price: 5000000, name: 'Premium Plan', features: ['Everything in Standard', 'Multi-branch Management', 'AI Forecasting', 'Priority Support'] }
  }

  useEffect(() => {
    if (appUser) {
      fetchSubscription()
      fetchPayments()
    }
  }, [appUser])

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', appUser?.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      // Simulate payment history - in real app, this would come from payment provider
      const mockPayments: Payment[] = [
        {
          id: '1',
          amount: 1000000,
          method: 'Mobile Money',
          status: 'completed',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Basic Plan - Monthly Subscription'
        },
        {
          id: '2',
          amount: 1000000,
          method: 'Flutterwave',
          status: 'completed',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Basic Plan - Monthly Subscription'
        }
      ]
      setPayments(mockPayments)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (tier: 'basic' | 'standard' | 'premium') => {
    setProcessing(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update subscription in database
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: appUser?.id,
          tier,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })

      if (error) throw error

      toast.success(`Successfully upgraded to ${tierPricing[tier].name}!`)
      fetchSubscription()
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      toast.error('Failed to upgrade subscription')
    } finally {
      setProcessing(false)
    }
  }

  const handlePayment = async (method: string) => {
    setProcessing(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success(`Payment processed successfully via ${method}!`)
      
      // Add to payment history
      const newPayment: Payment = {
        id: Date.now().toString(),
        amount: tierPricing[selectedTier].price,
        method,
        status: 'completed',
        created_at: new Date().toISOString(),
        description: `${tierPricing[selectedTier].name} - Monthly Subscription`
      }
      
      setPayments(prev => [newPayment, ...prev])
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'standard': return 'bg-green-100 text-green-800'
      case 'premium': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <CreditCard className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Payments & Subscriptions</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your subscription and payment methods
                </p>
              </div>
            </div>
            {subscription && (
              <Badge className={getTierColor(subscription.tier)}>
                {subscription.tier.toUpperCase()} Plan
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="upgrade">Upgrade Plan</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Your active subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{tierPricing[subscription.tier].name}</h3>
                        <p className="text-muted-foreground">
                          UGX {tierPricing[subscription.tier].price.toLocaleString()} per month
                        </p>
                      </div>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Features included:</h4>
                      <ul className="space-y-1">
                        {tierPricing[subscription.tier].features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Expires on {new Date(subscription.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active subscription found</p>
                    <Button className="mt-4" onClick={() => setSelectedTier('basic')}>
                      Subscribe Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upgrade" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(tierPricing).map(([tier, details]) => (
                <Card key={tier} className={subscription?.tier === tier ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <CardTitle>{details.name}</CardTitle>
                    <div className="text-3xl font-bold text-primary">
                      UGX {details.price.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {details.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => handleUpgrade(tier as any)}
                      disabled={processing || subscription?.tier === tier}
                    >
                      {processing ? 'Processing...' : 
                       subscription?.tier === tier ? 'Current Plan' : 
                       'Upgrade Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your recent payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No payment history found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.created_at).toLocaleDateString()} • {payment.method}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">UGX {payment.amount.toLocaleString()}</p>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methods" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col space-y-2"
                        onClick={() => handlePayment('Mobile Money')}
                        disabled={processing}
                      >
                        <Smartphone className="h-6 w-6" />
                        <span>Mobile Money</span>
                        <span className="text-xs text-muted-foreground">MTN, Airtel</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col space-y-2"
                        onClick={() => handlePayment('Flutterwave')}
                        disabled={processing}
                      >
                        <CreditCard className="h-6 w-6" />
                        <span>Flutterwave</span>
                        <span className="text-xs text-muted-foreground">Cards, Bank Transfer</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col space-y-2"
                        onClick={() => handlePayment('PayPal')}
                        disabled={processing}
                      >
                        <DollarSign className="h-6 w-6" />
                        <span>PayPal</span>
                        <span className="text-xs text-muted-foreground">International</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col space-y-2"
                        onClick={() => handlePayment('Bank Transfer')}
                        disabled={processing}
                      >
                        <Building2 className="h-6 w-6" />
                        <span>Bank Transfer</span>
                        <span className="text-xs text-muted-foreground">Direct Transfer</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Payments
