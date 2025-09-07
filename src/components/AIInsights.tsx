import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Lightbulb,
  Target,
  BarChart3,
  Package
} from 'lucide-react'
import { AIInsight, AIAnalytics } from '@/services/aiService'

interface AIInsightsProps {
  type: 'inventory' | 'sales' | 'financial' | 'general'
  data: any
  onRefresh?: () => void
}

const AIInsights: React.FC<AIInsightsProps> = ({ type, data, onRefresh }) => {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateInsights = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('AI Insights - Generating insights for type:', type)
      console.log('AI Insights - Data received:', data)
      
      let newInsights: AIInsight[] = []
      
      switch (type) {
        case 'inventory':
          newInsights = await AIAnalytics.generateInventoryInsights(
            data.products || [], 
            data.lowStockItems || []
          )
          break
        case 'sales':
          console.log('AI Insights - Sales data:', {
            sales: data.sales || [],
            revenue: data.revenue || 0,
            growth: data.growth || 0
          })
          newInsights = await AIAnalytics.generateSalesInsights(
            data.sales || [],
            data.revenue || 0,
            data.growth || 0
          )
          break
        case 'financial':
          newInsights = await AIAnalytics.generateFinancialInsights(
            data.revenue || 0,
            data.expenses || 0,
            data.profit || 0
          )
          break
        default:
          newInsights = []
      }
      
      console.log('AI Insights - Generated insights:', newInsights)
      setInsights(newInsights)
    } catch (err) {
      setError('Failed to generate AI insights. Please try again.')
      console.error('AI insights error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      generateInsights()
    }
  }, [type, data])

  const getInsightIcon = (insightType: string) => {
    switch (insightType) {
      case 'inventory':
        return <Package className="h-4 w-4" />
      case 'sales':
        return <TrendingUp className="h-4 w-4" />
      case 'customer':
        return <Target className="h-4 w-4" />
      case 'financial':
        return <BarChart3 className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
            AI Insights Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={generateInsights} 
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
            <Brain className="h-5 w-5 mr-2 text-[#faa51a]" />
            AI Insights
          </CardTitle>
          <Button
            onClick={generateInsights}
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
          AI-powered insights and recommendations for your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No insights available. Click refresh to generate AI insights.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-3 border border-gray-200 rounded-lg hover:border-[#faa51a]/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-semibold text-[#040458] text-sm">{insight.title}</h4>
                    {insight.actionable && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                      {insight.priority}
                    </Badge>
                    <span className={`text-xs ${getConfidenceColor(insight.confidence)}`}>
                      {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AIInsights