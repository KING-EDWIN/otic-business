import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, X, Loader2, AlertCircle, CheckCircle, Package, Zap } from 'lucide-react'
import { toast } from 'sonner'
import modernProductDetectionService from '@/services/modernProductDetectionService'

interface ModernCameraScannerProps {
  onClose?: () => void
  onProductDetected?: (product: any) => void
}

interface DetectionResult {
  id: string
  label: string
  confidence: number
  brandName?: string
  isRegistered: boolean
  timestamp: number
}

const ModernCameraScanner: React.FC<ModernCameraScannerProps> = ({ onClose, onProductDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // State management
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [detections, setDetections] = useState<DetectionResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'active' | 'error'>('idle')
  const [captureCount, setCaptureCount] = useState(0)
  const [lastCaptureTime, setLastCaptureTime] = useState<number>(0)

  // Configuration
  const CAPTURE_INTERVAL = 2000 // 2 seconds between captures
  const MAX_DETECTIONS = 5 // Keep last 5 detections
  const MIN_CONFIDENCE = 0.3 // Minimum confidence threshold
  const MAX_CAPTURES_WITHOUT_RESULT = 5 // Show "not registered" after 5 failed attempts

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Handle video stream
  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(console.error)
    }
  }, [streamRef.current])

  // Capture photo from video stream
  const capturePhoto = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (canvas.width === 0 || canvas.height === 0) return null

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8)
    })
  }, [])

  // Process image using the modern detection service
  const processImageWithService = async (imageBlob: Blob) => {
    try {
      const result = await modernProductDetectionService.processDetection(imageBlob)
      return result
    } catch (error) {
      console.error('Detection service error:', error)
      throw error
    }
  }

  // Process captured image
  const processImage = useCallback(async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setCaptureCount(prev => prev + 1)
    setLastCaptureTime(Date.now())

    try {
      const imageBlob = await capturePhoto()
      if (!imageBlob) {
        console.warn('Failed to capture image')
        return
      }

      // Use the modern detection service
      const result = await processImageWithService(imageBlob)
      
      if (result.detections.length === 0) {
        console.log('No objects detected in image')
        return
      }

      // Process registered products
      const newDetections: DetectionResult[] = []
      
      // Add registered products
      for (const product of result.registeredProducts) {
        const detection = result.detections.find(d => 
          d.label.toLowerCase().includes(product.productName.toLowerCase()) ||
          product.productName.toLowerCase().includes(d.label.toLowerCase())
        )
        
        if (detection) {
          const result: DetectionResult = {
            id: product.id,
            label: detection.label,
            confidence: detection.confidence,
            brandName: product.brandName,
            isRegistered: true,
            timestamp: Date.now()
          }
          newDetections.push(result)
        }
      }

      // Add unregistered products
      for (const label of result.unregisteredProducts) {
        const detection = result.detections.find(d => d.label === label)
        if (detection) {
          const result: DetectionResult = {
            id: `unregistered_${Date.now()}_${Math.random()}`,
            label: detection.label,
            confidence: detection.confidence,
            brandName: undefined,
            isRegistered: false,
            timestamp: Date.now()
          }
          newDetections.push(result)
        }
      }

      // Update detections state
      setDetections(prev => {
        const combined = [...newDetections, ...prev]
        return combined.slice(0, MAX_DETECTIONS)
      })

      // Show toast for new detections
      const registeredProducts = newDetections.filter(d => d.isRegistered)
      const unregisteredProducts = newDetections.filter(d => !d.isRegistered)

      if (registeredProducts.length > 0) {
        toast.success(`Found ${registeredProducts.length} registered product(s)!`)
      }

      if (unregisteredProducts.length > 0 && captureCount >= MAX_CAPTURES_WITHOUT_RESULT) {
        toast.info('Some items are not registered in the system')
      }

    } catch (error) {
      console.error('Error processing image:', error)
      setError('Failed to analyze image')
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, capturePhoto, captureCount, processImageWithService])

  // Start camera
  const startCamera = async () => {
    try {
      setCameraStatus('starting')
      setError(null)

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error)
        }
        videoRef.current.onplay = () => {
          setIsActive(true)
          setCameraStatus('active')
          toast.success('Camera started!')
          
          // Start automatic capture
          captureIntervalRef.current = setInterval(processImage, CAPTURE_INTERVAL)
        }
      }

    } catch (error: any) {
      console.error('Camera error:', error)
      setCameraStatus('error')
      
      let errorMessage = 'Camera access failed'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found'
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }

    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
      processingTimeoutRef.current = null
    }

    setIsActive(false)
    setCameraStatus('idle')
    setDetections([])
    setCaptureCount(0)
    setError(null)
  }

  // Handle product selection
  const handleProductSelect = (detection: DetectionResult) => {
    if (detection.isRegistered && onProductDetected) {
      // Get the actual product data from the service
      const productData = modernProductDetectionService.getCacheStats()
      console.log('Cache stats:', productData)
      
      onProductDetected({
        id: detection.id,
        name: detection.brandName || detection.label,
        price: 2500, // Default price, will be updated from database
        confidence: detection.confidence,
        brandName: detection.brandName
      })
      toast.success(`Added ${detection.brandName} to cart!`)
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-lg flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#040458]">OTIC Vision Scanner</h2>
              <p className="text-sm text-gray-600">AI-powered product detection</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isActive && (
              <Badge className="bg-green-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                LIVE
              </Badge>
            )}
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="flex-1 bg-black relative overflow-hidden">
        {isActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Overlay UI */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning frame */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#faa51a] rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#faa51a] rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#faa51a] rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#faa51a] rounded-br-lg"></div>
                </div>
              </div>

              {/* Processing indicator */}
              {isProcessing && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#faa51a]" />
                        <span className="text-sm font-medium text-gray-900">Analyzing...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Capture counter */}
              <div className="absolute bottom-4 left-4">
                <Card className="bg-black/50 backdrop-blur-sm border-0">
                  <CardContent className="p-2">
                    <div className="text-white text-xs">
                      Captures: {captureCount}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white p-8">
              <Camera className="h-20 w-20 mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-bold mb-4">Ready to Scan</h3>
              <p className="text-lg opacity-75 mb-8 max-w-md">
                Point your camera at products to automatically detect and identify them
              </p>
              <Button
                onClick={startCamera}
                disabled={cameraStatus === 'starting'}
                className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {cameraStatus === 'starting' ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                    Starting Camera...
                  </>
                ) : (
                  <>
                    <Camera className="h-6 w-6 mr-3" />
                    Start Scanning
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detection Results */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200/50 max-h-80 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-[#faa51a]" />
              Detected Products
            </h3>
            {detections.length > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {detections.length} found
              </Badge>
            )}
          </div>

          {detections.length > 0 ? (
            <div className="space-y-3">
              {detections.map((detection) => (
                <Card 
                  key={detection.id} 
                  className={`border-2 transition-all duration-200 hover:shadow-md ${
                    detection.isRegistered 
                      ? 'border-green-200 bg-green-50 hover:border-green-300' 
                      : 'border-orange-200 bg-orange-50 hover:border-orange-300'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {detection.isRegistered ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                          )}
                          <h4 className="font-semibold text-gray-900">
                            {detection.brandName || detection.label}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              detection.isRegistered 
                                ? 'bg-green-100 text-green-800 border-green-300' 
                                : 'bg-orange-100 text-orange-800 border-orange-300'
                            }`}
                          >
                            {Math.round(detection.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {detection.isRegistered 
                            ? `Registered product from ${detection.brandName}` 
                            : 'Not registered in system'
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          Detected: {new Date(detection.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="ml-4">
                        {detection.isRegistered ? (
                          <Button
                            onClick={() => handleProductSelect(detection)}
                            className="bg-[#040458] hover:bg-[#040458]/90 text-white h-10 px-4"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            disabled
                            className="h-10 px-4 text-gray-400"
                          >
                            Not Available
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No products detected yet</p>
              <p className="text-sm">
                {isActive 
                  ? 'Point camera at products to start detection' 
                  : 'Start camera to begin scanning'
                }
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Card className="mt-4 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Camera Error</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Camera Controls */}
          <div className="mt-6 flex space-x-3">
            {!isActive ? (
              <Button
                onClick={startCamera}
                disabled={cameraStatus === 'starting'}
                className="flex-1 bg-[#faa51a] hover:bg-[#faa51a]/90 text-white h-12 font-semibold"
              >
                {cameraStatus === 'starting' ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5 mr-2" />
                    Start Camera
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={stopCamera}
                variant="destructive"
                className="flex-1 bg-red-500 hover:bg-red-600 h-12 font-semibold"
              >
                <X className="h-5 w-5 mr-2" />
                Stop Camera
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={1280}
        height={720}
      />
    </div>
  )
}

export default ModernCameraScanner
