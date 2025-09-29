import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, X, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { visionApiManager } from '@/services/visionApiManager'

interface SimpleLiveScannerProps {
  onClose?: () => void
  onProductDetected?: (vftName: string, products: any[]) => void
  onError?: (detectedObject: string) => void
}

const SimpleLiveScanner: React.FC<SimpleLiveScannerProps> = ({ onClose, onProductDetected, onError }) => {
  console.log('🎥 SimpleLiveScanner component mounted')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<string>('Checking...')
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectionResults, setDetectionResults] = useState<any[]>([])
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')

  // Check API status on mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const statuses = await visionApiManager.getAllApiStatuses()
        const currentApi = visionApiManager.getCurrentApi()
        const currentStatus = statuses.find(s => s.name.toLowerCase().includes(currentApi))
        setApiStatus(currentStatus ? `${currentStatus.name}: ${currentStatus.status}` : 'Unknown')
      } catch (error) {
        setApiStatus('Error checking APIs')
      }
    }
    checkApiStatus()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Handle video element when stream changes (like the working components)
  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(console.error)
    }
  }, [streamRef.current])

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return null
    
    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      console.error('Failed to get 2D context from canvas')
      return null
    }
    
    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    if (canvas.width === 0 || canvas.height === 0) {
      console.warn('Canvas dimensions are zero, video might not be ready.')
      return null
    }

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to blob
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          console.error('Failed to create blob from canvas.')
          resolve(null)
        }
      }, 'image/jpeg', 0.8)
    })
  }, [])

  const processFrame = useCallback(async () => {
    if (!isLive || isProcessing) return
    
    setIsProcessing(true)
    try {
      const imageBlob = await captureFrame()
      
      if (!imageBlob) {
        console.warn('No image blob captured, skipping frame processing.')
        return
      }
      
      // Convert blob to file
      const imageFile = new File([imageBlob], 'camera-frame.jpg', { type: 'image/jpeg' })
      
      // Process with vision API
      const result = await visionApiManager.detectObjects(imageFile)
      
      if (result.success && result.objects.length > 0) {
        setDetectionResults(prev => {
          const newResults = result.objects.map(obj => ({ ...obj, detectedAt: new Date().toISOString() }))
          // Keep a limited history of detections
          return [...newResults, ...prev.slice(0, 5 - newResults.length)]
        })
        
        // Call callback for product detection
        if (onProductDetected && result.objects.length > 0) {
          onProductDetected(result.objects[0].label, result.objects)
        }
      } else if (!result.success && result.error) {
        console.warn('Vision API error:', result.error)
        if (onError) {
          onError(result.error)
        }
      }
      
    } catch (err) {
      console.error('Error processing frame:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsProcessing(false)
    }
  }, [isLive, isProcessing, captureFrame, onProductDetected, onError])

  // Auto-process frames every 3 seconds when camera is live
  useEffect(() => {
    if (!isLive) return
    
    detectionIntervalRef.current = setInterval(processFrame, 3000)
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [isLive, processFrame])

  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...')
      setError(null)
      
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser')
      }
      
      // Check HTTPS requirement
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Camera requires HTTPS or localhost')
      }
      
      // Request camera access with proper constraints
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      }
      
      console.log('Requesting camera with constraints:', constraints)
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      console.log('✅ Camera stream obtained:', mediaStream)
      console.log('Video tracks:', mediaStream.getVideoTracks().length)
      
      // Store stream reference
      streamRef.current = mediaStream
      
      // Set video source and handle events
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          videoRef.current?.play().catch(console.error)
        }
        videoRef.current.onplay = () => {
          console.log('✅ Video element playing')
          setIsLive(true)
          setCameraPermission('granted')
          toast.success('Camera started successfully!')
        }
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e)
          setError('Failed to play video stream')
        }
      }
      
    } catch (error: any) {
      console.error('❌ Camera error:', error)
      
      let errorMessage = error.message
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and try again.'
        setCameraPermission('denied')
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application or device is busy.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints cannot be satisfied. Your device might not support the requested video resolution.'
      }
      
      setError(errorMessage)
      toast.error(`Camera error: ${errorMessage}`)
      stopCamera()
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      console.log('Stopping camera stream...')
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
    
    setIsLive(false)
    setError(null)
    setDetectionResults([])
    setCameraPermission('unknown')
  }

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col rounded-lg overflow-hidden">
      {/* Camera Feed Section */}
      <div className="flex-1 bg-black rounded-t-lg overflow-hidden relative flex items-center justify-center">
        {isLive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Live Indicator */}
            <div className="absolute top-2 left-2 flex items-center space-x-2 bg-black/50 rounded px-2 py-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">LIVE</span>
            </div>

            {/* Detection Results Overlay */}
            {detectionResults.length > 0 && (
              <div className="absolute top-12 left-2 right-2">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {detectionResults[0]?.label || 'Object Detected'}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {Math.round((detectionResults[0]?.confidence || 0) * 100)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {detectionResults.length} object{detectionResults.length !== 1 ? 's' : ''} found
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Button
                          size="sm"
                          className="h-7 px-3 bg-green-500 hover:bg-green-600 text-white text-xs"
                          onClick={() => {
                            console.log('Adding detected object to cart:', detectionResults[0])
                            if (onProductDetected) {
                              onProductDetected(detectionResults[0].label, [detectionResults[0]])
                            }
                          }}
                        >
                          Add to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                          onClick={() => setDetectionResults([])}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="absolute top-12 left-2 right-2">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600">Processing frame...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-white p-4">
            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Camera Ready</h3>
            <p className="text-sm opacity-75 mb-4">Click "Start Camera" to begin detection</p>
            <Button
              onClick={startCamera}
              className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white h-12 px-8"
            >
              <Camera className="h-5 w-5 mr-2" />
              Start Camera
            </Button>
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Detection Results Section */}
      <div className="bg-white rounded-b-lg p-4 space-y-4 max-h-80 overflow-y-auto">
        {/* API Status */}
        <div className="bg-white rounded-lg p-3 border">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">AI Detection Service</span>
          </div>
          <div className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
            {apiStatus}
          </div>
        </div>

        {/* Detection Results */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">Recent Detections</span>
            {detectionResults.length > 0 && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {detectionResults.length}
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {detectionResults.length > 0 ? (
              detectionResults.slice(0, 5).map((result, index) => (
                <div key={index} className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 mb-1">{result.label}</div>
                      <div className="text-xs text-gray-600 mb-2">
                        Confidence: {Math.round(result.confidence * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(result.detectedAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="h-8 px-3 bg-green-500 hover:bg-green-600 text-white text-xs ml-2"
                      onClick={() => {
                        console.log('Adding detected object to cart:', result)
                        if (onProductDetected) {
                          onProductDetected(result.label, [result])
                        }
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {isLive ? 'Point camera at objects to detect them' : 'Start camera to begin detection'}
                </p>
                {cameraPermission === 'denied' && (
                  <p className="text-xs text-gray-400 mt-1">
                    Camera access is denied. Please check browser permissions.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Camera Controls */}
        <div className="flex flex-col space-y-2">
          {!isLive ? (
            <Button
              onClick={startCamera}
              className="w-full bg-[#faa51a] hover:bg-[#faa51a]/90 text-white h-12 text-sm font-medium"
            >
              <Camera className="h-5 w-5 mr-2" />
              Start Camera
            </Button>
          ) : (
            <Button
              onClick={stopCamera}
              variant="destructive"
              className="w-full bg-red-500 hover:bg-red-600 h-10 text-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Stop Camera
            </Button>
          )}
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="text-xs text-red-800">
                  <p className="font-medium mb-1">Camera Error</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={640}
        height={480}
      />
    </div>
  )
}

export default SimpleLiveScanner