import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, X, RotateCcw, Flashlight, FlashlightOff, AlertCircle } from 'lucide-react'
import Quagga from 'quagga'

interface QuaggaBarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
  isOpen: boolean
}

const QuaggaBarcodeScanner: React.FC<QuaggaBarcodeScannerProps> = ({ onScan, onClose, isOpen }) => {
  const scannerRef = useRef<HTMLDivElement>(null)
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

      // Get available video devices
      const videoDevices = await navigator.mediaDevices.enumerateDevices()
      const cameras = videoDevices.filter(device => device.kind === 'videoinput')
      setDevices(cameras)
      
      if (cameras.length > 0) {
        setSelectedDevice(cameras[0].deviceId)
        startScanning(cameras[0].deviceId)
      } else {
        setError('No camera devices found')
      }
    } catch (err) {
      console.error('Error initializing scanner:', err)
      setError('Failed to initialize camera. Please check permissions.')
    }
  }

  const startScanning = (deviceId: string) => {
    if (!scannerRef.current) return

    try {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: 640,
            height: 480,
            deviceId: deviceId
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ]
        },
        locate: true
      }, (err) => {
        if (err) {
          console.error('Quagga initialization error:', err)
          setError('Failed to start camera')
          return
        }
        console.log("Quagga initialization finished. Ready to start")
        Quagga.start()
        setIsScanning(true)
      })

      // Listen for successful scans
      Quagga.onDetected((result) => {
        const code = result.codeResult.code
        console.log('Barcode detected:', code)
        onScan(code)
        stopScanning()
      })

      // Listen for errors
      Quagga.onProcessed((result) => {
        if (result) {
          const drawingCtx = Quagga.canvas.ctx.overlay
          const drawingCanvas = Quagga.canvas.dom.overlay

          if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 2})
          } else {
            drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')), parseInt(drawingCanvas.getAttribute('height')))
          }
        }
      })

    } catch (err) {
      console.error('Error starting scanner:', err)
      setError('Failed to start camera')
    }
  }

  const stopScanning = () => {
    try {
      Quagga.stop()
      setIsScanning(false)
    } catch (err) {
      console.error('Error stopping scanner:', err)
    }
  }

  const switchCamera = async () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(device => device.deviceId === selectedDevice)
      const nextIndex = (currentIndex + 1) % devices.length
      const nextDevice = devices[nextIndex]
      
      setSelectedDevice(nextDevice.deviceId)
      stopScanning()
      setTimeout(() => startScanning(nextDevice.deviceId), 100)
    }
  }

  const toggleFlashlight = () => {
    // Flashlight toggle would need to be implemented with specific camera constraints
    setFlashlightOn(!flashlightOn)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4">
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
                <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Camera Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={initializeScanner} className="bg-[#040458] hover:bg-[#040458]/90">
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
                      setTimeout(() => startScanning(e.target.value), 100)
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

              {/* Scanner Container */}
              <div className="relative">
                <div 
                  ref={scannerRef}
                  className="w-full h-96 bg-black rounded-lg overflow-hidden"
                  style={{ minHeight: '400px' }}
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-32 border-2 border-[#faa51a] rounded-lg flex items-center justify-center relative">
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
                <p className="text-xs mt-1 text-[#faa51a]">Supports: UPC, EAN, Code 128, Code 39, Codabar, and more</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default QuaggaBarcodeScanner
