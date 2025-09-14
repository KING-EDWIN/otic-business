import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  CreditCard,
  PiggyBank,
  Target,
  Plus,
  ArrowRight,
  LogOut,
  Settings,
  BarChart3,
  PieChart,
  Receipt,
  Wallet
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import IndividualLoginStatus from '@/components/IndividualLoginStatus'
import BusinessSwitcher from '@/components/BusinessSwitcher'
import InvitationNotification from '@/components/InvitationNotification'

interface Expense {
  id: string
  category: string
  amount: number
  description: string
  date: string
  type: 'expense' | 'income'
}

interface Budget {
  category: string
  budgeted: number
  spent: number
  remaining: number
}

const IndividualDashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  console.log('IndividualDashboard: Component rendered, user:', user?.id)

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        
        // For now, use empty arrays since the individual tables might not exist yet
        // This will show the dashboard structure without data
        console.log('IndividualDashboard: Using empty data for now')
        setExpenses([])
        setBudgets([])
    } catch (error) {
        console.error('Error fetching individual dashboard data:', error)
        // Don't set fallback data - let error state handle this
    } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
  const netIncome = totalIncome - totalExpenses

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  // Chart data
  const monthlyData = [
    { month: 'Jan', income: 2500000, expenses: 395000 },
    { month: 'Feb', income: 2500000, expenses: 420000 },
    { month: 'Mar', income: 2500000, expenses: 380000 },
    { month: 'Apr', income: 2500000, expenses: 450000 },
  ]

  const expenseData = budgets.map(budget => ({
    name: budget.category,
    value: budget.spent,
    color: budget.remaining > 0 ? '#10b981' : '#ef4444'
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
          {/* Header Skeleton */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Welcome Section Skeleton */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Charts Section Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
          </div>
          
            {/* Recent Activity Skeleton */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#faa51a] to-[#040458] rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              <div>
                  <h1 className="text-2xl font-bold text-[#040458]">Personal Finance</h1>
                  <p className="text-sm text-gray-600">Manage your personal finances</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BusinessSwitcher />
              <Button
                variant="outline"
                onClick={() => navigate('/individual-settings')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
              <IndividualLoginStatus />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Business Invitations */}
        <div className="mb-8">
          <InvitationNotification />
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-3xl font-bold text-green-600">UGX {totalIncome.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
      </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600">UGX {totalExpenses.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Income</p>
                  <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    UGX {netIncome.toLocaleString()}
                  </p>
                </div>
                <div className={`w-12 h-12 ${netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                  <DollarSign className={`h-6 w-6 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                  <p className="text-3xl font-bold text-[#040458]">
                    {totalIncome > 0 ? Math.round((netIncome / totalIncome) * 100) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Income vs Expenses Chart */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-[#faa51a]" />
                <span>Income vs Expenses</span>
              </CardTitle>
              <CardDescription>Monthly overview of your finances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, '']} />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expense Categories Chart */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-6 w-6 text-[#faa51a]" />
                <span>Expense Categories</span>
              </CardTitle>
              <CardDescription>Breakdown of your spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, '']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
                </div>

        {/* Budget Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-[#faa51a]" />
                <span>Budget Overview</span>
              </CardTitle>
              <CardDescription>Track your spending against budget</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {budgets.map((budget, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{budget.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          UGX {budget.spent.toLocaleString()} / UGX {budget.budgeted.toLocaleString()}
                        </span>
                        <Badge variant={budget.remaining >= 0 ? "default" : "destructive"}>
                          {budget.remaining >= 0 ? 'On Track' : 'Over Budget'}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${budget.remaining >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, (budget.spent / budget.budgeted) * 100)}%` }}
                      ></div>
                      </div>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-6 w-6 text-[#faa51a]" />
                <span>Recent Transactions</span>
              </CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        expense.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {expense.type === 'income' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                </div>
                        <div>
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-500">{expense.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {expense.type === 'income' ? '+' : '-'}UGX {expense.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">{expense.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-6 w-6 text-[#faa51a]" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Common financial tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm font-medium">Add Income</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                <TrendingDown className="h-6 w-6" />
                <span className="text-sm font-medium">Add Expense</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                <Target className="h-6 w-6" />
                <span className="text-sm font-medium">Set Budget</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm font-medium">View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default IndividualDashboard