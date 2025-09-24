import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, CreditCard, Smartphone, Building2, Upload, Check, Copy, Clock, CheckCircle, XCircle, Star, Crown, TrendingUp, DollarSign, Users, Calendar, RefreshCw, Download, Eye, MoreVertical, Shield } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import PaymentInstructions from '@/components/PaymentInstructions'
import { paymentService, PaymentRequest } from '@/services/paymentService'
import { flutterwaveWebService, PaymentTransaction } from '@/services/flutterwaveWebService'
import { paymentVerificationService, OrderData } from '@/services/paymentVerificationService'
import { getUrl } from '@/services/environmentService'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const Payments: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('subscription')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium' | null>(null)
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false)
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalPayments: 0,
    pendingPayments: 0,
    verifiedPayments: 0,
    rejectedPayments: 0
  })
  const [revenueData, setRevenueData] = useState([])
  const [flutterwaveTransactions, setFlutterwaveTransactions] = useState<PaymentTransaction[]>([])
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    currency: 'UGX',
    description: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  })

  useEffect(() => {
    // Check URL parameters for tier selection
    const tierParam = searchParams.get('tier')
    if (tierParam) {
      // Map tier names from pricing page to our internal tier names
      const tierMapping: { [key: string]: 'basic' | 'standard' | 'premium' } = {
        'free trial': 'basic',
        'start smart': 'basic',
        'grow with intelligence': 'standard',
        'enterprise advantage': 'premium'
      }
      
      const mappedTier = tierMapping[tierParam.toLowerCase()]
      if (mappedTier) {
        setSelectedTier(mappedTier)
        setShowPaymentModal(true)
        setActiveTab('subscription')
      }
    }
    
    // Load payment data only if user is available
    if (user?.id) {
      loadPaymentData()
    } else {
      // If no user, stop loading after a short delay
      const timeout = setTimeout(() => {
        setLoading(false)
      }, 2000)
      
      return () => clearTimeout(timeout)
    }
  }, [searchParams, user])

  const loadPaymentData = async () => {
    try {
      setLoading(true)
      
      if (!user?.id) {
        console.log('No user ID, skipping payment data load')
        setLoading(false)
        return
      }

      // Load payment requests first
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (paymentsError) {
        console.warn('Payment requests error:', paymentsError)
        setPaymentRequests([])
      } else {
        setPaymentRequests(payments || [])
      }

      // Load other data in parallel
      const loadPromises = [
        // Load Flutterwave transactions
        loadFlutterwaveTransactions().catch(err => {
          console.warn('Flutterwave transactions failed:', err)
        })
      ]

      // Wait for other data
      await Promise.allSettled(loadPromises)

      // Calculate stats after payment requests are loaded
      await loadPaymentStats()
      
    } catch (error) {
      console.error('Error loading payment data:', error)
      // Don't show error toast for timeout - just log it
      if (!error.message?.includes('timeout')) {
        toast.error('Failed to load payment data')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentStats = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID, skipping payment stats')
        return
      }

      // Use the already loaded payment requests instead of making another query
      const payments = paymentRequests
      
      console.log('Calculating stats for payments:', payments?.length || 0)

      // Calculate statistics
      const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
      const monthlyRevenue = payments?.filter(payment => {
        const paymentDate = new Date(payment.created_at)
        const now = new Date()
        return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
      }).reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

      const totalPayments = payments?.length || 0
      const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0
      const verifiedPayments = payments?.filter(p => p.status === 'verified').length || 0
      const rejectedPayments = payments?.filter(p => p.status === 'rejected').length || 0

      setPaymentStats({
        totalRevenue,
        monthlyRevenue,
        totalPayments,
        pendingPayments,
        verifiedPayments,
        rejectedPayments
      })

      // Generate revenue chart data
      const monthlyData = generateMonthlyRevenueData(payments || [])
      setRevenueData(monthlyData)

    } catch (error) {
      console.error('Error loading payment stats:', error)
      // Set empty stats on error
      setPaymentStats({
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalPayments: 0,
        pendingPayments: 0,
        verifiedPayments: 0,
        rejectedPayments: 0
      })
    }
  }

  const generateMonthlyRevenueData = (payments: any[]) => {
    const monthlyRevenue = new Map<string, number>()
    
    payments.forEach(payment => {
      const month = payment.created_at.substring(0, 7) // YYYY-MM
      const existing = monthlyRevenue.get(month) || 0
      monthlyRevenue.set(month, existing + (payment.amount || 0))
    })

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentDate = new Date()
    
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5 + i, 1)
      const monthKey = date.toISOString().substring(0, 7)
      return {
        month: months[date.getMonth()],
        revenue: monthlyRevenue.get(monthKey) || 0
      }
    })
  }

  const loadFlutterwaveTransactions = async () => {
    try {
      if (!user?.id) return

      // Load from database directly since web service doesn't have getPaymentHistory
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      const transactions = data || []
      setFlutterwaveTransactions(transactions)
    } catch (error) {
      console.error('Error loading Flutterwave transactions:', error)
    }
  }

  const saveTransactionToDatabase = async (transactionData: any) => {
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .insert([{
          ...transactionData,
          user_id: user?.id,
          created_at: new Date().toISOString()
        }])
      
      if (error) throw error
      console.log('✅ Transaction saved to database')
    } catch (error) {
      console.error('❌ Error saving transaction:', error)
      throw error
    }
  }

  const updateTransactionStatus = async (txRef: string, status: string) => {
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('tx_ref', txRef)
      
      if (error) throw error
      console.log('✅ Transaction status updated:', status)
    } catch (error) {
      console.error('❌ Error updating transaction status:', error)
    }
  }

  const handleFlutterwavePayment = async (tier: 'basic' | 'standard' | 'premium') => {
    try {
      setIsProcessingPayment(true)

      // Validate phone number
      if (!paymentFormData.customerPhone) {
        toast.error('Please enter your phone number for testing')
        return
      }

      // Set tier-specific pricing following OTIC Business specification
      const tierPricing = {
        basic: { amount: 1000000, description: 'Start Smart Plan - Basic Features' },
        standard: { amount: 3000000, description: 'Grow with Intelligence Plan - Advanced Features' },
        premium: { amount: 5000000, description: 'Enterprise Advantage Plan - Premium Features' }
      }

      const pricing = tierPricing[tier]
      const txRef = flutterwaveWebService.generateTxRef() // Generates "OTIC-{timestamp}-{random}"

      // Prepare payment data following the exact specification
      const paymentData = {
        amount: pricing.amount,
        currency: 'UGX',
        email: profile?.email || user?.email || '',
        phone_number: paymentFormData.customerPhone,
        name: profile?.full_name || profile?.business_name || 'Customer',
        tx_ref: txRef,
        description: pricing.description,
        redirect_url: getUrl(`/payments/success?tx_ref=${txRef}`),
        meta: {
          tier: tier,
          user_id: user?.id,
          phone_number: paymentFormData.customerPhone
        }
      }

      console.log('🚀 Flutterwave payment data:', paymentData)

      // Create order in database first (following the specification)
      const orderData: OrderData = {
        tx_ref: txRef,
        amount: pricing.amount,
        currency: 'UGX',
        payment_status: 'pending',
        customer_name: paymentData.name,
        customer_email: paymentData.email,
        customer_phone: paymentData.phone_number,
        user_id: user.id,
        tier: tier,
        description: pricing.description
      }

      const orderResult = await paymentVerificationService.createOrder(orderData)
      if (!orderResult.success) {
        throw new Error(`Failed to create order: ${orderResult.error}`)
      }

      toast.success('Opening Flutterwave payment...')

      // Initialize payment using Flutterwave Checkout Modal
      const result = await flutterwaveWebService.initializePayment(paymentData)

      if (result.status === 'success' && result.data) {
        // Payment successful - verify with backend
        if (result.data.transaction_id) {
          const verificationResult = await paymentVerificationService.verifyPayment({
            transaction_id: result.data.transaction_id,
            tx_ref: txRef
          })

          if (verificationResult.success) {
            toast.success('Payment successful!')
            
            // Close modal and refresh data
            setShowPaymentModal(false)
            setSelectedTier(null)
            await loadPaymentData()
          } else {
            toast.error(`Payment verification failed: ${verificationResult.message}`)
          }
        } else {
          toast.success('Payment initiated! Please check your email for confirmation.')
          setShowPaymentModal(false)
          setSelectedTier(null)
        }
      } else {
        throw new Error(result.message || 'Failed to initialize payment')
      }
    } catch (error: any) {
      console.error('❌ Flutterwave payment error:', error)
      
      // Handle specific error types
      if (error.message.includes('cancelled')) {
        toast.info('Payment cancelled')
      } else if (error.message.includes('timeout')) {
        toast.error('Payment timed out. Please try again.')
      } else {
        toast.error(`Payment failed: ${error.message}`)
      }
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleCustomPayment = async () => {
    try {
      setIsProcessingPayment(true)

      const amount = parseFloat(paymentFormData.amount)
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount')
        return
      }

      const txRef = flutterwaveWebService.generateTxRef()

      const paymentData = {
        amount: amount,
        currency: paymentFormData.currency,
        email: paymentFormData.customerEmail,
        phone_number: paymentFormData.customerPhone,
        name: paymentFormData.customerName,
        tx_ref: txRef,
        description: paymentFormData.description,
        redirect_url: getUrl(`/payments/success?tx_ref=${txRef}`),
        meta: {
          user_id: user?.id,
          custom_payment: true
        }
      }

      // Save transaction to database first
      await saveTransactionToDatabase({
        tx_ref: txRef,
        amount: amount,
        currency: paymentFormData.currency,
        status: 'pending',
        payment_method: 'flutterwave',
        customer_email: paymentFormData.customerEmail,
        customer_name: paymentFormData.customerName,
        description: paymentFormData.description,
        user_id: user.id
      })

      toast.success('Opening Flutterwave payment...')

      const result = await flutterwaveWebService.initializePayment(paymentData)

      if (result.status === 'success' && result.data) {
        toast.success('Payment successful!')
        
        // Update transaction status
        await updateTransactionStatus(txRef, 'successful')
        
        // Refresh data
        await loadPaymentData()
      } else {
        throw new Error(result.message || 'Failed to initialize payment')
      }
    } catch (error: any) {
      console.error('Custom payment error:', error)
      
      // Handle specific error types
      if (error.message.includes('cancelled')) {
        toast.info('Payment cancelled')
      } else if (error.message.includes('timeout')) {
        toast.error('Payment timed out. Please try again.')
      } else {
        toast.error(`Payment failed: ${error.message}`)
      }
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleUpgrade = (tier: 'basic' | 'standard' | 'premium') => {
    setSelectedTier(tier)
    setShowPaymentModal(true)
  }

  const handlePaymentProofUpload = async (file: File) => {
    if (!selectedTier) return
    
    // Store the uploaded file for the upgrade button
    setUploadedFile(file)
    toast.success('Payment proof uploaded! Click "Submit Upgrade Request" to proceed.')
  }

  const handleUpgradeRequest = async () => {
    if (!selectedTier || !uploadedFile) return

    try {
      setIsSubmittingUpgrade(true)
      const result = await paymentService.createPaymentRequest(selectedTier, 'mtn_mobile_money', uploadedFile)
      
      if (result.success) {
        toast.success('Upgrade request submitted! You will be notified once verified by admin.')
        setShowPaymentModal(false)
        setSelectedTier(null)
        setUploadedFile(null)
        // Refresh payment requests without calling loadPaymentStats
        const requests = await paymentService.getPaymentRequests()
        setPaymentRequests(requests)
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error submitting upgrade request:', error)
      toast.error('Failed to submit upgrade request')
    } finally {
      setIsSubmittingUpgrade(false)
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
    basic: { price: 1000000, name: 'Start Smart' },
    standard: { price: 3000000, name: 'Grow with Intelligence' },
    premium: { price: 5000000, name: 'Enterprise Advantage' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10 transition-all duration-200 rounded-lg px-4 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-[#faa51a] to-[#ff6b35] rounded-xl shadow-lg">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#040458] to-[#1e40af] bg-clip-text text-transparent">
                    Payments & Subscriptions
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Manage your payments, subscriptions, and billing
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-[#faa51a] to-[#ff6b35] text-white border-0 shadow-lg px-4 py-2">
                <Crown className="h-4 w-4 mr-2" />
                {profile?.tier?.toUpperCase() || 'FREE_TRIAL'} Plan
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#040458]" />
              <span className="text-[#040458] font-medium">Loading payment data...</span>
            </div>
          </div>
        )}
        
        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Total Revenue</p>
                  <p className="text-3xl font-bold text-[#040458]">UGX {paymentStats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">This Month</p>
                  <p className="text-3xl font-bold text-green-600">UGX {paymentStats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Total Payments</p>
                  <p className="text-3xl font-bold text-purple-600">{paymentStats.totalPayments}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{paymentStats.pendingPayments}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg shadow-md">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 shadow-lg">
            <TabsList className="bg-transparent border-0">
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
              <TabsTrigger value="flutterwave" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white text-[#040458]">
                Flutterwave
              </TabsTrigger>
            </TabsList>
          </div>

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
                      <h3 className="font-semibold">{profile?.tier?.toUpperCase() || 'FREE_TRIAL'} Plan</h3>
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
                      <span className="font-medium">Start Smart</span>
                      <span className="text-sm text-gray-600">UGX 1,000,000/month</span>
                    </Button>
                    <Button
                      onClick={() => handleUpgrade('standard')}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      variant="outline"
                    >
                      <Crown className="h-6 w-6 text-purple-500" />
                      <span className="font-medium">Grow with Intelligence</span>
                      <span className="text-sm text-gray-600">UGX 3,000,000/month</span>
                    </Button>
                    <Button
                      onClick={() => handleUpgrade('premium')}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      variant="outline"
                    >
                      <Crown className="h-6 w-6 text-orange-500" />
                      <span className="font-medium">Enterprise Advantage</span>
                      <span className="text-sm text-gray-600">UGX 5,000,000/month</span>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                      <h3 className="text-lg font-semibold">Start Smart</h3>
                      <div className="text-3xl font-bold text-[#faa51a]">1,000,000 UGX</div>
                      <p className="text-sm text-gray-600">Per Month</p>
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
                      <h3 className="text-lg font-semibold">Grow with Intelligence</h3>
                      <div className="text-3xl font-bold text-[#faa51a]">3,000,000 UGX</div>
                      <p className="text-sm text-gray-600">Per Month</p>
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

                  {/* Enterprise Advantage Plan */}
                  <Card className="border-2 border-purple-200 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">Enterprise</Badge>
                    </div>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Enterprise Advantage</h3>
                      <div className="text-3xl font-bold text-purple-600">5,000,000 UGX</div>
                      <p className="text-sm text-gray-600">Per Month</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">For large enterprises requiring advanced features and dedicated support.</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Everything in Grow with Intelligence</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Advanced AI analytics & predictions</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Custom integrations & APIs</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Unlimited users & locations</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Advanced reporting & dashboards</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />White-label solutions</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Dedicated account manager</li>
                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />24/7 priority support</li>
                      </ul>
                      <Button 
                        onClick={() => handleUpgrade('premium')}
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Choose Enterprise
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

          {/* Flutterwave Tab */}
          <TabsContent value="flutterwave">
            <div className="space-y-6">
              {/* Flutterwave Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Flutterwave Transactions</CardTitle>
                      <CardDescription>Your recent payment transactions processed through Flutterwave</CardDescription>
                    </div>
                    <Button
                      onClick={loadFlutterwaveTransactions}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {flutterwaveTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Transactions Yet</h3>
                      <p className="text-gray-500 mb-4">You haven't made any payments through Flutterwave yet.</p>
                      <Button
                        onClick={() => setActiveTab('upgrade')}
                        className="bg-gradient-to-r from-[#040458] to-[#faa51a] hover:from-[#030345] hover:to-[#e6941a]"
                      >
                        Make Your First Payment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {flutterwaveTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-[#040458] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                transaction.status === 'successful' ? 'bg-green-100' :
                                transaction.status === 'failed' ? 'bg-red-100' :
                                transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                              }`}>
                                {transaction.status === 'successful' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : transaction.status === 'failed' ? (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                ) : (
                                  <Clock className="w-5 h-5 text-yellow-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold">{transaction.description}</h4>
                                <p className="text-sm text-gray-600">
                                  {transaction.customer_name} • {transaction.customer_email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(transaction.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-lg">
                                {transaction.currency} {transaction.amount.toLocaleString()}
                              </div>
                              <Badge
                                variant={
                                  transaction.status === 'successful' ? 'default' :
                                  transaction.status === 'failed' ? 'destructive' :
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {transaction.status}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                Ref: {transaction.tx_ref}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Custom Payment</CardTitle>
                  <CardDescription>Process a custom payment through Flutterwave</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={paymentFormData.amount}
                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={paymentFormData.currency}
                        onValueChange={(value) => setPaymentFormData(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['UGX', 'USD', 'EUR', 'GBP'].map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        placeholder="Customer name"
                        value={paymentFormData.customerName}
                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Customer Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        placeholder="customer@example.com"
                        value={paymentFormData.customerEmail}
                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
                      <Input
                        id="customerPhone"
                        placeholder="+256..."
                        value={paymentFormData.customerPhone}
                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Payment description"
                        value={paymentFormData.description}
                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={handleCustomPayment}
                      disabled={isProcessingPayment || !paymentFormData.amount || !paymentFormData.customerName || !paymentFormData.customerEmail}
                      className="bg-gradient-to-r from-[#040458] to-[#faa51a] hover:from-[#030345] hover:to-[#e6941a]"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Process Payment
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Payment Modal */}
      {showPaymentModal && selectedTier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#040458] to-[#faa51a] p-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Complete Payment</h2>
                  <p className="text-white/90 text-sm">Secure payment processing</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedTier(null)
                  }}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                {/* Payment Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Payment Summary</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-[#040458] capitalize">{selectedTier} Plan</h4>
                      <p className="text-sm text-gray-600">
                        {selectedTier === 'basic' && 'Start Smart Plan'}
                        {selectedTier === 'standard' && 'Grow with Intelligence Plan'}
                        {selectedTier === 'premium' && 'Enterprise Advantage Plan'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#040458]">
                        {selectedTier === 'basic' && 'UGX 50,000'}
                        {selectedTier === 'standard' && 'UGX 150,000'}
                        {selectedTier === 'premium' && 'UGX 500,000'}
                      </div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                  </div>
                </div>

                {/* Phone Number Input for Testing */}
                <div className="space-y-3">
                  <Label htmlFor="phoneNumber">Phone Number for Testing</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+256 700 000 000"
                    value={paymentFormData.customerPhone}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500">
                    Enter your phone number to test Flutterwave OTP and USSD flow
                  </p>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Choose Payment Method</h3>
                  
                  {/* Flutterwave Payment */}
                  <div className="p-4 border-2 border-[#040458] rounded-lg bg-gradient-to-r from-[#040458]/5 to-[#faa51a]/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold">Flutterwave</h5>
                          <p className="text-sm text-gray-600">Cards, Mobile Money, USSD</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleFlutterwavePayment(selectedTier)}
                        disabled={isProcessingPayment || !paymentFormData.customerPhone}
                        className="bg-gradient-to-r from-[#040458] to-[#faa51a] hover:from-[#030345] hover:to-[#e6941a]"
                      >
                        {isProcessingPayment ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Pay Now'
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-800">
                        Secure payment processing with Flutterwave
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments