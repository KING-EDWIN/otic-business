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
  const getBusinessContext = () => {
    const demoMode = sessionStorage.getItem('demo_mode') === 'true'
    
    if (demoMode) {
      return {
        businessName: 'Demo Business Store',
        totalSales: 15,
        totalRevenue: 12748000,
        totalProducts: 25,
        growthRate: 15.3,
        lowStockCount: 4,
        recentSales: [
          { date: '2024-01-15', amount: 450000, method: 'cash' },
          { date: '2024-01-14', amount: 320000, method: 'mobile_money' },
          { date: '2024-01-13', amount: 280000, method: 'cash' }
        ],
        topProducts: [
          { name: 'Rice 5kg', sales: 8, revenue: 1200000 },
          { name: 'Cooking Oil 1L', sales: 12, revenue: 960000 },
          { name: 'Sugar 2kg', sales: 6, revenue: 480000 }
        ]
      }
    }
    
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

  // Generate AI response
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const context = getBusinessContext()
    
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
      const context = getBusinessContext()
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
