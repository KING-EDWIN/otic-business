import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { branchDataService, type BranchInventory } from '@/services/branchDataService'
import { useDateRange } from '@/hooks/useDateRange'
import DateRangePicker from '@/components/DateRangePicker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Plus, 
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  BarChart3,
  PieChart
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

interface BranchProduct {
  id: string
  product_id: string
  product_name: string
  brand_name: string
  barcode: string
  sku: string
  current_stock: number
  minimum_stock: number
  maximum_stock: number
  unit_price: number
  cost_price: number
  category: string
  supplier: string
  last_restocked: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'
}

interface StockMovement {
  id: string
  product_id: string
  product_name: string
  movement_type: 'in' | 'out' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'return' | 'damage' | 'expired'
  quantity: number
  reason: string
  reference: string
  created_at: string
  created_by: string
}

const BranchInventory: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [branch, setBranch] = useState<BranchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<BranchProduct | null>(null)
  
  // Date range management
  const { dateRange, updateDateRange, minDate, maxDate, dateRangeString, loading: dateLoading } = useDateRange()
  
  // Live data from backend
  const [products, setProducts] = useState<BranchProduct[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])

  useEffect(() => {
    if (branchId) {
      loadBranchData()
      loadInventoryData()
      loadStockMovements()
    }
  }, [branchId, dateRange])

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

  const loadInventoryData = async () => {
    try {
      setLoading(true)
      
      // Load live inventory data only
      const liveInventory = await branchDataService.getBranchInventory(branchId)
      
      // Map live inventory to expected format
      const mappedProducts: BranchProduct[] = liveInventory.map(item => ({
        id: item.id,
        product_id: item.product_id,
        product_name: 'Unknown Product', // Would need to join with products table
        brand_name: 'Unknown Brand',
        barcode: 'N/A',
        sku: 'N/A',
        current_stock: item.current_stock,
        minimum_stock: item.minimum_stock,
        maximum_stock: item.maximum_stock,
        unit_price: item.selling_price,
        cost_price: item.cost_price,
        category: 'Uncategorized',
        supplier: 'Unknown',
        last_restocked: item.last_restocked?.split('T')[0] || 'Never',
        status: item.current_stock === 0 ? 'out_of_stock' : 
                item.current_stock <= item.minimum_stock ? 'low_stock' : 'in_stock'
      }))

      setProducts(mappedProducts)
    } catch (error) {
      console.error('Error loading inventory data:', error)
      toast.error('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  const loadStockMovements = async () => {
    try {
      // Load live stock movements only
      const liveMovements = await branchDataService.getInventoryMovements(branchId)
      
      // Map live movements to expected format
      const mappedMovements: StockMovement[] = liveMovements.map(movement => ({
        id: movement.id,
        product_id: movement.product_id,
        product_name: 'Product', // This would need to be joined with products table
        movement_type: movement.movement_type,
        quantity: movement.quantity,
        reason: movement.reason || 'No reason provided',
        reference: movement.reference_number || 'N/A',
        created_at: movement.created_at,
        created_by: movement.created_by || 'System'
      }))

      setStockMovements(mappedMovements)
    } catch (error) {
      console.error('Error loading stock movements:', error)
      toast.error('Failed to load stock movements')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      case 'overstock': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'low_stock': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'out_of_stock': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'overstock': return <TrendingUp className="h-4 w-4 text-blue-500" />
      default: return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'in': return 'bg-green-100 text-green-800'
      case 'out': return 'bg-red-100 text-red-800'
      case 'transfer_in': return 'bg-blue-100 text-blue-800'
      case 'transfer_out': return 'bg-orange-100 text-orange-800'
      case 'adjustment': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getTotalValue = () => {
    return products.reduce((sum, product) => sum + (product.current_stock * product.unit_price), 0)
  }

  const getLowStockCount = () => {
    return products.filter(product => product.status === 'low_stock' || product.status === 'out_of_stock').length
  }

  const getOverstockCount = () => {
    return products.filter(product => product.status === 'overstock').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
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
                  Inventory - {branch?.branch_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {branch?.branch_code} • {branch?.city}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                Active inventory items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">UGX {getTotalValue().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Current stock value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{getLowStockCount()}</div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overstock</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{getOverstockCount()}</div>
              <p className="text-xs text-muted-foreground">
                Items over maximum
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="movements">Stock Movements</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <DateRangePicker
                    onDateRangeChange={updateDateRange}
                    initialRange={dateRange}
                    minDate={minDate}
                    maxDate={maxDate}
                    placeholder="Select date range"
                    className="w-64"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="overstock">Overstock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Products List */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Products</CardTitle>
                <CardDescription>Manage your branch inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{product.product_name}</h4>
                          <p className="text-sm text-gray-500">{product.brand_name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(product.status)}
                          <Badge className={getStatusColor(product.status)}>
                            {product.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold">UGX {product.unit_price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          Stock: {product.current_stock} / {product.maximum_stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Movements Tab */}
          <TabsContent value="movements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Movements</CardTitle>
                <CardDescription>Track all inventory movements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stockMovements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          movement.movement_type === 'in' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {movement.movement_type === 'in' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{movement.product_name}</h4>
                          <p className="text-sm text-gray-500">{movement.reason}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getMovementTypeColor(movement.movement_type)}>
                              {movement.movement_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-gray-500">Ref: {movement.reference}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(movement.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">{movement.created_by}</p>
                      </div>
                    </div>
                  ))}
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
                    <BarChart3 className="h-5 w-5" />
                    <span>Stock Report</span>
                  </CardTitle>
                  <CardDescription>Current stock levels and values</CardDescription>
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
                    <span>Category Analysis</span>
                  </CardTitle>
                  <CardDescription>Inventory breakdown by category</CardDescription>
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
                    <TrendingUp className="h-5 w-5" />
                    <span>Movement Report</span>
                  </CardTitle>
                  <CardDescription>Stock movement trends</CardDescription>
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

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>Important notifications about your inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-red-900">Out of Stock</h4>
                    </div>
                    <p className="text-sm text-red-800">
                      Milk 1L is completely out of stock. Consider placing an urgent order.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-900">Low Stock Warning</h4>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Bread Loaf is running low (8 units remaining). Restock soon to avoid stockouts.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Overstock Alert</h4>
                    </div>
                    <p className="text-sm text-blue-800">
                      Rice 5kg is overstocked (120 units, max: 50). Consider reducing order quantity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Details
                </h3>
                <Button
                  onClick={() => setSelectedProduct(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Product Name:</span>
                    <div className="text-lg font-semibold">{selectedProduct.product_name}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Brand:</span>
                    <div className="text-lg font-semibold">{selectedProduct.brand_name}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Current Stock:</span>
                    <div className="text-lg font-semibold">{selectedProduct.current_stock}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <Badge className={getStatusColor(selectedProduct.status)}>
                      {selectedProduct.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Unit Price:</span>
                    <div className="text-lg font-semibold">UGX {selectedProduct.unit_price.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Cost Price:</span>
                    <div className="text-lg font-semibold">UGX {selectedProduct.cost_price.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Barcode:</span>
                    <div className="text-lg font-semibold">{selectedProduct.barcode}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">SKU:</span>
                    <div className="text-lg font-semibold">{selectedProduct.sku}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <div className="text-lg font-semibold">{selectedProduct.category}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Supplier:</span>
                    <div className="text-lg font-semibold">{selectedProduct.supplier}</div>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-6">
                  <Button className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Adjust Stock
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchInventory
