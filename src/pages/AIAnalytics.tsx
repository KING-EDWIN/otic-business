import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Brain, 
  ArrowLeft, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Lightbulb,
  RefreshCw,
  Send,
  MessageSquare,
  Zap,
  DollarSign,
  ShoppingCart,
  Package,
  Users
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { AIAnalytics } from '@/services/aiService'

const AIAnalyticsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [aiResponse, setAiResponse] = useState('')
  const [userQuestion, setUserQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [businessData, setBusinessData] = useState({
    totalSales: 27048000,
    totalRevenue: 27048000,
    totalProducts: 32,
    lowStockItems: 5,
    salesGrowth: 20.1,
    revenueGrowth: 15.3
  })

  // Chart data
  const salesData = [
    { name: 'Jan', sales: 4000, revenue: 2400 },
    { name: 'Feb', sales: 3000, revenue: 1398 },
    { name: 'Mar', sales: 2000, revenue: 9800 },
    { name: 'Apr', sales: 2780, revenue: 3908 },
    { name: 'May', sales: 1890, revenue: 4800 },
    { name: 'Jun', sales: 2390, revenue: 3800 }
  ]

  const productData = [
    { name: 'Electronics', value: 35, color: '#040458' },
    { name: 'Clothing', value: 25, color: '#faa51a' },
    { name: 'Accessories', value: 20, color: '#10b981' },
    { name: 'Other', value: 20, color: '#8b5cf6' }
  ]

  const askAI = async (question: string) => {
    if (!question.trim()) return
    
    setIsLoading(true)
    try {
      const context = `
        Business Context:
        - Total Sales: UGX ${businessData.totalSales.toLocaleString()}
        - Total Revenue: UGX ${businessData.totalRevenue.toLocaleString()}
        - Total Products: ${businessData.totalProducts}
        - Low Stock Items: ${businessData.lowStockItems}
        - Sales Growth: ${businessData.salesGrowth}%
        - Revenue Growth: ${businessData.revenueGrowth}%
        
        Question: ${question}
      `
      
      const response = await AIAnalytics.generateGeneralInsights({
        totalSales: businessData.totalSales,
        totalRevenue: businessData.totalRevenue,
        totalProducts: businessData.totalProducts,
        lowStockItems: businessData.lowStockItems
      })
      
      setAiResponse(response[0]?.description || 'AI is analyzing your business data...')
    } catch (error) {
      console.error('AI Error:', error)
      setAiResponse('I apologize, but I encountered an error while analyzing your business data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    askAI(userQuestion)
    setUserQuestion('')
  }

  const quickQuestions = [
    "What are my top performing products?",
    "How can I improve my sales?",
    "What's my inventory optimization strategy?",
    "Should I expand my product range?",
    "What are the growth opportunities?",
    "How can I reduce costs?"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <Brain className="h-8 w-8 text-[#faa51a]" />
              <div>
                <h1 className="text-2xl font-bold text-[#040458]">AI Business Analytics</h1>
                <p className="text-sm text-gray-600">
                  Powered by Mistral AI - Your intelligent business advisor
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total Sales</p>
                      <p className="text-2xl font-bold">UGX {businessData.totalSales.toLocaleString()}</p>
                      <p className="text-green-200 text-sm">+{businessData.salesGrowth}% this month</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Revenue</p>
                      <p className="text-2xl font-bold">UGX {businessData.totalRevenue.toLocaleString()}</p>
                      <p className="text-blue-200 text-sm">+{businessData.revenueGrowth}% this month</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Products</p>
                      <p className="text-2xl font-bold">{businessData.totalProducts}</p>
                      <p className="text-orange-200 text-sm">Active products</p>
                    </div>
                    <Package className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100">Low Stock</p>
                      <p className="text-2xl font-bold">{businessData.lowStockItems}</p>
                      <p className="text-red-200 text-sm">Need restocking</p>
                    </div>
                    <Target className="h-8 w-8 text-red-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-[#040458] to-[#faa51a] text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Brain className="h-6 w-6 mr-3" />
                  AI Business Summary
                </CardTitle>
                <CardDescription className="text-white/90">
                  Your business is performing well with strong growth indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Growth Analysis</h4>
                      <p className="text-sm text-white/90">
                        Your sales have grown by {businessData.salesGrowth}% this month, indicating strong market demand and effective sales strategies.
                      </p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Inventory Status</h4>
                      <p className="text-sm text-white/90">
                        You have {businessData.lowStockItems} items running low on stock. Consider reordering to maintain sales momentum.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab('chat')}
                    className="bg-white text-[#040458] hover:bg-white/90 font-semibold"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask AI for Advice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-[#faa51a]" />
                    Sales Trend
                  </CardTitle>
                  <CardDescription>Monthly sales and revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#040458" 
                          strokeWidth={3}
                          name="Sales"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#faa51a" 
                          strokeWidth={3}
                          name="Revenue"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-[#faa51a]" />
                    Product Categories
                  </CardTitle>
                  <CardDescription>Sales distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {productData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-[#faa51a]" />
                  AI-Generated Business Insights
                </CardTitle>
                <CardDescription>
                  Intelligent analysis of your business performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-semibold text-green-800">Growth Opportunity</h4>
                      </div>
                      <p className="text-sm text-green-700">
                        Your {businessData.salesGrowth}% sales growth indicates strong market demand. 
                        Consider expanding your product range or increasing marketing efforts to capitalize on this momentum.
                      </p>
                    </div>

                    <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <div className="flex items-center mb-2">
                        <Package className="h-5 w-5 text-yellow-600 mr-2" />
                        <h4 className="font-semibold text-yellow-800">Inventory Alert</h4>
                      </div>
                      <p className="text-sm text-yellow-700">
                        {businessData.lowStockItems} items are running low on stock. 
                        Implement automated reorder points to prevent stockouts during peak sales periods.
                      </p>
                    </div>

                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-800">Revenue Optimization</h4>
                      </div>
                      <p className="text-sm text-blue-700">
                        Your revenue growth of {businessData.revenueGrowth}% shows healthy financial performance. 
                        Consider implementing upselling strategies to maximize customer value.
                      </p>
                    </div>

                    <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                      <div className="flex items-center mb-2">
                        <Target className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-purple-800">Strategic Focus</h4>
                      </div>
                      <p className="text-sm text-purple-700">
                        With {businessData.totalProducts} active products, focus on optimizing your top performers 
                        and consider discontinuing underperforming items to improve overall efficiency.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-[#faa51a]" />
                  AI Business Advisor
                </CardTitle>
                <CardDescription>
                  Ask questions about your business performance and get AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setUserQuestion(question)}
                        className="text-left justify-start h-auto p-3"
                      >
                        <Lightbulb className="h-4 w-4 mr-2 text-[#faa51a]" />
                        {question}
                      </Button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                      placeholder="Ask me anything about your business performance, growth strategies, or optimization opportunities..."
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading || !userQuestion.trim()}
                      className="w-full bg-[#040458] hover:bg-[#040458]/90"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          AI is thinking...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Ask AI
                        </>
                      )}
                    </Button>
                  </form>

                  {aiResponse && (
                    <Card className="bg-gradient-to-r from-[#040458]/5 to-[#faa51a]/5 border-[#faa51a]/20">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Brain className="h-6 w-6 text-[#faa51a] mt-1" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#040458] mb-2">AI Response</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{aiResponse}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AIAnalyticsPage

