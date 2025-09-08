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
  MessageSquare
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
}

interface Invoice {
  id: string
  number: string
  customer: string
  amount: number
  vat: number
  total: number
  date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  balance: number
}

const UnifiedAccountingDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [showCreateCustomer, setShowCreateCustomer] = useState(false)
  const [showAIHelp, setShowAIHelp] = useState(false)

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    customer: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    notes: ''
  })

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  })

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
      
      // Transform QuickBooks data to our format
      const transformedInvoices: Invoice[] = invoicesData.map((inv: any) => ({
        id: inv.Id,
        number: inv.DocNumber,
        customer: inv.CustomerRef?.name || 'Unknown',
        amount: inv.TotalAmt || 0,
        vat: (inv.TotalAmt || 0) * 0.18,
        total: (inv.TotalAmt || 0) * 1.18,
        date: inv.TxnDate,
        status: inv.Balance > 0 ? 'sent' : 'paid'
      }))

      const transformedCustomers: Customer[] = customersData.map((cust: any) => ({
        id: cust.Id,
        name: cust.Name,
        email: cust.PrimaryEmailAddr?.Address || '',
        phone: cust.PrimaryPhone?.FreeFormNumber || '',
        balance: cust.Balance || 0
      }))

      setInvoices(transformedInvoices)
      setCustomers(transformedCustomers)
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
      setInvoiceForm({ customer: '', items: [{ description: '', quantity: 1, price: 0 }], notes: '' })
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
      setCustomerForm({ name: '', email: '', phone: '', company: '' })
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

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-[#040458]" />
          <h2 className="text-xl font-semibold mb-2">Loading Accounting Dashboard</h2>
          <p className="text-gray-600">Fetching data from QuickBooks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-[#040458]">Accounting Dashboard</h1>
                <p className="text-gray-600">Real-time QuickBooks integration with AI assistance</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={loadDashboardData} variant="outline" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="ai-help">AI Help</TabsTrigger>
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
                  <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
                  <CreditCard className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.cashBalance || 0)}
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    Available liquidity
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
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest accounting activities</CardDescription>
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
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Invoices</h2>
                <p className="text-gray-600">Manage your invoices and billing</p>
              </div>
              <Button onClick={() => setShowCreateInvoice(true)} className="bg-[#040458] hover:bg-[#030345]">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VAT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{invoice.number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.customer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(invoice.amount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(invoice.vat)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatCurrency(invoice.total)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Customers</h2>
                <p className="text-gray-600">Manage your customer database</p>
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
                    <CardDescription>{customer.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Phone: {customer.phone}</p>
                      <p className="text-sm font-semibold">
                        Balance: {formatCurrency(customer.balance)}
                      </p>
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
              <p className="text-gray-600">Generate comprehensive financial reports</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-[#040458]" />
                    Profit & Loss
                  </CardTitle>
                  <CardDescription>Income statement with VAT breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate P&L
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-green-600" />
                    Balance Sheet
                  </CardTitle>
                  <CardDescription>Assets, liabilities, and equity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Balance Sheet
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    VAT Report
                  </CardTitle>
                  <CardDescription>VAT collected vs paid analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate VAT Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Help Tab */}
          <TabsContent value="ai-help" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">AI Accounting Assistant</h2>
              <p className="text-gray-600">Get intelligent help with your accounting questions</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-[#040458]" />
                  Ask AI Assistant
                </CardTitle>
                <CardDescription>Ask any accounting question and get AI-powered answers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ai-question">Your Question</Label>
                    <Textarea
                      id="ai-question"
                      placeholder="e.g., How do I calculate VAT for my invoices? What's the best way to track expenses?"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={handleAIHelp} 
                    disabled={loading || !aiQuestion.trim()}
                    className="bg-[#040458] hover:bg-[#030345]"
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Invoice Modal */}
      <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Create a new invoice with automatic VAT calculation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                value={invoiceForm.customer}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, customer: e.target.value })}
                placeholder="Customer name"
              />
            </div>
            
            <div>
              <Label>Items</Label>
              {invoiceForm.items.map((item, index) => (
                <div key={index} className="flex space-x-2 mt-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...invoiceForm.items]
                      newItems[index].description = e.target.value
                      setInvoiceForm({ ...invoiceForm, items: newItems })
                    }}
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
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInvoiceForm({
                  ...invoiceForm,
                  items: [...invoiceForm.items, { description: '', quantity: 1, price: 0 }]
                })}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
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
            <DialogDescription>Add a new customer to your database</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={customerForm.company}
                onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
                placeholder="Company name"
              />
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
    </div>
  )
}

export default UnifiedAccountingDashboard

