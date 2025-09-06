// Demo Data Service
export interface DemoUser {
  name: string
  tier: 'basic' | 'standard' | 'premium'
  description: string
  features: string[]
  stats: {
    totalSales: number
    totalRevenue: number
    totalProducts: number
    lowStockItems: number
  }
}

export interface DemoProduct {
  id: string
  name: string
  barcode: string
  price: number
  cost: number
  stock: number
  min_stock: number
  user_id: string
  created_at: string
}

export interface DemoSale {
  id: string
  user_id: string
  total: number
  payment_method: 'cash' | 'mobile_money' | 'card' | 'flutterwave'
  receipt_number: string
  created_at: string
}

export const demoUsers: Record<string, DemoUser> = {
  basic: {
    name: "Sarah's Corner Shop",
    tier: "basic",
    description: "Small retail store with basic POS needs",
    features: ["POS System", "Basic Reports", "Single User", "Receipt Generation"],
    stats: {
      totalSales: 45,
      totalRevenue: 1250000,
      totalProducts: 12,
      lowStockItems: 2
    }
  },
  standard: {
    name: "Kampala Electronics Hub",
    tier: "standard", 
    description: "Growing electronics business with multiple staff",
    features: ["Everything in Basic", "QuickBooks Integration", "AI Analytics", "Multi-user Access", "Tax Computation"],
    stats: {
      totalSales: 156,
      totalRevenue: 8750000,
      totalProducts: 45,
      lowStockItems: 5
    }
  },
  premium: {
    name: "East Africa Supermarkets Ltd",
    tier: "premium",
    description: "Multi-branch supermarket chain with advanced needs",
    features: ["Everything in Standard", "Multi-branch Management", "AI Forecasting", "Priority Support", "Advanced Compliance"],
    stats: {
      totalSales: 1245,
      totalRevenue: 45000000,
      totalProducts: 280,
      lowStockItems: 12
    }
  }
}

export const generateDemoProducts = (tier: 'basic' | 'standard' | 'premium'): DemoProduct[] => {
  const productCount = tier === 'basic' ? 12 : tier === 'standard' ? 45 : 280
  const products: DemoProduct[] = []
  
  const productNames = [
    'Coca Cola 500ml', 'Bread Loaf', 'Milk 1L', 'Rice 5kg', 'Cooking Oil 1L',
    'Sugar 2kg', 'Salt 1kg', 'Tomatoes 1kg', 'Onions 1kg', 'Potatoes 2kg',
    'Chicken 1kg', 'Beef 1kg', 'Fish 1kg', 'Eggs 30pcs', 'Bananas 1kg',
    'Oranges 1kg', 'Apples 1kg', 'Tea Leaves 250g', 'Coffee 500g', 'Soap Bar',
    'Toothpaste', 'Shampoo 400ml', 'Toilet Paper 4rolls', 'Detergent 2L',
    'Candles 10pcs', 'Matches Box', 'Batteries AA 4pcs', 'Light Bulb 60W',
    'Extension Cord 5m', 'Phone Charger', 'USB Cable', 'Memory Card 32GB',
    'Headphones', 'Speaker', 'Calculator', 'Notebook A4', 'Pen Set',
    'Pencil Box', 'Eraser', 'Ruler 30cm', 'Scissors', 'Tape Dispenser'
  ]

  for (let i = 0; i < productCount; i++) {
    const name = productNames[i % productNames.length]
    const price = Math.floor(Math.random() * 50000) + 1000
    const cost = Math.floor(price * 0.7)
    const stock = Math.floor(Math.random() * 50) + 5
    
    products.push({
      id: `demo-product-${i}`,
      name: `${name} ${i > productNames.length ? `#${Math.floor(i / productNames.length) + 1}` : ''}`,
      barcode: Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'),
      price,
      cost,
      stock,
      min_stock: 5,
      user_id: '00000000-0000-0000-0000-000000000001',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  return products
}

export const generateDemoSales = (tier: 'basic' | 'standard' | 'premium'): DemoSale[] => {
  const salesCount = tier === 'basic' ? 45 : tier === 'standard' ? 156 : 1245
  const sales: DemoSale[] = []
  
  for (let i = 0; i < salesCount; i++) {
    const total = Math.floor(Math.random() * 100000) + 5000
    const paymentMethods: Array<'cash' | 'mobile_money' | 'card' | 'flutterwave'> = ['cash', 'mobile_money', 'card', 'flutterwave']
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    
    sales.push({
      id: `demo-sale-${i}`,
      user_id: '00000000-0000-0000-0000-000000000001',
      total,
      payment_method: paymentMethod,
      receipt_number: `RCP-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  return sales.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export const generateDemoAnalytics = (tier: 'basic' | 'standard' | 'premium') => {
  return {
    totalSales: tier === 'basic' ? 45 : tier === 'standard' ? 156 : 1245,
    totalRevenue: tier === 'basic' ? 1250000 : tier === 'standard' ? 8750000 : 45000000,
    totalProducts: tier === 'basic' ? 12 : tier === 'standard' ? 45 : 280,
    lowStockItems: tier === 'basic' ? 2 : tier === 'standard' ? 5 : 12,
    salesGrowth: Math.floor(Math.random() * 30) - 5, // -5% to +25%
    revenueGrowth: Math.floor(Math.random() * 30) - 5,
    averageOrderValue: tier === 'basic' ? 28000 : tier === 'standard' ? 56000 : 36000
  }
}
