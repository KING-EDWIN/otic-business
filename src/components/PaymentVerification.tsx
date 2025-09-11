import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface PaymentRequest {
  id: string
  user_id: string
  user_email: string
  user_name: string
  tier: string
  amount: number
  payment_method: string
  payment_proof_url: string
  status: 'pending' | 'verified' | 'rejected'
  created_at: string
  verified_at?: string
  verified_by?: string
  notes?: string
}

export const PaymentVerification: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          user_profiles!inner(
            email,
            business_name,
            phone,
            tier
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('Raw payment data:', data)
      
      const formattedPayments = data?.map(payment => {
        console.log('Processing payment:', payment.id, 'user_profiles:', payment.user_profiles)
        return {
          ...payment,
          user_email: payment.user_profiles?.[0]?.email || 'Unknown',
          user_name: payment.user_profiles?.[0]?.business_name || 'Unknown'
        }
      }) || []

      console.log('Formatted payments:', formattedPayments)
      setPayments(formattedPayments)
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to fetch payment requests')
    } finally {
      setLoading(false)
    }
  }

  const verifyPayment = async (paymentId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({
          status,
          verified_at: new Date().toISOString(),
          verified_by: '00000000-0000-0000-0000-000000000000', // Admin UUID placeholder
          notes: verificationNotes
        })
        .eq('id', paymentId)

      if (error) throw error

      // If verified, update user's subscription
      if (status === 'verified') {
        const payment = payments.find(p => p.id === paymentId)
        if (payment) {
          // Update user profile tier
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({ tier: payment.tier })
            .eq('id', payment.user_id)

          if (profileError) throw profileError

          // Create subscription record
          const { error: subError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: payment.user_id,
              tier: payment.tier,
              status: 'active',
              expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
              payment_method: payment.payment_method,
              amount: payment.amount
            })

          if (subError) throw subError
        }
      }

      toast.success(`Payment ${status} successfully`)
      setSelectedPayment(null)
      setVerificationNotes('')
      fetchPayments()
    } catch (error) {
      console.error('Error verifying payment:', error)
      toast.error('Failed to verify payment')
    }
  }

  const filteredPayments = payments.filter(payment => 
    filterStatus === 'all' || payment.status === filterStatus
  )

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

  if (loading) {
    return <div className="flex justify-center p-8">Loading payment requests...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#040458]">Payment Verification</h2>
        <div className="flex space-x-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Requests ({filteredPayments.length})</CardTitle>
              <CardDescription>Review and verify payment requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{payment.user_name}</h3>
                        {getStatusBadge(payment.status)}
                      </div>
                      <p className="text-sm text-gray-600">{payment.user_email}</p>
                      <p className="text-sm text-gray-500">
                        {payment.tier.toUpperCase()} • UGX {payment.amount.toLocaleString()} • {payment.payment_method}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPayment(payment)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {filteredPayments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No payment requests found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Details */}
        <div>
          {selectedPayment ? (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Review payment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">User Information</Label>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm"><strong>Name:</strong> {selectedPayment.user_name}</p>
                    <p className="text-sm"><strong>Email:</strong> {selectedPayment.user_email}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Payment Information</Label>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm"><strong>Tier:</strong> {selectedPayment.tier.toUpperCase()}</p>
                    <p className="text-sm"><strong>Amount:</strong> UGX {selectedPayment.amount.toLocaleString()}</p>
                    <p className="text-sm"><strong>Method:</strong> {selectedPayment.payment_method}</p>
                    <p className="text-sm"><strong>Date:</strong> {new Date(selectedPayment.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {selectedPayment.payment_proof_url && (
                  <div>
                    <Label className="text-sm font-medium">Payment Proof</Label>
                    <div className="mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(selectedPayment.payment_proof_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        View Proof
                      </Button>
                    </div>
                  </div>
                )}

                {selectedPayment.status === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Verification Notes</Label>
                      <Input
                        id="notes"
                        placeholder="Add notes about verification..."
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => verifyPayment(selectedPayment.id, 'verified')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                      <Button
                        onClick={() => verifyPayment(selectedPayment.id, 'rejected')}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {selectedPayment.status !== 'pending' && (
                  <div>
                    <Label className="text-sm font-medium">Verification Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedPayment.status)}
                      {selectedPayment.verified_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedPayment.status === 'verified' ? 'Verified' : 'Rejected'} on{' '}
                          {new Date(selectedPayment.verified_at).toLocaleString()}
                        </p>
                      )}
                      {selectedPayment.notes && (
                        <p className="text-xs text-gray-600 mt-1">
                          <strong>Notes:</strong> {selectedPayment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  Select a payment request to view details
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentVerification


