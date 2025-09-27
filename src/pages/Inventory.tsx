import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { DataService } from '@/services/dataService'
import { InventorySkeleton } from '@/components/ui/skeletons'
import OTICVisionRegistration from '@/components/OTICVisionRegistration'
import { supabase } from '@/lib/supabaseClient'

interface Product {
  id: string
  name: string
  description?: string
  barcode: string
  wholesale_barcode?: string
  price: number
  cost: number
  stock: number
  min_stock: number
  category?: string
  supplier?: string
  unit_type?: 'piece' | 'kg' | 'liter' | 'box' | 'pack'
  selling_type?: 'retail' | 'wholesale' | 'both'
  category_id: string | null
  supplier_id: string | null
  user_id: string
  created_at: string
  updated_at: string
  // OTIC Vision specific fields
  brand_name?: string
  product_name?: string
  sku?: string
  weight?: number
  dimensions?: string
  color?: string
  size?: string
  material?: string
  country_of_origin?: string
  is_otic_vision?: boolean
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Barcode,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Eye,
  RefreshCw,
  Filter,
  Download,
  Upload,
  QrCode,
  ShoppingCart,
  Users,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Camera,
  Menu
} from 'lucide-react'
import { toast } from 'sonner'
import BusinessLoginStatus from '@/components/BusinessLoginStatus'

interface ProductFormData {
  name: string
  description: string
  price: string
  cost: string
  stock: string
  min_stock: string
  barcode: string
  wholesale_barcode: string
  category: string
  supplier: string
  unit_type: 'piece' | 'kg' | 'liter' | 'box' | 'pack'
  selling_type: 'retail' | 'wholesale' | 'both'
}

interface LowStockItem {
  id: string
  name: string
  current_stock: number
  min_stock: number
  barcode: string
  price: number
  days_remaining: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

const Inventory = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Debug logging
  console.log('Inventory component render: user =', user?.id ? 'User loaded' : 'No user')
  console.log('Inventory component render: user details =', user)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showOTICVisionRegistration, setShowOTICVisionRegistration] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12) // Show 12 products per page
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsSearching(false)
    }, 300) // 300ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    min_stock: '5',
    barcode: '',
    wholesale_barcode: '',
    category: '',
    supplier: '',
    unit_type: 'piece',
    selling_type: 'retail'
  })

  // Fetch products using DataService - memoized to prevent unnecessary re-renders
  const fetchProducts = useCallback(async () => {
    if (!user?.id) {
      return
    }
    
    try {
      setLoading(true)
      
      // Fetch regular products from DataService
      const regularProducts = await DataService.getProducts(user.id)
      
      // Fetch OTIC Vision products from PVFS system
      const { data: oticVisionProducts, error: oticError } = await supabase
        .from('vft_products')
        .select(`
          id,
          brand_name,
          product_name,
          description,
          price,
          cost,
          stock_quantity,
          barcode,
          sku,
          weight,
          dimensions,
          color,
          size,
          material,
          country_of_origin,
          supplier,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (oticError) {
        console.error('Error fetching OTIC Vision products:', oticError)
        // Continue with regular products only
      }

      // Map OTIC Vision products to match the Product interface
      const mappedOticProducts = (oticVisionProducts || []).map(product => ({
        id: product.id,
        name: `${product.brand_name} ${product.product_name}`,
        barcode: product.barcode || '',
        price: product.price || 0,
        cost: product.cost || 0,
        stock: product.stock_quantity || 0,
        min_stock: 0,
        category_id: null,
        supplier_id: null,
        user_id: user.id,
        created_at: product.created_at,
        updated_at: product.updated_at,
        // Additional OTIC Vision specific fields
        brand_name: product.brand_name,
        product_name: product.product_name,
        description: product.description,
        sku: product.sku,
        weight: product.weight,
        dimensions: product.dimensions,
        color: product.color,
        size: product.size,
        material: product.material,
        country_of_origin: product.country_of_origin,
        supplier: product.supplier,
        is_otic_vision: true // Flag to identify OTIC Vision products
      }))

      // Combine regular products and OTIC Vision products
      const allProducts = [...regularProducts, ...mappedOticProducts]
      
      console.log(`Loaded ${regularProducts.length} regular products and ${mappedOticProducts.length} OTIC Vision products`)
      setProducts(allProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    // Only fetch products when user is available
    if (user?.id) {
    fetchProducts()
    }
  }, [user?.id, fetchProducts]) // Include fetchProducts in dependencies


  const generateBarcode = (prefix: string = 'OTIC') => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${prefix}${timestamp}${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock),
        min_stock: parseInt(formData.min_stock),
        barcode: formData.barcode || generateBarcode(),
        wholesale_barcode: formData.wholesale_barcode || generateBarcode('WHL'),
        category: formData.category,
        supplier: formData.supplier,
        unit_type: formData.unit_type,
        selling_type: formData.selling_type,
        user_id: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (editingProduct) {
        // Update existing product
        await DataService.updateProduct(editingProduct.id, productData)
        toast.success('Product updated successfully!')
      } else {
        // Create new product
        await DataService.createProduct(productData)
        toast.success('Product added successfully!')
      }

      setIsDialogOpen(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      // Delete product using DataService
      await DataService.deleteProduct(productId)
      toast.success('Product deleted successfully!')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      min_stock: product.min_stock?.toString() || '5',
      barcode: product.barcode || '',
      wholesale_barcode: product.wholesale_barcode || '',
      category: product.category || '',
      supplier: product.supplier || '',
      unit_type: product.unit_type || 'piece',
      selling_type: product.selling_type || 'retail'
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      cost: '',
      stock: '',
      min_stock: '5',
      barcode: '',
      wholesale_barcode: '',
      category: '',
      supplier: '',
      unit_type: 'piece',
      selling_type: 'retail'
    })
  }

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300) // 300ms delay
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  // Reset pagination when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleFilterChange = (value: string) => {
    setFilterStatus(value)
    setCurrentPage(1)
  }

  // Memoized low stock items calculation
  const lowStockItems = useMemo(() => {
    return products.filter(product => 
      product.stock <= product.min_stock
    ).map(product => ({
      id: product.id,
      name: product.name,
      current_stock: product.stock,
      min_stock: product.min_stock,
      barcode: product.barcode,
      price: product.price,
      days_remaining: Math.max(0, Math.floor(product.stock / 2)), // Rough estimate
      urgency: (product.stock === 0 ? 'critical' : 
              product.stock <= product.min_stock * 0.5 ? 'high' :
              product.stock <= product.min_stock * 0.8 ? 'medium' : 'low') as 'low' | 'medium' | 'high' | 'critical'
    }))
  }, [products])

  // Memoized filtered products calculation using debounced search
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           product.barcode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    
    if (filterStatus === 'low_stock') {
      return matchesSearch && product.stock <= product.min_stock
    }
    
    return matchesSearch
  })
  }, [products, debouncedSearchTerm, filterStatus])

  // Memoized pagination logic
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }, [filteredProducts, currentPage, itemsPerPage])

  // Memoized pagination info
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1
    
    return {
      totalPages,
      hasNextPage,
      hasPrevPage,
      startItem: (currentPage - 1) * itemsPerPage + 1,
      endItem: Math.min(currentPage * itemsPerPage, filteredProducts.length)
    }
  }, [filteredProducts.length, currentPage, itemsPerPage])

  const getStockStatus = useCallback((stock: number, minStock: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: XCircle }
    if (stock <= minStock) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
    if (stock <= minStock * 2) return { status: 'Medium Stock', color: 'bg-blue-100 text-blue-800', icon: AlertCircle }
    return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  }, [])

  const getUrgencyColor = useCallback((urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-blue-500'
    }
  }, [])

  const downloadBarcode = async (product: Product) => {
    try {
      const barcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${product.barcode}`
      const link = document.createElement('a')
      link.href = barcodeUrl
      link.download = `${product.name}_barcode.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Barcode for ${product.name} downloaded successfully`)
    } catch (error) {
      console.error('Error downloading barcode:', error)
      toast.error('Failed to download barcode')
    }
  }

  const renderProductsGrid = (productsToRender: Product[]) => {
    if (productsToRender.length === 0) {
      return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate('/commodity-registration')}
                className="bg-[#040458] hover:bg-[#040458]/90 text-white"
              >
                <Barcode className="h-4 w-4 mr-2" />
                Register Commodity
              </Button>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
              
              <Button
                onClick={() => setShowOTICVisionRegistration(true)}
                className="bg-[#040458] hover:bg-[#040458]/90 text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                Use Camera
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {productsToRender.map((product) => {
          const stockStatus = getStockStatus(product.stock, product.min_stock)
          const StatusIcon = stockStatus.icon
          
          return (
            <Card key={product.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-4 lg:p-6">
                <div className="space-y-3 lg:space-y-4">
                  {/* Product Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm lg:text-lg line-clamp-2 group-hover:text-[#040458] transition-colors">
                          {product.name}
                        </h3>
                        {product.is_otic_vision && (
                          <Badge className="bg-[#faa51a] text-white text-xs px-1 lg:px-2 py-1">
                            📷 Camera
                          </Badge>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-xs lg:text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                      )}
                      {product.category && (
                        <Badge variant="outline" className="text-xs mt-2">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    <Badge className={`${stockStatus.color} text-xs`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">{stockStatus.status}</span>
                      <span className="sm:hidden">{stockStatus.status.split(' ')[0]}</span>
                    </Badge>
                  </div>

                  {/* Barcodes */}
                  <div className="space-y-2">
                    <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                      <div className="flex items-center space-x-2">
                        <Barcode className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded truncate">
                          {product.barcode}
                        </span>
                      </div>
                      {/* Download button for generated barcodes */}
                      {product.barcode && product.barcode.startsWith('OTIC') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadBarcode(product)}
                          className="h-6 px-2 text-xs w-full lg:w-auto"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-gray-600">Price:</span>
                      <span className="font-semibold text-[#040458] text-sm lg:text-base">UGX {product.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-gray-600">Cost:</span>
                      <span className="font-semibold text-gray-700 text-sm lg:text-base">UGX {product.cost.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-gray-600">Stock:</span>
                      <span className="font-semibold text-gray-900 text-sm lg:text-base">{product.stock} {product.unit_type || 'units'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-gray-600">Min Stock:</span>
                      <span className="font-semibold text-gray-700 text-sm lg:text-base">{product.min_stock}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      className="flex-1 text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // Products with existing barcodes
  const productsWithBarcode = useMemo(() => {
    return filteredProducts.filter(product => product.barcode && product.barcode.trim() !== '')
  }, [filteredProducts])

  // Products with generated barcodes (for download)
  const productsWithGeneratedBarcode = useMemo(() => {
    return filteredProducts.filter(product => 
      product.barcode && 
      product.barcode.trim() !== '' && 
      product.barcode.startsWith('OTIC') // Generated barcodes start with 'OTIC'
    )
  }, [filteredProducts])

  // Memoized total calculations
  const { totalValue, totalUnits } = useMemo(() => {
    const value = products.reduce((sum, product) => sum + (product.price * product.stock), 0)
    const units = products.reduce((sum, product) => sum + product.stock, 0)
    return { totalValue: value, totalUnits: units }
  }, [products])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
        <InventorySkeleton />
      </div>
    )
  }

  if (!user) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
          <p className="text-sm text-gray-500 mt-2">If this takes too long, please refresh the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-[#040458] hover:text-[#faa51a] hover:bg-[#faa51a]/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-2xl font-bold text-[#040458]">Inventory Management</h1>
                  <p className="text-xs lg:text-sm text-gray-600">Manage your products and stock levels</p>
                </div>
              </div>
            </div>
            {/* Desktop buttons - hidden on mobile */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                onClick={() => navigate('/commodity-registration')}
                className="bg-[#040458] hover:bg-[#040458]/90 text-white text-sm"
                size="sm"
              >
                <Barcode className="h-4 w-4 mr-2" />
                Register Commodity
              </Button>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white text-sm"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
              <Button
                onClick={() => setShowOTICVisionRegistration(true)}
                className="bg-[#040458] hover:bg-[#040458]/90 text-white text-sm"
                size="sm"
              >
                <Camera className="h-4 w-4 mr-2" />
                Use Camera
              </Button>
            </div>

            {/* Mobile dropdown */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Menu className="h-4 w-4 mr-1" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/commodity-registration')}>
                    <Barcode className="h-4 w-4 mr-2" />
                    Register Commodity
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Add
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowOTICVisionRegistration(true)}>
                    <Camera className="h-4 w-4 mr-2" />
                    Use Camera
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <BusinessLoginStatus />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 lg:px-4 py-4 lg:py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-xl lg:text-3xl font-bold text-[#040458]">{products.length}</p>
                </div>
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-xl lg:text-3xl font-bold text-red-600">{lowStockItems.length}</p>
                </div>
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 lg:h-6 lg:w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-lg lg:text-2xl font-bold text-[#040458]">UGX {totalValue.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600">Total Units</p>
                  <p className="text-xl lg:text-3xl font-bold text-[#040458]">{totalUnits.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-4 lg:mb-6">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:gap-4">
              <div className="flex-1 relative">
                {isSearching ? (
                  <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                )}
                <Input
                  placeholder="Search by name or barcode..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-10 lg:h-12 border-gray-200 focus:border-[#faa51a] focus:ring-[#faa51a]/20 text-sm lg:text-base"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full lg:w-40 h-10 lg:h-12">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={fetchProducts}
                  variant="outline"
                  className="h-10 lg:h-12 px-3 lg:px-4"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 mb-4 lg:mb-6">
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center text-red-800 text-base lg:text-lg">
                <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                Low Stock Alerts ({lowStockItems.length})
              </CardTitle>
              <CardDescription className="text-red-700 text-sm">
                These products need immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <Badge className={`${getUrgencyColor(item.urgency)} text-white text-xs`}>
                        {item.urgency.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Barcode: {item.barcode}</p>
                      <p>Current Stock: <span className="font-semibold text-red-600">{item.current_stock}</span></p>
                      <p>Min Required: <span className="font-semibold">{item.min_stock}</span></p>
                      <p>Price: UGX {item.price.toLocaleString()}</p>
                      <p>Days Remaining: ~{item.days_remaining}</p>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleEdit(products.find(p => p.id === item.id)!)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Restock Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products with Tabs */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-[#040458] flex items-center">
                <Package className="h-6 w-6 mr-3 text-[#faa51a]" />
                Products
              </h2>
              <p className="text-gray-600 mt-1">Manage your inventory and stock levels</p>
            </div>
            
            {/* Mobile-first responsive button layout */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Product count badge */}
              <div className="flex justify-center sm:justify-start">
                <Badge variant="outline" className="text-sm">
                  {paginationInfo.startItem}-{paginationInfo.endItem} of {filteredProducts.length} products
                </Badge>
              </div>
              
              {/* Action buttons - responsive layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2">
                <Button
                  onClick={() => navigate('/commodity-registration')}
                  className="bg-[#040458] hover:bg-[#040458]/90 text-white text-sm sm:text-base"
                >
                  <Barcode className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Register Commodity</span>
                  <span className="sm:hidden">Register</span>
                </Button>
                
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Quick Add</span>
                  <span className="sm:hidden">Quick Add</span>
                </Button>
                
                <Button
                  onClick={() => setShowOTICVisionRegistration(true)}
                  className="bg-[#040458] hover:bg-[#040458]/90 text-white text-sm sm:text-base"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Use Camera</span>
                  <span className="sm:hidden">Camera</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs for different product views */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg border-0 h-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white text-xs lg:text-sm py-2 lg:py-3">
                <span className="hidden sm:inline">All Products</span>
                <span className="sm:hidden">All</span>
                <span className="ml-1">({products.length})</span>
              </TabsTrigger>
              <TabsTrigger value="with-barcode" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white text-xs lg:text-sm py-2 lg:py-3">
                <span className="hidden sm:inline">With Barcode</span>
                <span className="sm:hidden">Barcode</span>
                <span className="ml-1">({productsWithBarcode.length})</span>
              </TabsTrigger>
              <TabsTrigger value="generated-barcode" className="data-[state=active]:bg-[#040458] data-[state=active]:text-white text-xs lg:text-sm py-2 lg:py-3">
                <span className="hidden sm:inline">Generated</span>
                <span className="sm:hidden">Generated</span>
                <span className="ml-1">({productsWithGeneratedBarcode.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {renderProductsGrid(filteredProducts)}
            </TabsContent>

            <TabsContent value="with-barcode" className="mt-6">
              {renderProductsGrid(productsWithBarcode)}
            </TabsContent>

            <TabsContent value="generated-barcode" className="mt-6">
              {renderProductsGrid(productsWithGeneratedBarcode)}
            </TabsContent>
          </Tabs>
              </div>

      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information' : 'Add a new product to your inventory'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Electronics, Food, Clothing"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (UGX) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cost">Cost Price (UGX) *</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Current Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min_stock">Min Stock Level *</Label>
                <Input
                  id="min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({...formData, min_stock: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_type">Unit Type</Label>
                <Select value={formData.unit_type} onValueChange={(value: any) => setFormData({...formData, unit_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_type">Selling Type</Label>
              <Select value={formData.selling_type} onValueChange={(value: any) => setFormData({...formData, selling_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail Only</SelectItem>
                  <SelectItem value="wholesale">Wholesale Only</SelectItem>
                  <SelectItem value="both">Both Retail & Wholesale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="barcode">Retail Barcode</Label>
                <div className="flex space-x-2">
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    placeholder="Auto-generated if empty"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({...formData, barcode: generateBarcode()})}
                  >
                    <Barcode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wholesale_barcode">Wholesale Barcode</Label>
                <div className="flex space-x-2">
                  <Input
                    id="wholesale_barcode"
                    value={formData.wholesale_barcode}
                    onChange={(e) => setFormData({...formData, wholesale_barcode: e.target.value})}
                    placeholder="Auto-generated if empty"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({...formData, wholesale_barcode: generateBarcode('WHL')})}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                placeholder="Supplier name"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingProduct(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#040458] hover:bg-[#040458]/90">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* OTIC Vision Registration Modal */}
      {showOTICVisionRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 lg:p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] lg:max-h-[90vh] overflow-y-auto">
            <div className="p-3 lg:p-6">
              <OTICVisionRegistration
                onProductRegistered={() => {
                  setShowOTICVisionRegistration(false)
                  fetchProducts() // Reload products after registration
                }}
                onClose={() => setShowOTICVisionRegistration(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory