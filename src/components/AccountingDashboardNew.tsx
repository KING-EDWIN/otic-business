import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Building2,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Edit,
  Send,
  Calculator,
  PieChart,
  BarChart3
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts'

const AccountingDashboardNew: React.FC = () => {
  const financialData = {
    netIncome: -17500,
    totalRevenue: 500,
    totalExpenses: 18000,
    bankBalance: 922050,
    checkingBalance: 153300,
    creditCardBalance: -500,
    unpaidInvoices: 147344,
    overdueInvoices: 147344,
    paidInvoices: 0,
    totalSales: 0
  }

  const expenseBreakdown = [
    { name: 'Online Marketing', amount: 10000, percentage: 55.6 },
    { name: 'Subscriptions', amount: 6000, percentage: 33.3 },
    { name: 'Depreciation', amount: 2000, percentage: 11.1 }
  ]

  const salesData = [
    { month: 'Jan', sales: 0 },
    { month: 'Feb', sales: 0 },
    { month: 'Mar', sales: 0 },
    { month: 'Apr', sales: 0 },
    { month: 'May', sales: 0 },
    { month: 'Jun', sales: 0 }
  ]

  const COLORS = ['#faa51a', '#040458', '#10b981', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-6">
      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">1000 Cash on hand</div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Reviewed</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Bank balance: $0</div>
                    <div className="font-semibold text-gray-900">In QuickBooks: ${financialData.bankBalance.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">1010 Checking Account</div>
                  <div className="font-semibold text-gray-900">In QuickBooks: ${financialData.checkingBalance.toLocaleString()}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">2001 Credit Card</div>
                  <div className="font-semibold text-red-600">In QuickBooks: ${financialData.creditCardBalance.toLocaleString()}</div>
                </div>
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
      </div>

      {/* Capital Section */}
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
    </div>
  )
}

export default AccountingDashboardNew
