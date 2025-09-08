import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Product, Sale, SaleItem } from '@/lib/supabase'
import { OticAPI } from '@/services/api'
import { BrowserMultiFormatReader } from '@zxing/library'
import QuaggaBarcodeScanner from '@/components/QuaggaBarcodeScanner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Smartphone,
  Receipt,
  Package,
  Camera,
  QrCode,
  ArrowLeft,
  RefreshCw,
  User,
  Phone,
  Percent,
  Calculator,
  CheckCircle,
  AlertCircle,
  Zap,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

const POS = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'card' | 'flutterwave'>('cash')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [barcodeReader, setBarcodeReader] = useState<BrowserMultiFormatReader | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  
  // Customer information
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  
  // Discount and tax
  const [discount, setDiscount] = useState(0)
  const [taxRate] = useState(18) // 18% VAT for Uganda

  useEffect(() => {
    if (user?.id) {
      fetchProducts()
    }
    initializeBarcodeReader()
  }, [user?.id])

  const initializeBarcodeReader = () => {
    try {
      const reader = new BrowserMultiFormatReader()
      setBarcodeReader(reader)
    } catch (error) {
      console.error('Error initializing barcode reader:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.price }
          : item
      ))
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        subtotal: product.price
      }])
    }
    toast.success(`${product.name} added to cart`)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity, subtotal: quantity * item.product.price }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
    toast.success('Item removed from cart')
  }

  const handleBarcodeChange = (value: string) => {
    setBarcodeInput(value)
  }

  const handleBarcodeScan = async () => {
    if (!barcodeInput.trim()) return

    try {
      // Clean the barcode input (remove spaces, dashes, etc.)
      const cleanBarcode = barcodeInput.trim().replace(/[\s-]/g, '')
      
      // Try exact match first
      let product = products.find(p => p.barcode === cleanBarcode)
      
      // If no exact match, try partial match
      if (!product) {
        product = products.find(p => p.barcode?.includes(cleanBarcode) || cleanBarcode.includes(p.barcode || ''))
      }
      
      if (product) {
        addToCart(product)
        setBarcodeInput('')
        toast.success(`${product.name} added to cart!`)
      } else {
        toast.error(`Product not found with barcode: ${cleanBarcode}`)
        console.log('Available barcodes:', products.map(p => p.barcode).filter(Boolean))
      }
    } catch (error) {
      console.error('Error scanning barcode:', error)
      toast.error('Failed to scan barcode')
    }
  }

  const handleBarcodeScanFromCamera = (barcode: string) => {
    setBarcodeInput(barcode)
    handleBarcodeScan()
    setShowBarcodeScanner(false)
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * discount) / 100
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = calculateDiscount()
    const taxableAmount = subtotal - discountAmount
    return (taxableAmount * taxRate) / 100
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = calculateDiscount()
    const taxAmount = calculateTax()
    return subtotal - discountAmount + taxAmount
  }

  const clearCart = () => {
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    setDiscount(0)
    setBarcodeInput('')
  }

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    try {
      setProcessing(true)
      
      const saleData = {
        user_id: user?.id,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        payment_method: paymentMethod,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        tax: calculateTax(),
        total: calculateTotal(),
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.subtotal
        }))
      }

      const result = await OticAPI.createSale(saleData)
      
      if (result.success) {
        toast.success('Sale processed successfully!')
        clearCart()
      } else {
        throw new Error(result.error || 'Failed to process sale')
      }
    } catch (error) {
      console.error('Error processing sale:', error)
      toast.error('Failed to process sale. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#faa51a] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading POS System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#040458]">Point of Sale</h1>
                  <p className="text-sm text-gray-600">Process sales and manage transactions</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-lg px-4 py-2 bg-[#faa51a]/10 text-[#faa51a] border-[#faa51a]/30">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {cart.length} items in cart
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Products Section */}
          <div className="xl:col-span-3">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#040458] to-[#faa51a] text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <Package className="h-6 w-6 mr-3" />
                  Products
                </CardTitle>
                <CardDescription className="text-white/90">Search and add products to cart</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Search and Barcode Input */}
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search products by name or barcode..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-12 border-gray-200 focus:border-[#faa51a] focus:ring-[#faa51a]/20"
                        />
                      </div>
                      <Button 
                        onClick={() => setShowBarcodeScanner(true)} 
                        className="bg-[#040458] hover:bg-[#040458]/90 text-white h-12 px-6"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Scan Barcode
                      </Button>
                    </div>
                    
                    <div className="flex space-x-3">
                      <div className="flex-1 relative">
                        <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Enter barcode manually (e.g., 6000622620003)..."
                          value={barcodeInput}
                          onChange={(e) => handleBarcodeChange(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan()}
                          className="pl-10 h-12 border-gray-200 focus:border-[#faa51a] focus:ring-[#faa51a]/20"
                        />
                      </div>
                      <Button 
                        onClick={handleBarcodeScan} 
                        className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white h-12 px-6"
                        disabled={!barcodeInput.trim()}
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Product
                      </Button>
                    </div>
                    
                    {/* Quick Test Barcodes */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-700 font-medium mb-2">Quick Test Barcodes:</p>
                      <div className="flex flex-wrap gap-2">
                        {products.slice(0, 3).map((product) => (
                          <Button
                            key={product.id}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBarcodeInput(product.barcode || '')
                              handleBarcodeScan()
                            }}
                            className="text-xs h-8"
                          >
                            {product.barcode}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="hover:shadow-md transition-all duration-200 border-gray-100 hover:border-[#faa51a]/30">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
                                {product.barcode && (
                                  <p className="text-xs text-gray-400 mt-1">Barcode: {product.barcode}</p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                UGX {product.price.toLocaleString()}
                              </Badge>
                            </div>
                            <Button
                              onClick={() => addToCart(product)}
                              className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white text-sm h-8"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="xl:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-24">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <ShoppingCart className="h-6 w-6 mr-3" />
                  Cart ({cart.length})
                </CardTitle>
                <CardDescription className="text-white/90">Current transaction</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Cart is empty</p>
                    <p className="text-gray-400 text-xs mt-1">Add products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Cart Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">{item.product.name}</h4>
                            <p className="text-xs text-gray-500">UGX {item.product.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.product.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Customer Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-2 text-[#faa51a]" />
                        Customer Info
                      </h4>
                      <div className="space-y-2">
                        <Input
                          placeholder="Customer name (optional)"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="h-10 text-sm"
                        />
                        <Input
                          placeholder="Phone number (optional)"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="h-10 text-sm"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Discount */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center">
                        <Percent className="h-4 w-4 mr-2 text-[#faa51a]" />
                        Discount (%)
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="h-10 text-sm"
                        min="0"
                        max="100"
                      />
                    </div>

                    <Separator />

                    {/* Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>UGX {calculateSubtotal().toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount ({discount}%):</span>
                          <span>-UGX {calculateDiscount().toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>VAT ({taxRate}%):</span>
                        <span>UGX {calculateTax().toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-[#040458]">UGX {calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-[#faa51a]" />
                        Payment Method
                      </Label>
                      <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Cash
                            </div>
                          </SelectItem>
                          <SelectItem value="mobile_money">
                            <div className="flex items-center">
                              <Smartphone className="h-4 w-4 mr-2" />
                              Mobile Money
                            </div>
                          </SelectItem>
                          <SelectItem value="card">
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Card
                            </div>
                          </SelectItem>
                          <SelectItem value="flutterwave">
                            <div className="flex items-center">
                              <Zap className="h-4 w-4 mr-2" />
                              Flutterwave
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        onClick={processSale}
                        disabled={processing || cart.length === 0}
                        className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white h-12 font-semibold"
                      >
                        {processing ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Process Sale
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={clearCart}
                        variant="outline"
                        className="w-full h-10 text-gray-600 hover:text-red-600 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <QuaggaBarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanFromCamera}
      />
    </div>
  )
}

export default POS