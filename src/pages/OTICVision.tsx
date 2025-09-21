import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Camera,
  Target,
  Database,
  BarChart3,
  Eye,
  Zap,
  CheckCircle,
  Smartphone,
  Brain,
  ArrowRight
} from 'lucide-react'

const OTICVision: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040458] to-[#1a1a6e] p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:text-[#faa51a]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="text-white">
              <h1 className="text-3xl font-bold flex items-center">
                <Brain className="h-8 w-8 mr-3 text-[#faa51a]" />
                OTIC Vision
              </h1>
              <p className="text-gray-300 text-lg">AI-Powered Visual Product Recognition</p>
            </div>
          </div>
        </div>

        {/* How to Use Instructions */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-xl">How to Use OTIC Vision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* POS Usage */}
              <div className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center">
                  <Target className="h-5 w-5 mr-2 text-[#faa51a]" />
                  In POS System
                </h3>
                <ol className="space-y-3 text-gray-300">
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</Badge>
                    <span>Go to the POS page</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</Badge>
                    <span>Click the "OTIC Vision" button (orange button)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</Badge>
                    <span>Point your camera at the product</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</Badge>
                    <span>Tap "Capture & Analyze" when ready</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">5</Badge>
                    <span>Select the detected object name</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">6</Badge>
                    <span>Product will be added to cart automatically</span>
                  </li>
                </ol>
              </div>

              {/* Inventory Usage */}
              <div className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center">
                  <Database className="h-5 w-5 mr-2 text-[#faa51a]" />
                  In Inventory System
                </h3>
                <ol className="space-y-3 text-gray-300">
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</Badge>
                    <span>Go to the Inventory page</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</Badge>
                    <span>Click the "OTIC Vision" button (navy button)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</Badge>
                    <span>Point your camera at the product</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</Badge>
                    <span>Tap "Capture & Analyze" when ready</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">5</Badge>
                    <span>Select the detected object name</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Badge className="bg-[#faa51a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">6</Badge>
                    <span>Fill in product details and register</span>
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Camera className="h-6 w-6 mr-2 text-[#faa51a]" />
                Visual Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                AI-powered object detection that identifies products from images with high accuracy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="h-6 w-6 mr-2 text-[#faa51a]" />
                Smart Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Builds a personalized visual library that learns from your inventory patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-6 w-6 mr-2 text-[#faa51a]" />
                Instant Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Get instant product recognition and automatic cart addition in milliseconds.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate('/pos')}
                className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white"
              >
                <Target className="h-4 w-4 mr-2" />
                Go to POS
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button
                onClick={() => navigate('/inventory')}
                className="bg-[#040458] hover:bg-[#040458]/90 text-white"
              >
                <Database className="h-4 w-4 mr-2" />
                Go to Inventory
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Alert className="bg-gradient-to-r from-[#faa51a]/20 to-[#040458]/20 border-[#faa51a]/30">
          <Zap className="h-4 w-4 text-[#faa51a]" />
          <AlertDescription className="text-white">
            <strong>Pro Tips:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Ensure good lighting for better recognition accuracy</li>
              <li>Hold your device steady and position the product clearly in frame</li>
              <li>Register products in inventory first for better POS recognition</li>
              <li>The system learns from your usage patterns and improves over time</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm pt-4">
          Powered by OTIC Vision AI Technology
        </div>
      </div>
    </div>
  )
}

export default OTICVision