import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Product, Sale, SaleItem } from '@/lib/supabase'
import { OticAPI } from '@/services/api'
import { BrowserMultiFormatReader } from '@zxing/library'
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
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'

interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

const POS = () => {
  const { appUser } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'card' | 'flutterwave'>('cash')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)

  useEffect(() => {
    if (appUser) {
      fetchProducts()
    }
  }, [appUser])

  const fetchProducts = async () => {
    try {
      if (!appUser?.id) return
      
      // Use the real API service
      const searchResult = await OticAPI.searchProducts(appUser.id, '', undefined, 100)
      setProducts(searchResult.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      // Fallback to direct Supabase query
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', appUser.id)
          .order('name')

        if (error) throw error
        setProducts(data || [])
      } catch (fallbackError) {
        console.error('Fallback fetch error:', fallbackError)
        toast.error('Failed to load products')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  )

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
  }

  const clearCart = () => {
    setCart([])
  }

  const handleBarcodeScan = async () => {
    if (!barcodeInput.trim()) return

    const product = products.find(p => p.barcode === barcodeInput.trim())
    if (product) {
      addToCart(product)
      setBarcodeInput('')
      toast.success(`Added ${product.name} to cart`)
    } else {
      toast.error('Product not found with this barcode')
    }
  }

  const handleCameraScan = async () => {
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera not available on this device')
        return
      }

      // Show camera permission request
      toast.info('Requesting camera permission...')
      
      // Create barcode reader
      const codeReader = new BrowserMultiFormatReader()
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })

      // Create video element for camera preview
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      // Create modal for camera view
      const modal = document.createElement('div')
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `

      const videoContainer = document.createElement('div')
      videoContainer.style.cssText = `
        position: relative;
        width: 90%;
        max-width: 500px;
        height: 60%;
        border-radius: 10px;
        overflow: hidden;
      `

      const closeButton = document.createElement('button')
      closeButton.innerHTML = '✕ Close'
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.7);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 10000;
      `

      const scanArea = document.createElement('div')
      scanArea.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 200px;
        height: 100px;
        border: 2px solid #00ff00;
        border-radius: 10px;
        background: transparent;
        z-index: 10001;
      `

      const instructions = document.createElement('div')
      instructions.innerHTML = 'Point camera at barcode'
      instructions.style.cssText = `
        color: white;
        text-align: center;
        margin-top: 20px;
        font-size: 18px;
      `

      videoContainer.appendChild(video)
      videoContainer.appendChild(closeButton)
      videoContainer.appendChild(scanArea)
      modal.appendChild(videoContainer)
      modal.appendChild(instructions)
      document.body.appendChild(modal)

      // Real barcode detection using ZXing
      const scanBarcode = async () => {
        try {
          const result = await codeReader.decodeFromVideoDevice(undefined, video, (result, error) => {
            if (result) {
              const barcode = result.getText()
              console.log('Barcode detected:', barcode)
              
              // Find product by barcode
              const product = products.find(p => p.barcode === barcode)
              if (product) {
                addToCart(product)
                toast.success(`📷 Scanned and added ${product.name} to cart`)
              } else {
                toast.error(`❌ Product not found with barcode: ${barcode}`)
              }
              
              // Close camera and modal
              codeReader.reset()
              stream.getTracks().forEach(track => track.stop())
              document.body.removeChild(modal)
            }
            if (error && !(error instanceof Error && error.name === 'NotFoundException')) {
              console.error('Barcode scan error:', error)
            }
          })
        } catch (error) {
          console.error('Barcode reader error:', error)
          toast.error('Failed to initialize barcode scanner')
        }
      }

      // Start barcode scanning
      scanBarcode()

      // Handle close button
      closeButton.onclick = () => {
        codeReader.reset()
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(modal)
      }

      // Auto-close after 30 seconds
      const autoClose = setTimeout(() => {
        codeReader.reset()
        stream.getTracks().forEach(track => track.stop())
        if (document.body.contains(modal)) {
          document.body.removeChild(modal)
        }
      }, 30000)

      // Clean up on close
      closeButton.onclick = () => {
        clearTimeout(autoClose)
        codeReader.reset()
        stream.getTracks().forEach(track => track.stop())
        document.body.removeChild(modal)
      }

    } catch (error) {
      console.error('Camera error:', error)
      toast.error('Failed to access camera. Please try manual barcode entry.')
      
      // Fallback to manual barcode input
      const barcode = prompt('Enter barcode manually:')
      if (barcode) {
        handleBarcodeInput(barcode)
      }
    }
  }

  const handleBarcodeInput = (barcode: string) => {
    if (!barcode.trim()) return
    
    const product = products.find(p => p.barcode === barcode.trim())
    if (product) {
      addToCart(product)
      toast.success(`✅ Added ${product.name} to cart`)
      setBarcodeInput('') // Clear input after successful scan
    } else {
      toast.error(`❌ Product not found with barcode: ${barcode}`)
      // Show available barcodes for reference
      const availableBarcodes = products.slice(0, 3).map(p => p.barcode).join(', ')
      if (availableBarcodes) {
        toast.info(`Available barcodes: ${availableBarcodes}...`)
      }
    }
  }

  // Auto-scan when barcode input changes (for barcode scanners)
  const handleBarcodeChange = (value: string) => {
    setBarcodeInput(value)
    
    // Auto-scan if input looks like a complete barcode (8+ characters)
    if (value.length >= 8 && /^\d+$/.test(value)) {
      setTimeout(() => {
        handleBarcodeInput(value)
      }, 100)
    }
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0)
  }

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    if (!appUser?.id) {
      toast.error('User not authenticated')
      return
    }

    setProcessing(true)
    try {
      const total = calculateTotal()
      
      // Prepare cart items for API
      const cartItems = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.selling_price
      }))

      // Use the real API service
      const saleResult = await OticAPI.processSale(
        appUser.id,
        cartItems,
        paymentMethod,
        undefined, // customer name
        undefined  // customer phone
      )

      if (saleResult.success) {
        toast.success(`Sale completed! Receipt: ${saleResult.receipt_number}`)
        clearCart()
        setBarcodeInput('')
        
        // Refresh products to update stock
        await fetchProducts()
      } else {
        throw new Error('Sale processing failed')
      }
      
    } catch (error) {
      console.error('Error processing sale:', error)
      toast.error('Failed to process sale')
    } finally {
      setProcessing(false)
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
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Point of Sale</h1>
                <p className="text-sm text-muted-foreground">
                  Process sales and manage transactions
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {cart.length} items in cart
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Barcode */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Search and add products to cart</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Products</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="barcode">Barcode Scanner</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="barcode"
                        placeholder="Scan or enter barcode..."
                        value={barcodeInput}
                        onChange={(e) => handleBarcodeChange(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleBarcodeInput(barcodeInput)}
                        autoFocus
                        className="text-center font-mono"
                      />
                      <Button onClick={handleBarcodeScan} variant="outline" title="Manual scan">
                        <Package className="h-4 w-4" />
                      </Button>
                      <Button onClick={handleCameraScan} className="bg-green-600 hover:bg-green-700" title="Camera scan">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <p className="text-xs text-muted-foreground">
                        📷 Camera scan • ⌨️ Type barcode • 🔍 Auto-detect
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const testBarcode = products[0]?.barcode
                          if (testBarcode) {
                            setBarcodeInput(testBarcode)
                            handleBarcodeInput(testBarcode)
                          }
                        }}
                        className="text-xs"
                      >
                        Test: {products[0]?.barcode || 'No products'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        UGX {product.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.stock}
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No products found matching your search' : 'No products available. Add some products to get started.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Cart Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cart</CardTitle>
                <CardDescription>Review and process your sale</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center space-x-3 p-2 border rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              UGX {item.product.price.toLocaleString()} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-sm font-medium">
                            UGX {item.subtotal.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>UGX {calculateTotal().toLocaleString()}</span>
                      </div>

                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4" />
                                <span>Cash</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="mobile_money">
                              <div className="flex items-center space-x-2">
                                <Smartphone className="h-4 w-4" />
                                <span>Mobile Money</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="card">
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4" />
                                <span>Card</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="flutterwave">
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4" />
                                <span>Flutterwave</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={clearCart}
                          className="flex-1"
                        >
                          Clear Cart
                        </Button>
                        <Button
                          onClick={processSale}
                          disabled={processing}
                          className="flex-1"
                        >
                          {processing ? 'Processing...' : 'Complete Sale'}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default POS
