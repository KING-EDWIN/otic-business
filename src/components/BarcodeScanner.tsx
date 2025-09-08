import React, { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, X, RotateCcw, Flashlight, FlashlightOff } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
  isOpen: boolean
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [flashlightOn, setFlashlightOn] = useState(false)

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

      // Initialize the barcode reader
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

      // Configure the reader for better barcode detection
      const hints = new Map()
      hints.set(1, []) // Enable all barcode formats
      hints.set(2, []) // Enable all character sets

      await readerRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcode = result.getText()
            console.log('Barcode scanned:', barcode)
            console.log('Barcode format:', result.getBarcodeFormat())
            onScan(barcode)
            stopScanning()
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('Scanning error:', error)
            // Don't show error for NotFoundException as it's normal during scanning
          }
        },
        hints
      )
    } catch (err) {
      console.error('Error starting scanner:', err)
      setError('Failed to start camera')
    }
  }

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset()
    }
    setIsScanning(false)
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

  const toggleFlashlight = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const track = stream.getVideoTracks()[0]
      
      if (track && track.getCapabilities) {
        const capabilities = track.getCapabilities()
        if (capabilities.torch) {
          track.applyConstraints({ advanced: [{ torch: !flashlightOn }] })
          setFlashlightOn(!flashlightOn)
        }
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Barcode Scanner
              </CardTitle>
              <CardDescription>
                Position the barcode within the camera view to scan
              </CardDescription>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <Camera className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Camera Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={initializeScanner} className="bg-blue-600 hover:bg-blue-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera Selection */}
              {devices.length > 1 && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Camera:</label>
                  <select
                    value={selectedDevice}
                    onChange={(e) => {
                      setSelectedDevice(e.target.value)
                      stopScanning()
                      startScanning(e.target.value)
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    {devices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Video Feed */}
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-80 bg-black rounded-lg object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-40 border-2 border-[#faa51a] rounded-lg flex items-center justify-center relative">
                    {/* Corner indicators */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#faa51a] rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#faa51a] rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#faa51a] rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#faa51a] rounded-br-lg"></div>
                    
                    {/* Scanning line */}
                    <div className="w-full h-0.5 bg-[#faa51a] animate-pulse"></div>
                  </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  {devices.length > 1 && (
                    <Button
                      onClick={switchCamera}
                      size="sm"
                      variant="secondary"
                      className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={toggleFlashlight}
                    size="sm"
                    variant="secondary"
                    className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                  >
                    {flashlightOn ? <FlashlightOff className="h-4 w-4" /> : <Flashlight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center text-sm text-gray-600">
                <p className="font-medium">Point your camera at a barcode to scan</p>
                <p className="text-xs mt-1">Make sure the barcode is well-lit and clearly visible</p>
                <p className="text-xs mt-1 text-[#faa51a]">Supports: UPC, EAN, Code 128, QR Code, and more</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BarcodeScanner
