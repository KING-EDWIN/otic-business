import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  FileText,
  Calculator,
  PieChart
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserInfo } from '@/utils/userUtils'
import { toast } from 'sonner'

interface FinancialData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  grossProfit: number
  taxCollected: number
  invoiceCount: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
}

interface ReportData {
  period: string
  revenue: number
  expenses: number
  profit: number
  invoices: number
}

const FinancialReports: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedReport, setSelectedReport] = useState('profit-loss')

  useEffect(() => {
    loadFinancialData()
    loadReportData()
  }, [selectedPeriod])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) return

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(selectedPeriod))

      // Get invoices data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userInfo.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (invoicesError) throw invoicesError

      // Get sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('user_id', userInfo.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (salesError) throw salesError

      // Get expenses data
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userInfo.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (expensesError) throw expensesError

      // Calculate totals
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
      const salesRevenue = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0
      const totalRevenueCombined = totalRevenue + salesRevenue
      
      const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0
      const grossProfit = totalRevenueCombined - totalExpenses
      const taxCollected = invoices?.reduce((sum, inv) => sum + (inv.tax_amount || 0), 0) || 0
      const netProfit = grossProfit - taxCollected

      const invoiceCount = invoices?.length || 0
      const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0
      const pendingInvoices = invoices?.filter(inv => inv.status === 'sent').length || 0
      const overdueInvoices = invoices?.filter(inv => inv.status === 'overdue').length || 0

      setFinancialData({
        totalRevenue: totalRevenueCombined,
        totalExpenses,
        netProfit,
        grossProfit,
        taxCollected,
        invoiceCount,
        paidInvoices,
        pendingInvoices,
        overdueInvoices
      })
    } catch (error) {
      console.error('Error loading financial data:', error)
      toast.error('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }

  const loadReportData = async () => {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) return

      const days = parseInt(selectedPeriod)
      const reportData: ReportData[] = []

      for (let i = days; i >= 0; i -= Math.max(1, Math.floor(days / 7))) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        // Get data for this day
        const { data: invoices } = await supabase
          .from('invoices')
          .select('total, tax_amount')
          .eq('user_id', userInfo.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())

        const { data: sales } = await supabase
          .from('sales')
          .select('total_amount')
          .eq('user_id', userInfo.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())

        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', userInfo.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())

        const revenue = (invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0) + 
                       (sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0)
        const expensesTotal = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0
        const profit = revenue - expensesTotal

        reportData.push({
          period: date.toLocaleDateString(),
          revenue,
          expenses: expensesTotal,
          profit,
          invoices: invoices?.length || 0
        })
      }

      setReportData(reportData)
    } catch (error) {
      console.error('Error loading report data:', error)
    }
  }

  const generateReport = (reportType: string) => {
    if (!financialData) return

    let content = ''
    const period = selectedPeriod === '30' ? 'Last 30 Days' : 
                  selectedPeriod === '90' ? 'Last 90 Days' : 
                  selectedPeriod === '365' ? 'Last Year' : 'Custom Period'

    switch (reportType) {
      case 'profit-loss':
        content = `
PROFIT & LOSS STATEMENT
Period: ${period}
Generated: ${new Date().toLocaleDateString()}

REVENUE
Total Revenue: ${formatCurrency(financialData.totalRevenue)}

EXPENSES
Total Expenses: ${formatCurrency(financialData.totalExpenses)}

PROFIT
Gross Profit: ${formatCurrency(financialData.grossProfit)}
Tax Collected: ${formatCurrency(financialData.taxCollected)}
Net Profit: ${formatCurrency(financialData.netProfit)}

INVOICE SUMMARY
Total Invoices: ${financialData.invoiceCount}
Paid Invoices: ${financialData.paidInvoices}
Pending Invoices: ${financialData.pendingInvoices}
Overdue Invoices: ${financialData.overdueInvoices}
        `
        break

      case 'balance-sheet':
        content = `
BALANCE SHEET
Period: ${period}
Generated: ${new Date().toLocaleDateString()}

ASSETS
Cash: ${formatCurrency(financialData.totalRevenue * 0.8)}
Accounts Receivable: ${formatCurrency(financialData.totalRevenue * 0.2)}
Total Assets: ${formatCurrency(financialData.totalRevenue)}

LIABILITIES
Accounts Payable: ${formatCurrency(financialData.totalExpenses * 0.3)}
Tax Payable: ${formatCurrency(financialData.taxCollected)}
Total Liabilities: ${formatCurrency(financialData.totalExpenses * 0.3 + financialData.taxCollected)}

EQUITY
Retained Earnings: ${formatCurrency(financialData.netProfit)}
Total Equity: ${formatCurrency(financialData.netProfit)}
        `
        break

      case 'cash-flow':
        content = `
CASH FLOW STATEMENT
Period: ${period}
Generated: ${new Date().toLocaleDateString()}

CASH FROM OPERATIONS
Revenue: ${formatCurrency(financialData.totalRevenue)}
Expenses: ${formatCurrency(financialData.totalExpenses)}
Net Operating Cash: ${formatCurrency(financialData.grossProfit)}

CASH FROM INVESTING
Equipment Purchases: ${formatCurrency(financialData.totalExpenses * 0.1)}
Net Investing Cash: ${formatCurrency(-financialData.totalExpenses * 0.1)}

NET CASH FLOW: ${formatCurrency(financialData.grossProfit - financialData.totalExpenses * 0.1)}
        `
        break
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}-${period.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success(`${reportType.replace('-', ' ').toUpperCase()} report downloaded!`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">Loading financial data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-gray-600">Comprehensive financial analysis and reporting</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial Overview Cards */}
      {financialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialData.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {financialData.invoiceCount} invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialData.totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                Operating costs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(financialData.netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">
                After all expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Collected</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialData.taxCollected)}</div>
              <p className="text-xs text-muted-foreground">
                VAT collected
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Download comprehensive financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => generateReport('profit-loss')} 
              className="h-20 flex flex-col"
              variant="outline"
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              Profit & Loss
            </Button>
            <Button 
              onClick={() => generateReport('balance-sheet')} 
              className="h-20 flex flex-col"
              variant="outline"
            >
              <FileText className="h-6 w-6 mb-2" />
              Balance Sheet
            </Button>
            <Button 
              onClick={() => generateReport('cash-flow')} 
              className="h-20 flex flex-col"
              variant="outline"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              Cash Flow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Revenue and profit trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Invoices</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.slice(-7).map((data, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{data.period}</TableCell>
                  <TableCell>{formatCurrency(data.revenue)}</TableCell>
                  <TableCell>{formatCurrency(data.expenses)}</TableCell>
                  <TableCell>
                    <span className={data.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(data.profit)}
                    </span>
                  </TableCell>
                  <TableCell>{data.invoices}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default FinancialReports

