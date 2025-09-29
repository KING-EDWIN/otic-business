import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Camera,
  Upload,
  Target,
  X,
  Eye,
  Zap,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { visionApiManager } from '@/services/visionApiManager'
import { pvfsService } from '@/services/pvfsService'
import { DetectedObject } from '@/services/huggingFaceVisionService'

interface OTICVisionScannerProps {
  onProductDetected?: (vftName: string, products: any[]) => void
  onClose?: () => void
  showCloseButton?: boolean
}

const OTICVisionScanner: React.FC<OTICVisionScannerProps> = ({
  onProductDetected,
  onClose,
  showCloseButton = true
}) => {
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
  const [showInstructions, setShowInstructions] = useState(false)
  const [foundProducts, setFoundProducts] = useState<any[]>([])
  const [detectedVFTName, setDetectedVFTName] = useState<string>('')

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

  // Camera functions
  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...')
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
      toast.error('Failed to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraOpen(false)
    }
  }

  const switchCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    // Reopen camera with new facing mode
    setTimeout(() => {
      startCamera()
    }, 100)
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
        // Show detected objects to user
        setDetectedObjects(result.objects)
        // Process detected objects for smart matching
        await processDetectedObjects(result.objects)
        toast.success('Products found! Check the suggestions below.')
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

  const processDetectedObjects = async (objects: DetectedObject[]) => {
    try {
      // Get the most confident detection
      const bestDetection = objects.reduce((prev, current) => 
        (current.confidence > prev.confidence) ? current : prev
      )
      
      console.log('Processing detected object:', bestDetection.label)
      
      // Check network connectivity first
      if (!navigator.onLine) {
        toast.error('No internet connection. Please check your network and try again.')
        return
      }
      
      // Find VFTs that match this object with retry logic
      let vfts = []
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          vfts = await pvfsService.getUserVFTs()
          console.log('User VFTs loaded successfully:', vfts.length, 'VFTs')
          break
        } catch (error) {
          retryCount++
          console.warn(`Attempt ${retryCount} failed to fetch VFTs:`, error)
          
          if (retryCount < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          } else {
            // All retries failed, show fallback message
            console.error('Failed to fetch VFTs after all retries:', error)
            
            // Provide specific error messages based on error type
            if (error.message?.includes('Load failed') || error.message?.includes('network')) {
              toast.error('Network connection lost. Please check your internet and try again.')
            } else if (error.message?.includes('access control')) {
              toast.error('Access denied. Please refresh the page and try again.')
            } else if (error.message?.includes('503') || error.message?.includes('Service temporarily unavailable')) {
              toast.error('Service temporarily unavailable. Please try again in a moment.')
            } else if (error.message?.includes('not authenticated')) {
              toast.error('Please sign in and try again.')
            } else {
              toast.error('Unable to access product database. Please try again.')
            }
            
            // Show fallback UI with detected object
            toast.info(`Detected: "${bestDetection.label}". Please register this product first.`)
            return
          }
        }
      }
      
      console.log('🔍 Available VFTs:', vfts.map(vft => vft.tag_name))
      console.log('🎯 Looking for matches with:', bestDetection.label)
      
      const matchingVFTs = vfts.filter(vft => 
        vft.tag_name.toLowerCase().includes(bestDetection.label.toLowerCase()) ||
        bestDetection.label.toLowerCase().includes(vft.tag_name.toLowerCase())
      )
      
      console.log('🔍 Available VFTs:', vfts.map(v => v.tag_name))
      console.log('🎯 Detected object:', bestDetection.label)
      console.log('✅ Matching VFTs found:', matchingVFTs.map(vft => vft.tag_name))
      
      if (matchingVFTs.length > 0) {
        // Get products for the best matching VFT with error handling
        const vft = matchingVFTs[0]
        let products = []
        
        try {
          products = await pvfsService.getProductsByVFT(vft.tag_name)
          console.log('Products loaded successfully:', products.length, 'products')
        } catch (error) {
          console.error('Error fetching products for VFT:', error)
          
          // Provide specific error messages based on error type
          if (error.message?.includes('Load failed') || error.message?.includes('network')) {
            toast.error('Network connection lost. Please check your internet and try again.')
          } else if (error.message?.includes('access control')) {
            toast.error('Access denied. Please refresh the page and try again.')
          } else if (error.message?.includes('503') || error.message?.includes('Service temporarily unavailable')) {
            toast.error('Service temporarily unavailable. Please try again in a moment.')
          } else if (error.message?.includes('not authenticated')) {
            toast.error('Please sign in and try again.')
          } else {
            toast.error('Unable to fetch products. Please try again.')
          }
          return
        }
        
        // Sort products by popularity (most sold first)
        const sortedProducts = products.sort((a, b) => {
          // This would need to be implemented based on sales data
          return a.product_name.localeCompare(b.product_name)
        })
        
        // Show top 5 most relevant products
        const topProducts = sortedProducts.slice(0, 5)
        
        console.log('Found products for VFT:', vft.tag_name, 'Count:', topProducts.length)
        console.log('Top products:', JSON.stringify(topProducts, null, 2))
        
        if (topProducts.length > 0) {
          console.log('Calling onProductDetected with:', vft.tag_name, topProducts)
          // Store found products for display in scanner
          setFoundProducts(topProducts)
          setDetectedVFTName(vft.tag_name)
          console.log('✅ Found products set in state:', topProducts.length, 'products')
          // Also call the callback for POS integration
          onProductDetected?.(vft.tag_name, topProducts)
          toast.success(`Found ${topProducts.length} products for "${vft.tag_name}"`)
        } else {
          // No products found for this VFT, silently ignore
          console.log('No products found for VFT:', vft.tag_name, '- ignoring detection')
          toast.info(`No products registered for "${vft.tag_name}" yet.`)
        }
      } else {
        // No matching VFT found, silently ignore
        console.log('No matching VFT found for:', bestDetection.label, '- ignoring detection')
        toast.info(`"${bestDetection.label}" is not registered in your inventory.`)
      }
    } catch (error) {
      console.error('Error processing detected objects:', error)
      
      // Provide more specific error messages
      if (error.message?.includes('Load failed') || error.message?.includes('network')) {
        toast.error('Network connection lost. Please check your internet and try again.')
      } else if (error.message?.includes('access control')) {
        toast.error('Access denied. Please refresh the page and try again.')
      } else {
        toast.error('Failed to process detection results. Please try again.')
      }
    }
  }

  const selectVFT = async (vftName: string) => {
    try {
      // Get products for this VFT
      const products = await pvfsService.getProductsByVFT(vftName)
      
      if (products.length > 0) {
        onProductDetected?.(vftName, products)
        toast.success(`Found ${products.length} products for "${vftName}"`)
      } else {
        toast.info(`No products found for "${vftName}". You may need to register this product first.`)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    }
  }

  const clearAll = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setDetectedObjects([])
    setFoundProducts([])
    setDetectedVFTName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Instructions Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">otic Vision Scanner</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-sm"
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
            <strong>How to use:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Click "Use Camera" to open your device camera</li>
              <li>Point camera at the product you want to scan</li>
              <li>Tap "Capture & Analyze" when ready</li>
              <li>Our AI will automatically find matching products from your inventory</li>
              <li>Choose from the suggested products or register new ones</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {/* Camera Section */}
      <Card>
        <CardContent className="p-4">
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
                  className="w-full max-w-sm mx-auto rounded-lg"
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
                  onClick={switchCamera}
                  variant="outline"
                  size="sm"
                  className="px-2"
                >
                  <Camera className="h-4 w-4" />
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
              className="w-full max-w-md mx-auto rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Found Products */}
      {foundProducts.length > 0 && (
        <Card className="border-2 border-[#faa51a] bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-[#040458]">
              <Target className="h-5 w-5 mr-2 text-[#faa51a]" />
              Found Products ({detectedVFTName})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {foundProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-base">
                      {product.brand_name} {product.product_name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Price: UGX {product.price?.toLocaleString() || '0'} | Stock: {product.stock_quantity || '0'}
                    </div>
                    {product.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {product.description}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                      {product.barcode || 'No Barcode'}
                    </Badge>
                    <Button
                      size="sm"
                      className="bg-[#040458] hover:bg-[#040458]/90 text-white text-xs h-8 px-3"
                      onClick={() => {
                        console.log('Adding product to cart:', product)
                        // This will trigger the onProductDetected callback
                        onProductDetected?.(detectedVFTName, [product])
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Click "Add to Cart" to add products to your POS transaction
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#faa51a]"></div>
          <span className="ml-2 text-sm text-gray-600">Analyzing image...</span>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-2">
        Powered by otic Vision
      </div>

      {/* Close Button */}
      {showCloseButton && onClose && (
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            Close Scanner
          </Button>
        </div>
      )}
    </div>
  )
}

export default OTICVisionScanner
