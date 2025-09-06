import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Target,
  BarChart3
} from 'lucide-react'

interface AIInsightsProps {
  tier: 'free_trial' | 'basic' | 'standard' | 'premium'
  salesData: any
  inventoryData: any
}

export const AIInsights = ({ tier, salesData, inventoryData }: AIInsightsProps) => {
  // Simulate AI insights based on tier
  const getInsights = () => {
    const insights = []
    
    // Basic insights for all tiers
    insights.push({
      type: 'forecast',
      title: 'Sales Forecast',
      description: 'AI predicts 15% increase in sales next week',
      confidence: 85,
      icon: TrendingUp,
      color: 'text-green-600'
    })
    
    insights.push({
      type: 'alert',
      title: 'Low Stock Alert',
      description: '3 products need restocking within 2 days',
      confidence: 95,
      icon: AlertTriangle,
      color: 'text-red-600'
    })
    
    // Standard tier insights
    if (tier === 'standard' || tier === 'premium') {
      insights.push({
        type: 'recommendation',
        title: 'Pricing Optimization',
        description: 'Increase price of top-selling items by 8%',
        confidence: 78,
        icon: Target,
        color: 'text-blue-600'
      })
      
      insights.push({
        type: 'trend',
        title: 'Customer Behavior',
        description: 'Peak sales time: 2-4 PM on weekdays',
        confidence: 82,
        icon: BarChart3,
        color: 'text-purple-600'
      })
    }
    
    // Premium tier insights
    if (tier === 'premium') {
      insights.push({
        type: 'anomaly',
        title: 'Fraud Detection',
        description: 'Unusual transaction pattern detected',
        confidence: 92,
        icon: AlertTriangle,
        color: 'text-orange-600'
      })
      
      insights.push({
        type: 'optimization',
        title: 'Inventory Optimization',
        description: 'Reorder 12 items to maximize profit',
        confidence: 88,
        icon: Lightbulb,
        color: 'text-indigo-600'
      })
    }
    
    return insights
  }

  const insights = getInsights()

  if (tier === 'free_trial') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Upgrade to Standard or Premium for AI-powered business insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Unlock AI-driven forecasting, anomaly detection, and business optimization
            </p>
            <Badge variant="outline" className="text-sm">
              Available in Standard & Premium
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Powered by machine learning and business intelligence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <Icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {insight.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
