// Offline data service for when Supabase is not available
export const getOfflineStats = () => {
  return {
    totalSales: 15,
    totalProducts: 3,
    totalRevenue: 125000,
    lowStockItems: 1
  }
}

export const getOfflineProducts = () => {
  return [
    {
      id: '1',
      name: 'Coca Cola 500ml',
      barcode: '1234567890123',
      price: 2500,
      cost: 2000,
      stock: 50,
      min_stock: 10,
      category_id: null,
      supplier_id: null,
      user_id: '4a280b3c-f99b-4efb-b1c8-a2a93c6fb76d',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Bread Loaf',
      barcode: '1234567890124',
      price: 3000,
      cost: 2500,
      stock: 20,
      min_stock: 5,
      category_id: null,
      supplier_id: null,
      user_id: '4a280b3c-f99b-4efb-b1c8-a2a93c6fb76d',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Rice 1kg',
      barcode: '1234567890125',
      price: 5000,
      cost: 4000,
      stock: 15,
      min_stock: 8,
      category_id: null,
      supplier_id: null,
      user_id: '4a280b3c-f99b-4efb-b1c8-a2a93c6fb76d',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

export const getOfflineSales = () => {
  return [
    {
      id: '1',
      user_id: '4a280b3c-f99b-4efb-b1c8-a2a93c6fb76d',
      total: 5500,
      payment_method: 'cash',
      receipt_number: 'RCP-001',
      created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: '2',
      user_id: '4a280b3c-f99b-4efb-b1c8-a2a93c6fb76d',
      total: 2500,
      payment_method: 'mobile_money',
      receipt_number: 'RCP-002',
      created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    }
  ]
}
