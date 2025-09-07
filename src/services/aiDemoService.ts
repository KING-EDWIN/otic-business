import { AIInsight, AIPrediction } from './aiService'

// Pre-generated AI insights for demo purposes
export const getDemoAIInsights = (type: 'inventory' | 'sales' | 'financial' | 'general'): AIInsight[] => {
  const baseInsights = {
    inventory: [
      {
        id: 'demo-inventory-1',
        type: 'inventory' as const,
        title: 'Stock Level Optimization',
        description: 'Your Coca Cola 500ml is running low (2 units left). Consider restocking 50 units to maintain sales momentum. Bulk purchasing could save you 15% on costs.',
        confidence: 0.92,
        actionable: true,
        priority: 'high' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-inventory-2',
        type: 'inventory' as const,
        title: 'Fast-Moving Products',
        description: 'Bread Loaf and Milk 1L are your top sellers. Increase stock levels by 30% to avoid stockouts during peak hours (8-10 AM).',
        confidence: 0.88,
        actionable: true,
        priority: 'medium' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-inventory-3',
        type: 'inventory' as const,
        title: 'Seasonal Stock Planning',
        description: 'With rainy season approaching, consider stocking more umbrellas and raincoats. Historical data shows 40% increase in demand.',
        confidence: 0.75,
        actionable: true,
        priority: 'medium' as const,
        createdAt: new Date().toISOString()
      }
    ],
    sales: [
      {
        id: 'demo-sales-1',
        type: 'sales' as const,
        title: 'Peak Sales Hours',
        description: 'Your busiest hours are 8-10 AM and 5-7 PM. Consider extending staff hours or adding a second cashier during these times to increase revenue by 25%.',
        confidence: 0.90,
        actionable: true,
        priority: 'high' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-sales-2',
        type: 'sales' as const,
        title: 'Payment Method Optimization',
        description: 'Mobile Money transactions are 60% of your sales. Consider offering mobile money discounts to encourage more cashless payments and reduce cash handling.',
        confidence: 0.85,
        actionable: true,
        priority: 'medium' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-sales-3',
        type: 'customer' as const,
        title: 'Customer Retention Strategy',
        description: 'Implement a loyalty program for repeat customers. Offer 5% discount on every 10th purchase to increase customer retention by 30%.',
        confidence: 0.80,
        actionable: true,
        priority: 'medium' as const,
        createdAt: new Date().toISOString()
      }
    ],
    financial: [
      {
        id: 'demo-financial-1',
        type: 'financial' as const,
        title: 'Profit Margin Analysis',
        description: 'Your current profit margin is 30%, which is excellent for retail. Focus on high-margin products like electronics to increase overall profitability.',
        confidence: 0.92,
        actionable: true,
        priority: 'high' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-financial-2',
        type: 'financial' as const,
        title: 'Cost Reduction Opportunities',
        description: 'Review your electricity bills - switching to LED bulbs could save you UGX 50,000 monthly. Also consider bulk purchasing to reduce per-unit costs.',
        confidence: 0.88,
        actionable: true,
        priority: 'medium' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-financial-3',
        type: 'financial' as const,
        title: 'Cash Flow Management',
        description: 'Your cash flow is healthy. Consider setting aside 20% of daily revenue for emergency fund and business expansion opportunities.',
        confidence: 0.85,
        actionable: true,
        priority: 'low' as const,
        createdAt: new Date().toISOString()
      }
    ],
    general: [
      {
        id: 'demo-general-1',
        type: 'general' as const,
        title: 'Business Growth Potential',
        description: 'Your business shows strong growth potential. Consider opening a second location in Nakawa or expanding product range to include electronics.',
        confidence: 0.87,
        actionable: true,
        priority: 'medium' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-general-2',
        type: 'general' as const,
        title: 'Digital Transformation',
        description: 'Implement digital receipts and customer database to track buying patterns. This will help personalize offers and increase customer satisfaction.',
        confidence: 0.82,
        actionable: true,
        priority: 'medium' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-general-3',
        type: 'general' as const,
        title: 'Competitive Advantage',
        description: 'Your location advantage and product variety give you a competitive edge. Focus on customer service excellence to maintain market leadership.',
        confidence: 0.90,
        actionable: true,
        priority: 'high' as const,
        createdAt: new Date().toISOString()
      }
    ]
  }

  return baseInsights[type] || []
}

export const getDemoAIPredictions = (type: 'sales_forecast' | 'inventory_needs' | 'revenue_prediction' | 'customer_trends'): AIPrediction => {
  const basePredictions = {
    sales_forecast: {
      type: 'sales_forecast' as const,
      title: 'Sales Forecast - Next 30 Days',
      prediction: `Based on your current sales trends, I predict you'll generate approximately UGX 1,800,000 in revenue over the next 30 days. This represents a 15% growth from last month.

Key factors driving this growth:
• Increased foot traffic during rainy season
• Higher demand for essential items
• Your improved product mix

Recommendations:
• Stock up on umbrellas and rain gear
• Increase inventory of fast-moving items by 25%
• Consider promotional offers during peak hours`,
      confidence: 0.85,
      timeframe: '30 days',
      data: { historicalSales: 45, averageDaily: 41667 }
    },
    inventory_needs: {
      type: 'inventory_needs' as const,
      title: 'Inventory Restocking Predictions',
      prediction: `Your inventory analysis shows several critical restocking needs:

URGENT (Restock within 3 days):
• Coca Cola 500ml - Only 2 units left
• Bread Loaf - 3 units left
• Milk 1L - 1 unit left

MEDIUM PRIORITY (Restock within 1 week):
• Rice 5kg - 8 units left
• Cooking Oil 1L - 5 units left
• Sugar 2kg - 6 units left

RECOMMENDED QUANTITIES:
• Coca Cola: 50 units (2-week supply)
• Bread: 30 units (daily restocking)
• Milk: 20 units (1-week supply)

This will prevent stockouts and maintain customer satisfaction.`,
      confidence: 0.90,
      timeframe: '7 days',
      data: { totalProducts: 12, lowStock: 3, fastMoving: 5 }
    },
    revenue_prediction: {
      type: 'revenue_prediction' as const,
      title: 'Revenue Growth Prediction',
      prediction: `Your revenue trajectory shows strong growth potential:

CURRENT MONTH: UGX 1,250,000
NEXT MONTH PREDICTION: UGX 1,450,000 (+16% growth)
3-MONTH OUTLOOK: UGX 1,800,000 (+44% growth)

Growth drivers:
• Seasonal demand increase (rainy season)
• Improved customer retention
• Expanded product range
• Better inventory management

To achieve these targets:
• Focus on high-margin products
• Implement customer loyalty program
• Optimize peak hour operations
• Consider bulk purchasing discounts`,
      confidence: 0.88,
      timeframe: '3 months',
      data: { currentRevenue: 1250000, growthRate: 16 }
    },
    customer_trends: {
      type: 'customer_trends' as const,
      title: 'Customer Behavior Trends',
      prediction: `Your customer analysis reveals interesting patterns:

CUSTOMER SEGMENTS:
• Regular customers (60%) - Visit 3-4 times per week
• Occasional customers (30%) - Visit 1-2 times per month  
• New customers (10%) - First-time visitors

BUYING PATTERNS:
• Peak hours: 8-10 AM, 5-7 PM
• Preferred payment: Mobile Money (60%)
• Average basket size: UGX 28,000
• Most popular items: Bread, Milk, Coca Cola

RECOMMENDATIONS:
• Implement loyalty program for regular customers
• Create morning specials for peak hours
• Offer mobile money discounts
• Bundle popular items for better margins`,
      confidence: 0.82,
      timeframe: '1 month',
      data: { totalCustomers: 150, repeatRate: 60, avgBasket: 28000 }
    }
  }

  return basePredictions[type] || {
    type: 'sales_forecast' as const,
    title: 'No Prediction Available',
    prediction: 'Unable to generate prediction at this time.',
    confidence: 0,
    timeframe: 'N/A',
    data: {}
  }
}

// Check if we should use demo AI insights (for demo users or when API is not available)
export const shouldUseDemoAI = (): boolean => {
  // Check if we're in demo mode or if API key is not available
  const isDemoMode = sessionStorage.getItem('demo_mode') === 'true'
  const hasApiKey = import.meta.env.VITE_MISTRAL_API_KEY && 
                   import.meta.env.VITE_MISTRAL_API_KEY !== 'your-mistral-api-key-here'
  
  return isDemoMode || !hasApiKey
}
