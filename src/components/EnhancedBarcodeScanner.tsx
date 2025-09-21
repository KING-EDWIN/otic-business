import React, { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader, Result, BarcodeFormat } from '@zxing/library'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, X, RotateCcw, Flashlight, FlashlightOff, Volume2, VolumeX } from 'lucide-react'

interface EnhancedBarcodeScannerProps {
  onScan: (barcode: string, format: string) => void
  onClose: () => void
  isOpen: boolean
  enableSound?: boolean
  enableVibration?: boolean
}

const EnhancedBarcodeScanner: React.FC<EnhancedBarcodeScannerProps> = ({ 
  onScan, 
  onClose, 
  isOpen, 
  enableSound = true,
  enableVibration = true 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(enableSound)
  const [vibrationEnabled, setVibrationEnabled] = useState(enableVibration)
  const [lastScanTime, setLastScanTime] = useState<number>(0)
  const [scanCount, setScanCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Audio context for beep sound
  const audioContextRef = useRef<AudioContext | null>(null)
  const beepBufferRef = useRef<AudioBuffer | null>(null)

  // Initialize audio context and beep sound
  useEffect(() => {
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        createBeepSound()
      } catch (err) {
        console.warn('Audio context not supported:', err)
      }
    }
  }, [soundEnabled])

  const createBeepSound = async () => {
    if (!audioContextRef.current) return

    try {
      const sampleRate = audioContextRef.current.sampleRate
      const duration = 0.1 // 100ms beep
      const frequency = 800 // 800Hz beep
      const length = sampleRate * duration
      const buffer = audioContextRef.current.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < length; i++) {
        data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3
      }

      beepBufferRef.current = buffer
    } catch (err) {
      console.warn('Could not create beep sound:', err)
    }
  }

  const playBeepSound = () => {
    if (!soundEnabled || !audioContextRef.current || !beepBufferRef.current) return

    try {
      const source = audioContextRef.current.createBufferSource()
      source.buffer = beepBufferRef.current
      source.connect(audioContextRef.current.destination)
      source.start()
    } catch (err) {
      console.warn('Could not play beep sound:', err)
    }
  }

  const vibrateDevice = () => {
    if (!vibrationEnabled || !navigator.vibrate) return

    try {
      navigator.vibrate([100, 50, 100]) // Vibrate pattern
    } catch (err) {
      console.warn('Vibration not supported:', err)
    }
  }

  useEffect(() => {
    if (isOpen) {
      initializeScanner()
    } else {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [isOpen])

  const initializeScanner = async () => {
    try {
      setError(null)
      setIsScanning(true)
      setIsProcessing(false)

      // Initialize the barcode reader with enhanced configuration
      readerRef.current = new BrowserMultiFormatReader()

      // Get available video devices
      const videoDevices = await readerRef.current.listVideoInputDevices()
      setDevices(videoDevices)
      
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId)
        startScanning(videoDevices[0].deviceId)
      } else {
        setError('No camera devices found')
      }
    } catch (err) {
      console.error('Error initializing scanner:', err)
      setError('Failed to initialize camera. Please check permissions.')
    }
  }

  const startScanning = async (deviceId: string) => {
    try {
      if (!readerRef.current || !videoRef.current) return

      setIsProcessing(true)

      // Enhanced configuration for better barcode detection
      const hints = new Map()
      hints.set('SKIP_ZERO_LENGTH', false)
      hints.set('TRY_HARDER', true)

      await readerRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result: Result | null, error: any) => {
          if (result && !isProcessing) {
            const rawBarcode = result.getText()
            const format = result.getBarcodeFormat().toString()
            const currentTime = Date.now()

            // Prevent duplicate scans within 2 seconds
            if (currentTime - lastScanTime < 2000) {
              return
            }

            // Clean and validate barcode
            const cleanBarcode = rawBarcode.trim().replace(/[^0-9A-Za-z]/g, '')
            
            // Validate barcode length (most barcodes are 8-13 digits)
            if (cleanBarcode.length < 4 || cleanBarcode.length > 20) {
              console.warn('Invalid barcode length:', cleanBarcode.length)
              return
            }

            console.log('Raw barcode:', rawBarcode)
            console.log('Cleaned barcode:', cleanBarcode)
            console.log('Barcode format:', format)
            console.log('Barcode length:', cleanBarcode.length)
            console.log('Scan count:', scanCount + 1)

            setLastScanTime(currentTime)
            setScanCount(prev => prev + 1)
            setIsProcessing(true)

            // Play sound and vibrate
            playBeepSound()
            vibrateDevice()

            // Call the onScan callback with cleaned barcode
            onScan(cleanBarcode, format)

            // Stop scanning after successful scan
            stopScanning()
          }
          
          if (error && error.name !== 'NotFoundException' && !error.message?.includes('No MultiFormat Readers')) {
            console.error('Scanning error:', error)
            // Don't show error for NotFoundException as it's normal during scanning
          }
          // Don't log NotFoundException errors as they're normal during scanning
        }
      )

      setIsProcessing(false)
    } catch (err) {
      console.error('Error starting scanner:', err)
      setError('Failed to start camera')
      setIsProcessing(false)
    }
  }

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset()
    }
    setIsScanning(false)
    setIsProcessing(false)
  }

  const switchCamera = async () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(device => device.deviceId === selectedDevice)
      const nextIndex = (currentIndex + 1) % devices.length
      const nextDevice = devices[nextIndex]
      
      setSelectedDevice(nextDevice.deviceId)
      stopScanning()
      await startScanning(nextDevice.deviceId)
    }
  }

  const toggleFlashlight = async () => {
    if (!videoRef.current) return

    try {
      const stream = videoRef.current.srcObject as MediaStream
      if (stream) {
        const track = stream.getVideoTracks()[0]
        if (track && (track.getCapabilities() as any).torch) {
          await track.applyConstraints({
            advanced: [{ torch: !flashlightOn } as any]
          })
          setFlashlightOn(!flashlightOn)
        }
      }
    } catch (err) {
      console.warn('Flashlight not supported:', err)
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  const toggleVibration = () => {
    setVibrationEnabled(!vibrationEnabled)
  }

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">Barcode Scanner</CardTitle>
            <CardDescription>
              Point your camera at a barcode to scan
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Scanner Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant={isScanning ? "default" : "secondary"}>
                {isScanning ? "Scanning" : "Stopped"}
              </Badge>
              {scanCount > 0 && (
                <Badge variant="outline">
                  {scanCount} scan{scanCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            {isProcessing && (
              <Badge variant="destructive">
                Processing...
              </Badge>
            )}
          </div>

          {/* Video Element */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              playsInline
              muted
            />
            
            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-32 border-2 border-[#040458] rounded-lg animate-pulse">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#040458] rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#040458] rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#040458] rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#040458] rounded-br-lg"></div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Camera Switch */}
            {devices.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={switchCamera}
                disabled={!isScanning}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Switch Camera
              </Button>
            )}

            {/* Flashlight Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFlashlight}
              disabled={!isScanning}
            >
              {flashlightOn ? (
                <FlashlightOff className="h-4 w-4 mr-1" />
              ) : (
                <Flashlight className="h-4 w-4 mr-1" />
              )}
              {flashlightOn ? 'Flash Off' : 'Flash On'}
            </Button>

            {/* Sound Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 mr-1" />
              ) : (
                <VolumeX className="h-4 w-4 mr-1" />
              )}
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </Button>

            {/* Vibration Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVibration}
            >
              {vibrationEnabled ? 'Vibrate On' : 'Vibrate Off'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Ensure good lighting for better scanning</p>
            <p>• Hold the barcode steady in the frame</p>
            <p>• The scanner will automatically detect the barcode</p>
            <p>• Use flashlight in low light conditions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedBarcodeScanner


