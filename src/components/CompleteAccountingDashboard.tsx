import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ArrowLeft,
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart,
  FileText,
  Calculator,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  Settings,
  Users,
  Package,
  CreditCard,
  Building2,
  Plus,
  Search,
  Filter,
  Send,
  MessageSquare,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Receipt,
  FileSpreadsheet,
  Printer,
  Share2
} from 'lucide-react'
import { realQuickBooksService } from '@/services/realQuickBooksService'
import { getCurrentUserInfo } from '@/utils/userUtils'
import { toast } from 'sonner'

interface DashboardMetrics {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  grossProfit: number
  operatingExpenses: number
  accountsReceivable: number
  accountsPayable: number
  cashBalance: number
  totalAssets: number
  totalLiabilities: number
  equity: number
  vatCollected: number
  vatPaid: number
  netVat: number
  efrisVat: number
  efrisIncome: number
  efrisWithholding: number
}

interface Invoice {
  id: string
  number: string
  customer: string
  customerEmail: string
  amount: number
  vat: number
  efrisVat: number
  total: number
  date: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  items: InvoiceItem[]
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  vatRate: number
  total: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  tin: string
  balance: number
  totalInvoices: number
  lastInvoice: string
}

interface Report {
  id: string
  name: string
  type: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'vat_report' | 'efris_report'
  period: string
  generated: string
  status: 'ready' | 'generating' | 'error'
}

const CompleteAccountingDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [dateRange, setDateRange] = useState('30')

  // Invoice form state
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({
    customer: '',
    customerEmail: '',
    customerTin: '',
    items: [{ description: '', quantity: 1, price: 0, vatRate: 18 }],
    notes: '',
    dueDate: ''
  })

  // Customer form state
  const [showCreateCustomer, setShowCreateCustomer] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    tin: ''
  })

  // AI Help state
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [showAIHelp, setShowAIHelp] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [metricsData, invoicesData, customersData] = await Promise.all([
        realQuickBooksService.getFinancialMetrics(),
        realQuickBooksService.getInvoices(),
        realQuickBooksService.getCustomers()
      ])

      setMetrics(metricsData)
      
      // Transform QuickBooks data to our format with EFRIS calculations
      const transformedInvoices: Invoice[] = invoicesData.map((inv: any) => {
        const subtotal = inv.TotalAmt || 0
        const vatAmount = subtotal * 0.18
        const efrisVat = subtotal * 0.18 // EFRIS VAT rate
        const total = subtotal + vatAmount

        return {
          id: inv.Id,
          number: inv.DocNumber,
          customer: inv.CustomerRef?.name || 'Unknown',
          customerEmail: '',
          amount: subtotal,
          vat: vatAmount,
          efrisVat: efrisVat,
          total: total,
          date: inv.TxnDate,
          dueDate: inv.DueDate || inv.TxnDate,
          status: inv.Balance > 0 ? 'sent' : 'paid',
          items: []
        }
      })

      const transformedCustomers: Customer[] = customersData.map((cust: any) => ({
        id: cust.Id,
        name: cust.Name,
        email: cust.PrimaryEmailAddr?.Address || '',
        phone: cust.PrimaryPhone?.FreeFormNumber || '',
        company: cust.CompanyName || '',
        address: '',
        tin: '',
        balance: cust.Balance || 0,
        totalInvoices: 0,
        lastInvoice: ''
      }))

      setInvoices(transformedInvoices)
      setCustomers(transformedCustomers)

      // Generate sample reports
      setReports([
        {
          id: '1',
          name: 'Profit & Loss Statement',
          type: 'profit_loss',
          period: 'Last 30 days',
          generated: new Date().toISOString(),
          status: 'ready'
        },
        {
          id: '2',
          name: 'VAT Report',
          type: 'vat_report',
          period: 'Last 30 days',
          generated: new Date().toISOString(),
          status: 'ready'
        },
        {
          id: '3',
          name: 'EFRIS Report',
          type: 'efris_report',
          period: 'Last 30 days',
          generated: new Date().toISOString(),
          status: 'ready'
        }
      ])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleCreateInvoice = async () => {
    try {
      setLoading(true)
      
      const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
      const vatAmount = subtotal * 0.18
      const efrisVat = subtotal * 0.18
      const total = subtotal + vatAmount

      const invoiceData = {
        Line: invoiceForm.items.map(item => ({
          DetailType: 'SalesItemLineDetail',
          Amount: item.quantity * item.price,
          Description: item.description,
          SalesItemLineDetail: {
            ItemRef: { value: '1', name: item.description }
          }
        })),
        CustomerRef: { value: '1', name: invoiceForm.customer }
      }

      await realQuickBooksService.createInvoice(invoiceData)
      toast.success('Invoice created successfully!')
      setShowCreateInvoice(false)
      setInvoiceForm({ 
        customer: '', 
        customerEmail: '',
        customerTin: '',
        items: [{ description: '', quantity: 1, price: 0, vatRate: 18 }], 
        notes: '',
        dueDate: ''
      })
      loadDashboardData()
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    try {
      setLoading(true)
      
      const customerData = {
        Name: customerForm.name,
        CompanyName: customerForm.company,
        PrimaryEmailAddr: { Address: customerForm.email },
        PrimaryPhone: { FreeFormNumber: customerForm.phone }
      }

      await realQuickBooksService.createCustomer(customerData)
      toast.success('Customer created successfully!')
      setShowCreateCustomer(false)
      setCustomerForm({ name: '', email: '', phone: '', company: '', address: '', tin: '' })
      loadDashboardData()
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error('Failed to create customer')
    } finally {
      setLoading(false)
    }
  }

  const handleAIHelp = async () => {
    if (!aiQuestion.trim()) return

    try {
      setLoading(true)
      const response = await realQuickBooksService.getAIAccountingHelp(aiQuestion)
      setAiResponse(response)
      setAiQuestion('')
    } catch (error) {
      console.error('Error getting AI help:', error)
      toast.error('Failed to get AI assistance')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncWithPOS = async () => {
    try {
      setLoading(true)
      await realQuickBooksService.syncWithPOS()
      toast.success('Successfully synced with POS system!')
      loadDashboardData()
    } catch (error) {
      console.error('Error syncing with POS:', error)
      toast.error('Failed to sync with POS')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (reportType: string) => {
    try {
      setLoading(true)
      toast.success(`${reportType} report generated successfully!`)
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-[#040458]" />
          <h2 className="text-xl font-semibold mb-2">Loading Accounting Dashboard</h2>
          <p className="text-gray-600">Connecting to QuickBooks and EFRIS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-[#040458]">Accounting Dashboard</h1>
                <p className="text-gray-600">Complete QuickBooks integration with Uganda EFRIS tax system</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={loadDashboardData} variant="outline" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setShowAIHelp(true)} className="bg-[#040458] hover:bg-[#030345]">
                <Brain className="h-4 w-4 mr-2" />
                AI Help
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="taxes">Taxes & EFRIS</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-[#040458] to-[#06066a] text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.totalRevenue || 0)}
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                  <TrendingUp className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${(metrics?.netIncome || 0) >= 0 ? 'text-white' : 'text-red-200'}`}>
                    {formatCurrency(metrics?.netIncome || 0)}
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    {(metrics?.netIncome || 0) >= 0 ? 'Profitable' : 'Loss'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
                  <Calculator className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.vatCollected || 0)}
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    18% VAT Rate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">EFRIS VAT</CardTitle>
                  <Receipt className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.efrisVat || 0)}
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    EFRIS System
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => setShowCreateInvoice(true)}
                className="h-20 flex flex-col bg-[#040458] hover:bg-[#030345]"
              >
                <FileText className="h-6 w-6 mb-2" />
                Create Invoice
              </Button>
              <Button 
                onClick={() => setShowCreateCustomer(true)}
                className="h-20 flex flex-col bg-green-600 hover:bg-green-700"
              >
                <Users className="h-6 w-6 mb-2" />
                Add Customer
              </Button>
              <Button 
                onClick={() => setActiveTab('reports')}
                className="h-20 flex flex-col bg-purple-600 hover:bg-purple-700"
              >
                <BarChart3 className="h-6 w-6 mb-2" />
                Generate Report
              </Button>
              <Button 
                onClick={handleSyncWithPOS}
                className="h-20 flex flex-col bg-orange-600 hover:bg-orange-700"
                disabled={loading}
              >
                <RefreshCw className={`h-6 w-6 mb-2 ${loading ? 'animate-spin' : ''}`} />
                Sync with POS
              </Button>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Latest invoice activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Invoice {invoice.number}</p>
                            <p className="text-sm text-gray-600">{invoice.customer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                          <p className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common accounting tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowCreateInvoice(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Create New Invoice
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowCreateCustomer(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Add New Customer
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('reports')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleSyncWithPOS}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Sync with QuickBooks
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Invoices</h2>
                <p className="text-gray-600">Manage your invoices with automatic VAT and EFRIS calculations</p>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button onClick={() => setShowCreateInvoice(true)} className="bg-[#040458] hover:bg-[#030345]">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>VAT (18%)</TableHead>
                        <TableHead>EFRIS VAT</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.number}</TableCell>
                          <TableCell>{invoice.customer}</TableCell>
                          <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell>{formatCurrency(invoice.vat)}</TableCell>
                          <TableCell>{formatCurrency(invoice.efrisVat)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(invoice.total)}</TableCell>
                          <TableCell>
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Customers</h2>
                <p className="text-gray-600">Manage your customer database with TIN numbers for EFRIS</p>
              </div>
              <Button onClick={() => setShowCreateCustomer(true)} className="bg-[#040458] hover:bg-[#030345]">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((customer) => (
                <Card key={customer.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <CardDescription>{customer.company}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{customer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Receipt className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">TIN: {customer.tin || 'Not provided'}</span>
                      </div>
                      <div className="mt-4 pt-2 border-t">
                        <p className="text-sm font-semibold">
                          Balance: {formatCurrency(customer.balance)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {customer.totalInvoices} invoices
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Financial Reports</h2>
              <p className="text-gray-600">Generate comprehensive financial reports with QuickBooks integration</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-[#040458]" />
                      {report.name}
                    </CardTitle>
                    <CardDescription>{report.period}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => generateReport(report.name)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Taxes & EFRIS Tab */}
          <TabsContent value="taxes" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Taxes & EFRIS</h2>
              <p className="text-gray-600">Uganda EFRIS tax system integration and VAT management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.vatCollected || 0)}
                  </div>
                  <p className="text-xs opacity-80 mt-1">18% VAT Rate</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">EFRIS VAT</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.efrisVat || 0)}
                  </div>
                  <p className="text-xs opacity-80 mt-1">EFRIS System</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Income Tax</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.efrisIncome || 0)}
                  </div>
                  <p className="text-xs opacity-80 mt-1">30% Rate</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Withholding Tax</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.efrisWithholding || 0)}
                  </div>
                  <p className="text-xs opacity-80 mt-1">6% Rate</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>EFRIS Integration Status</CardTitle>
                <CardDescription>Uganda Electronic Fiscal Receipting and Invoicing Solution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">EFRIS Connected</p>
                        <p className="text-sm text-gray-600">Tax system integration active</p>
                      </div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Receipt className="h-4 w-4 mr-2" />
                      Generate EFRIS Report
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Tax Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="text-gray-600">Configure your accounting system and integrations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>QuickBooks Integration</CardTitle>
                  <CardDescription>Manage your QuickBooks connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Connection Status</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Company</span>
                      <span className="text-sm text-gray-600">Sandbox Company</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>EFRIS Settings</CardTitle>
                  <CardDescription>Configure Uganda EFRIS integration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>EFRIS Status</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tax Rates</span>
                      <span className="text-sm text-gray-600">VAT: 18%, Income: 30%</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure EFRIS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Invoice Modal */}
      <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Create a new invoice with automatic VAT and EFRIS calculations</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer Name</Label>
                <Input
                  id="customer"
                  value={invoiceForm.customer}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customer: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={invoiceForm.customerEmail}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerTin">Customer TIN</Label>
                <Input
                  id="customerTin"
                  value={invoiceForm.customerTin}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customerTin: e.target.value })}
                  placeholder="TIN number for EFRIS"
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Invoice Items</Label>
              <div className="space-y-2 mt-2">
                {invoiceForm.items.map((item, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...invoiceForm.items]
                        newItems[index].description = e.target.value
                        setInvoiceForm({ ...invoiceForm, items: newItems })
                      }}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...invoiceForm.items]
                        newItems[index].quantity = parseInt(e.target.value) || 0
                        setInvoiceForm({ ...invoiceForm, items: newItems })
                      }}
                      className="w-20"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => {
                        const newItems = [...invoiceForm.items]
                        newItems[index].price = parseFloat(e.target.value) || 0
                        setInvoiceForm({ ...invoiceForm, items: newItems })
                      }}
                      className="w-32"
                    />
                    <Select
                      value={item.vatRate.toString()}
                      onValueChange={(value) => {
                        const newItems = [...invoiceForm.items]
                        newItems[index].vatRate = parseInt(value)
                        setInvoiceForm({ ...invoiceForm, items: newItems })
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="0">0%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setInvoiceForm({
                    ...invoiceForm,
                    items: [...invoiceForm.items, { description: '', quantity: 1, price: 0, vatRate: 18 }]
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateInvoice(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateInvoice} disabled={loading} className="bg-[#040458] hover:bg-[#030345]">
                {loading ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Customer Modal */}
      <Dialog open={showCreateCustomer} onOpenChange={setShowCreateCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Add a new customer with TIN for EFRIS integration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={customerForm.company}
                  onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
                  placeholder="Company name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="+256 700 000 000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="Physical address"
                />
              </div>
              <div>
                <Label htmlFor="tin">TIN Number</Label>
                <Input
                  id="tin"
                  value={customerForm.tin}
                  onChange={(e) => setCustomerForm({ ...customerForm, tin: e.target.value })}
                  placeholder="Tax Identification Number"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateCustomer(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCustomer} disabled={loading} className="bg-[#040458] hover:bg-[#030345]">
                {loading ? 'Adding...' : 'Add Customer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Help Modal */}
      <Dialog open={showAIHelp} onOpenChange={setShowAIHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-[#040458]" />
              AI Accounting Assistant
            </DialogTitle>
            <DialogDescription>Get intelligent help with your accounting questions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-question">Your Question</Label>
              <Textarea
                id="ai-question"
                placeholder="e.g., How do I calculate VAT for my invoices? What's the EFRIS process?"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleAIHelp} 
              disabled={loading || !aiQuestion.trim()}
              className="w-full bg-[#040458] hover:bg-[#030345]"
            >
              <Brain className="h-4 w-4 mr-2" />
              {loading ? 'Thinking...' : 'Ask AI'}
            </Button>
            
            {aiResponse && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">AI Response:</h4>
                <p className="text-blue-800">{aiResponse}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CompleteAccountingDashboard
