import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Download,
  Barcode,
  QrCode,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  Camera
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import EnhancedBarcodeScanner from '@/components/EnhancedBarcodeScanner'
import jsPDF from 'jspdf'

interface Product {
  id: string
  name: string
  description?: string
  sku?: string
  barcode: string
  barcode_type: 'existing' | 'generated'
  cost_price: number
  wholesale_price: number
  retail_price: number
  current_stock: number
  min_stock: number
  max_stock: number
  category?: string
  brand?: string
  manufacturer?: string
  unit_type: string
  items_per_package: number
  package_type: string
  product_image_url?: string
  barcode_image_url?: string
  status: string
  created_at: string
  updated_at: string
}

interface RestockFormData {
  quantity: string
  costPrice: string
  supplier: string
  notes: string
}

const Restock: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentBusiness } = useBusinessManagement()
  
  const [activeTab, setActiveTab] = useState<'with-barcode' | 'no-barcode'>('with-barcode')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  
  const [restockForm, setRestockForm] = useState<RestockFormData>({
    quantity: '',
    costPrice: '',
    supplier: '',
    notes: ''
  })

  // Load products
  useEffect(() => {
    if (currentBusiness?.id) {
      loadProducts()
    }
  }, [currentBusiness])

  // Filter products based on search term and tab
  useEffect(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by barcode type
    if (activeTab === 'with-barcode') {
      filtered = filtered.filter(product => product.barcode_type === 'existing')
    } else {
      filtered = filtered.filter(product => product.barcode_type === 'generated')
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, activeTab])

  const loadProducts = async () => {
    if (!currentBusiness?.id) return

    try {
      setLoading(true)
      
      // Use direct query instead of RPC for better performance
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleBarcodeScan = (barcode: string, format: string) => {
    console.log('Scanned barcode:', barcode, 'Format:', format)
    
    // Find product by barcode
    const product = products.find(p => p.barcode === barcode)
    if (product) {
      setSelectedProduct(product)
      setIsRestockDialogOpen(true)
      setIsScannerOpen(false)
      toast.success(`Found product: ${product.name}`)
    } else {
      toast.error('Product not found with this barcode')
    }
  }

  const handleRestock = async () => {
    if (!selectedProduct || !currentBusiness?.id || !user?.id) return

    const quantity = parseInt(restockForm.quantity)
    const costPrice = parseFloat(restockForm.costPrice)

    if (!quantity || quantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    if (!costPrice || costPrice <= 0) {
      toast.error('Please enter a valid cost price')
      return
    }

    setIsSubmitting(true)

    try {
      // Update product stock using RPC function
      const { error: stockError } = await supabase.rpc('update_product_stock', {
        product_id_param: selectedProduct.id,
        quantity_change: quantity,
        movement_type_param: 'in',
        reason_param: 'Restock',
        reference_type_param: 'restock',
        reference_id_param: null
      })

      if (stockError) throw stockError

      // Update product cost price if different
      if (costPrice !== selectedProduct.cost_price) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            cost_price: costPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedProduct.id)

        if (updateError) throw updateError
      }

      toast.success(`Successfully restocked ${quantity} units of ${selectedProduct.name}`)
      
      // Reset form and close dialog
      setRestockForm({
        quantity: '',
        costPrice: selectedProduct.cost_price.toString(),
        supplier: '',
        notes: ''
      })
      setIsRestockDialogOpen(false)
      setSelectedProduct(null)
      
      // Reload products
      loadProducts()
      
    } catch (error) {
      console.error('Error restocking product:', error)
      toast.error('Failed to restock product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateBarcodePDF = (product: Product) => {
    const doc = new jsPDF()
    
    // Set up the PDF
    doc.setFontSize(16)
    doc.text(product.name, 20, 30)
    
    doc.setFontSize(12)
    doc.text(`Brand: ${product.brand || 'N/A'}`, 20, 45)
    doc.text(`Manufacturer: ${product.manufacturer || 'N/A'}`, 20, 55)
    doc.text(`Price: ${product.retail_price}`, 20, 65)
    
    // Add dotted line separator
    doc.setLineWidth(0.5)
    doc.setDrawColor(0, 0, 0)
    for (let i = 20; i < 190; i += 2) {
      doc.line(i, 75, i + 1, 75)
    }
    
    // Add barcode (simplified representation)
    doc.setFontSize(10)
    doc.text(`Barcode: ${product.barcode}`, 20, 90)
    
    // Add tear-off instruction
    doc.setFontSize(8)
    doc.text('Tear along dotted line to separate barcode from product info', 20, 100)
    
    // Save the PDF
    doc.save(`${product.name.replace(/[^a-z0-9]/gi, '_')}_barcode.pdf`)
  }

  const openRestockDialog = (product: Product) => {
    setSelectedProduct(product)
    setRestockForm({
      quantity: '',
      costPrice: product.cost_price.toString(),
      supplier: '',
      notes: ''
    })
    setIsRestockDialogOpen(true)
  }

  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Business Selected</h2>
            <p className="text-gray-600 mb-4">Please select a business to manage restocking.</p>
            <Button onClick={() => navigate('/business-management')}>
              Select Business
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Restock Inventory</h1>
                <p className="text-sm text-gray-600">{currentBusiness.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate('/commodity-registration')}>
                <Plus className="h-4 w-4 mr-2" />
                Register New Product
              </Button>
              <Button onClick={() => navigate('/inventory')}>
                View Inventory
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Scanner */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products by name, barcode, or brand..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsScannerOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>Scan Barcode</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'with-barcode' | 'no-barcode')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="with-barcode" className="flex items-center space-x-2">
              <Barcode className="h-4 w-4" />
              <span>With Barcode ({products.filter(p => p.barcode_type === 'existing').length})</span>
            </TabsTrigger>
            <TabsTrigger value="no-barcode" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>Generated Barcode ({products.filter(p => p.barcode_type === 'generated').length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="with-barcode" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? 'No products match your search criteria.'
                      : 'No products with existing barcodes found.'
                    }
                  </p>
                  <Button onClick={() => navigate('/commodity-registration')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Register New Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {product.brand && <span className="block">{product.brand}</span>}
                            <span className="text-xs text-gray-500">Barcode: {product.barcode}</span>
                          </CardDescription>
                        </div>
                        <Badge variant={product.current_stock <= product.min_stock ? "destructive" : "default"}>
                          {product.current_stock} {product.unit_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Product Image */}
                      {product.product_image_url && (
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={product.product_image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Product Details */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cost Price:</span>
                          <span className="font-medium">{product.cost_price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Wholesale:</span>
                          <span className="font-medium">{product.wholesale_price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Retail:</span>
                          <span className="font-medium">{product.retail_price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Min Stock:</span>
                          <span className="font-medium">{product.min_stock}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRestockDialog(product)}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Restock
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/inventory/${product.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="no-barcode" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? 'No products match your search criteria.'
                      : 'No products with generated barcodes found.'
                    }
                  </p>
                  <Button onClick={() => navigate('/commodity-registration')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Register New Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {product.brand && <span className="block">{product.brand}</span>}
                            <span className="text-xs text-gray-500">Generated Barcode: {product.barcode}</span>
                          </CardDescription>
                        </div>
                        <Badge variant={product.current_stock <= product.min_stock ? "destructive" : "default"}>
                          {product.current_stock} {product.unit_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Product Image */}
                      {product.product_image_url && (
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={product.product_image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Product Details */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cost Price:</span>
                          <span className="font-medium">{product.cost_price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Wholesale:</span>
                          <span className="font-medium">{product.wholesale_price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Retail:</span>
                          <span className="font-medium">{product.retail_price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Min Stock:</span>
                          <span className="font-medium">{product.min_stock}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRestockDialog(product)}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Restock
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateBarcodePDF(product)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/inventory/${product.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restock Product</DialogTitle>
            <DialogDescription>
              Add new stock for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Current Stock Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Current Stock Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="ml-2 font-medium">{selectedProduct?.current_stock} {selectedProduct?.unit_type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Min Stock:</span>
                  <span className="ml-2 font-medium">{selectedProduct?.min_stock} {selectedProduct?.unit_type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Current Cost:</span>
                  <span className="ml-2 font-medium">{selectedProduct?.cost_price}</span>
                </div>
                <div>
                  <span className="text-gray-600">Barcode:</span>
                  <span className="ml-2 font-medium text-xs">{selectedProduct?.barcode}</span>
                </div>
              </div>
            </div>

            {/* Restock Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity to Add *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={restockForm.quantity}
                  onChange={(e) => setRestockForm(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice">New Cost Price *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  placeholder="Enter cost price"
                  value={restockForm.costPrice}
                  onChange={(e) => setRestockForm(prev => ({ ...prev, costPrice: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier (Optional)</Label>
                <Input
                  id="supplier"
                  placeholder="Enter supplier name"
                  value={restockForm.supplier}
                  onChange={(e) => setRestockForm(prev => ({ ...prev, supplier: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Add any notes"
                  value={restockForm.notes}
                  onChange={(e) => setRestockForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRestock} 
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{isSubmitting ? 'Restocking...' : 'Confirm Restock'}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Modal */}
      <EnhancedBarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
        enableSound={true}
        enableVibration={true}
      />
    </div>
  )
}

export default Restock
