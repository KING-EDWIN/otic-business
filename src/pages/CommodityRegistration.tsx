import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useBusinessManagement } from '@/contexts/BusinessManagementContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Camera, 
  Barcode, 
  Package, 
  Upload, 
  Save, 
  X,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  QrCode
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import EnhancedBarcodeScanner from '@/components/EnhancedBarcodeScanner'
import { imageStorageService } from '@/services/imageStorageService'
import { toast } from 'sonner'

interface ProductFormData {
  name: string
  description: string
  category: string
  brand: string
  manufacturer: string
  costPrice: string
  wholesalePrice: string
  retailPrice: string
  currentStock: string
  minStock: string
  maxStock: string
  unitType: string
  itemsPerPackage: string
  packageType: string
  barcode: string
  barcodeType: 'existing' | 'generated'
  productImage: File | null
  barcodeImage: File | null
}

interface Category {
  id: string
  name: string
  description?: string
  business_id?: string
}

const CommodityRegistration: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentBusiness } = useBusinessManagement()
  
  const [activeTab, setActiveTab] = useState<'with-barcode' | 'no-barcode'>('with-barcode')
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const barcodeImageInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    brand: '',
    manufacturer: '',
    costPrice: '',
    wholesalePrice: '',
    retailPrice: '',
    currentStock: '0',
    minStock: '5',
    maxStock: '1000',
    unitType: 'piece',
    itemsPerPackage: '1',
    packageType: 'individual',
    barcode: '',
    barcodeType: 'existing',
    productImage: null,
    barcodeImage: null
  })

  const [previewImages, setPreviewImages] = useState<{
    product: string | null
    barcode: string | null
  }>({
    product: null,
    barcode: null
  })

  // Load categories
  useEffect(() => {
    loadCategories()
  }, [currentBusiness])

  const loadCategories = async () => {
    if (!currentBusiness?.id) return

    try {
      setLoadingCategories(true)
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error loading categories:', error)
        setCategories([])
        return
      }
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBarcodeScan = (barcode: string, format: string) => {
    console.log('Scanned barcode:', barcode, 'Format:', format)
    setFormData(prev => ({
      ...prev,
      barcode: barcode,
      barcodeType: 'existing'
    }))
    setIsScannerOpen(false)
    toast.success(`Barcode scanned: ${barcode}`)
  }

  const handleImageUpload = (file: File, type: 'product' | 'barcode') => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreviewImages(prev => ({
        ...prev,
        [type]: result
      }))
    }
    reader.readAsDataURL(file)

    if (type === 'product') {
      handleInputChange('productImage', file)
    } else {
      handleInputChange('barcodeImage', file)
    }
  }

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const result = await imageStorageService.uploadImage(file, path, {
        compress: true,
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.8
      })

      if (result.success && result.url) {
        return result.url
      } else {
        console.error('Upload error:', result.error)
        return null
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const generateBarcode = async (): Promise<string | null> => {
    if (!currentBusiness?.name || !formData.name) return null

    try {
      const { data, error } = await supabase.rpc('generate_product_barcode', {
        business_name_param: currentBusiness.name,
        product_name_param: formData.name,
        manufacturer_param: formData.manufacturer || null
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error generating barcode via RPC:', error)
      
      // Fallback: Generate barcode client-side
      const businessPrefix = currentBusiness.name.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, '')
      const productPrefix = formData.name.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, '')
      const manufacturerPrefix = formData.manufacturer ? 
        formData.manufacturer.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, '') : 'XX'
      const timestamp = Date.now().toString().slice(-6)
      
      const fallbackBarcode = (businessPrefix + productPrefix + manufacturerPrefix + timestamp).padEnd(12, '0')
      console.log('Generated fallback barcode:', fallbackBarcode)
      
      return fallbackBarcode
    }
  }

  const validateForm = (): boolean => {
    const requiredFields = ['name', 'costPrice', 'wholesalePrice', 'retailPrice']
    
    for (const field of requiredFields) {
      if (!formData[field as keyof ProductFormData]) {
        toast.error(`Please fill in ${field}`)
        return false
      }
    }

    if (activeTab === 'with-barcode' && !formData.barcode) {
      toast.error('Please scan or enter a barcode')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm() || !currentBusiness?.id || !user?.id) return

    setIsSubmitting(true)

    try {
      let barcode = formData.barcode

      // Generate barcode for no-barcode products
      if (activeTab === 'no-barcode') {
        const generatedBarcode = await generateBarcode()
        if (!generatedBarcode) {
          toast.error('Failed to generate barcode')
          return
        }
        barcode = generatedBarcode
        formData.barcodeType = 'generated'
      }

      // Upload images (optional - don't block registration if upload fails)
      let productImageUrl = null
      let barcodeImageUrl = null
      
      if (formData.productImage) {
        try {
          const productPath = `products/${user.id}/${Date.now()}-product.jpg`
          productImageUrl = await uploadImage(formData.productImage, productPath)
          if (!productImageUrl) {
            console.warn('Product image upload failed, continuing without image')
          }
        } catch (error) {
          console.warn('Product image upload failed:', error)
        }
      }

      if (formData.barcodeImage) {
        try {
          const barcodePath = `barcodes/${user.id}/${Date.now()}-barcode.jpg`
          barcodeImageUrl = await uploadImage(formData.barcodeImage, barcodePath)
          if (!barcodeImageUrl) {
            console.warn('Barcode image upload failed, continuing without image')
          }
        } catch (error) {
          console.warn('Barcode image upload failed:', error)
        }
      }

      // Create product
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          business_id: currentBusiness.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          brand: formData.brand,
          manufacturer: formData.manufacturer,
          cost_price: parseFloat(formData.costPrice),
          wholesale_price: parseFloat(formData.wholesalePrice),
          retail_price: parseFloat(formData.retailPrice),
          current_stock: parseInt(formData.currentStock),
          min_stock: parseInt(formData.minStock),
          max_stock: parseInt(formData.maxStock),
          unit_type: formData.unitType,
          items_per_package: parseInt(formData.itemsPerPackage),
          package_type: formData.packageType,
          barcode: barcode,
          barcode_type: formData.barcodeType,
          product_image_url: productImageUrl,
          barcode_image_url: barcodeImageUrl,
          status: 'active'
        })
        .select()

      if (error) throw error

      toast.success('Commodity registered successfully! You can now register another commodity.')
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        brand: '',
        manufacturer: '',
        costPrice: '',
        wholesalePrice: '',
        retailPrice: '',
        currentStock: '0',
        minStock: '5',
        maxStock: '1000',
        unitType: 'piece',
        itemsPerPackage: '1',
        packageType: 'individual',
        barcode: '',
        barcodeType: 'existing',
        productImage: null,
        barcodeImage: null
      })
      
      setPreviewImages({ product: null, barcode: null })
      
      // Stay on the same page - don't navigate away
      
    } catch (error) {
      console.error('Error registering commodity:', error)
      toast.error('Failed to register commodity')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Business Selected</h2>
            <p className="text-gray-600 mb-4">Please select a business to register commodities.</p>
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
                <h1 className="text-xl font-semibold">Commodity Registration</h1>
                <p className="text-sm text-gray-600">{currentBusiness.name}</p>
              </div>
            </div>
            <Button onClick={() => navigate('/inventory')}>
              View Inventory
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'with-barcode' | 'no-barcode')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="with-barcode" className="flex items-center space-x-2">
              <Barcode className="h-4 w-4" />
              <span>Stock with Barcode</span>
            </TabsTrigger>
            <TabsTrigger value="no-barcode" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>Stock with No Barcode</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="with-barcode" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Barcode className="h-5 w-5" />
                  <span>Barcode Product Registration</span>
                </CardTitle>
                <CardDescription>
                  Register products that already have barcodes (like supermarket products)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Barcode Scanning */}
                <div className="space-y-4">
                  <Label>Barcode</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Scan or enter barcode"
                      value={formData.barcode}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setIsScannerOpen(true)}
                      className="flex items-center space-x-2"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Scan</span>
                    </Button>
                  </div>
                  {formData.barcode && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Barcode: {formData.barcode}</span>
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Jesa Milk 500ml"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      placeholder="e.g., Jesa"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      placeholder="e.g., Jesa Dairy"
                      value={formData.manufacturer}
                      onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Product description..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Cost Price *</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.costPrice}
                        onChange={(e) => handleInputChange('costPrice', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wholesalePrice">Wholesale Price *</Label>
                      <Input
                        id="wholesalePrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.wholesalePrice}
                        onChange={(e) => handleInputChange('wholesalePrice', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retailPrice">Retail Price *</Label>
                      <Input
                        id="retailPrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.retailPrice}
                        onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Inventory */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Inventory</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentStock">Current Stock</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        placeholder="0"
                        value={formData.currentStock}
                        onChange={(e) => handleInputChange('currentStock', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStock">Minimum Stock</Label>
                      <Input
                        id="minStock"
                        type="number"
                        placeholder="5"
                        value={formData.minStock}
                        onChange={(e) => handleInputChange('minStock', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStock">Maximum Stock</Label>
                      <Input
                        id="maxStock"
                        type="number"
                        placeholder="1000"
                        value={formData.maxStock}
                        onChange={(e) => handleInputChange('maxStock', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Packaging */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Packaging</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unitType">Unit Type</Label>
                      <Select value={formData.unitType} onValueChange={(value) => handleInputChange('unitType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="liter">Liter</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="pack">Pack</SelectItem>
                          <SelectItem value="gram">Gram</SelectItem>
                          <SelectItem value="ml">Milliliter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemsPerPackage">Items per Package</Label>
                      <Input
                        id="itemsPerPackage"
                        type="number"
                        placeholder="1"
                        value={formData.itemsPerPackage}
                        onChange={(e) => handleInputChange('itemsPerPackage', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packageType">Package Type</Label>
                      <Select value={formData.packageType} onValueChange={(value) => handleInputChange('packageType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="pack">Pack</SelectItem>
                          <SelectItem value="bundle">Bundle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Product Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Product Image</h3>
                  <div className="space-y-2">
                    <Label>Upload Product Photo</Label>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Choose Image</span>
                      </Button>
                      {previewImages.product && (
                        <div className="flex items-center space-x-2">
                          <img
                            src={previewImages.product}
                            alt="Product preview"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewImages(prev => ({ ...prev, product: null }))
                              handleInputChange('productImage', null)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'product')
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="no-barcode" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>No-Barcode Product Registration</span>
                </CardTitle>
                <CardDescription>
                  Register products without barcodes. The system will generate a unique barcode for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name2">Product Name *</Label>
                    <Input
                      id="name2"
                      placeholder="e.g., Fresh Tomatoes"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand2">Brand</Label>
                    <Input
                      id="brand2"
                      placeholder="e.g., Local Farm"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer2">Manufacturer/Supplier</Label>
                    <Input
                      id="manufacturer2"
                      placeholder="e.g., Local Farm"
                      value={formData.manufacturer}
                      onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category2">Category (Optional)</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description2">Description</Label>
                  <Textarea
                    id="description2"
                    placeholder="Product description..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice2">Cost Price *</Label>
                      <Input
                        id="costPrice2"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.costPrice}
                        onChange={(e) => handleInputChange('costPrice', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wholesalePrice2">Wholesale Price *</Label>
                      <Input
                        id="wholesalePrice2"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.wholesalePrice}
                        onChange={(e) => handleInputChange('wholesalePrice', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retailPrice2">Retail Price *</Label>
                      <Input
                        id="retailPrice2"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.retailPrice}
                        onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Inventory */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Inventory</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentStock2">Current Stock</Label>
                      <Input
                        id="currentStock2"
                        type="number"
                        placeholder="0"
                        value={formData.currentStock}
                        onChange={(e) => handleInputChange('currentStock', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStock2">Minimum Stock</Label>
                      <Input
                        id="minStock2"
                        type="number"
                        placeholder="5"
                        value={formData.minStock}
                        onChange={(e) => handleInputChange('minStock', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStock2">Maximum Stock</Label>
                      <Input
                        id="maxStock2"
                        type="number"
                        placeholder="1000"
                        value={formData.maxStock}
                        onChange={(e) => handleInputChange('maxStock', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Packaging */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Packaging</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unitType2">Unit Type</Label>
                      <Select value={formData.unitType} onValueChange={(value) => handleInputChange('unitType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="liter">Liter</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="pack">Pack</SelectItem>
                          <SelectItem value="gram">Gram</SelectItem>
                          <SelectItem value="ml">Milliliter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemsPerPackage2">Items per Package</Label>
                      <Input
                        id="itemsPerPackage2"
                        type="number"
                        placeholder="1"
                        value={formData.itemsPerPackage}
                        onChange={(e) => handleInputChange('itemsPerPackage', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packageType2">Package Type</Label>
                      <Select value={formData.packageType} onValueChange={(value) => handleInputChange('packageType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="pack">Pack</SelectItem>
                          <SelectItem value="bundle">Bundle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Product Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Product Image</h3>
                  <div className="space-y-2">
                    <Label>Upload Product Photo</Label>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Choose Image</span>
                      </Button>
                      {previewImages.product && (
                        <div className="flex items-center space-x-2">
                          <img
                            src={previewImages.product}
                            alt="Product preview"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewImages(prev => ({ ...prev, product: null }))
                              handleInputChange('productImage', null)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'product')
                      }}
                    />
                  </div>
                </div>

                {/* Generated Barcode Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <QrCode className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Generated Barcode</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    A unique barcode will be automatically generated for this product based on your business name, 
                    product name, and manufacturer. This barcode will be used for inventory tracking and sales.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Registering...' : 'Register Commodity'}</span>
          </Button>
        </div>
      </div>

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

export default CommodityRegistration
