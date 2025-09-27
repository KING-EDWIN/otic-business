import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { IndividualBusinessAccessService } from '@/services/individualBusinessAccessService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Building2,
  ShoppingCart,
  Package,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'

const BusinessPOSForIndividual: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [businessName, setBusinessName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id && businessId) {
      checkAccess()
    }
  }, [user?.id, businessId])

  const checkAccess = async () => {
    if (!user?.id || !businessId) return

    try {
      setLoading(true)
      
      // Check if user has access to POS for this business
      const access = await IndividualBusinessAccessService.hasPageAccess(businessId, user.id, 'pos')
      
      if (access) {
        setHasAccess(true)
        // Update last accessed time
        await IndividualBusinessAccessService.updateLastAccessed(businessId, user.id)
        
        // Get business name (you would fetch this from the business data)
        setBusinessName('Business POS System')
      } else {
        setHasAccess(false)
        toast.error('You do not have access to this business POS system')
      }
    } catch (error) {
      console.error('Error checking access:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Access Denied</span>
            </CardTitle>
            <CardDescription>
              You do not have permission to access this business POS system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/individual-dashboard')}
              className="w-full bg-[#040458] hover:bg-[#030345] text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/individual-dashboard')}
                className="text-[#040458] border-[#faa51a] hover:bg-[#faa51a] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-[#040458] to-[#1e1e6b] rounded-xl shadow-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#040458]">POS System</h1>
                  <p className="text-sm text-gray-600">{businessName}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-[#040458] border-[#faa51a]">
                <User className="h-3 w-3 mr-1" />
                Individual Access
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Access Info */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Business POS Access</h3>
                <p className="text-blue-700">
                  You are accessing the POS system for <strong>{businessName}</strong> as an individual user.
                  All transactions and activities will be recorded under the business account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* POS Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Products</span>
                </CardTitle>
                <CardDescription>
                  Select products to add to the cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input 
                    placeholder="Search products..." 
                    className="w-full"
                  />
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Product catalog will be loaded here</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This would show products from the business inventory
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart & Checkout */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart</span>
                </CardTitle>
                <CardDescription>
                  Review and checkout items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Cart is empty</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Add products to start a transaction
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-[#040458]">UGX 0</span>
                    </div>
                    <Button 
                      className="w-full bg-[#040458] hover:bg-[#030345] text-white"
                      disabled
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Payment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent transactions</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Transaction history will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BusinessPOSForIndividual
