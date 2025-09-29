import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'

interface Product {
  id: string
  name: string
  barcode: string
  price: number
  cost: number
  stock: number
  min_stock: number
  category_id: string | null
  supplier_id: string | null
  user_id: string
  created_at: string
  updated_at: string
}

interface Sale {
  id: string
  user_id: string
  total: number
  payment_method: string
  receipt_number: string
  created_at: string
}

interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
}
import { OticAPI } from '@/services/api'
import { BrowserMultiFormatReader } from '@zxing/library'
import EnhancedBarcodeScanner from '@/components/EnhancedBarcodeScanner'
import OTICVisionScanner from '@/components/OTICVisionScanner'
import { supabase } from '@/lib/supabaseClient'
import { ReceiptService } from '@/services/receiptService'
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
  DollarSign,
  Printer,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { NotificationService } from '@/services/notificationService'
import BusinessLoginStatus from '@/components/BusinessLoginStatus'

interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

const POS = () => {
  const { user } = useAuth()
  const { currentBusiness } = useBusinessManagement()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'card' | 'flutterwave'>('cash')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showOTICVision, setShowOTICVision] = useState(false)
  const [barcodeReader, setBarcodeReader] = useState<BrowserMultiFormatReader | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [showFallbackProductForm, setShowFallbackProductForm] = useState(false)
  const [fallbackDetectedObject, setFallbackDetectedObject] = useState('')
  const [fallbackProductName, setFallbackProductName] = useState('')
  const [fallbackProductPrice, setFallbackProductPrice] = useState('')
  
  // Product selection modal state
  const [showProductSelection, setShowProductSelection] = useState(false)
  const [detectedVFTName, setDetectedVFTName] = useState('')
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  
  // Customer information
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  
  // Receipt state
  const [showReceipt, setShowReceipt] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState<any>(null)
  
  // Discount and tax
  const [discount, setDiscount] = useState(0)
  const [taxRate] = useState(18) // 18% VAT for Uganda

  useEffect(() => {
    // Always fetch products and initialize barcode reader
    if (user?.id) {
      fetchProducts()
      initializeBarcodeReader()
    }
  }, [currentBusiness?.id, user?.id])

  // Debug logging for camera modal state
  useEffect(() => {
    console.log('🎥 Camera modal state changed:', showOTICVision)
  }, [showOTICVision])

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
      
      // Use currentBusiness?.id or fallback to user?.id for business users
      const businessId = currentBusiness?.id || user?.id
      
      if (!businessId) {
        console.log('No business ID available, no products available')
        setProducts([])
        setLoading(false)
        return
      }
      
      console.log('🔄 Loading products for business ID:', businessId)
      
      // Try to load from database first - use user_id for products
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', businessId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading products from database:', error)
        setProducts([])
      } else {
        // Transform database products to match POS interface
        const transformedProducts = (dbProducts || []).map(product => ({
          id: product.id,
          name: product.name,
          barcode: product.barcode || '',
          price: product.retail_price || product.wholesale_price || product.cost_price || 0,
          cost: product.cost_price || 0,
          stock: product.current_stock || 0,
          min_stock: product.min_stock || 0,
          category_id: product.category_id,
          supplier_id: product.supplier_id,
          user_id: product.user_id || '',
          created_at: product.created_at,
          updated_at: product.updated_at
        }))
        setProducts(transformedProducts)
        console.log('✅ Loaded products for POS:', transformedProducts.length, 'products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
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
    console.log('Camera scanned barcode:', barcode)
    setBarcodeInput(barcode)
    // Don't call handleBarcodeScan immediately, let user see the barcode first
    setShowBarcodeScanner(false)
  }

  const handleOTICVisionProductDetected = (vftName: string, products: any[]) => {
    console.log('🎯 OTIC Vision detected products:', vftName, products)
    console.log('📊 Products length:', products.length)
    console.log('📋 Products array:', JSON.stringify(products, null, 2))
    
    if (products.length === 0) {
      console.log('❌ No products found for VFT:', vftName)
      toast.info(`No products found for "${vftName}". You may need to register this product first.`)
      return
    }
    
    // Show product selection modal for all cases (single or multiple products)
    setDetectedVFTName(vftName)
    setAvailableProducts(products)
    setShowProductSelection(true)
    setShowOTICVision(false) // Close the camera modal
  }

  const handleProductSelection = (selectedProduct: any) => {
    console.log('✅ Adding selected product to cart:', selectedProduct)
    addToCart({
      id: selectedProduct.id || selectedProduct.product_id || `temp_${Date.now()}`,
      name: `${selectedProduct.brand_name || 'Unknown'} ${selectedProduct.product_name || 'Product'}`,
      barcode: selectedProduct.barcode || '',
      price: selectedProduct.price || 0,
      cost: selectedProduct.cost || 0,
      stock: selectedProduct.stock_quantity || 0,
      min_stock: 0,
      category_id: null,
      supplier_id: null,
      user_id: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    setShowProductSelection(false)
    toast.success(`Added ${selectedProduct.brand_name || 'Unknown'} ${selectedProduct.product_name || 'Product'} to cart`)
  }

  const handleOTICVisionError = (detectedObject: string) => {
    console.log('OTIC Vision error, showing fallback form for:', detectedObject)
    setFallbackDetectedObject(detectedObject)
    setFallbackProductName(detectedObject)
    setShowFallbackProductForm(true)
    setShowOTICVision(false)
  }

  const handleFallbackProductSubmit = () => {
    if (!fallbackProductName.trim() || !fallbackProductPrice.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    const price = parseFloat(fallbackProductPrice)
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    // Add the fallback product to cart
    addToCart({
      id: `fallback_${Date.now()}`,
      name: fallbackProductName,
      barcode: '',
      price: price,
      cost: 0,
      stock: 1,
      min_stock: 0,
      category_id: null,
      supplier_id: null,
      user_id: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    setShowFallbackProductForm(false)
    setFallbackDetectedObject('')
    setFallbackProductName('')
    setFallbackProductPrice('')
    toast.success(`Added ${fallbackProductName} to cart`)
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
      
      // For business users, the user ID IS the business ID
      const businessId = user?.id
      
      if (!businessId) {
        throw new Error('User ID not found')
      }

      // Prepare receipt items
      const receiptItems = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.subtotal
      }))

      // Create receipt
      const receiptResult = await ReceiptService.createReceipt(
        businessId,
        user?.id || '',
        user?.id || '', // Employee ID (same as user for now)
        receiptItems,
        paymentMethod as 'cash' | 'credit' | 'mobile_money' | 'card',
        customerName || customerPhone ? {
          name: customerName || undefined,
          phone: customerPhone || undefined
        } : undefined,
        calculateTax(),
        calculateDiscount()
      )

      if (!receiptResult.success) {
        throw new Error(receiptResult.error || 'Failed to create receipt')
      }

      // Also create sale record for analytics
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
        // Create sale notification
        if (businessId && user?.id) {
          await NotificationService.createSaleNotification(
            businessId,
            user.id,
            calculateTotal(),
            paymentMethod
          )
        }
        
        // Show receipt
        setCurrentReceipt(receiptResult.receipt)
        setShowReceipt(true)
        toast.success('Sale processed successfully!')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
              <BusinessLoginStatus />
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
                    <div className="space-y-4">
                      {/* Prominent Camera Button */}
                      <div className="flex justify-center">
                        <Button 
                          onClick={() => {
                            console.log('🎥 Camera button clicked, setting showOTICVision to true')
                            setShowOTICVision(true)
                          }} 
                          className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white h-16 px-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Camera className="h-6 w-6 mr-3" />
                          Use Camera
                        </Button>
                      </div>
                      
                      {/* Search Bar and Secondary Options */}
                      <div className="flex space-x-3">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search products by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-12 border-gray-200 focus:border-[#faa51a] focus:ring-[#faa51a]/20"
                          />
                        </div>
                        <Button 
                          onClick={() => setShowBarcodeScanner(true)} 
                          className="bg-[#040458] hover:bg-[#040458]/90 text-white h-10 px-4 text-sm"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Scan Barcode
                        </Button>
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
      <EnhancedBarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanFromCamera}
      />

      {/* OTIC Vision Scanner Modal */}
      {showOTICVision && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full h-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <div className="bg-white rounded-lg p-6 h-full overflow-y-auto">
              <OTICVisionScanner
                onClose={() => {
                  console.log('🎥 Closing camera modal')
                  setShowOTICVision(false)
                }}
                onProductDetected={(vftName, products) => {
                  console.log('🎯 Product detected:', vftName, products)
                  handleOTICVisionProductDetected(vftName, products)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      {showProductSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Select Product
                  </h3>
                  <p className="text-sm text-gray-500">
                    Found {availableProducts.length} products for "{detectedVFTName}"
                  </p>
                </div>
                <Button
                  onClick={() => setShowProductSelection(false)}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {availableProducts.map((product, index) => (
                  <div 
                    key={product.id || product.product_id || index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleProductSelection(product)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#faa51a] bg-opacity-10 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-[#faa51a]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {product.brand_name || 'Unknown Brand'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {product.product_name || 'Product'}
                        </p>
                        {product.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Stock: {product.stock_quantity || 0}
                          </Badge>
                          {product.barcode && (
                            <Badge variant="outline" className="text-xs">
                              {product.barcode}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#040458]">
                        UGX {(product.price || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cost: UGX {(product.cost || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Click on any product to add it to your cart
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {showReceipt && currentReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Receipt Header */}
              <div className="text-center mb-6">
                <img 
                  src="/ otic Vision blue.png" 
                  alt="Otic Vision Logo" 
                  className="h-12 w-12 mx-auto mb-2"
                />
                <h2 className="text-xl font-bold text-[#040458]">Otic Vision</h2>
                <p className="text-sm text-gray-600">Digital Receipt</p>
                <p className="text-xs text-gray-500 mt-1">
                  Receipt #: {currentReceipt.receipt_number}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(currentReceipt.created_at).toLocaleString()}
                </p>
              </div>

              {/* Receipt Items */}
              <div className="space-y-2 mb-4">
                {currentReceipt.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product_name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x UGX {item.unit_price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">
                      UGX {item.total_price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Receipt Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>UGX {currentReceipt.total_amount.toLocaleString()}</span>
                </div>
                {currentReceipt.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>VAT (18%):</span>
                    <span>UGX {currentReceipt.tax_amount.toLocaleString()}</span>
                  </div>
                )}
                {currentReceipt.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-UGX {currentReceipt.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>UGX {currentReceipt.total_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 p-3 rounded-lg mb-6">
                <div className="flex justify-between text-sm">
                  <span>Payment Method:</span>
                  <span className="capitalize font-medium">
                    {currentReceipt.payment_method.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Status:</span>
                  <span className="text-green-600 font-medium">
                    {currentReceipt.payment_status}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              {currentReceipt.customer_info && (
                <div className="bg-blue-50 p-3 rounded-lg mb-6">
                  <h4 className="font-medium text-sm mb-2">Customer Details:</h4>
                  {currentReceipt.customer_info.name && (
                    <p className="text-sm">Name: {currentReceipt.customer_info.name}</p>
                  )}
                  {currentReceipt.customer_info.phone && (
                    <p className="text-sm">Phone: {currentReceipt.customer_info.phone}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setShowReceipt(false)
                    clearCart()
                  }}
                  className="flex-1 bg-[#040458] hover:bg-[#040458]/90"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  New Sale
                </Button>
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                Thank you for your business!
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default POS