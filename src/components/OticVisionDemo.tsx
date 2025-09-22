/**
 * 🚀 OTIC VISION DEMO COMPONENT
 * Demonstrates the complete OTIC Vision workflow
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Camera, 
  Brain, 
  Package, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Sparkles,
  Eye,
  Zap
} from 'lucide-react'
import { useOticVision } from '@/hooks/useOticVision'
import { toast } from 'sonner'

const OticVisionDemo: React.FC = () => {
  const { camera, recognition, registration, captureAndRecognize, captureAndRegister } = useOticVision()
  const [showRegistration, setShowRegistration] = useState(false)
  const [productData, setProductData] = useState({
    name: '',
    manufacturer: '',
    category: '',
    retailPrice: 0
  })

  const handleRegisterProduct = async () => {
    if (!productData.name || !productData.retailPrice) {
      toast.error('Please fill in product name and price')
      return
    }

    await captureAndRegister(productData)
    if (registration.success) {
      setShowRegistration(false)
      setProductData({ name: '', manufacturer: '', category: '', retailPrice: 0 })
    }
  }

  const handleConfirmMatch = async (confirmed: boolean) => {
    if (recognition.result?.bestMatch) {
      await recognition.confirmMatch(recognition.result.bestMatch, confirmed)
      recognition.clearResult()
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-full">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#040458]">OTIC Vision Demo</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience revolutionary RGB-based product recognition. Point your camera at any product 
          and watch the AI identify it instantly!
        </p>
      </div>

      {/* Camera Section */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-[#040458]">
            <Camera className="h-6 w-6" />
            <span>Live Camera Recognition</span>
          </CardTitle>
          <CardDescription>
            Activate your camera and scan any product for instant recognition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera Controls */}
          <div className="flex justify-center space-x-4">
            {!camera.isActive ? (
              <Button 
                onClick={camera.startCamera}
                disabled={!camera.isSupported}
                className="bg-[#040458] hover:bg-[#040458]/90 text-white px-8 py-3"
              >
                <Camera className="h-5 w-5 mr-2" />
                Start Camera
              </Button>
            ) : (
              <>
                <Button 
                  onClick={camera.stopCamera}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Stop Camera
                </Button>
                <Button 
                  onClick={captureAndRecognize}
                  disabled={recognition.isAnalyzing}
                  className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white px-8 py-3"
                >
                  {recognition.isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Scan Product
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Camera Error */}
          {camera.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{camera.error}</p>
            </div>
          )}

          {/* Camera Preview */}
          {camera.isActive && (
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <video
                ref={camera.videoRef}
                className="w-full h-64 object-cover"
                playsInline
                muted
                autoPlay
              />
              
              {/* Scanning Overlay */}
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

          {/* Recognition Results */}
          {recognition.result && (
            <Card className={`border-2 ${recognition.result.wasSuccessful ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <CardContent className="p-6">
                {recognition.result.wasSuccessful && recognition.result.bestMatch ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h3 className="text-xl font-semibold text-green-800">Product Recognized!</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{recognition.result.bestMatch.productName}</h4>
                        {recognition.result.bestMatch.manufacturer && (
                          <p className="text-sm text-gray-600">by {recognition.result.bestMatch.manufacturer}</p>
                        )}
                        <p className="text-lg font-bold text-[#040458]">
                          UGX {recognition.result.bestMatch.retailPrice.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Confidence:</span>
                          <Badge className="bg-green-100 text-green-800">
                            {(recognition.result.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Processing Time:</span>
                          <span className="text-sm font-medium">{recognition.result.processingTimeMs}ms</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => handleConfirmMatch(true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Match
                      </Button>
                      <Button 
                        onClick={() => handleConfirmMatch(false)}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Match
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <XCircle className="h-6 w-6 text-yellow-600" />
                      <h3 className="text-xl font-semibold text-yellow-800">No Match Found</h3>
                    </div>
                    <p className="text-gray-600">
                      This product isn't in your Personalized Visual Bank yet. 
                      Would you like to register it?
                    </p>
                    <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#040458] hover:bg-[#040458]/90 text-white">
                          <Package className="h-4 w-4 mr-2" />
                          Register Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Register New Product</DialogTitle>
                          <DialogDescription>
                            Add this product to your Personalized Visual Bank
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                              id="name"
                              value={productData.name}
                              onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter product name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="manufacturer">Manufacturer</Label>
                            <Input
                              id="manufacturer"
                              value={productData.manufacturer}
                              onChange={(e) => setProductData(prev => ({ ...prev, manufacturer: e.target.value }))}
                              placeholder="Enter manufacturer"
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Input
                              id="category"
                              value={productData.category}
                              onChange={(e) => setProductData(prev => ({ ...prev, category: e.target.value }))}
                              placeholder="Enter category"
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Retail Price (UGX)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={productData.retailPrice}
                              onChange={(e) => setProductData(prev => ({ ...prev, retailPrice: parseFloat(e.target.value) || 0 }))}
                              placeholder="Enter price"
                            />
                          </div>
                          <div className="flex justify-end space-x-3">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowRegistration(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleRegisterProduct}
                              disabled={registration.isRegistering}
                              className="bg-[#040458] hover:bg-[#040458]/90 text-white"
                            >
                              {registration.isRegistering ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Registering...
                                </>
                              ) : (
                                <>
                                  <Package className="h-4 w-4 mr-2" />
                                  Register Product
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Registration Success */}
          {registration.success && registration.token && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-800">Product Registered!</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>{productData.name}</strong> has been added to your Personalized Visual Bank.
                  </p>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Visual Token:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {registration.token.token.substring(0, 16)}...
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {(registration.token.confidence * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#040458] mb-2">RGB Analysis</h3>
            <p className="text-gray-600 text-sm">
              Advanced color analysis using K-means clustering and spatial distribution
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#040458] mb-2">Instant Recognition</h3>
            <p className="text-gray-600 text-sm">
              Sub-second product identification with high accuracy and confidence scoring
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#040458] mb-2">Smart Learning</h3>
            <p className="text-gray-600 text-sm">
              Personalized Visual Bank learns and improves with each recognition
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technical Details */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-[#040458]">
            <Brain className="h-6 w-6" />
            <span>How It Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Registration Process</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Capture product image with camera</li>
                <li>Extract dominant colors using K-means clustering</li>
                <li>Analyze spatial distribution of colors</li>
                <li>Calculate lighting profile and color temperature</li>
                <li>Generate unique visual token</li>
                <li>Store in Personalized Visual Bank</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Recognition Process</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Capture live image from camera</li>
                <li>Generate visual token from image</li>
                <li>Compare with stored tokens in PVB</li>
                <li>Calculate similarity scores</li>
                <li>Return best match with confidence</li>
                <li>Log recognition attempt for analytics</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OticVisionDemo



