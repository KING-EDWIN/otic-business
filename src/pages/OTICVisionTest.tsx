import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Camera, 
  Brain, 
  Sparkles, 
  Eye, 
  Zap, 
  Crown,
  ArrowLeft,
  CheckCircle,
  Star,
  Target,
  Lightbulb,
  Rocket,
  Shield,
  Globe,
  Users,
  TrendingUp,
  Package,
  ShoppingCart,
  BarChart3,
  Award,
  Gauge,
  Clock,
  DollarSign,
  Layers,
  Activity,
  Cpu,
  Database,
  Cloud,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Bluetooth,
  QrCode,
  Scan,
  Image as ImageIcon,
  Upload,
  Download,
  Share2,
  Bookmark,
  Heart,
  ThumbsUp,
  MessageCircle,
  Bell,
  Settings,
  HelpCircle,
  Info,
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  Maximize,
  Minimize,
  X,
  Plus,
  Minus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Calendar,
  Clock as ClockIcon,
  MapPin,
  Phone,
  Mail,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Key,
  Shield as ShieldIcon,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info as InfoIcon,
  Loader2,
  Loader,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Move,
  Move3D,
  Scale,
  Crop,
  Scissors,
  Copy,
  Undo,
  Redo,
  Save,
  Trash2,
  Edit,
  Edit2,
  Edit3,
  Pen,
  PenTool,
  Pencil,
  Eraser,
  Highlighter,
  Brush,
  Palette,
  Paintbrush,
  Droplet,
  Rainbow,
  Sun,
  Moon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Gauge as GaugeIcon,
  BarChart,
  BarChart2,
  BarChart3 as BarChart3Icon,
  LineChart,
  PieChart,
  AreaChart
} from 'lucide-react'
import { toast } from 'sonner'

interface ProductData {
  name: string
  description: string
  category: string
  brand: string
  price: string
  cost: string
  stock: string
  minStock: string
  unitType: string
  barcode: string
  image: string
}

const OTICVisionTest = () => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    unitType: 'piece',
    barcode: '',
    image: ''
  })
  const [capturedImage, setCapturedImage] = useState<string>('')
  const [confidence, setConfidence] = useState<number>(0)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>('')

  // Initialize camera
  const startCamera = async () => {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraActive(true)
        toast.success('Camera activated!')
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please check permissions.')
      toast.error('Camera access denied')
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraActive(false)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageDataUrl)
        setProductData(prev => ({ ...prev, image: imageDataUrl }))
        toast.success('Image captured!')
      }
    }
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const simulateAIAnalysis = async () => {
    if (!capturedImage) {
      toast.error('Please capture an image first!')
      return
    }
    
    setIsAnalyzing(true)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Simulate AI analysis results
    const mockResults = {
      detectedProducts: [
        {
          name: "Coca-Cola Classic 500ml",
          brand: "Coca-Cola",
          category: "Beverages",
          confidence: 0.95,
          description: "Classic Coca-Cola soft drink in 500ml bottle",
          estimatedPrice: "2500",
          estimatedCost: "1800"
        },
        {
          name: "Pepsi Cola 500ml",
          brand: "Pepsi",
          category: "Beverages", 
          confidence: 0.87,
          description: "Pepsi Cola soft drink in 500ml bottle",
          estimatedPrice: "2400",
          estimatedCost: "1700"
        }
      ],
      overallConfidence: 0.91
    }
    
    setAnalysisResult(mockResults)
    setConfidence(mockResults.overallConfidence)
    
    // Auto-populate form with highest confidence result
    const bestMatch = mockResults.detectedProducts[0]
    setProductData({
      name: bestMatch.name,
      description: bestMatch.description,
      category: bestMatch.category,
      brand: bestMatch.brand,
      price: bestMatch.estimatedPrice,
      cost: bestMatch.estimatedCost,
      stock: '10',
      minStock: '5',
      unitType: 'piece',
      barcode: `OTIC${Date.now().toString().slice(-8)}`,
      image: capturedImage
    })
    
    setIsAnalyzing(false)
    setShowForm(true)
    toast.success('AI analysis completed! Product identified with 95% confidence.')
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Product added to inventory successfully!')
    // Here you would typically save to database
    console.log('Product data:', productData)
  }

  const resetForm = () => {
    setProductData({
      name: '',
      description: '',
      category: '',
      brand: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      unitType: 'piece',
      barcode: '',
      image: ''
    })
    setCapturedImage('')
    setAnalysisResult(null)
    setShowForm(false)
    setConfidence(0)
    stopCamera()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/otic-vision')}
                className="text-gray-600 hover:text-[#040458]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to OTIC Vision
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-gradient-to-r from-[#040458] to-[#faa51a] text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium Feature
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Instructions */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#040458]">
                  <Lightbulb className="h-6 w-6" />
                  <span>How to Test</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#040458] mb-2">How to Test OTIC Vision</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Click "Start Camera" to activate your device camera</li>
                      <li>Point the camera at any product (bottle, box, package, etc.)</li>
                      <li>Click "Capture Image" to take a photo</li>
                      <li>Click "Analyze with AI" to start the recognition process</li>
                      <li>Review the AI-detected product information</li>
                      <li>Confirm or modify the details in the auto-populated form</li>
                      <li>Save the product to your inventory</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#040458]">
                  <Star className="h-6 w-6" />
                  <span>AI Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Product Recognition</h4>
                      <p className="text-sm text-gray-600">Identifies products from images</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Smart Analysis</h4>
                      <p className="text-sm text-gray-600">Extracts product details automatically</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Instant Results</h4>
                      <p className="text-sm text-gray-600">Fast processing and results</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Camera and Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-[#040458]">
                  <Camera className="h-6 w-6" />
                  <span>Product Image Analysis</span>
                </CardTitle>
                <CardDescription>
                  Use your camera to capture a product image and let our AI identify it automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Camera Interface */}
                <div className="space-y-4">
                  {/* Camera Controls */}
                  <div className="flex justify-center space-x-3">
                    {!isCameraActive ? (
                      <Button 
                        onClick={startCamera}
                        className="bg-[#040458] hover:bg-[#040458]/90 text-white"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera
                      </Button>
                    ) : (
                      <Button 
                        onClick={stopCamera}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Stop Camera
                      </Button>
                    )}
                    
                    {isCameraActive && (
                      <Button 
                        onClick={captureImage}
                        className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Image
                      </Button>
                    )}
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Camera Preview */}
                  {isCameraActive && (
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-64 object-cover"
                        playsInline
                        muted
                        autoPlay
                      />
                      
                      {/* Camera Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-32 border-2 border-[#040458] rounded-lg animate-pulse">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#040458] rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#040458] rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#040458] rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#040458] rounded-br-lg"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Captured Image Display */}
                  {capturedImage && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-600 mb-2">✓ Image Captured Successfully!</p>
                      </div>
                      <img 
                        src={capturedImage} 
                        alt="Captured product" 
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                      />
                      <div className="flex justify-center space-x-2">
                        <Button 
                          onClick={captureImage}
                          variant="outline"
                          size="sm"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Retake Photo
                        </Button>
                        <Button 
                          onClick={resetForm}
                          variant="outline"
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Hidden canvas for image capture */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Analysis Button */}
                <Button 
                  onClick={simulateAIAnalysis}
                  disabled={!capturedImage || isAnalyzing}
                  className="w-full bg-gradient-to-r from-[#040458] to-[#faa51a] hover:opacity-90 text-white py-3 text-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>

                {/* Analysis Results */}
                {analysisResult && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-800">AI Analysis Complete!</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Confidence:</span>
                          <Badge className="bg-green-100 text-green-800">
                            {Math.round(confidence * 100)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Products Detected:</span>
                          <span className="text-sm font-medium">{analysisResult.detectedProducts.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Product Form */}
                {showForm && (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-[#040458]">
                        <Package className="h-6 w-6" />
                        <span>Product Details</span>
                      </CardTitle>
                      <CardDescription>
                        Review and confirm the AI-detected product information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                              id="name"
                              value={productData.name}
                              onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter product name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                              id="brand"
                              value={productData.brand}
                              onChange={(e) => setProductData(prev => ({ ...prev, brand: e.target.value }))}
                              placeholder="Enter brand"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={productData.description}
                            onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter product description"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={productData.category} onValueChange={(value) => setProductData(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="food">Food & Beverages</SelectItem>
                                <SelectItem value="electronics">Electronics</SelectItem>
                                <SelectItem value="clothing">Clothing</SelectItem>
                                <SelectItem value="home">Home & Garden</SelectItem>
                                <SelectItem value="health">Health & Beauty</SelectItem>
                                <SelectItem value="sports">Sports & Outdoors</SelectItem>
                                <SelectItem value="books">Books & Media</SelectItem>
                                <SelectItem value="toys">Toys & Games</SelectItem>
                                <SelectItem value="automotive">Automotive</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="unitType">Unit Type</Label>
                            <Select value={productData.unitType} onValueChange={(value) => setProductData(prev => ({ ...prev, unitType: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="piece">Piece</SelectItem>
                                <SelectItem value="kg">Kilogram</SelectItem>
                                <SelectItem value="liter">Liter</SelectItem>
                                <SelectItem value="box">Box</SelectItem>
                                <SelectItem value="pack">Pack</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="barcode">Barcode</Label>
                            <Input
                              id="barcode"
                              value={productData.barcode}
                              onChange={(e) => setProductData(prev => ({ ...prev, barcode: e.target.value }))}
                              placeholder="Auto-generated"
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price">Selling Price (UGX)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={productData.price}
                              onChange={(e) => setProductData(prev => ({ ...prev, price: e.target.value }))}
                              placeholder="0"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cost">Cost Price (UGX)</Label>
                            <Input
                              id="cost"
                              type="number"
                              value={productData.cost}
                              onChange={(e) => setProductData(prev => ({ ...prev, cost: e.target.value }))}
                              placeholder="0"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="stock">Current Stock</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={productData.stock}
                              onChange={(e) => setProductData(prev => ({ ...prev, stock: e.target.value }))}
                              placeholder="0"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="minStock">Minimum Stock</Label>
                            <Input
                              id="minStock"
                              type="number"
                              value={productData.minStock}
                              onChange={(e) => setProductData(prev => ({ ...prev, minStock: e.target.value }))}
                              placeholder="5"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                          >
                            Reset
                          </Button>
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-[#040458] to-[#faa51a] hover:opacity-90 text-white"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Add to Inventory
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OTICVisionTest