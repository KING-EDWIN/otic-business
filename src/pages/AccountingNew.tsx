import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  CreditCard,
  Building2,
  Users,
  Calculator,
  PieChart,
  BarChart3,
  Settings,
  Search,
  Bell,
  HelpCircle,
  User,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  MoreVertical,
  Plus,
  Download,
  RefreshCw,
  Target,
  Activity,
  Zap,
  Shield,
  Send
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts'
import BusinessLoginStatus from '@/components/BusinessLoginStatus'

const AccountingNew: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [financialData, setFinancialData] = useState({
    netIncome: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    bankBalance: 0,
    checkingBalance: 0,
    creditCardBalance: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
    paidInvoices: 0,
    totalSales: 0
  })

  const [expenseBreakdown, setExpenseBreakdown] = useState([])
  const [salesData, setSalesData] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])

  useEffect(() => {
    if (user?.id) {
      loadFinancialData()
    }
  }, [user?.id])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      
      // Load bank accounts
      const { data: bankAccountsData, error: bankError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
      
      if (bankError) {
        console.log('Bank accounts table might not exist:', bankError.message)
        setBankAccounts([])
      } else {
        setBankAccounts(bankAccountsData || [])
      }
      
      // Load invoices
      const { data: invoicesData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
      
      if (invoiceError) {
        console.log('Invoices table might not exist:', invoiceError.message)
      }
      
      // Load expenses
      const { data: expensesData, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
      
      if (expenseError) {
        console.log('Expenses table might not exist:', expenseError.message)
      }
      
      // Load sales data
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('total, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (salesError) {
        console.log('Sales table might not exist:', salesError.message)
      }
      
      // Calculate financial metrics
      const totalRevenue = invoicesData?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0) || 0
      const totalExpenses = expensesData?.reduce((sum, exp) => sum + exp.amount, 0) || 0
      const netIncome = totalRevenue - totalExpenses
      
      const unpaidInvoices = invoicesData?.filter(inv => inv.status === 'sent' || inv.status === 'draft').reduce((sum, inv) => sum + inv.total_amount, 0) || 0
      const overdueInvoices = invoicesData?.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total_amount, 0) || 0
      const paidInvoices = invoicesData?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0) || 0
      
      // Calculate bank balances
      const bankBalance = bankAccountsData?.find(acc => acc.account_type === 'Cash')?.current_balance || 0
      const checkingBalance = bankAccountsData?.find(acc => acc.account_type === 'Checking')?.current_balance || 0
      const creditCardBalance = bankAccountsData?.find(acc => acc.account_type === 'Credit Card')?.current_balance || 0
      
      // Calculate expense breakdown
      const expenseCategories: { [key: string]: number } = {}
      expensesData?.forEach(expense => {
        if (expenseCategories[expense.category]) {
          expenseCategories[expense.category] += expense.amount
        } else {
          expenseCategories[expense.category] = expense.amount
        }
      })
      
      const totalExpenseAmount = Object.values(expenseCategories).reduce((sum, amount) => sum + amount, 0)
      const expenseBreakdownData = Object.entries(expenseCategories).map(([category, amount]) => ({
        name: category,
        amount: amount,
        percentage: totalExpenseAmount > 0 ? ((amount / totalExpenseAmount) * 100).toFixed(1) : 0
      }))
      
      // Generate sales chart data
      const salesChartData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - (i * 7))
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        
        const weekSales = salesData?.filter(sale => {
          const saleDate = new Date(sale.created_at)
          return saleDate >= weekStart && saleDate <= weekEnd
        }).reduce((sum, sale) => sum + sale.total, 0) || 0
        
        salesChartData.push({
          month: weekStart.toLocaleDateString('en-US', { month: 'short' }),
          sales: weekSales
        })
      }
      
      setFinancialData({
        netIncome,
        totalRevenue,
        totalExpenses,
        bankBalance,
        checkingBalance,
        creditCardBalance,
        unpaidInvoices,
        overdueInvoices,
        paidInvoices,
        totalSales: salesData?.reduce((sum, sale) => sum + sale.total, 0) || 0
      })
      
      setExpenseBreakdown(expenseBreakdownData)
      setSalesData(salesChartData)

    } catch (error) {
      console.error('Error loading financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3, active: true },
    { id: 'banking', label: 'Banking', icon: Building2 },
    { id: 'invoicing', label: 'Invoicing', icon: FileText },
    { id: 'customers', label: 'Customers & leads', icon: Users },
    { id: 'cashflow', label: 'Cash flow', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'payroll', label: 'Payroll', icon: Users },
    { id: 'time', label: 'Time', icon: Clock },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'taxes', label: 'Taxes', icon: Calculator },
    { id: 'mileage', label: 'Mileage', icon: Activity },
    { id: 'accounting', label: 'Accounting', icon: Calculator },
    { id: 'myaccountant', label: 'My accountant', icon: User },
    { id: 'capital', label: 'Capital', icon: Target },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'apps', label: 'Apps', icon: Settings },
    { id: 'insurance', label: 'Insurance', icon: Shield }
  ]

  const COLORS = ['#faa51a', '#040458', '#10b981', '#ef4444', '#8b5cf6']

  // Skeleton components
  const CardSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  )

  const ChartSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </CardHeader>
      <CardContent>
        <div className="h-32 bg-gray-200 rounded"></div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#040458]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <img 
                  src="/Otic icon@2x.png" 
                  alt="Otic Business Logo" 
                  className="h-8 w-8"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Otic Business</h1>
                  <p className="text-sm text-gray-500">Accounting & Finance</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Settings className="h-4 w-4" />
              </Button>
                <BusinessLoginStatus />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-8 w-8"
              />
              <div>
                <h2 className="text-lg font-bold">Accounting</h2>
                <p className="text-xs text-gray-300">Menu</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    item.active 
                      ? 'bg-[#faa51a] text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  <ChevronRight className="h-4 w-4" />
                  </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Action Buttons */}
          <div className="mb-6">
            <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">Get things done</Button>
                <Button variant="default" size="sm" className="bg-[#040458] hover:bg-[#030345]">
                  Business overview
                </Button>
            </div>
          </div>

          {/* Dashboard Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {loading ? (
              <>
                {/* Profit and Loss Skeleton */}
                <Card className="lg:col-span-2 animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expenses Skeleton */}
                <Card className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
            {/* Profit and Loss */}
            <Card className="lg:col-span-2">
              <CardHeader>
                    <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    PROFIT AND LOSS
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Last 30 days</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-red-600">-${Math.abs(financialData.netIncome).toLocaleString()}</div>
                    <div className="flex items-center space-x-2 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">100% categorized</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Income</span>
                      <span className="text-sm font-semibold text-green-600">${financialData.totalRevenue.toLocaleString()}</span>
                      </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expenses</span>
                      <span className="text-sm font-semibold text-red-600">${financialData.totalExpenses.toLocaleString()}</span>
                      </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                      </div>
                  
                  <Button variant="link" className="p-0 text-[#040458] hover:text-[#030345]">
                    See profit and loss report
                  </Button>
                    </div>
                  </CardContent>
                </Card>

            {/* Expenses */}
            <Card>
              <CardHeader>
                    <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    EXPENSES
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Last 30 days</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${financialData.totalExpenses.toLocaleString()}
                  </div>
                  
                  <div className="space-y-2">
                    {expenseBreakdown.map((expense, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">${expense.amount.toLocaleString()}</span>
                        <span className="text-gray-500">({expense.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="w-24 h-24 mx-auto">
                    <RechartsPieChart width={96} height={96}>
                      <RechartsPieChart
                        data={expenseBreakdown}
                        cx={48}
                        cy={48}
                        innerRadius={20}
                        outerRadius={40}
                        dataKey="amount"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
              </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {loading ? (
              <>
                {/* Bank Accounts Skeleton */}
                <Card className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-8 bg-gray-200 rounded w-full"></div>
                        <div className="h-8 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Invoices Skeleton */}
                <Card className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales Skeleton */}
                <Card className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
            {/* Bank Accounts */}
            <Card>
                <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    BANK ACCOUNTS
                  </CardTitle>
                  <Edit className="h-4 w-4 text-gray-400" />
                </div>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
              <div className="space-y-3">
                {bankAccounts.length > 0 ? (
                  bankAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{account.account_name}</div>
                        {account.account_type === 'Cash' && (
                            <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-600">Reviewed</span>
                          </div>
                          )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Bank balance: $0</div>
                        <div className={`font-semibold ${account.current_balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                              In Otic: ${Math.abs(account.current_balance).toLocaleString()}
                        </div>
                  </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No bank accounts found</p>
                    <Button 
                      size="sm" 
                      className="mt-2 bg-[#040458] hover:bg-[#030345] text-white"
                      onClick={() => {/* Add bank account functionality */}}
                    >
                      Add Bank Account
                    </Button>
                  </div>
                )}
              </div>
                  
                  <div className="space-y-2">
                    <Button className="w-full bg-[#040458] hover:bg-[#030345] text-white">
                      Connect accounts
                    </Button>
                    <Button variant="outline" className="w-full">
                      Go to registers
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                    </div>
                    </div>
                  </CardContent>
                </Card>

            {/* Invoices */}
            <Card>
                <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  INVOICES
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                          <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${financialData.unpaidInvoices.toLocaleString()}
                          </div>
                    <div className="text-sm text-gray-600">Last 365 days</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overdue</span>
                      <span className="text-sm font-semibold text-orange-600">${financialData.overdueInvoices.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Not due yet</span>
                      <span className="text-sm font-semibold text-gray-600">$0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Paid</span>
                      <span className="text-sm font-semibold text-gray-600">$0</span>
            </div>
                    <div className="text-xs text-gray-500">Last 30 days</div>
                  </div>
                  </div>
                </CardContent>
              </Card>

            {/* Sales */}
            <Card>
                <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    SALES
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Last 30 days</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
            </div>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${financialData.totalSales.toLocaleString()}
                  </div>
                  
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#faa51a" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
            </div>
                  </div>
                </CardContent>
              </Card>
              </>
            )}
            </div>

          {/* Capital Section */}
          {loading ? (
            <Card className="animate-pulse">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="flex items-center justify-center space-x-8 mt-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  CAPITAL
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-gray-400">
                  Hide
                </Button>
        </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-lg text-gray-900 mb-4">
                  You may be eligible for a loan up to <span className="font-bold text-[#040458]">$150K</span>, 
                  depending on your business health and needs. Conditions apply
      </div>

                <div className="flex items-center justify-center space-x-8 mt-6">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-[#faa51a] rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Start your application</span>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-[#040458] rounded-full flex items-center justify-center">
                      <Send className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Submit application</span>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                    <span className="text-sm text-gray-600">Get a decision</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </main>
            </div>
    </div>
  )
}

export default AccountingNew

