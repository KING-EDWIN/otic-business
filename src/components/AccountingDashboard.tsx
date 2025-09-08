import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Plus,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { getAccountingService } from '@/services/accountingService'
import CreateInvoiceModal from './CreateInvoiceModal'
import CreateExpenseModal from './CreateExpenseModal'
import ReportsModal from './ReportsModal'

interface AccountingStats {
  totalInvoices: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  overdueInvoices: number
  recentTransactions: any[]
}

const AccountingDashboard: React.FC = () => {
  const [stats, setStats] = useState<AccountingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    
    try {
      const accountingService = getAccountingService()
      // Fetching accounting stats from Supabase
      const data = await accountingService.getDashboardStats()
      // Accounting stats received
      setStats(data)
    } catch (err) {
      setError('Failed to load accounting data')
      console.error('Accounting error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleExport = async () => {
    try {
      const accountingService = getAccountingService()
      const blob = await accountingService.exportData('csv')
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `accounting-data-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  // Remove the old handleViewReports function - now handled by ReportsModal

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Accounting Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-[#040458]">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-[#040458]">
                  {formatCurrency(stats?.totalExpenses || 0)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${(stats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats?.netProfit || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Invoices</p>
                <p className="text-2xl font-bold text-[#040458]">
                  {stats?.totalInvoices || 0}
                </p>
                {stats?.overdueInvoices && stats.overdueInvoices > 0 && (
                  <p className="text-xs text-red-600">
                    {stats.overdueInvoices} overdue
                  </p>
                )}
              </div>
              <FileText className="h-8 w-8 text-[#faa51a]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#040458]">Recent Transactions</CardTitle>
              <CardDescription>
                Latest invoices and expenses
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <CreateInvoiceModal onInvoiceCreated={() => fetchStats()}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </CreateInvoiceModal>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'invoice' ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'invoice' ? (
                        <FileText className="h-4 w-4 text-blue-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[#040458]">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No transactions found</p>
              <CreateInvoiceModal onInvoiceCreated={() => fetchStats()}>
                <Button className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Invoice
                </Button>
              </CreateInvoiceModal>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CreateInvoiceModal onInvoiceCreated={() => fetchStats()}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Plus className="h-8 w-8 mx-auto text-[#faa51a] mb-3" />
              <h3 className="font-semibold text-[#040458] mb-2">Create Invoice</h3>
              <p className="text-sm text-gray-600">Generate new invoice for customers</p>
            </CardContent>
          </Card>
        </CreateInvoiceModal>

        <CreateExpenseModal onExpenseCreated={() => fetchStats()}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <TrendingDown className="h-8 w-8 mx-auto text-[#faa51a] mb-3" />
              <h3 className="font-semibold text-[#040458] mb-2">Add Expense</h3>
              <p className="text-sm text-gray-600">Record business expenses</p>
            </CardContent>
          </Card>
        </CreateExpenseModal>

        <ReportsModal>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 mx-auto text-[#faa51a] mb-3" />
              <h3 className="font-semibold text-[#040458] mb-2">View Reports</h3>
              <p className="text-sm text-gray-600">Financial reports and analytics</p>
            </CardContent>
          </Card>
        </ReportsModal>
      </div>
    </div>
  )
}

export default AccountingDashboard
