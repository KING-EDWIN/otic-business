import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  TrendingUp, 
  Package, 
  DollarSign,
  RefreshCw,
  Calendar,
  Target,
  AlertTriangle
} from 'lucide-react'
import { AIPrediction, AIAnalytics } from '@/services/aiService'

interface AIPredictionsProps {
  type: 'sales_forecast' | 'inventory_needs' | 'revenue_prediction' | 'customer_trends'
  data: any
  onRefresh?: () => void
}

const AIPredictions: React.FC<AIPredictionsProps> = ({ type, data, onRefresh }) => {
  const [prediction, setPrediction] = useState<AIPrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generatePrediction = async () => {
    setLoading(true)
    setError('')
    
    try {
      let newPrediction: AIPrediction
      
      switch (type) {
        case 'sales_forecast':
          newPrediction = await AIAnalytics.generateSalesForecast(
            data.sales || [],
            data.timeframe || '30 days'
          )
          break
        case 'inventory_needs':
          newPrediction = await AIAnalytics.generateInventoryPredictions(
            data.products || []
          )
          break
        default:
          throw new Error('Unsupported prediction type')
      }
      
      setPrediction(newPrediction)
    } catch (err) {
      setError('Failed to generate AI prediction. Please try again.')
      console.error('AI prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      generatePrediction()
    }
  }, [type, data])

  const getPredictionIcon = (predictionType: string) => {
    switch (predictionType) {
      case 'sales_forecast':
        return <TrendingUp className="h-5 w-5" />
      case 'inventory_needs':
        return <Package className="h-5 w-5" />
      case 'revenue_prediction':
        return <DollarSign className="h-5 w-5" />
      case 'customer_trends':
        return <Target className="h-5 w-5" />
      default:
        return <Brain className="h-5 w-5" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            AI Prediction Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={generatePrediction} 
            variant="outline" 
            size="sm" 
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#faa51a]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-[#040458]">
            {getPredictionIcon(type)}
            <span className="ml-2">AI Predictions</span>
          </CardTitle>
          <Button
            onClick={generatePrediction}
            disabled={loading}
            size="sm"
            variant="outline"
            className="text-[#040458] border-[#faa51a] hover:bg-[#faa51a] hover:text-white"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          AI-powered predictions and forecasts for your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ) : !prediction ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No predictions available. Click refresh to generate AI predictions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-[#faa51a]/5 border border-[#faa51a]/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-[#040458] text-sm">{prediction.title}</h4>
                <div className="flex items-center space-x-1">
                  <Badge className="bg-[#faa51a] text-white text-xs">
                    {prediction.timeframe}
                  </Badge>
                  <span className={`text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                    {Math.round(prediction.confidence * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-line line-clamp-3">
                  {prediction.prediction}
                </p>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  Generated on {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AIPredictions
