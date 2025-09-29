import { Mistral } from '@mistralai/mistralai'
import { getDemoAIInsights, getDemoAIPredictions, shouldUseDemoAI } from './aiDemoService'

// Initialize Mistral AI client
const mistral = new Mistral({
  apiKey: import.meta.env.VITE_MISTRAL_API_KEY || 'mETgieTfZknbjowO3SXnZScl5Ijy4fZx'
})

export interface AIInsight {
  id: string
  type: 'inventory' | 'sales' | 'customer' | 'financial' | 'general'
  title: string
  description: string
  confidence: number
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

export interface AIPrediction {
  type: 'sales_forecast' | 'inventory_needs' | 'revenue_prediction' | 'customer_trends'
  title: string
  prediction: string
  confidence: number
  timeframe: string
  data: any
}

export class AIAnalytics {
  private static async callMistral(prompt: string, context?: any): Promise<string> {
    try {
      // Add timeout and retry logic
      const response = await Promise.race([
        mistral.chat.complete({
          model: 'mistral-tiny',
          messages: [
            {
              role: 'system',
              content: `You are an AI business analyst for African SMEs. Provide concise, actionable insights in English. Focus on practical recommendations for small businesses in Uganda/East Africa.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          maxTokens: 200,
          temperature: 0.7
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Mistral API timeout')), 10000))
      ]) as any

      const content = response.choices[0]?.message?.content
      return typeof content === 'string' ? content : 'Unable to generate insight'
    } catch (error) {
      console.error('Mistral AI error:', error)
      
      // Always throw error to trigger fallback insights
      throw error
    }
  }

  // Static method for chat functionality
  static async callMistralForChat(prompt: string, context?: any): Promise<string> {
    return this.callMistral(prompt, context)
  }

  // Generate inventory insights
  static async generateInventoryInsights(products: any[], lowStockItems: any[]): Promise<AIInsight[]> {
    try {
      const context = {
        totalProducts: products.length,
        lowStockCount: lowStockItems.length,
        lowStockItems: lowStockItems.map(item => ({
          name: item.name,
          currentStock: item.current_stock || 0,
          minStock: item.min_stock || 5
        }))
      }

      const prompt = `Analyze this inventory data for an African SME:
      - Total products: ${context.totalProducts}
      - Low stock items: ${context.lowStockCount}
      - Low stock details: ${JSON.stringify(context.lowStockItems)}
      
      Provide 3 actionable insights about inventory management, stock optimization, and purchasing recommendations.`

      const response = await this.callMistral(prompt, context)
      
      return [
        {
          id: 'inventory-1',
          type: 'inventory',
          title: 'Stock Level Analysis',
          description: response.split('\n')[0] || 'Review your stock levels regularly',
          confidence: 0.85,
          actionable: true,
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: 'inventory-2',
          type: 'inventory',
          title: 'Purchasing Recommendations',
          description: response.split('\n')[1] || 'Consider bulk purchasing for frequently sold items',
          confidence: 0.80,
          actionable: true,
          priority: 'medium',
          createdAt: new Date().toISOString()
        },
        {
          id: 'inventory-3',
          type: 'inventory',
          title: 'Inventory Optimization',
          description: response.split('\n')[2] || 'Implement automated reorder points',
          confidence: 0.75,
          actionable: true,
          priority: 'medium',
          createdAt: new Date().toISOString()
        }
      ]
    } catch (error) {
      console.error('Mistral AI error, using fallback insights:', error)
      // Return basic insights based on actual data
      return [
        {
          id: 'inventory-1',
          type: 'inventory',
          title: 'Stock Level Analysis',
          description: `You have ${products.length} products in inventory. ${lowStockItems.length} items are running low on stock.`,
          confidence: 0.90,
          actionable: true,
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: 'inventory-2',
          type: 'inventory',
          title: 'Restocking Priority',
          description: `Focus on restocking ${lowStockItems.map(item => item.name).join(', ')} to avoid stockouts.`,
          confidence: 0.85,
          actionable: true,
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: 'inventory-3',
          type: 'inventory',
          title: 'Inventory Management',
          description: 'Consider implementing automated reorder points for better stock control.',
          confidence: 0.80,
          actionable: true,
          priority: 'medium',
          createdAt: new Date().toISOString()
        }
      ]
    }
  }

  // Generate sales insights
  static async generateSalesInsights(sales: any[], revenue: number, growth: number): Promise<AIInsight[]> {
    try {
      const context = {
        totalSales: sales.length,
        totalRevenue: revenue,
        growthRate: growth,
        recentSales: sales.slice(-10).map(sale => ({
          date: sale.created_at,
          amount: sale.total,
          method: sale.payment_method
        }))
      }

      const prompt = `Analyze this sales data for an African SME business:
      - Total sales: ${context.totalSales} transactions
      - Total revenue: UGX ${context.totalRevenue.toLocaleString()}
      - Growth rate: ${context.growthRate}%
      - Recent sales: ${JSON.stringify(context.recentSales)}
      
      This business has ${context.totalSales} sales generating UGX ${context.totalRevenue.toLocaleString()} in revenue with ${context.growthRate}% growth.
      
      Based on this data, provide 3 specific, actionable insights for this business. Focus on:
      1. Sales performance analysis
      2. Revenue optimization opportunities  
      3. Customer behavior insights
      
      Keep each insight under 50 words and make them specific to this business's actual data.`

      const response = await this.callMistral(prompt, context)
      
      return [
        {
          id: 'sales-1',
          type: 'sales',
          title: 'Sales Performance',
          description: response.split('\n')[0] || 'Your sales are performing well',
          confidence: 0.90,
          actionable: true,
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sales-2',
          type: 'sales',
          title: 'Revenue Optimization',
          description: response.split('\n')[1] || 'Consider upselling strategies',
          confidence: 0.85,
          actionable: true,
          priority: 'medium',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sales-3',
          type: 'customer',
          title: 'Customer Insights',
          description: response.split('\n')[2] || 'Focus on customer retention',
          confidence: 0.80,
          actionable: true,
          priority: 'medium',
          createdAt: new Date().toISOString()
        }
      ]
    } catch (error) {
      console.error('Mistral AI error, using fallback insights:', error)
      // Return basic insights based on actual data
      return [
        {
          id: 'sales-1',
          type: 'sales',
          title: 'Sales Performance',
          description: `You have made ${sales.length} sales generating UGX ${revenue.toLocaleString()} in revenue.`,
          confidence: 0.95,
          actionable: true,
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sales-2',
          type: 'sales',
          title: 'Revenue Analysis',
          description: `Your average sale value is UGX ${sales.length > 0 ? Math.round(revenue / sales.length).toLocaleString() : 0}.`,
          confidence: 0.90,
          actionable: true,
          priority: 'medium',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sales-3',
          type: 'customer',
          title: 'Growth Strategy',
          description: `Focus on increasing your ${sales.length} sales to boost revenue further.`,
          confidence: 0.85,
          actionable: true,
          priority: 'medium',
          createdAt: new Date().toISOString()
        }
      ]
    }
  }

  // Generate financial insights
  static async generateFinancialInsights(revenue: number, expenses: number, profit: number): Promise<AIInsight[]> {
    try {
      const context = {
        revenue,
        expenses,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
      }

      const prompt = `Analyze this financial data for an African SME:
      - Revenue: UGX ${context.revenue.toLocaleString()}
      - Expenses: UGX ${context.expenses.toLocaleString()}
      - Profit: UGX ${context.profit.toLocaleString()}
      - Profit margin: ${context.profitMargin.toFixed(1)}%
      
      Provide 3 actionable insights about financial health, cost optimization, and profit improvement.`

      const response = await this.callMistral(prompt, context)
      
      return [
        {
          id: 'financial-1',
          type: 'financial',
          title: 'Financial Health',
          description: response.split('\n')[0] || 'Your business is financially stable',
          confidence: 0.88,
          actionable: true,
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: 'financial-2',
          type: 'financial',
          title: 'Cost Optimization',
          description: response.split('\n')[1] || 'Review your operational costs',
          confidence: 0.82,
          actionable: true,
          priority: 'medium',
          createdAt: new Date().toISOString()
        },
        {
          id: 'financial-3',
          type: 'financial',
          title: 'Profit Improvement',
          description: response.split('\n')[2] || 'Focus on high-margin products',
          confidence: 0.85,
          actionable: true,
          priority: 'high',
          createdAt: new Date().toISOString()
        }
      ]
    } catch (error) {
      console.error('Mistral AI error, using fallback insights:', error)
      // Return basic insights based on actual data
      return [
        {
          id: 'financial-1',
          type: 'financial',
          title: 'Financial Health',
          description: `Your revenue is UGX ${revenue.toLocaleString()} with a profit margin of ${revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0}%.`,
          confidence: 0.95,
          actionable: true,
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: 'financial-2',
          type: 'financial',
          title: 'Cost Management',
          description: `Your expenses are UGX ${expenses.toLocaleString()}. Consider reviewing operational costs.`,
          confidence: 0.90,
          actionable: true,
          priority: 'medium',
          createdAt: new Date().toISOString()
        },
        {
          id: 'financial-3',
          type: 'financial',
          title: 'Profit Optimization',
          description: `Your profit is UGX ${profit.toLocaleString()}. Focus on high-margin products to increase profitability.`,
          confidence: 0.85,
          actionable: true,
          priority: 'high',
          createdAt: new Date().toISOString()
        }
      ]
    }
  }

  // Generate sales forecast
  static async generateSalesForecast(sales: any[], timeframe: string = '30 days'): Promise<AIPrediction> {
    try {
      const context = {
        historicalSales: sales.slice(-30).map(sale => ({
          date: sale.created_at,
          amount: sale.total
        })),
        averageDailySales: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length : 0
      }

      const prompt = `Based on this sales history for an African SME, predict sales for the next ${timeframe}:
      - Historical sales: ${JSON.stringify(context.historicalSales)}
      - Average daily sales: UGX ${context.averageDailySales.toLocaleString()}
      
      Provide a sales forecast with confidence level and key factors.`

      const response = await this.callMistral(prompt, context)
      
      return {
        type: 'sales_forecast',
        title: `Sales Forecast - Next ${timeframe}`,
        prediction: response,
        confidence: 0.75,
        timeframe,
        data: context
      }
    } catch (error) {
      console.error('Mistral AI error, using fallback prediction:', error)
      // Return basic prediction based on actual data
      const averageDaily = sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length : 0
      const forecastAmount = averageDaily * (timeframe.includes('30') ? 30 : 7)
      
      return {
        type: 'sales_forecast',
        title: `Sales Forecast - Next ${timeframe}`,
        prediction: `Based on your ${sales.length} historical sales, you can expect approximately UGX ${Math.round(forecastAmount).toLocaleString()} in revenue over the next ${timeframe}. Your average daily sales are UGX ${Math.round(averageDaily).toLocaleString()}.`,
        confidence: 0.80,
        timeframe,
        data: { historicalSales: sales.length, averageDaily }
      }
    }
  }

  // Generate inventory predictions
  static async generateInventoryPredictions(products: any[]): Promise<AIPrediction> {
    try {
      const context = {
        totalProducts: products.length,
        lowStockProducts: products.filter(p => (p.current_stock || 0) <= 5).length,
        fastMovingProducts: products.filter(p => (p.current_stock || 0) < 10).length
      }

      const prompt = `Analyze this inventory data and predict what products need restocking:
      - Total products: ${context.totalProducts}
      - Low stock products: ${context.lowStockProducts}
      - Fast moving products: ${context.fastMovingProducts}
      
      Provide inventory predictions and restocking recommendations.`

      const response = await this.callMistral(prompt, context)
      
      return {
        type: 'inventory_needs',
        title: 'Inventory Restocking Predictions',
        prediction: response,
        confidence: 0.80,
        timeframe: '7 days',
        data: context
      }
    } catch (error) {
      console.error('Mistral AI error, using fallback prediction:', error)
      // Return basic prediction based on actual data
      const lowStockProducts = products.filter(p => (p.current_stock || 0) <= 5)
      
      return {
        type: 'inventory_needs',
        title: 'Inventory Restocking Predictions',
        prediction: `You have ${products.length} products in inventory. ${lowStockProducts.length} items are running low on stock: ${lowStockProducts.map(p => p.name).join(', ')}. Consider restocking these items within the next 7 days to avoid stockouts.`,
        confidence: 0.85,
        timeframe: '7 days',
        data: { totalProducts: products.length, lowStock: lowStockProducts.length }
      }
    }
  }

  // Generate business summary
  static async generateBusinessSummary(data: any): Promise<string> {
    try {
      const prompt = `Generate a comprehensive business summary for an African SME with this data:
      - Sales: ${data.sales || 0} transactions
      - Revenue: UGX ${(data.revenue || 0).toLocaleString()}
      - Products: ${data.products || 0} items
      - Growth: ${data.growth || 0}%
      
      Provide a 2-paragraph executive summary highlighting key achievements and recommendations.`

      return await this.callMistral(prompt, data)
    } catch (error) {
      console.error('Mistral AI error, using fallback summary:', error)
      // Return basic summary based on actual data
      return `Your business is performing well with ${data.sales || 0} sales generating UGX ${(data.revenue || 0).toLocaleString()} in revenue. You have ${data.products || 0} products in inventory with ${data.growth || 0}% growth rate. 

To continue growing, focus on optimizing your inventory management, implementing customer loyalty programs, and expanding your product range to meet customer demand.`
    }
  }
}

// Export individual functions for easy use
export const {
  generateInventoryInsights,
  generateSalesInsights,
  generateFinancialInsights,
  generateSalesForecast,
  generateInventoryPredictions,
  generateBusinessSummary
} = AIAnalytics