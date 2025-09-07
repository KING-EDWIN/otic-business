import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bot, 
  Send, 
  User, 
  Loader2, 
  MessageSquare,
  Brain,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { AIAnalytics } from '@/services/aiService'
import { getDemoAIInsights, getDemoAIPredictions, shouldUseDemoAI } from '@/services/aiDemoService'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  data?: any
}

interface AIChatBotProps {
  businessData: {
    sales?: any[]
    products?: any[]
    revenue?: number
    growth?: number
    lowStockItems?: any[]
    user?: any
  }
}

const AIChatBot: React.FC<AIChatBotProps> = ({ businessData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI business assistant. I have access to all your business data and can help you with insights, predictions, and recommendations. What would you like to know about your business?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getBusinessContext = () => {
    const context = {
      businessName: businessData.user?.business_name || 'Your Business',
      totalSales: businessData.sales?.length || 0,
      totalRevenue: businessData.revenue || 0,
      totalProducts: businessData.products?.length || 0,
      growthRate: businessData.growth || 0,
      lowStockCount: businessData.lowStockItems?.length || 0,
      recentSales: businessData.sales?.slice(-5).map(sale => ({
        date: sale.created_at,
        amount: sale.total,
        method: sale.payment_method
      })) || [],
      topProducts: businessData.products?.slice(0, 5).map(product => ({
        name: product.name,
        stock: product.stock,
        price: product.price
      })) || []
    }
    return context
  }

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const context = getBusinessContext()
    
    try {
      // Always use live Mistral AI
      const prompt = `You are an AI business assistant for "${context.businessName}", an African SME. 
      
      Current Business Data:
      - Total Sales: ${context.totalSales} transactions
      - Total Revenue: UGX ${context.totalRevenue.toLocaleString()}
      - Total Products: ${context.totalProducts} items
      - Growth Rate: ${context.growthRate}%
      - Low Stock Items: ${context.lowStockCount}
      - Recent Sales: ${JSON.stringify(context.recentSales)}
      - Top Products: ${JSON.stringify(context.topProducts)}
      
      User Question: "${userMessage}"
      
      Provide a helpful, actionable response based on their specific business data. Be specific and give concrete recommendations. Keep it conversational and under 100 words. Focus on actionable insights.`

      const response = await AIAnalytics.callMistralForChat(prompt, context)
      return response
    } catch (error) {
      console.error('AI Chat error:', error)
      // Fallback to demo response only if API fails
      return generateDemoResponse(userMessage, context)
    }
  }

  const generateDemoResponse = (userMessage: string, context: any): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('sales') || lowerMessage.includes('revenue')) {
      return `Based on your sales data, you've made ${context.totalSales} transactions totaling UGX ${context.totalRevenue.toLocaleString()}. Your growth rate is ${context.growthRate}%, which is excellent! 

I recommend focusing on your peak hours (8-10 AM and 5-7 PM) and consider implementing a loyalty program to increase repeat customers. Your recent sales show strong performance - keep up the great work!`
    }
    
    if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
      return `Your inventory analysis shows ${context.totalProducts} products with ${context.lowStockCount} items running low. 

I notice your top products are performing well. Consider restocking your fast-moving items and implementing automated reorder points. This will help prevent stockouts and maintain customer satisfaction.`
    }
    
    if (lowerMessage.includes('profit') || lowerMessage.includes('financial')) {
      return `Your financial health looks strong! With UGX ${context.totalRevenue.toLocaleString()} in revenue, you're on a good track. 

I recommend focusing on high-margin products and reviewing your operational costs. Consider bulk purchasing for frequently sold items to improve your profit margins.`
    }
    
    if (lowerMessage.includes('predict') || lowerMessage.includes('forecast')) {
      return `Based on your current trends, I predict you'll generate approximately UGX ${Math.round(context.totalRevenue * 1.15).toLocaleString()} in the next month - that's a 15% growth! 

Key factors: seasonal demand, improved customer retention, and your expanding product range. Focus on inventory management and peak hour optimization to achieve this.`
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `I can help you with:
• Sales analysis and revenue insights
• Inventory management and restocking recommendations  
• Financial health and profit optimization
• Business predictions and forecasting
• Customer behavior analysis
• Growth strategies and recommendations

Just ask me anything about your business!`
    }
    
    return `I understand you're asking about "${userMessage}". Based on your business data, I can see you have ${context.totalSales} sales worth UGX ${context.totalRevenue.toLocaleString()}. 

Could you be more specific? I can help with sales analysis, inventory management, financial insights, or business predictions. What aspect of your business would you like to explore?`
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const aiResponse = await generateAIResponse(inputMessage)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error generating AI response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    "How are my sales performing?",
    "What should I restock?",
    "What's my profit margin?",
    "Predict next month's revenue",
    "Give me business insights"
  ]

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
  }

  return (
    <Card className="h-[400px] flex flex-col border-[#faa51a]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-[#040458]">
          <Bot className="h-5 w-5 mr-2 text-[#faa51a]" />
          AI Business Assistant
          <Badge className="ml-2 bg-[#faa51a] text-white">
            Live AI
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Quick Questions */}
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion(question)}
                className="text-xs text-[#040458] border-[#faa51a] hover:bg-[#faa51a] hover:text-white"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages - Fixed height with scroll */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-[#faa51a] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'ai' ? (
                      <Bot className="h-4 w-4 mt-1 text-[#faa51a]" />
                    ) : (
                      <User className="h-4 w-4 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-[#faa51a]" />
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your business..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-[#faa51a] hover:bg-[#040458] text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AIChatBot
