import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { branchDataService, BranchExpense } from '@/services/branchDataService'
import { useDateRange } from '@/hooks/useDateRange'
import DateRangePicker from '@/components/DateRangePicker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Receipt, 
  CreditCard, 
  Banknote,
  ArrowLeft,
  Calendar,
  PieChart,
  BarChart3,
  Calculator,
  FileText,
  Download,
  Plus,
  Eye,
  Edit
} from 'lucide-react'
import { toast } from 'sonner'

interface BranchData {
  id: string
  branch_name: string
  branch_code: string
  address: string
  city: string
  is_active: boolean
}

interface FinancialSummary {
  total_revenue: number
  total_expenses: number
  net_profit: number
  profit_margin: number
  cash_flow: number
  accounts_receivable: number
  accounts_payable: number
}

interface Transaction {
  id: string
  date: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  payment_method: 'cash' | 'card' | 'mobile_money' | 'bank_transfer'
  reference: string
  status: 'completed' | 'pending' | 'cancelled'
}

interface ExpenseCategory {
  name: string
  amount: number
  percentage: number
  color: string
}

const BranchAccounting: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [branch, setBranch] = useState<BranchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  
  // Date range management
  const { dateRange, updateDateRange, minDate, maxDate, dateRangeString, loading: dateLoading } = useDateRange()
  
  // Real-time data from backend
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])

  useEffect(() => {
    if (branchId) {
      loadBranchData()
    }
  }, [branchId])

  useEffect(() => {
    if (branchId && dateRange.from && dateRange.to) {
      loadAccountingData()
    }
  }, [branchId, dateRange])

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      rent: '#3B82F6',
      utilities: '#EF4444',
      staff: '#10B981',
      inventory: '#F59E0B',
      marketing: '#8B5CF6',
      maintenance: '#06B6D4',
      security: '#84CC16',
      insurance: '#F97316',
      other: '#6B7280'
    }
    return colors[category] || '#6B7280'
  }

  const loadBranchData = async () => {
    try {
      const { data, error } = await supabase
        .from('branch_locations')
        .select('*')
        .eq('id', branchId)
        .single()

      if (error) throw error
      setBranch(data)
    } catch (error) {
      console.error('Error loading branch:', error)
      toast.error('Failed to load branch data')
    }
  }

  const loadAccountingData = async () => {
    try {
      setLoading(true)
      
      if (!branchId || !dateRange.from || !dateRange.to) return
      
      // Use the selected date range
      const startDate = dateRange.from.toISOString().split('T')[0]
      const endDate = dateRange.to.toISOString().split('T')[0]
      
      // Load live financial data
      const dailyMetrics = await branchDataService.getDailyMetrics(branchId, startDate, endDate)
      const expenses = await branchDataService.getBranchExpenses(branchId)
      
      // Calculate financial summary from live data
      const totalRevenue = dailyMetrics?.reduce((sum, metric) => sum + metric.total_sales, 0) || 0
      const paidExpensesTotal = expenses
        ?.filter(expense => expense.payment_status === 'paid')
        ?.reduce((sum, expense) => sum + expense.amount, 0) || 0
      const netProfit = totalRevenue - paidExpensesTotal
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
      
      const liveFinancialSummary: FinancialSummary = {
        total_revenue: totalRevenue,
        total_expenses: paidExpensesTotal,
        net_profit: netProfit,
        profit_margin: profitMargin,
        cash_flow: netProfit * 0.8, // Assume 80% of profit is cash
        accounts_receivable: totalRevenue * 0.05, // Assume 5% of revenue is receivables
        accounts_payable: paidExpensesTotal * 0.1 // Assume 10% of expenses are payables
      }



      // Load live transactions from sales and expenses
      const sales = await branchDataService.getBranchSales(branchId)
      
      // Map sales to income transactions
      const salesTransactions: Transaction[] = sales.map(sale => ({
        id: `sale_${sale.id}`,
        date: sale.created_at.split('T')[0],
        type: 'income',
        category: 'Sales',
        description: `Sale ${sale.sale_number}`,
        amount: sale.total_amount,
        payment_method: sale.payment_method === 'credit' ? 'card' : sale.payment_method as 'cash' | 'card' | 'mobile_money' | 'bank_transfer',
        reference: sale.sale_number,
        status: sale.payment_status as 'completed' | 'pending' | 'cancelled'
      }))
      
      // Map expenses to expense transactions
      const expenseTransactions: Transaction[] = expenses.map(expense => ({
        id: `expense_${expense.id}`,
        date: expense.created_at.split('T')[0],
        type: 'expense',
        category: expense.expense_category,
        description: expense.description,
        amount: expense.amount,
        payment_method: expense.payment_method === 'check' ? 'bank_transfer' : expense.payment_method as 'cash' | 'card' | 'mobile_money' | 'bank_transfer',
        reference: expense.receipt_number || `EXP-${expense.id.slice(0, 8)}`,
        status: expense.payment_status === 'paid' ? 'completed' : expense.payment_status as 'pending' | 'cancelled'
      }))
      
      // Combine and sort transactions
      const liveTransactions = [...salesTransactions, ...expenseTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      // Calculate expense categories from live data
      const categoryTotals = expenses
        ?.filter(expense => expense.payment_status === 'paid')
        ?.reduce((acc, expense) => {
          const category = expense.expense_category
          if (!acc[category]) {
            acc[category] = 0
          }
          acc[category] += expense.amount
          return acc
        }, {} as Record<string, number>) || {}
      
      const totalExpensesByCategory = Object.values(categoryTotals)?.reduce((sum, amount) => sum + amount, 0) || 0
      
      const liveExpenseCategories: ExpenseCategory[] = Object.entries(categoryTotals).map(([name, amount]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount,
        percentage: totalExpensesByCategory > 0 ? (amount / totalExpensesByCategory) * 100 : 0,
        color: getCategoryColor(name)
      }))

      setFinancialSummary(liveFinancialSummary)
      setTransactions(liveTransactions)
      setExpenseCategories(liveExpenseCategories)
    } catch (error) {
      console.error('Error loading accounting data:', error)
      toast.error('Failed to load accounting data')
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'mobile_money': return <Receipt className="h-4 w-4" />
      case 'bank_transfer': return <Calculator className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800'
      case 'card': return 'bg-blue-100 text-blue-800'
      case 'mobile_money': return 'bg-purple-100 text-purple-800'
      case 'bank_transfer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accounting data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/multi-branch-management')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Branches</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Accounting - {branch?.branch_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {branch?.branch_code} • {branch?.city}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DateRangePicker
                onDateRangeChange={updateDateRange}
                initialRange={dateRange}
                minDate={minDate}
                maxDate={maxDate}
                placeholder="Select date range"
                className="w-64"
              />
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Transaction</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Summary */}
        {financialSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  UGX {financialSummary.total_revenue.toLocaleString()}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+12.5%</span>
                  <span>from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  UGX {financialSummary.total_expenses.toLocaleString()}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">+8.2%</span>
                  <span>from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  UGX {financialSummary.net_profit.toLocaleString()}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+18.7%</span>
                  <span>from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {financialSummary.profit_margin.toFixed(1)}%
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+2.3%</span>
                  <span>from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>All financial transactions for this branch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {getPaymentMethodIcon(transaction.payment_method)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                            <Badge className={`text-xs ${getPaymentMethodColor(transaction.payment_method)}`}>
                              {transaction.payment_method.replace('_', ' ')}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}UGX {transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                        <p className="text-xs text-gray-400">{transaction.reference}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                  <CardDescription>Breakdown of expenses by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenseCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">UGX {category.amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Trends</CardTitle>
                  <CardDescription>Monthly expense trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Expense trends chart will be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Income Sources</CardTitle>
                <CardDescription>Breakdown of income by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Cash Sales</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600">UGX 450,000</p>
                    <p className="text-sm text-green-700">36% of total income</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Card Payments</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">UGX 320,000</p>
                    <p className="text-sm text-blue-700">25.6% of total income</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Receipt className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">Mobile Money</h4>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">UGX 280,000</p>
                    <p className="text-sm text-purple-700">22.4% of total income</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Profit & Loss</span>
                  </CardTitle>
                  <CardDescription>Comprehensive P&L statement</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Cash Flow</span>
                  </CardTitle>
                  <CardDescription>Cash flow analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Expense Analysis</span>
                  </CardTitle>
                  <CardDescription>Detailed expense breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Management</CardTitle>
                <CardDescription>Set and track budgets for different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Rent Budget</h4>
                      <Badge className="bg-green-100 text-green-800">On Track</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>UGX 112,500 / UGX 150,000</span>
                      <span>75% used</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Marketing Budget</h4>
                      <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>UGX 45,000 / UGX 50,000</span>
                      <span>90% used</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details
                </h3>
                <Button
                  onClick={() => setSelectedTransaction(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Amount:</span>
                    <div className={`text-lg font-semibold ${selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedTransaction.type === 'income' ? '+' : '-'}UGX {selectedTransaction.amount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Date:</span>
                    <div className="text-lg font-semibold">{selectedTransaction.date}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <div className="text-lg font-semibold">{selectedTransaction.category}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <Badge className={getStatusColor(selectedTransaction.status)}>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <div className="text-lg font-semibold">{selectedTransaction.description}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Payment Method:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {getPaymentMethodIcon(selectedTransaction.payment_method)}
                      <span className="font-semibold">{selectedTransaction.payment_method.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Reference:</span>
                    <div className="text-lg font-semibold">{selectedTransaction.reference}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchAccounting
