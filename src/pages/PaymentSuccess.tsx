import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { paymentVerificationService } from '@/services/paymentVerificationService'

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const txRef = searchParams.get('tx_ref')
  const transactionId = searchParams.get('transaction_id')

  useEffect(() => {
    if (txRef) {
      verifyPayment()
    } else {
      setError('No transaction reference found')
      setVerificationStatus('failed')
    }
  }, [txRef])

  const verifyPayment = async () => {
    try {
      setVerificationStatus('loading')
      
      // Get order data first
      const orderResult = await paymentVerificationService.getOrderByTxRef(txRef!)
      if (!orderResult.success || !orderResult.order) {
        throw new Error('Order not found')
      }

      setPaymentData(orderResult.order)

      // If we have a transaction ID, verify with Flutterwave
      if (transactionId) {
        const verificationResult = await paymentVerificationService.verifyPayment({
          transaction_id: transactionId,
          tx_ref: txRef!
        })

        if (verificationResult.success) {
          setVerificationStatus('success')
          toast.success('Payment verified successfully!')
        } else {
          setVerificationStatus('failed')
          setError(verificationResult.message)
          toast.error('Payment verification failed')
        }
      } else {
        // No transaction ID, check order status
        if (orderResult.order.payment_status === 'paid') {
          setVerificationStatus('success')
        } else if (orderResult.order.payment_status === 'failed') {
          setVerificationStatus('failed')
          setError('Payment failed')
        } else {
          setVerificationStatus('pending')
        }
      }
    } catch (error: any) {
      console.error('Payment verification error:', error)
      setVerificationStatus('failed')
      setError(error.message)
      toast.error('Payment verification failed')
    }
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600" />
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-600" />
      default:
        return <RefreshCw className="w-16 h-16 text-blue-600 animate-spin" />
    }
  }

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'success':
        return {
          title: 'Payment Successful!',
          message: 'Your payment has been verified and processed successfully.',
          color: 'text-green-600'
        }
      case 'failed':
        return {
          title: 'Payment Failed',
          message: error || 'Your payment could not be verified.',
          color: 'text-red-600'
        }
      case 'pending':
        return {
          title: 'Payment Pending',
          message: 'Your payment is being processed. Please wait for confirmation.',
          color: 'text-yellow-600'
        }
      default:
        return {
          title: 'Verifying Payment...',
          message: 'Please wait while we verify your payment.',
          color: 'text-blue-600'
        }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={`text-2xl font-bold ${statusInfo.color}`}>
            {statusInfo.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{statusInfo.message}</p>
            
            {paymentData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Transaction Reference:</span>
                  <span className="font-mono text-sm">{paymentData.tx_ref}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-semibold">{paymentData.currency} {paymentData.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span>{paymentData.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span className="text-sm">{paymentData.customer_email}</span>
                </div>
                {paymentData.tier && (
                  <div className="flex justify-between">
                    <span className="font-medium">Plan:</span>
                    <span className="capitalize">{paymentData.tier}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-3">
            {verificationStatus === 'failed' && (
              <Button
                onClick={verifyPayment}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Verification
              </Button>
            )}
            
            <Button
              onClick={() => navigate('/payments')}
              className="w-full bg-gradient-to-r from-[#040458] to-[#faa51a] hover:from-[#030345] hover:to-[#e6941a]"
            >
              Back to Payments
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentSuccess