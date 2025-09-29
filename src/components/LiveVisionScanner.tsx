import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Camera,
  X,
  Eye,
  EyeOff,
  Target,
  Zap,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { visionApiManager } from '@/services/visionApiManager'
import { pvfsService } from '@/services/pvfsService'
import { DetectedObject } from '@/services/huggingFaceVisionService'

interface LiveVisionScannerProps {
  onProductDetected?: (vftName: string, products: any[]) => void
  onClose?: () => void
}

interface DetectedItem {
  id: string
  label: string
  confidence: number
  timestamp: number
  products?: any[]
  vftName?: string
}

const LiveVisionScanner: React.FC<LiveVisionScannerProps> = ({
  onProductDetected,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // State
  const [isLive, setIsLive] = useState(false)
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDetections, setShowDetections] = useState(true)
  const [lastDetectionTime, setLastDetectionTime] = useState(0)

  // Detection frequency (every 2 seconds)
  const DETECTION_INTERVAL = 2000
  const MIN_CONFIDENCE = 0.3

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLiveDetection()
    }
  }, [])

  // Start live camera feed
  const startLiveDetection = async () => {
    try {
      console.log('🎥 Starting live camera detection...')
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      })

      streamRef.current = mediaStream
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      setIsLive(true)
      setDetectedItems([])
      
      // Start continuous detection
      startContinuousDetection()
      
      toast.success('Live detection started! Point camera at products.')
    } catch (error) {
      console.error('❌ Camera error:', error)
      toast.error('Failed to access camera. Please check permissions.')
    }
  }

  // Stop live detection
  const stopLiveDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setIsLive(false)
    setIsProcessing(false)
    setDetectedItems([])
  }

  // Start continuous detection loop
  const startContinuousDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
    }

    detectionIntervalRef.current = setInterval(() => {
      if (isLive && !isProcessing) {
        captureAndAnalyze()
      }
    }, DETECTION_INTERVAL)
  }

  // Capture frame and analyze
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current video frame
    ctx.drawImage(video, 0, 0)

    // Convert to blob for analysis
    canvas.toBlob(async (blob) => {
      if (blob && isLive) {
        const file = new File([blob], 'live-frame.jpg', { type: 'image/jpeg' })
        await analyzeFrame(file)
      }
    }, 'image/jpeg', 0.7)
  }, [isLive, isProcessing])

  // Analyze captured frame
  const analyzeFrame = async (imageFile: File) => {
    setIsProcessing(true)

    try {
      const result = await visionApiManager.detectObjects(imageFile)

      if (result.success && result.objects.length > 0) {
        // Filter high-confidence detections
        const highConfidenceObjects = result.objects.filter(
          obj => obj.confidence >= MIN_CONFIDENCE
        )

        if (highConfidenceObjects.length > 0) {
          await processDetectedObjects(highConfidenceObjects)
        }
      }
    } catch (error) {
      console.error('Frame analysis error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Process detected objects
  const processDetectedObjects = async (objects: DetectedObject[]) => {
    try {
      // Get the most confident detection
      const bestDetection = objects.reduce((prev, current) => 
        (current.confidence > prev.confidence) ? current : prev
      )

      // Check if we already detected this recently (avoid duplicates)
      const now = Date.now()
      const recentDetection = detectedItems.find(
        item => item.label === bestDetection.label && 
                (now - item.timestamp) < 10000 // 10 seconds
      )

      if (recentDetection) {
        return // Skip duplicate detection
      }

      console.log('🔍 Processing live detection:', bestDetection.label)

      // Check network connectivity
      if (!navigator.onLine) {
        return
      }

      // Find matching VFTs
      const vfts = await pvfsService.getUserVFTs()
      const matchingVFTs = vfts.filter(vft => 
        vft.tag_name.toLowerCase().includes(bestDetection.label.toLowerCase()) ||
        bestDetection.label.toLowerCase().includes(vft.tag_name.toLowerCase())
      )

      if (matchingVFTs.length > 0) {
        const vft = matchingVFTs[0]
        const products = await pvfsService.getProductsByVFT(vft.tag_name)

        if (products.length > 0) {
          // Create detected item
          const detectedItem: DetectedItem = {
            id: `${vft.tag_name}-${now}`,
            label: bestDetection.label,
            confidence: bestDetection.confidence,
            timestamp: now,
            products: products.slice(0, 3), // Show top 3 products
            vftName: vft.tag_name
          }

          // Add to detected items (keep only last 10)
          setDetectedItems(prev => {
            const newItems = [detectedItem, ...prev].slice(0, 10)
            return newItems
          })

          // Call callback for POS integration
          onProductDetected?.(vft.tag_name, products)
          
          toast.success(`Found ${products.length} products for "${vft.tag_name}"`)
        }
      }
    } catch (error) {
      console.error('Error processing live detection:', error)
    }
  }

  // Handle item selection
  const handleItemSelect = (item: DetectedItem) => {
    if (item.products && item.vftName) {
      onProductDetected?.(item.vftName, item.products)
      toast.success(`Added ${item.products.length} products to cart`)
    }
  }

  // Remove detected item
  const removeDetectedItem = (itemId: string) => {
    setDetectedItems(prev => prev.filter(item => item.id !== itemId))
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Live Camera Feed */}
      {isLive && (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Live Indicator */}
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">LIVE</span>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-2">
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            </div>
          )}

          {/* Detected Items Overlay */}
          {showDetections && detectedItems.length > 0 && (
            <div className="absolute top-16 left-4 right-4 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {detectedItems.map((item) => (
                  <Card key={item.id} className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Target className="h-3 w-3 text-[#faa51a]" />
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {item.label}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(item.confidence * 100)}%
                            </Badge>
                          </div>
                          {item.products && item.products.length > 0 && (
                            <div className="text-xs text-gray-600">
                              {item.products.length} products found
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {item.products && item.products.length > 0 && (
                            <Button
                              size="sm"
                              onClick={() => handleItemSelect(item)}
                              className="h-6 px-2 bg-[#faa51a] hover:bg-[#faa51a]/90 text-white text-xs"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDetectedItem(item.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Start Screen */}
      {!isLive && (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#040458] to-[#faa51a] text-white">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <Camera className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Live Product Detection</h3>
                <p className="text-white/80 text-sm max-w-sm">
                  Point your camera at products to automatically detect and add them to your cart
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={startLiveDetection}
                className="bg-white text-[#040458] hover:bg-white/90 h-12 px-8 text-lg font-semibold"
              >
                <Zap className="h-5 w-5 mr-2" />
                Start Live Detection
              </Button>
              
              <div className="flex items-center justify-center space-x-2 text-xs text-white/70">
                <Eye className="h-3 w-3" />
                <span>Powered by AI Vision</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {isLive && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-3">
          <Button
            onClick={() => setShowDetections(!showDetections)}
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white text-gray-900"
          >
            {showDetections ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={stopLiveDetection}
            variant="destructive"
            size="sm"
            className="bg-red-500 hover:bg-red-600"
          >
            <X className="h-4 w-4 mr-1" />
            Stop
          </Button>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export default LiveVisionScanner
