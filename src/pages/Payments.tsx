import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, CreditCard, Smartphone, Building2, Upload, Check, Copy, Clock, CheckCircle, XCircle, Star, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import PaymentInstructions from '@/components/PaymentInstructions'
import { paymentService, PaymentRequest } from '@/services/paymentService'
import { useAuth } from '@/contexts/AuthContext'

const Payments: React.FC = () => {
  const navigate = useNavigate()
  const { appUser } = useAuth()
  const [activeTab, setActiveTab] = useState('subscription')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium' | null>(null)
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPaymentData()
  }, [])

  const loadPaymentData = async () => {
    try {
      setLoading(true)
      const requests = await paymentService.getPaymentRequests()
      setPaymentRequests(requests)
    } catch (error) {
      console.error('Error loading payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = (tier: 'basic' | 'standard' | 'premium') => {
    setSelectedTier(tier)
    setShowPaymentModal(true)
  }

  const handlePaymentProofUpload = async (file: File) => {
    if (!selectedTier) return

    try {
      const result = await paymentService.createPaymentRequest(selectedTier, 'mtn_mobile_money', file)
      
      if (result.success) {
        toast.success('Payment request submitted! You will be notified once verified.')
        setShowPaymentModal(false)
        setSelectedTier(null)
        loadPaymentData()
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error submitting payment:', error)
      toast.error('Failed to submit payment request')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'verified':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const tierPricing = {
    basic: { price: 50000, name: 'Basic Plan' },
    standard: { price: 150000, name: 'Standard Plan' },
    premium: { price: 300000, name: 'Premium Plan' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-[#040458]">Payments & Subscriptions</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-[#faa51a] text-white border-[#faa51a]">
                {appUser?.tier?.toUpperCase() || 'FREE_TRIAL'} Plan
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="subscription" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]">
              Subscription
            </TabsTrigger>
            <TabsTrigger value="upgrade" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]">
              Upgrade Plan
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]">
              Payment History
            </TabsTrigger>
            <TabsTrigger value="methods" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]">
              Payment Methods
            </TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Manage your current subscription status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{appUser?.tier?.toUpperCase() || 'FREE_TRIAL'} Plan</h3>
                      <p className="text-sm text-gray-600">Current subscription status</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">No expiration</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => handleUpgrade('basic')}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      variant="outline"
                    >
                      <Star className="h-6 w-6 text-green-500" />
                      <span className="font-medium">Basic Plan</span>
                      <span className="text-sm text-gray-600">UGX 50,000/month</span>
                    </Button>
                    <Button
                      onClick={() => handleUpgrade('standard')}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      variant="outline"
                    >
                      <Crown className="h-6 w-6 text-purple-500" />
                      <span className="font-medium">Standard Plan</span>
                      <span className="text-sm text-gray-600">UGX 150,000/month</span>
                    </Button>
                    <Button
                      onClick={() => handleUpgrade('premium')}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      variant="outline"
                    >
                      <Crown className="h-6 w-6 text-orange-500" />
                      <span className="font-medium">Premium Plan</span>
                      <span className="text-sm text-gray-600">UGX 300,000/month</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upgrade Plan Tab */}
          <TabsContent value="upgrade">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Growth Plan</CardTitle>
                <CardDescription>Transparent pricing designed for African businesses. Scale your business with the right tools at the right price.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Free Trial */}
                  <Card className="border-2 border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Free Trial</h3>
                        <Badge className="bg-[#040458] text-white">Free</Badge>
                      </div>
                      <div className="text-3xl font-bold text-[#faa51a]">0 UGX</div>
                      <p className="text-sm text-gray-600">30 days free</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">Try everything for free - no credit card required.</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Full access to all features</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />POS system with barcode scanning</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Complete inventory management</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />AI analytics and insights</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Multi-user access</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />All payment methods</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Priority support during trial</li>
                      </ul>
                      <Button className="w-full mt-4 bg-[#040458] hover:bg-[#030345] text-white">
                        Start Free Trial
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Basic Plan */}
                  <Card className="border-2 border-gray-200">
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Basic</h3>
                      <div className="text-3xl font-bold text-[#faa51a]">50,000 UGX</div>
                      <p className="text-sm text-gray-600">per month</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">Perfect for small businesses starting their digital transformation.</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Mobile POS with barcode scanning</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Basic inventory management</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Sales reporting (daily, weekly, monthly)</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Single user dashboard</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Receipt generation</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />CSV/PDF exports</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Email support</li>
                      </ul>
                      <Button 
                        onClick={() => handleUpgrade('basic')}
                        className="w-full mt-4 bg-white text-[#040458] border-[#040458] hover:bg-gray-50"
                        variant="outline"
                      >
                        Start Basic Plan
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Standard Plan */}
                  <Card className="border-2 border-[#faa51a] relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-[#faa51a] text-white">Most Popular</Badge>
                    </div>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Standard</h3>
                      <div className="text-3xl font-bold text-[#faa51a]">150,000 UGX</div>
                      <p className="text-sm text-gray-600">per month</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">Ideal for growing SMEs ready for advanced automation.</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Everything in Basic</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />QuickBooks API integration</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Tax computation & VAT analysis</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />AI sales trend analytics</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Multi-user access (up to 5 users)</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Role-based permissions</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Automated financial reports</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Priority support</li>
                      </ul>
                      <Button 
                        onClick={() => handleUpgrade('standard')}
                        className="w-full mt-4 bg-[#040458] hover:bg-[#030345] text-white"
                      >
                        Choose Standard
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track all your payment requests and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading payment history...</div>
                ) : paymentRequests.length > 0 ? (
                  <div className="space-y-4">
                    {paymentRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <CreditCard className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{request.tier.toUpperCase()} Plan</h3>
                            <p className="text-sm text-gray-600">
                              UGX {request.amount.toLocaleString()} • {request.payment_method}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(request.created_at || '').toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(request.status)}
                          {request.notes && (
                            <p className="text-xs text-gray-500 mt-1">{request.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No payment requests found</p>
                    <p className="text-sm">Your payment history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="methods">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mobile Money */}
                  <Card className="border-2 border-gray-200 hover:border-[#040458] transition-colors">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Smartphone className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Mobile Money</h3>
                          <p className="text-sm text-gray-600">MTN, Airtel</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">MTN Mobile Money</h4>
                          <p className="text-xs text-gray-600">Merchant Code: 720504</p>
                          <p className="text-xs text-gray-600">Name: Otic Foundation</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Airtel Money</h4>
                          <p className="text-xs text-gray-600">Merchant Code: 4379529</p>
                          <p className="text-xs text-gray-600">Name: Otic Foundation</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bank Transfer */}
                  <Card className="border-2 border-[#040458] bg-[#040458] text-white">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Bank Transfer</h3>
                          <p className="text-sm text-white/80">Direct Transfer</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-white/10 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Stanbic Bank</h4>
                          <p className="text-xs">Account Name: Otic Foundation Limited</p>
                          <p className="text-xs">Account Number: 9030025213237 UGX</p>
                          <p className="text-xs">Branch: Garden City</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Instructions Modal */}
      {showPaymentModal && selectedTier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#040458]">Complete Payment</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false)
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
    </div>
  )
}

export default Payments