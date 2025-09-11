import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Check, Upload, Smartphone, Building2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentInstructionsProps {
  tier: 'basic' | 'standard' | 'premium'
  onPaymentProofUpload: (file: File) => void
  onUpgradeRequest?: () => void
  uploadedFile?: File | null
  isUpgrading?: boolean
}

const tierPricing = {
  basic: { price: 1000000, name: 'Start Smart' },
  standard: { price: 3000000, name: 'Grow with Intelligence' },
  premium: { price: 5000000, name: 'Enterprise Advantage' }
}

const paymentMethods = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    icon: <Smartphone className="h-5 w-5" />,
    merchantCode: '720504',
    merchantName: 'Otic Foundation',
    instructions: [
      'Dial *165*3#',
      'Select "Pay Bills"',
      'Enter Merchant Code: 720504',
      'Enter Amount: UGX',
      'Enter Reference: Your email address',
      'Enter PIN to complete'
    ]
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    icon: <Smartphone className="h-5 w-5" />,
    merchantCode: '4379529',
    merchantName: 'Otic Foundation',
    instructions: [
      'Dial *185*9#',
      'Select "Pay Bills"',
      'Enter Merchant Code: 4379529',
      'Enter Amount: UGX',
      'Enter Reference: Your email address',
      'Enter PIN to complete'
    ]
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: <Building2 className="h-5 w-5" />,
    accountName: 'Otic Foundation Limited',
    accountNumber: '9030025213237',
    bankName: 'Stanbic Bank',
    branch: 'Garden City',
    instructions: [
      'Transfer to: Otic Foundation Limited',
      'Account: 9030025213237 UGX',
      'Bank: Stanbic Bank - Garden City',
      'Reference: Your email address',
      'Amount: UGX'
    ]
  }
]

export const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({ 
  tier, 
  onPaymentProofUpload,
  onUpgradeRequest,
  uploadedFile,
  isUpgrading = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('mtn')
  const [copied, setCopied] = useState<string | null>(null)

  const currentTier = tierPricing[tier]
  const currentMethod = paymentMethods.find(m => m.id === selectedMethod)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success(`${type} copied to clipboard!`)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onPaymentProofUpload(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card className="border-2 border-[#040458]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Summary</span>
            <Badge variant="outline" className="bg-[#faa51a] text-white border-[#faa51a]">
              {currentTier.name}
            </Badge>
          </CardTitle>
          <CardDescription>
            Complete your payment to unlock {currentTier.name} features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#040458] mb-2">
              UGX {currentTier.price.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              One-time payment • No recurring charges
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
          <CardDescription>
            Select your preferred payment method and follow the instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {paymentMethods.map((method) => (
              <Button
                key={method.id}
                variant={selectedMethod === method.id ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                  selectedMethod === method.id 
                    ? 'bg-[#040458] text-white' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                {method.icon}
                <span className="text-sm font-medium">{method.name}</span>
              </Button>
            ))}
          </div>

          {/* Selected Method Instructions */}
          {currentMethod && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">{currentMethod.name}</h3>
                  <p className="text-sm text-gray-600">
                    {currentMethod.merchantCode && `Code: ${currentMethod.merchantCode}`}
                    {currentMethod.accountNumber && `Account: ${currentMethod.accountNumber}`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {currentMethod.merchantCode && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(currentMethod.merchantCode!, 'Merchant Code')}
                    >
                      {copied === 'Merchant Code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                  {currentMethod.accountNumber && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(currentMethod.accountNumber!, 'Account Number')}
                    >
                      {copied === 'Account Number' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Payment Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {currentMethod.instructions.map((instruction, index) => (
                    <li key={index} className="text-gray-700">
                      {instruction.replace('UGX', `UGX ${currentTier.price.toLocaleString()}`)}
                    </li>
                  ))}
                </ol>
              </div>

              {currentMethod.bankName && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Bank Details:</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Account Name:</strong> {currentMethod.accountName}</div>
                    <div><strong>Account Number:</strong> {currentMethod.accountNumber}</div>
                    <div><strong>Bank:</strong> {currentMethod.bankName}</div>
                    <div><strong>Branch:</strong> {currentMethod.branch}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Proof Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Payment Proof</CardTitle>
          <CardDescription>
            After making payment, upload a screenshot or receipt as proof
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Upload screenshot of payment confirmation or receipt
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: PNG, JPG, PDF (Max 5MB)
              </p>
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#040458] file:text-white hover:file:bg-[#030345]"
            />
          </div>
          
          {/* File Upload Status and Upgrade Button */}
          {uploadedFile && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Payment proof uploaded successfully!
                    </p>
                    <p className="text-xs text-green-600">
                      File: {uploadedFile.name}
                    </p>
                  </div>
                </div>
                {onUpgradeRequest && (
                  <Button
                    onClick={onUpgradeRequest}
                    disabled={isUpgrading}
                    className="bg-[#040458] hover:bg-[#040458]/90 text-white font-semibold px-6 py-2"
                  >
                    {isUpgrading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Submit Upgrade Request
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-semibold text-yellow-800">Important Notes:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Use your email address as the payment reference</li>
              <li>• Payment verification takes 1-2 business days</li>
              <li>• You'll receive an email confirmation once verified</li>
              <li>• Contact support if you have any issues</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentInstructions


