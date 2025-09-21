import { advancedQuickBooksService } from './advancedQuickBooksService'
import { getCurrentUserInfo } from '@/utils/userUtils'

interface AIInsight {
  type: 'warning' | 'opportunity' | 'trend' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  action?: string
}

interface AIPrediction {
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  timeframe: string
}

interface AIRecommendation {
  category: string
  title: string
  description: string
  potentialSavings?: number
  implementation: string
  priority: 'high' | 'medium' | 'low'
}

export class AIAccountingService {
  private mistralApiKey = import.meta.env.VITE_MISTRAL_API_KEY

  async generateAIInsights(): Promise<AIInsight[]> {
    try {
      const metrics = await advancedQuickBooksService.getFinancialMetrics()
      const insights: AIInsight[] = []

      // Cash Flow Analysis
      if (metrics.cashBalance < metrics.accountsPayable) {
        insights.push({
          type: 'warning',
          title: 'Low Cash Position',
          description: `Your cash balance (${this.formatCurrency(metrics.cashBalance)}) is lower than accounts payable (${this.formatCurrency(metrics.accountsPayable)}). Consider collecting receivables or securing short-term financing.`,
          impact: 'high',
          action: 'Review cash flow and payment terms'
        })
      }

      // Profitability Analysis
      if (metrics.netIncome < 0) {
        insights.push({
          type: 'warning',
          title: 'Negative Net Income',
          description: `Your business is operating at a loss. Current net income is ${this.formatCurrency(metrics.netIncome)}. Focus on reducing expenses or increasing revenue.`,
          impact: 'high',
          action: 'Review expense categories and pricing strategy'
        })
      } else if (metrics.netIncome > 0 && metrics.netIncome < metrics.totalRevenue * 0.1) {
        insights.push({
          type: 'opportunity',
          title: 'Low Profit Margin',
          description: `Your profit margin is ${((metrics.netIncome / metrics.totalRevenue) * 100).toFixed(1)}%. Industry average is typically 10-15%. Consider optimizing costs or adjusting prices.`,
          impact: 'medium',
          action: 'Analyze cost structure and pricing'
        })
      }

      // Receivables Analysis
      if (metrics.accountsReceivable > metrics.totalRevenue * 0.3) {
        insights.push({
          type: 'trend',
          title: 'High Accounts Receivable',
          description: `Your receivables (${this.formatCurrency(metrics.accountsReceivable)}) represent ${((metrics.accountsReceivable / metrics.totalRevenue) * 100).toFixed(1)}% of revenue. Consider implementing stricter payment terms.`,
          impact: 'medium',
          action: 'Review payment terms and collection process'
        })
      }

      // Growth Opportunity
      if (metrics.netIncome > 0 && metrics.cashBalance > metrics.totalRevenue * 0.2) {
        insights.push({
          type: 'opportunity',
          title: 'Strong Financial Position',
          description: `Your business has strong profitability and cash reserves. Consider investing in growth opportunities or equipment upgrades.`,
          impact: 'low',
          action: 'Explore growth investments'
        })
      }

      // AI-Generated Insights using Mistral
      const aiInsights = await this.generateMistralInsights(metrics)
      insights.push(...aiInsights)

      return insights
    } catch (error) {
      console.error('Error generating AI insights:', error)
      return []
    }
  }

  async generatePredictions(): Promise<AIPrediction[]> {
    try {
      const metrics = await advancedQuickBooksService.getFinancialMetrics()
      const predictions: AIPrediction[] = []

      // Simple trend analysis (in real implementation, use ML models)
      const growthRate = 0.05 // 5% assumed growth
      const timeframes = ['1 month', '3 months', '6 months', '1 year']

      timeframes.forEach(timeframe => {
        const multiplier = timeframe === '1 month' ? 1.05 : 
                         timeframe === '3 months' ? 1.15 :
                         timeframe === '6 months' ? 1.25 : 1.5

        predictions.push({
          metric: 'Revenue',
          currentValue: metrics.totalRevenue,
          predictedValue: metrics.totalRevenue * multiplier,
          confidence: 0.75,
          timeframe
        })

        predictions.push({
          metric: 'Net Income',
          currentValue: metrics.netIncome,
          predictedValue: metrics.netIncome * multiplier,
          confidence: 0.70,
          timeframe
        })
      })

      return predictions
    } catch (error) {
      console.error('Error generating predictions:', error)
      return []
    }
  }

  async generateRecommendations(): Promise<AIRecommendation[]> {
    try {
      const metrics = await advancedQuickBooksService.getFinancialMetrics()
      const recommendations: AIRecommendation[] = []

      // Cost Optimization
      if (metrics.operatingExpenses > metrics.totalRevenue * 0.7) {
        recommendations.push({
          category: 'Cost Management',
          title: 'Optimize Operating Expenses',
          description: 'Your operating expenses are high relative to revenue. Focus on reducing unnecessary costs.',
          potentialSavings: metrics.operatingExpenses * 0.1,
          implementation: 'Review all expense categories, negotiate with suppliers, eliminate non-essential spending',
          priority: 'high'
        })
      }

      // Cash Flow Management
      if (metrics.accountsReceivable > metrics.cashBalance * 2) {
        recommendations.push({
          category: 'Cash Flow',
          title: 'Improve Collection Process',
          description: 'Implement stricter payment terms and follow up on outstanding invoices.',
          potentialSavings: metrics.accountsReceivable * 0.2,
          implementation: 'Set up automated payment reminders, offer early payment discounts, require deposits',
          priority: 'high'
        })
      }

      // Revenue Growth
      if (metrics.netIncome > 0) {
        recommendations.push({
          category: 'Growth',
          title: 'Invest in Marketing',
          description: 'With positive cash flow, consider increasing marketing spend to drive revenue growth.',
          potentialSavings: 0,
          implementation: 'Allocate 5-10% of revenue to marketing, focus on digital channels',
          priority: 'medium'
        })
      }

      // Tax Optimization
      recommendations.push({
        category: 'Tax Planning',
        title: 'Maximize Deductions',
        description: 'Ensure you\'re claiming all eligible business deductions to reduce tax liability.',
        potentialSavings: metrics.netIncome * 0.05,
        implementation: 'Track all business expenses, maintain proper records, consult with tax professional',
        priority: 'medium'
      })

      return recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }

  private async generateMistralInsights(metrics: any): Promise<AIInsight[]> {
    try {
      if (!this.mistralApiKey) return []

      const prompt = `
        Analyze this business financial data and provide 3 key insights:
        - Revenue: ${metrics.totalRevenue}
        - Expenses: ${metrics.totalExpenses}
        - Net Income: ${metrics.netIncome}
        - Cash Balance: ${metrics.cashBalance}
        - Accounts Receivable: ${metrics.accountsReceivable}
        - Accounts Payable: ${metrics.accountsPayable}

        Provide insights in JSON format with type, title, description, and impact level.
        Focus on actionable insights for a small business.
      `

      const response = await Promise.race([
        fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.mistralApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000
          })
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Mistral API timeout')), 15000))
      ]) as Response

      if (!response.ok) return []

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (content) {
        try {
          const insights = JSON.parse(content)
          return Array.isArray(insights) ? insights : []
        } catch {
          return []
        }
      }

      return []
    } catch (error) {
      console.error('Error calling Mistral API:', error)
      return []
    }
  }

  async autoCategorizeTransactions(): Promise<any> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) return

      // Get uncategorized transactions
      const { data: transactions, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userInfo.id)
        .is('category_id', null)

      if (error) throw error

      // AI categorization logic
      const categorizedTransactions = transactions?.map(transaction => {
        const description = transaction.description?.toLowerCase() || ''
        let category = 'Other'

        if (description.includes('fuel') || description.includes('petrol') || description.includes('gas')) {
          category = 'Transportation'
        } else if (description.includes('food') || description.includes('restaurant') || description.includes('lunch')) {
          category = 'Meals & Entertainment'
        } else if (description.includes('office') || description.includes('stationery') || description.includes('supplies')) {
          category = 'Office Supplies'
        } else if (description.includes('rent') || description.includes('lease')) {
          category = 'Rent & Utilities'
        } else if (description.includes('phone') || description.includes('internet') || description.includes('communication')) {
          category = 'Communication'
        } else if (description.includes('marketing') || description.includes('advertising') || description.includes('promotion')) {
          category = 'Marketing'
        }

        return {
          id: transaction.id,
          category
        }
      })

      // Update transactions with categories
      for (const transaction of categorizedTransactions || []) {
        await supabase
          .from('expenses')
          .update({ category: transaction.category })
          .eq('id', transaction.id)
      }

      return categorizedTransactions
    } catch (error) {
      console.error('Error auto-categorizing transactions:', error)
      return []
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount)
  }
}

export const aiAccountingService = new AIAccountingService()

