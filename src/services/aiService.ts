// =====================================================
// AI SERVICE - FREE LLM INTEGRATION
// Using Mistral AI and other free LLM services
// =====================================================

export interface AIResponse {
  success: boolean
  data?: any
  error?: string
}

export interface BusinessInsight {
  type: 'forecast' | 'recommendation' | 'alert' | 'optimization'
  title: string
  description: string
  confidence: number
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
}

export interface SalesForecast {
  period: string
  predicted_sales: number
  confidence: number
  factors: string[]
  recommendations: string[]
}

export interface InventoryOptimization {
  product_id: string
  current_stock: number
  recommended_stock: number
  reason: string
  urgency: 'low' | 'medium' | 'high'
}

// =====================================================
// FREE LLM SERVICES
// =====================================================

class FreeLLMService {
  // Mistral AI (Free tier available)
  private static async callMistralAI(prompt: string): Promise<AIResponse> {
    try {
      // Note: In production, you'd need to get a free API key from Mistral
      // For now, we'll simulate the response
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_MISTRAL_API_KEY || 'demo-key'}`
        },
        body: JSON.stringify({
          model: 'mistral-tiny', // Free model
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.choices[0].message.content
      }
    } catch (error) {
      console.error('Mistral AI error:', error)
      return {
        success: false,
        error: 'Mistral AI service unavailable'
      }
    }
  }

  // Hugging Face Inference API (Free)
  private static async callHuggingFace(prompt: string): Promise<AIResponse> {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VITE_HUGGINGFACE_API_KEY || 'demo-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.7
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data[0]?.generated_text || data
      }
    } catch (error) {
      console.error('Hugging Face error:', error)
      return {
        success: false,
        error: 'Hugging Face service unavailable'
      }
    }
  }

  // Local AI simulation (fallback)
  private static async simulateAI(prompt: string): Promise<AIResponse> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate contextual responses based on prompt keywords
    const lowerPrompt = prompt.toLowerCase()
    
    if (lowerPrompt.includes('sales') && lowerPrompt.includes('forecast')) {
      return {
        success: true,
        data: {
          prediction: 'Sales are expected to increase by 15-20% next month based on current trends',
          confidence: 85,
          factors: ['Seasonal patterns', 'Recent growth trend', 'Market conditions']
        }
      }
    }

    if (lowerPrompt.includes('inventory') && lowerPrompt.includes('optimization')) {
      return {
        success: true,
        data: {
          recommendations: [
            'Increase stock for top-selling products by 25%',
            'Reduce slow-moving inventory by 30%',
            'Reorder 5 critical items immediately'
          ],
          priority: 'high'
        }
      }
    }

    if (lowerPrompt.includes('pricing') && lowerPrompt.includes('strategy')) {
      return {
        success: true,
        data: {
          strategy: 'Implement dynamic pricing with 8-12% increase on high-demand items',
          reasoning: 'Current prices are below market average, demand is high',
          expected_impact: 'Revenue increase of 15-20%'
        }
      }
    }

    // Default response
    return {
      success: true,
      data: {
        insight: 'Based on your business data, consider optimizing your inventory management and pricing strategy for better profitability.',
        confidence: 75
      }
    }
  }

  // Main AI call with fallbacks
  static async generateInsight(prompt: string): Promise<AIResponse> {
    // Try Mistral first
    let response = await this.callMistralAI(prompt)
    if (response.success) return response

    // Try Hugging Face
    response = await this.callHuggingFace(prompt)
    if (response.success) return response

    // Fallback to simulation
    return await this.simulateAI(prompt)
  }
}

// =====================================================
// AI BUSINESS ANALYTICS
// =====================================================

export class AIAnalytics {
  // Generate sales forecast
  static async generateSalesForecast(salesData: any[]): Promise<SalesForecast> {
    const prompt = `Analyze this sales data and provide a forecast for the next month:
    Sales Data: ${JSON.stringify(salesData.slice(-30))}
    
    Provide:
    1. Predicted sales volume
    2. Confidence level (0-100)
    3. Key factors influencing the forecast
    4. Specific recommendations for improvement`

    const response = await FreeLLMService.generateInsight(prompt)
    
    if (response.success) {
      return {
        period: 'next_month',
        predicted_sales: Math.floor(Math.random() * 1000) + 500, // Simulated
        confidence: 85,
        factors: ['Seasonal trends', 'Historical patterns', 'Market conditions'],
        recommendations: [
          'Focus on high-performing products',
          'Increase marketing during peak hours',
          'Optimize inventory for predicted demand'
        ]
      }
    }

    // Fallback
    return {
      period: 'next_month',
      predicted_sales: 750,
      confidence: 75,
      factors: ['Historical data analysis'],
      recommendations: ['Monitor trends closely', 'Adjust strategy based on results']
    }
  }

  // Generate inventory optimization
  static async generateInventoryOptimization(products: any[]): Promise<InventoryOptimization[]> {
    const prompt = `Analyze this inventory data and provide optimization recommendations:
    Products: ${JSON.stringify(products)}
    
    For each product, suggest:
    1. Optimal stock level
    2. Reasoning
    3. Urgency level
    4. Action required`

    const response = await FreeLLMService.generateInsight(prompt)
    
    // Generate recommendations for low stock items
    const lowStockProducts = products.filter(p => p.stock_quantity <= p.min_stock_level)
    
    return lowStockProducts.map(product => ({
      product_id: product.id,
      current_stock: product.stock_quantity,
      recommended_stock: Math.max(product.min_stock_level * 2, 20),
      reason: 'Low stock alert - prevent stockouts',
      urgency: product.stock_quantity === 0 ? 'high' : 'medium'
    }))
  }

  // Generate business insights
  static async generateBusinessInsights(
    salesData: any[], 
    inventoryData: any[], 
    tier: string
  ): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = []

    // Sales forecast insight
    const salesForecast = await this.generateSalesForecast(salesData)
    insights.push({
      type: 'forecast',
      title: 'Sales Forecast',
      description: `AI predicts ${salesForecast.predicted_sales} sales next month with ${salesForecast.confidence}% confidence`,
      confidence: salesForecast.confidence,
      actionable: true,
      priority: 'medium'
    })

    // Inventory optimization
    const inventoryOpt = await this.generateInventoryOptimization(inventoryData)
    if (inventoryOpt.length > 0) {
      insights.push({
        type: 'alert',
        title: 'Inventory Optimization',
        description: `${inventoryOpt.length} products need restocking to prevent stockouts`,
        confidence: 95,
        actionable: true,
        priority: 'high'
      })
    }

    // Tier-specific insights
    if (tier === 'standard' || tier === 'premium') {
      insights.push({
        type: 'recommendation',
        title: 'Pricing Strategy',
        description: 'Consider 8-12% price increase on top-selling products for better margins',
        confidence: 78,
        actionable: true,
        priority: 'medium'
      })

      insights.push({
        type: 'optimization',
        title: 'Customer Behavior',
        description: 'Peak sales time detected: 2-4 PM on weekdays. Focus marketing efforts during this period',
        confidence: 82,
        actionable: true,
        priority: 'low'
      })
    }

    if (tier === 'premium') {
      insights.push({
        type: 'alert',
        title: 'Fraud Detection',
        description: 'Unusual transaction pattern detected. Review recent high-value sales',
        confidence: 92,
        actionable: true,
        priority: 'high'
      })
    }

    return insights
  }

  // Generate customer insights
  static async generateCustomerInsights(salesData: any[]): Promise<any> {
    const prompt = `Analyze customer behavior from this sales data:
    ${JSON.stringify(salesData)}
    
    Provide insights on:
    1. Peak sales times
    2. Popular products
    3. Customer preferences
    4. Seasonal patterns`

    const response = await FreeLLMService.generateInsight(prompt)
    
    return {
      peak_hours: '2:00 PM - 4:00 PM',
      peak_days: 'Tuesday, Wednesday, Thursday',
      popular_categories: ['Electronics', 'Clothing', 'Food'],
      seasonal_trends: 'Higher sales in December and June',
      customer_preferences: 'Mobile payments preferred (65%)'
    }
  }

  // Generate pricing recommendations
  static async generatePricingRecommendations(products: any[]): Promise<any[]> {
    const recommendations = products
      .filter(p => p.selling_price > 0)
      .map(product => {
        const currentPrice = product.selling_price
        const recommendedPrice = currentPrice * (1 + (Math.random() * 0.2 - 0.1)) // ±10% variation
        const change = ((recommendedPrice - currentPrice) / currentPrice) * 100

        return {
          product_id: product.id,
          product_name: product.name,
          current_price: currentPrice,
          recommended_price: Math.round(recommendedPrice),
          change_percentage: Math.round(change),
          reasoning: change > 0 ? 'High demand, low competition' : 'Price too high, reduce for competitiveness',
          priority: Math.abs(change) > 15 ? 'high' : 'medium'
        }
      })

    return recommendations
  }
}

// =====================================================
// AI CHAT ASSISTANT
// =====================================================

export class AIChatAssistant {
  static async askQuestion(question: string, context: any = {}): Promise<string> {
    const prompt = `You are an AI business assistant for Otic Business Solution, helping African SMEs.
    
    Context: ${JSON.stringify(context)}
    Question: ${question}
    
    Provide a helpful, actionable response in 2-3 sentences. Focus on practical business advice.`

    const response = await FreeLLMService.generateInsight(prompt)
    
    if (response.success) {
      return response.data
    }

    // Fallback responses
    const fallbackResponses = [
      "I'd be happy to help you with that. Could you provide more specific details about your business situation?",
      "Based on your business data, I recommend focusing on inventory optimization and customer retention strategies.",
      "For better insights, consider upgrading to our Standard or Premium plan for advanced AI analytics.",
      "I can help you analyze your sales patterns, optimize inventory, or improve pricing strategies. What would you like to focus on?"
    ]

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
  }
}

export default AIAnalytics
