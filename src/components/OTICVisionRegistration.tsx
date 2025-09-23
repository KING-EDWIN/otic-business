import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Camera,
  Upload,
  Target,
  X,
  Plus,
  Check,
  Eye,
  Zap,
  Database
} from 'lucide-react'
import { toast } from 'sonner'
import { visionApiManager } from '@/services/visionApiManager'
import { pvfsService, VFTCategory } from '@/services/pvfsService'
import { DetectedObject } from '@/services/huggingFaceVisionService'
import { useAuth } from '@/contexts/AuthContext'

interface OTICVisionRegistrationProps {
  onProductRegistered?: () => void
  onClose?: () => void
}

const OTICVisionRegistration: React.FC<OTICVisionRegistrationProps> = ({
  onProductRegistered,
  onClose
}) => {
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [categories, setCategories] = useState<VFTCategory[]>([])
  const [selectedVFT, setSelectedVFT] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showProductForm, setShowProductForm] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  // Product form state
  const [productForm, setProductForm] = useState({
    brandName: '',
    productName: '',
    description: '',
    price: '',
    cost: '',
    stockQuantity: '',
    barcode: '',
    sku: '',
    weight: '',
    dimensions: '',
    color: '',
    size: '',
    material: '',
    countryOfOrigin: '',
    supplier: ''
  })

  // Generate barcode and SKU
  const generateBarcode = () => {
    return Math.floor(1000000000000 + Math.random() * 9000000000000).toString()
  }

  const generateSKU = (brand: string, product: string) => {
    const brandCode = brand.substring(0, 3).toUpperCase()
    const productCode = product.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '')
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    return `${brandCode}-${productCode}-${randomNum}`
  }

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [])

  // Handle video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(console.error)
    }
  }, [stream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const loadCategories = async () => {
    try {
      const data = await pvfsService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Failed to load categories')
    }
  }

  // Camera functions
  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...')
      console.log('🔍 MediaDevices available:', navigator.mediaDevices)
      console.log('🔍 getUserMedia supported:', !!navigator.mediaDevices?.getUserMedia)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      })

      console.log('✅ Camera stream obtained:', mediaStream)
      setStream(mediaStream)
      setIsCameraOpen(true)
      console.log('✅ Camera state updated')
    } catch (error) {
      console.error('❌ Camera error:', error)
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
      toast.error(`Failed to access camera: ${error.message}`)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraOpen(false)
    }
  }

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
        setSelectedImage(file)
        setImagePreview(canvas.toDataURL())
        
        // Close camera and analyze image
        stopCamera()
        await analyzeImage(file)
      }
    }, 'image/jpeg', 0.8)
  }

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      await analyzeImage(file)
    }
  }

  const analyzeImage = async (imageFile: File) => {
    setIsProcessing(true)
    setDetectedObjects([])

    try {
      const result = await visionApiManager.detectObjects(imageFile)

      if (result.success && result.objects.length > 0) {
        setDetectedObjects(result.objects)
        toast.success(`Detected ${result.objects.length} objects!`)
      } else {
        toast.info('No objects detected in this image')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze image')
    } finally {
      setIsProcessing(false)
    }
  }

  const selectVFT = async (vftName: string) => {
    setSelectedVFT(vftName)
    const barcode = generateBarcode()
    const sku = generateSKU(productForm.brandName || 'PRO', vftName)
    setProductForm({
      ...productForm, 
      productName: vftName,
      barcode: barcode,
      sku: sku
    })
    setShowProductForm(true)
    toast.success(`Selected "${vftName}" as your Visual Filter Tag`)
  }

  const addProduct = async () => {
    if (!selectedVFT || !productForm.brandName || !productForm.productName || !productForm.price || !productForm.cost) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!selectedCategory) {
      toast.error('Please select a category')
      return
    }

    if (!user?.id) {
      toast.error('User not authenticated. Please sign in first.')
      return
    }

    setIsRegistering(true)
    try {
      const vftId = await pvfsService.createVFT(selectedVFT, selectedCategory, 0.9)
      
      const productId = await pvfsService.registerVFTProduct(
        vftId,
        productForm.brandName,
        productForm.productName,
        productForm.description,
        parseFloat(productForm.price),
        parseFloat(productForm.cost),
        parseInt(productForm.stockQuantity) || 0,
        productForm.barcode || undefined,
        productForm.sku || undefined,
        productForm.weight ? parseFloat(productForm.weight) : undefined,
        productForm.dimensions || undefined,
        productForm.color || undefined,
        productForm.size || undefined,
        productForm.material || undefined,
        productForm.countryOfOrigin || undefined,
        productForm.supplier || undefined
      )

      // Log the visual scan
      await pvfsService.logVisualScan(
        selectedVFT,
        detectedObjects,
        Math.max(...detectedObjects.map(obj => obj.confidence)),
        'registration',
        productId,
        imagePreview || undefined
      )

      toast.success(`Product "${productForm.brandName} ${productForm.productName}" registered successfully!`)
      
      // Reset form
      setProductForm({
        brandName: '',
        productName: '',
        description: '',
        price: '',
        cost: '',
        stockQuantity: '',
        barcode: '',
        sku: '',
        weight: '',
        dimensions: '',
        color: '',
        size: '',
        material: '',
        countryOfOrigin: '',
        supplier: ''
      })
      
      setShowProductForm(false)
      setSelectedVFT('')
      setSelectedCategory('')
      clearAll()
      
      onProductRegistered?.()
      
    } catch (error) {
      console.error('Error registering product:', error)
      toast.error('Failed to register product')
    } finally {
      setIsRegistering(false)
    }
  }

  const clearAll = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setDetectedObjects([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Camera Product Registration</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInstructions(!showInstructions)}
        >
          <Eye className="h-4 w-4 mr-1" />
          {showInstructions ? 'Hide' : 'Show'} Instructions
        </Button>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <Alert className="bg-blue-50 border-blue-200">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>How to register products:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Click "Use Camera" to scan your product</li>
              <li>Select the detected object name (e.g., "Calculator")</li>
              <li>Choose the appropriate category</li>
              <li>Fill in product details (brand, price, cost, etc.) - barcode and SKU auto-generated</li>
              <li>Click "Register Product" to save</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Camera & Detection */}
        <div className="space-y-4">
          {/* Camera Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Scan Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCameraOpen ? (
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      onClick={startCamera}
                      className="flex-1 bg-[#faa51a] hover:bg-[#faa51a]/90 text-white"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Use Camera
                    </Button>

                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={captureImage}
                      className="flex-1 bg-[#faa51a] hover:bg-[#faa51a]/90 text-white"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Capture & Analyze
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Preview */}
          {imagePreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Captured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={imagePreview}
                  alt="Captured"
                  className="w-full rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Detection Results */}
          {detectedObjects.length > 0 && !showProductForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Detected Objects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Tap on an object name to register as a product:
                </p>
                
                {detectedObjects.map((obj, index) => (
                  <div
                    key={index}
                    onClick={() => selectVFT(obj.label)}
                    className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {obj.label}
                      </span>
                      <Badge
                        className={`${
                          obj.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                          obj.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {Math.round(obj.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Position: ({obj.bbox.x}, {obj.bbox.y}) Size: {obj.bbox.width} × {obj.bbox.height}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Product Form */}
        {showProductForm && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Product Details</span>
                  <Badge className="bg-[#faa51a] text-white">
                    VFT: {selectedVFT}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Category *</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Brand Name *</Label>
                    <Input
                      value={productForm.brandName}
                      onChange={(e) => setProductForm({...productForm, brandName: e.target.value})}
                      placeholder="e.g., Nike, Apple, Coca-Cola"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">Product Name *</Label>
                    <Input
                      value={productForm.productName}
                      onChange={(e) => setProductForm({...productForm, productName: e.target.value})}
                      placeholder="e.g., Air Max 90, iPhone 15, Classic Cola"
                    />
                    {selectedVFT !== '' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-filled from detected tag: <span className="font-medium">{selectedVFT}</span> (editable)
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Description</Label>
                  <Textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Brief description of the product"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm">Selling Price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">Cost Price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={productForm.cost}
                      onChange={(e) => setProductForm({...productForm, cost: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">Stock Quantity</Label>
                    <Input
                      type="number"
                      value={productForm.stockQuantity}
                      onChange={(e) => setProductForm({...productForm, stockQuantity: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Barcode (Auto-generated)</Label>
                    <Input
                      value={productForm.barcode}
                      onChange={(e) => setProductForm({...productForm, barcode: e.target.value})}
                      placeholder="Auto-generated barcode"
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">13-digit barcode auto-generated</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm">SKU (Auto-generated)</Label>
                    <Input
                      value={productForm.sku}
                      onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                      placeholder="Auto-generated SKU"
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: BRAND-PROD-1234</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={addProduct}
                    disabled={isRegistering}
                    className="flex-1 bg-[#faa51a] hover:bg-[#faa51a]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRegistering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Register Product
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setShowProductForm(false)
                      setSelectedVFT('')
                      setSelectedCategory('')
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#faa51a]"></div>
          <span className="ml-2 text-sm text-gray-600">Analyzing image...</span>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-2">
        Powered by OTIC Vision
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            Close Registration
          </Button>
        </div>
      )}
    </div>
  )
}

export default OTICVisionRegistration
