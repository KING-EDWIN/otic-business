import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Calculator,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import ComprehensiveInventoryForm from '@/components/ComprehensiveInventoryForm';
import BusinessLoginStatus from '@/components/BusinessLoginStatus';

interface Product {
  id: string;
  product_code: string;
  name: string;
  category_id: string;
  category_name?: string;
  weight_grams: number;
  size_value: number;
  size_unit: string;
  quantity_per_carton: number;
  buying_price: number;
  selling_price: number;
  carton_discount: number;
  quantity_bought_cartons: number;
  current_stock_units: number;
  current_stock_cartons: number;
  reorder_level: number;
  purchase_date: string;
  expiry_date?: string;
  supplier_name: string;
  supplier_contact: string;
  how_sold: string;
  units_sold: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

const ComprehensiveInventory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories with fallback
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          console.error('Error loading categories:', categoriesError);
          // Use fallback categories
          setCategories([
            { id: '1', name: 'Beverages' },
            { id: '2', name: 'Snacks' },
            { id: '3', name: 'Detergents' },
            { id: '4', name: 'Toiletries' },
            { id: '5', name: 'Food Items' }
          ]);
        } else {
          setCategories(categoriesData || []);
        }
      } catch (error) {
        console.error('Categories loading failed:', error);
        setCategories([
          { id: '1', name: 'Beverages' },
          { id: '2', name: 'Snacks' },
          { id: '3', name: 'Detergents' },
          { id: '4', name: 'Toiletries' },
          { id: '5', name: 'Food Items' }
        ]);
      }

      // Load products with comprehensive data and fallback
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('inventory_comprehensive')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error('Error loading products:', productsError);
          // Try fallback to regular products table
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fallbackError) {
            console.error('Fallback products loading failed:', fallbackError);
            setProducts([]);
          } else {
            // Transform fallback data to match expected format
            const transformedProducts = (fallbackData || []).map(product => ({
              ...product,
              product_code: product.product_code || `PROD-${product.id.slice(0, 6).toUpperCase()}`,
              category_name: 'Unknown',
              weight_grams: product.weight_grams || 0,
              size_value: product.size_value || 0,
              size_unit: product.size_unit || 'pieces',
              quantity_per_carton: product.quantity_per_carton || 1,
              buying_price: product.cost || 0,
              selling_price: product.price || 0,
              carton_discount: product.carton_discount || 0,
              quantity_bought_cartons: product.quantity_bought_cartons || 0,
              current_stock_units: product.stock || 0,
              current_stock_cartons: product.quantity_per_carton > 0 ? Math.floor((product.stock || 0) / (product.quantity_per_carton || 1)) : 0,
              reorder_level: product.min_stock || 5,
              purchase_date: product.purchase_date || new Date().toISOString().split('T')[0],
              expiry_date: product.expiry_date || null,
              supplier_name: product.supplier_name || 'Unknown',
              supplier_contact: product.supplier_contact || '',
              how_sold: product.how_sold || 'Both',
              units_sold: product.units_sold || 0,
              min_stock: product.min_stock || 5
            }));
            setProducts(transformedProducts);
          }
        } else {
          setProducts(productsData || []);
        }
      } catch (error) {
        console.error('Products loading failed:', error);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading inventory data:', error);
      setProducts([]);
      setCategories([
        { id: '1', name: 'Beverages' },
        { id: '2', name: 'Snacks' },
        { id: '3', name: 'Detergents' },
        { id: '4', name: 'Toiletries' },
        { id: '5', name: 'Food Items' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        toast.error('Failed to delete product');
        console.error('Error deleting product:', error);
      } else {
        toast.success('Product deleted successfully');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const handleFormSubmit = async (productData: Product) => {
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: productData.name,
            category_id: productData.category_id,
            weight_grams: productData.weight_grams,
            size_value: productData.size_value,
            size_unit: productData.size_unit,
            quantity_per_carton: productData.quantity_per_carton,
            buying_price: productData.buying_price,
            selling_price: productData.selling_price,
            carton_discount: productData.carton_discount,
            quantity_bought_cartons: productData.quantity_bought_cartons,
            reorder_level: productData.reorder_level,
            purchase_date: productData.purchase_date,
            expiry_date: productData.expiry_date || null,
            supplier_name: productData.supplier_name,
            supplier_contact: productData.supplier_contact,
            how_sold: productData.how_sold,
            min_stock: productData.min_stock
          })
          .eq('id', editingProduct.id);

        if (error) {
          toast.error('Failed to update product');
          console.error('Error updating product:', error);
        } else {
          toast.success('Product updated successfully');
          setIsFormOpen(false);
          loadData();
        }
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            name: productData.name,
            category_id: productData.category_id,
            weight_grams: productData.weight_grams,
            size_value: productData.size_value,
            size_unit: productData.size_unit,
            quantity_per_carton: productData.quantity_per_carton,
            buying_price: productData.buying_price,
            selling_price: productData.selling_price,
            carton_discount: productData.carton_discount,
            quantity_bought_cartons: productData.quantity_bought_cartons,
            reorder_level: productData.reorder_level,
            purchase_date: productData.purchase_date,
            expiry_date: productData.expiry_date || null,
            supplier_name: productData.supplier_name,
            supplier_contact: productData.supplier_contact,
            how_sold: productData.how_sold,
            min_stock: productData.min_stock,
            user_id: user?.id
          });

        if (error) {
          toast.error('Failed to create product');
          console.error('Error creating product:', error);
        } else {
          toast.success('Product created successfully');
          setIsFormOpen(false);
          loadData();
        }
      }
    } catch (error) {
      toast.error('Failed to save product');
      console.error('Error saving product:', error);
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.current_stock_units <= 0) return { status: 'Out of Stock', color: 'destructive' };
    if (product.current_stock_units <= product.reorder_level) return { status: 'Low Stock', color: 'destructive' };
    if (product.expiry_date && new Date(product.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
      return { status: 'Expiring Soon', color: 'secondary' };
    }
    return { status: 'In Stock', color: 'default' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    
    const stockStatus = getStockStatus(product);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'low' && stockStatus.status === 'Low Stock') ||
                         (filterStatus === 'out' && stockStatus.status === 'Out of Stock') ||
                         (filterStatus === 'expiring' && stockStatus.status === 'Expiring Soon') ||
                         (filterStatus === 'in-stock' && stockStatus.status === 'In Stock');
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const lowStockProducts = products.filter(p => p.current_stock_units <= p.reorder_level);
  const outOfStockProducts = products.filter(p => p.current_stock_units <= 0);
  const expiringProducts = products.filter(p => 
    p.expiry_date && new Date(p.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-10 w-10"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Tracking System</h1>
                <p className="text-sm text-gray-500">Comprehensive inventory management with 17 tracking fields</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BusinessLoginStatus />
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={handleAddProduct}
                className="bg-[#040458] hover:bg-[#040458]/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{outOfStockProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                  <p className="text-2xl font-bold text-gray-900">{expiringProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products, codes, or suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
            <CardDescription>
              Comprehensive inventory tracking with all 17 required fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Stock (Units/Cartons)</TableHead>
                    <TableHead>Buying Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">
                          {product.product_code}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category_name || 'N/A'}</TableCell>
                        <TableCell>
                          {product.size_value} {product.size_unit}
                          {product.weight_grams > 0 && (
                            <div className="text-xs text-gray-500">
                              {product.weight_grams}g
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{product.current_stock_units} units</span>
                            <span className="text-xs text-gray-500">
                              {product.current_stock_cartons} cartons
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>UGX {product.buying_price.toLocaleString()}</TableCell>
                        <TableCell>UGX {product.selling_price.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{product.supplier_name}</span>
                            <span className="text-xs text-gray-500">{product.supplier_contact}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.color as any}>
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Form */}
      <ComprehensiveInventoryForm
        product={editingProduct}
        categories={categories}
        onSubmit={handleFormSubmit}
        onCancel={() => setIsFormOpen(false)}
        isOpen={isFormOpen}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      />
    </div>
  );
};

export default ComprehensiveInventory;
