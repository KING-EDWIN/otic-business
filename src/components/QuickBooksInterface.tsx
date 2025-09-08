import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Users, 
  Package, 
  DollarSign, 
  Plus,
  Search,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { sandboxQuickBooksService } from '@/services/sandboxQuickBooksService'
import { posQuickBooksIntegration } from '@/services/posQuickBooksIntegration'
import InvoiceManager from './InvoiceManager'
import FinancialReports from './FinancialReports'

interface QuickBooksInterfaceProps {
  isConnected: boolean
  onConnectionChange: (connected: boolean) => void
}

const QuickBooksInterface: React.FC<QuickBooksInterfaceProps> = ({ isConnected, onConnectionChange }) => {
  const [activeTab, setActiveTab] = useState('invoices')
  const [loading, setLoading] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [syncStatus, setSyncStatus] = useState<any>(null)

  useEffect(() => {
    if (isConnected) {
      loadQuickBooksData()
      loadSyncStatus()
    }
  }, [isConnected])

  const loadQuickBooksData = async () => {
    try {
      setLoading(true)
      const [invoicesData, customersData, itemsData] = await Promise.all([
        sandboxQuickBooksService.getInvoices(),
        sandboxQuickBooksService.getCustomers(),
        sandboxQuickBooksService.getItems()
      ])

      setInvoices(invoicesData?.QueryResponse?.Invoice || [])
      setCustomers(customersData?.QueryResponse?.Customer || [])
      setItems(itemsData?.QueryResponse?.Item || [])
    } catch (error) {
      console.error('Error loading QuickBooks data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSyncStatus = async () => {
    try {
      const status = await posQuickBooksIntegration.getSyncStatus()
      setSyncStatus(status)
    } catch (error) {
      console.error('Error loading sync status:', error)
    }
  }

  const handleSyncAll = async () => {
    try {
      setLoading(true)
      const [productsResult, customersResult, salesResult] = await Promise.all([
        posQuickBooksIntegration.syncAllProducts(),
        posQuickBooksIntegration.syncAllCustomers(),
        posQuickBooksIntegration.syncAllSales()
      ])

      console.log('Sync completed:', { productsResult, customersResult, salesResult })
      await loadSyncStatus()
      await loadQuickBooksData()
    } catch (error) {
      console.error('Error syncing data:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>QuickBooks Integration</CardTitle>
          <CardDescription>Connect to QuickBooks to access advanced accounting features</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">QuickBooks not connected</p>
          <Button onClick={() => window.location.href = '/accounting'}>
            Go to Connection Settings
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sync Status */}
      {syncStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2" />
              Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{syncStatus.products.synced}</div>
                <div className="text-sm text-gray-600">Products Synced</div>
                <div className="text-xs text-gray-500">{syncStatus.products.pending} pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{syncStatus.customers.synced}</div>
                <div className="text-sm text-gray-600">Customers Synced</div>
                <div className="text-xs text-gray-500">{syncStatus.customers.pending} pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{syncStatus.sales.synced}</div>
                <div className="text-sm text-gray-600">Sales Synced</div>
                <div className="text-xs text-gray-500">{syncStatus.sales.pending} pending</div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button onClick={handleSyncAll} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Syncing...' : 'Sync All Data'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QuickBooks Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceManager />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customers</CardTitle>
                  <CardDescription>Manage your QuickBooks customers</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading customers...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.Id}>
                        <TableCell className="font-medium">{customer.Name}</TableCell>
                        <TableCell>{customer.CompanyName || 'N/A'}</TableCell>
                        <TableCell>{customer.PrimaryEmailAddr?.Address || 'N/A'}</TableCell>
                        <TableCell>{customer.PrimaryPhone?.FreeFormNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Items</CardTitle>
                  <CardDescription>Manage your QuickBooks inventory items</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading items...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.Id}>
                        <TableCell className="font-medium">{item.Name}</TableCell>
                        <TableCell>{item.Sku || 'N/A'}</TableCell>
                        <TableCell>{formatCurrency(item.UnitPrice || 0)}</TableCell>
                        <TableCell>{item.QtyOnHand || 0}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.Type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default QuickBooksInterface
