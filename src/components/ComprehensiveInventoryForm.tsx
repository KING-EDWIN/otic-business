import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package, Calculator, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Product {
  id?: string;
  product_code: string;
  name: string;
  category_id: string;
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
}

interface Category {
  id: string;
  name: string;
}

interface ComprehensiveInventoryFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (product: Product) => void;
  onCancel: () => void;
  isOpen: boolean;
  title: string;
}

const ComprehensiveInventoryForm: React.FC<ComprehensiveInventoryFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
  isOpen,
  title
}) => {
  const [formData, setFormData] = useState<Product>({
    product_code: '',
    name: '',
    category_id: '',
    weight_grams: 0,
    size_value: 0,
    size_unit: 'grams',
    quantity_per_carton: 1,
    buying_price: 0,
    selling_price: 0,
    carton_discount: 0,
    quantity_bought_cartons: 0,
    current_stock_units: 0,
    current_stock_cartons: 0,
    reorder_level: 5,
    purchase_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    supplier_name: '',
    supplier_contact: '',
    how_sold: 'Both',
    units_sold: 0,
    min_stock: 5
  });

  const [purchaseDateOpen, setPurchaseDateOpen] = useState(false);
  const [expiryDateOpen, setExpiryDateOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      // Reset form for new product
      setFormData({
        product_code: '',
        name: '',
        category_id: '',
        weight_grams: 0,
        size_value: 0,
        size_unit: 'grams',
        quantity_per_carton: 1,
        buying_price: 0,
        selling_price: 0,
        carton_discount: 0,
        quantity_bought_cartons: 0,
        current_stock_units: 0,
        current_stock_cartons: 0,
        reorder_level: 5,
        purchase_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        supplier_name: '',
        supplier_contact: '',
        how_sold: 'Both',
        units_sold: 0,
        min_stock: 5
      });
    }
  }, [product, isOpen]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateStockLevels = () => {
    const totalUnits = formData.quantity_bought_cartons * formData.quantity_per_carton;
    const cartons = Math.floor(totalUnits / formData.quantity_per_carton);
    const remainingUnits = totalUnits % formData.quantity_per_carton;
    
    return {
      units: totalUnits,
      cartons: cartons,
      remainingUnits: remainingUnits
    };
  };

  const stockLevels = calculateStockLevels();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate final stock levels
    const finalData = {
      ...formData,
      current_stock_units: stockLevels.units,
      current_stock_cartons: stockLevels.cartons
    };
    
    onSubmit(finalData);
  };

  const sizeUnits = [
    { value: 'ml', label: 'ml' },
    { value: 'grams', label: 'grams' },
    { value: 'kg', label: 'kg' },
    { value: 'liters', label: 'liters' },
    { value: 'pieces', label: 'pieces' },
    { value: 'boxes', label: 'boxes' },
    { value: 'packs', label: 'packs' }
  ];

  const howSoldOptions = [
    { value: 'Standard Sizes', label: 'Standard Sizes' },
    { value: 'Carton Only', label: 'Carton Only' },
    { value: 'Both', label: 'Both' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Complete inventory tracking with all 17 required fields
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product ID / Code */}
            <div className="space-y-2">
              <Label htmlFor="product_code">Product ID / Code</Label>
              <Input
                id="product_code"
                value={formData.product_code}
                onChange={(e) => handleInputChange('product_code', e.target.value)}
                placeholder="Auto-generated if empty"
                disabled={!!product?.product_code}
              />
              <p className="text-xs text-gray-500">System-generated (not editable by user)</p>
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange('category_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight_grams">Weight (grams)</Label>
              <Input
                id="weight_grams"
                type="number"
                value={formData.weight_grams}
                onChange={(e) => handleInputChange('weight_grams', Number(e.target.value))}
                placeholder="0"
                min="0"
              />
            </div>

            {/* Size Value */}
            <div className="space-y-2">
              <Label htmlFor="size_value">Size Value</Label>
              <Input
                id="size_value"
                type="number"
                value={formData.size_value}
                onChange={(e) => handleInputChange('size_value', Number(e.target.value))}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* Size Unit */}
            <div className="space-y-2">
              <Label htmlFor="size_unit">Size Unit</Label>
              <Select
                value={formData.size_unit}
                onValueChange={(value) => handleInputChange('size_unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {sizeUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity per Carton */}
            <div className="space-y-2">
              <Label htmlFor="quantity_per_carton">Quantity per Carton</Label>
              <Input
                id="quantity_per_carton"
                type="number"
                value={formData.quantity_per_carton}
                onChange={(e) => handleInputChange('quantity_per_carton', Number(e.target.value))}
                placeholder="1"
                min="1"
              />
            </div>

            {/* Buying Price */}
            <div className="space-y-2">
              <Label htmlFor="buying_price">Buying Price (per unit)</Label>
              <Input
                id="buying_price"
                type="number"
                value={formData.buying_price}
                onChange={(e) => handleInputChange('buying_price', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price (per unit)</Label>
              <Input
                id="selling_price"
                type="number"
                value={formData.selling_price}
                onChange={(e) => handleInputChange('selling_price', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Carton Discount */}
            <div className="space-y-2">
              <Label htmlFor="carton_discount">Discount (when sold by carton)</Label>
              <Input
                id="carton_discount"
                type="number"
                value={formData.carton_discount}
                onChange={(e) => handleInputChange('carton_discount', Number(e.target.value))}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* Quantity Bought */}
            <div className="space-y-2">
              <Label htmlFor="quantity_bought_cartons">Quantity Bought (in cartons)</Label>
              <Input
                id="quantity_bought_cartons"
                type="number"
                value={formData.quantity_bought_cartons}
                onChange={(e) => handleInputChange('quantity_bought_cartons', Number(e.target.value))}
                placeholder="0"
                min="0"
              />
            </div>

            {/* Current Stock Level - Auto-calculated */}
            <div className="space-y-2">
              <Label>Current Stock Level (Auto-calculated)</Label>
              <Card className="p-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">
                      {stockLevels.units} units ({stockLevels.cartons} cartons)
                    </p>
                    {stockLevels.remainingUnits > 0 && (
                      <p className="text-xs text-gray-500">
                        + {stockLevels.remainingUnits} loose units
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Reorder Level */}
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level / Minimum Stock Alert</Label>
              <Input
                id="reorder_level"
                type="number"
                value={formData.reorder_level}
                onChange={(e) => handleInputChange('reorder_level', Number(e.target.value))}
                placeholder="5"
                min="0"
              />
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Popover open={purchaseDateOpen} onOpenChange={setPurchaseDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.purchase_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.purchase_date ? format(new Date(formData.purchase_date), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.purchase_date ? new Date(formData.purchase_date) : undefined}
                    onSelect={(date) => {
                      handleInputChange('purchase_date', date ? date.toISOString().split('T')[0] : '');
                      setPurchaseDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label>Expiry Date (if applicable)</Label>
              <Popover open={expiryDateOpen} onOpenChange={setExpiryDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expiry_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiry_date ? format(new Date(formData.expiry_date), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expiry_date ? new Date(formData.expiry_date) : undefined}
                    onSelect={(date) => {
                      handleInputChange('expiry_date', date ? date.toISOString().split('T')[0] : '');
                      setExpiryDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Supplier Name */}
            <div className="space-y-2">
              <Label htmlFor="supplier_name">Supplier Name</Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) => handleInputChange('supplier_name', e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>

            {/* Supplier Contact */}
            <div className="space-y-2">
              <Label htmlFor="supplier_contact">Supplier Contact</Label>
              <Input
                id="supplier_contact"
                value={formData.supplier_contact}
                onChange={(e) => handleInputChange('supplier_contact', e.target.value)}
                placeholder="Phone/Email"
              />
            </div>

            {/* How Sold */}
            <div className="space-y-2">
              <Label htmlFor="how_sold">How Sold</Label>
              <Select
                value={formData.how_sold}
                onValueChange={(value) => handleInputChange('how_sold', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select how sold" />
                </SelectTrigger>
                <SelectContent>
                  {howSoldOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Units Sold - Auto-calculated */}
            <div className="space-y-2">
              <Label>Units Sold / Sales Records</Label>
              <Card className="p-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium">{formData.units_sold} units sold</p>
                </div>
                <p className="text-xs text-gray-500">Auto-calculated from sales records</p>
              </Card>
            </div>
          </div>

          {/* Stock Status Alert */}
          {formData.reorder_level > 0 && stockLevels.units <= formData.reorder_level && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <p className="text-sm font-medium text-orange-800">
                  Low Stock Alert: Current stock ({stockLevels.units}) is at or below reorder level ({formData.reorder_level})
                </p>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#040458] hover:bg-[#040458]/90">
              {product ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ComprehensiveInventoryForm;
