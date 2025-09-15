import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft, 
  Brain, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RefreshCw,
  MessageSquareText,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { AIAnalytics } from '@/services/aiService'
import { DataService } from '@/services/dataService'
import { supabase } from '@/lib/supabaseClient'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

const AIChat: React.FC = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Quick questions
  const quickQuestions = [
    "How are my sales performing?",
    "What should I restock?",
    "What's my profit margin?",
    "Predict next month's revenue",
    "Give me business insights",
    "What are my top products?",
    "How can I increase sales?",
    "What's my inventory status?"
  ]

  // Get business context
  const getBusinessContext = async () => {
    try {
      if (!user?.id) {
        return {
          businessName: profile?.business_name || 'Your Business',
          totalSales: 0,
          totalRevenue: 0,
          totalProducts: 0,
          growthRate: 0,
          lowStockCount: 0,
          recentSales: [],
          topProducts: []
        }
      }

      // Fetch real data from database
      const [products, analyticsData] = await Promise.all([
        DataService.getProducts(user.id),
        DataService.getAnalyticsData(user.id, '30d')
      ])

      // Fetch recent sales
      const { data: salesData } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Calculate low stock items
      const lowStockCount = products.filter(p => (p.stock || 0) <= (p.min_stock || 5)).length

      // Get top products by revenue
      const productRevenue = {}
      salesData?.forEach(sale => {
        if (sale.product_id) {
          const product = products.find(p => p.id === sale.product_id)
          if (product) {
            if (productRevenue[product.id]) {
              productRevenue[product.id].revenue += sale.total
              productRevenue[product.id].sales += 1
            } else {
              productRevenue[product.id] = {
                name: product.name,
                revenue: sale.total,
                sales: 1
              }
            }
          }
        }
      })

      const topProducts = Object.values(productRevenue)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5)

      return {
        businessName: profile?.business_name || 'Your Business',
        totalSales: analyticsData.totalSales,
        totalRevenue: analyticsData.totalRevenue,
        totalProducts: analyticsData.totalProducts,
        growthRate: analyticsData.salesGrowth,
        lowStockCount,
        recentSales: salesData?.map(sale => ({
          date: new Date(sale.created_at).toISOString().split('T')[0],
          amount: sale.total,
          method: sale.payment_method || 'cash'
        })) || [],
        topProducts
      }
    } catch (error) {
      console.error('Error fetching business context:', error)
      return {
        businessName: profile?.business_name || 'Your Business',
        totalSales: 0,
        totalRevenue: 0,
        totalProducts: 0,
        growthRate: 0,
        lowStockCount: 0,
        recentSales: [],
        topProducts: []
      }
    }
  }

  // Generate AI response
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const context = await getBusinessContext()
    
    try {
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
      
      Provide a helpful, actionable response based on their specific business data. Be specific and give concrete recommendations. Keep it conversational and under 150 words. Focus on actionable insights.`

      const response = await AIAnalytics.callMistralForChat(prompt, context)
      return response
    } catch (error) {
      console.error('AI Chat error:', error)
      return `I apologize, but I'm having trouble accessing the AI service right now. However, based on your business data:
      
      - You have ${context.totalSales} total sales
      - Your revenue is UGX ${context.totalRevenue.toLocaleString()}
      - You have ${context.totalProducts} products in inventory
      - Your growth rate is ${context.growthRate}%
      
      Please try again in a moment.`
    }
  }

  // Handle sending message
  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim()
    if (!messageToSend) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const aiResponse = await generateAIResponse(messageToSend)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error generating AI response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle quick question
  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const initializeWelcome = async () => {
        const context = await getBusinessContext()
        const welcomeMessage: Message = {
          id: 'welcome',
          type: 'ai',
          content: `Hello! I'm your AI business assistant for ${context.businessName}. I have access to all your business data and can help you with insights, predictions, and recommendations. 

I can see you have:
- ${context.totalSales} total sales
- UGX ${context.totalRevenue.toLocaleString()} in revenue
- ${context.totalProducts} products in inventory
- ${context.growthRate}% growth rate

What would you like to know about your business?`,
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
      }
      initializeWelcome()
    }
  }, [])

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-[#040458]" />
              <h1 className="text-3xl font-bold text-[#040458]">AI Business Assistant</h1>
            </div>
          </div>
          <Badge className="bg-[#faa51a] text-white text-lg px-4 py-2">
            Live AI
          </Badge>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
          {/* Quick Questions Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-[#040458] text-lg">
                  <MessageSquareText className="h-5 w-5 mr-2 text-[#faa51a]" />
                  Quick Questions
                </CardTitle>
                <CardDescription>
                  Click any question to ask the AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left justify-start text-[#040458] border-[#faa51a] hover:bg-[#faa51a] hover:text-white h-auto p-3 text-sm"
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="flex items-center text-[#040458] text-xl">
                  <Bot className="h-6 w-6 mr-3 text-[#faa51a]" />
                  Chat with AI Assistant
                </CardTitle>
                <CardDescription className="text-base">
                  Ask me anything about your business - I have access to all your data
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-6 space-y-6">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-4 ${
                              message.type === 'user'
                                ? 'bg-[#faa51a] text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {message.type === 'ai' ? (
                                <Bot className="h-5 w-5 mt-1 text-[#faa51a] flex-shrink-0" />
                              ) : (
                                <User className="h-5 w-5 mt-1 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                  {message.content}
                                </p>
                                <p className="text-xs opacity-70 mt-2">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <Bot className="h-5 w-5 text-[#faa51a]" />
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-gray-600">AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Input */}
                <div className="p-6 border-t border-gray-200 flex-shrink-0">
                  <div className="flex space-x-3">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your business..."
                      className="flex-1 text-base h-12"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-[#faa51a] hover:bg-[#040458] text-white px-6 h-12"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AIChat
