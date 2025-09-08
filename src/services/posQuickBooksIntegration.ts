import { supabase } from '@/lib/supabase'
import { quickbooksService } from './quickbooksService'
import { getCurrentUserInfo } from '@/utils/userUtils'

// POS-QuickBooks Integration Service
// Handles barcode-based inventory sync between POS and QuickBooks
export class POSQuickBooksIntegration {
  
  // Sync product from POS to QuickBooks with barcode
  async syncProductToQuickBooks(productId: string): Promise<{ success: boolean; qbItemId?: string; error?: string }> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        throw new Error('User not authenticated')
      }

      // Get product from POS
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('user_id', userInfo.id)
        .single()

      if (productError || !product) {
        throw new Error('Product not found')
      }

      // Check if product already synced
      const { data: existingMapping } = await supabase
        .from('quickbooks_product_mapping')
        .select('qb_item_id')
        .eq('pos_product_id', productId)
        .eq('user_id', userInfo.id)
        .single()

      if (existingMapping) {
        return { success: true, qbItemId: existingMapping.qb_item_id }
      }

      // Create QuickBooks item with barcode
      const qbItemData = {
        Name: product.name,
        Description: product.description || product.name,
        UnitPrice: product.price,
        Type: 'Inventory',
        QtyOnHand: product.stock || 0,
        IncomeAccountRef: { value: '1' }, // Default income account
        AssetAccountRef: { value: '2' }, // Default asset account
        // Add barcode as custom field or SKU
        Sku: product.barcode,
        // Additional fields for barcode tracking
        MetaData: {
          CreateTime: new Date().toISOString(),
          LastUpdatedTime: new Date().toISOString()
        }
      }

      const qbResponse = await quickbooksService.createItem(qbItemData)
      
      if (qbResponse && qbResponse.Item) {
        const qbItemId = qbResponse.Item.Id

        // Store mapping
        await supabase
          .from('quickbooks_product_mapping')
          .insert({
            user_id: userInfo.id,
            pos_product_id: productId,
            qb_item_id: qbItemId
          })

        // Log sync
        await this.logSync('products', 'success', 1, userInfo.id)

        return { success: true, qbItemId }
      } else {
        throw new Error('Failed to create QuickBooks item')
      }
    } catch (error) {
      console.error('Error syncing product to QuickBooks:', error)
      await this.logSync('products', 'error', 0, userInfo?.id, error instanceof Error ? error.message : 'Unknown error')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Sync customer from POS to QuickBooks
  async syncCustomerToQuickBooks(customerId: string): Promise<{ success: boolean; qbCustomerId?: string; error?: string }> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        throw new Error('User not authenticated')
      }

      // Get customer from POS
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('user_id', userInfo.id)
        .single()

      if (customerError || !customer) {
        throw new Error('Customer not found')
      }

      // Check if customer already synced
      const { data: existingMapping } = await supabase
        .from('quickbooks_customer_mapping')
        .select('qb_customer_id')
        .eq('pos_customer_id', customerId)
        .eq('user_id', userInfo.id)
        .single()

      if (existingMapping) {
        return { success: true, qbCustomerId: existingMapping.qb_customer_id }
      }

      // Create QuickBooks customer
      const qbCustomerData = {
        Name: customer.business_name || customer.name,
        CompanyName: customer.business_name,
        PrimaryEmailAddr: { Address: customer.email },
        PrimaryPhone: { FreeFormNumber: customer.phone },
        BillAddr: {
          Line1: customer.address,
          City: customer.city || 'Kampala',
          Country: 'Uganda'
        }
      }

      const qbResponse = await quickbooksService.createCustomer(qbCustomerData)
      
      if (qbResponse && qbResponse.Customer) {
        const qbCustomerId = qbResponse.Customer.Id

        // Store mapping
        await supabase
          .from('quickbooks_customer_mapping')
          .insert({
            user_id: userInfo.id,
            pos_customer_id: customerId,
            qb_customer_id: qbCustomerId
          })

        // Log sync
        await this.logSync('customers', 'success', 1, userInfo.id)

        return { success: true, qbCustomerId }
      } else {
        throw new Error('Failed to create QuickBooks customer')
      }
    } catch (error) {
      console.error('Error syncing customer to QuickBooks:', error)
      await this.logSync('customers', 'error', 0, userInfo?.id, error instanceof Error ? error.message : 'Unknown error')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Sync sale from POS to QuickBooks as invoice
  async syncSaleToQuickBooks(saleId: string): Promise<{ success: boolean; qbInvoiceId?: string; error?: string }> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        throw new Error('User not authenticated')
      }

      // Get sale with items and customer
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (*)
          ),
          customers (*)
        `)
        .eq('id', saleId)
        .eq('user_id', userInfo.id)
        .single()

      if (saleError || !sale) {
        throw new Error('Sale not found')
      }

      // Check if sale already synced
      const { data: existingMapping } = await supabase
        .from('quickbooks_invoice_mapping')
        .select('qb_invoice_id')
        .eq('pos_sale_id', saleId)
        .eq('user_id', userInfo.id)
        .single()

      if (existingMapping) {
        return { success: true, qbInvoiceId: existingMapping.qb_invoice_id }
      }

      // Sync customer first if not already synced
      let qbCustomerId = null
      if (sale.customers) {
        const customerSync = await this.syncCustomerToQuickBooks(sale.customers.id)
        if (customerSync.success) {
          qbCustomerId = customerSync.qbCustomerId
        }
      }

      // Sync products first if not already synced
      const qbItemIds: { [posProductId: string]: string } = {}
      for (const item of sale.sale_items) {
        if (item.products) {
          const productSync = await this.syncProductToQuickBooks(item.products.id)
          if (productSync.success) {
            qbItemIds[item.products.id] = productSync.qbItemId!
          }
        }
      }

      // Create QuickBooks invoice
      const invoiceData = {
        CustomerRef: qbCustomerId ? { value: qbCustomerId } : undefined,
        Line: sale.sale_items.map((item: any) => ({
          DetailType: 'SalesItemLineDetail',
          Amount: item.price * item.quantity,
          SalesItemLineDetail: {
            ItemRef: { value: qbItemIds[item.product_id] },
            Qty: item.quantity,
            UnitPrice: item.price
          }
        })),
        TxnDate: sale.created_at.split('T')[0],
        DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        DocNumber: sale.receipt_number,
        PrivateNote: `POS Sale - Receipt: ${sale.receipt_number}`
      }

      const qbResponse = await quickbooksService.createInvoice(invoiceData)
      
      if (qbResponse && qbResponse.Invoice) {
        const qbInvoiceId = qbResponse.Invoice.Id

        // Store mapping
        await supabase
          .from('quickbooks_invoice_mapping')
          .insert({
            user_id: userInfo.id,
            pos_sale_id: saleId,
            qb_invoice_id: qbInvoiceId
          })

        // Log sync
        await this.logSync('invoices', 'success', 1, userInfo.id)

        return { success: true, qbInvoiceId }
      } else {
        throw new Error('Failed to create QuickBooks invoice')
      }
    } catch (error) {
      console.error('Error syncing sale to QuickBooks:', error)
      await this.logSync('invoices', 'error', 0, userInfo?.id, error instanceof Error ? error.message : 'Unknown error')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Bulk sync all products from POS to QuickBooks
  async syncAllProducts(): Promise<{ success: boolean; synced: number; errors: number; error?: string }> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        throw new Error('User not authenticated')
      }

      // Get all products from POS
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', userInfo.id)

      if (productsError || !products) {
        throw new Error('Failed to fetch products')
      }

      let synced = 0
      let errors = 0

      // Sync each product
      for (const product of products) {
        const result = await this.syncProductToQuickBooks(product.id)
        if (result.success) {
          synced++
        } else {
          errors++
        }
      }

      // Log bulk sync
      await this.logSync('products', 'success', synced, userInfo.id)

      return { success: true, synced, errors }
    } catch (error) {
      console.error('Error in bulk product sync:', error)
      return { success: false, synced: 0, errors: 0, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Bulk sync all customers from POS to QuickBooks
  async syncAllCustomers(): Promise<{ success: boolean; synced: number; errors: number; error?: string }> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        throw new Error('User not authenticated')
      }

      // Get all customers from POS
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userInfo.id)

      if (customersError || !customers) {
        throw new Error('Failed to fetch customers')
      }

      let synced = 0
      let errors = 0

      // Sync each customer
      for (const customer of customers) {
        const result = await this.syncCustomerToQuickBooks(customer.id)
        if (result.success) {
          synced++
        } else {
          errors++
        }
      }

      // Log bulk sync
      await this.logSync('customers', 'success', synced, userInfo.id)

      return { success: true, synced, errors }
    } catch (error) {
      console.error('Error in bulk customer sync:', error)
      return { success: false, synced: 0, errors: 0, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Bulk sync all sales from POS to QuickBooks
  async syncAllSales(): Promise<{ success: boolean; synced: number; errors: number; error?: string }> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        throw new Error('User not authenticated')
      }

      // Get all sales from POS
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('id')
        .eq('user_id', userInfo.id)

      if (salesError || !sales) {
        throw new Error('Failed to fetch sales')
      }

      let synced = 0
      let errors = 0

      // Sync each sale
      for (const sale of sales) {
        const result = await this.syncSaleToQuickBooks(sale.id)
        if (result.success) {
          synced++
        } else {
          errors++
        }
      }

      // Log bulk sync
      await this.logSync('invoices', 'success', synced, userInfo.id)

      return { success: true, synced, errors }
    } catch (error) {
      console.error('Error in bulk sales sync:', error)
      return { success: false, synced: 0, errors: 0, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get sync status and statistics
  async getSyncStatus(): Promise<{
    products: { total: number; synced: number; pending: number }
    customers: { total: number; synced: number; pending: number }
    sales: { total: number; synced: number; pending: number }
    lastSync: string | null
  }> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        throw new Error('User not authenticated')
      }

      // Get counts from POS
      const [productsResult, customersResult, salesResult] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', userInfo.id),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', userInfo.id),
        supabase.from('sales').select('id', { count: 'exact', head: true }).eq('user_id', userInfo.id)
      ])

      // Get synced counts
      const [productsSynced, customersSynced, salesSynced] = await Promise.all([
        supabase.from('quickbooks_product_mapping').select('id', { count: 'exact', head: true }).eq('user_id', userInfo.id),
        supabase.from('quickbooks_customer_mapping').select('id', { count: 'exact', head: true }).eq('user_id', userInfo.id),
        supabase.from('quickbooks_invoice_mapping').select('id', { count: 'exact', head: true }).eq('user_id', userInfo.id)
      ])

      // Get last sync time
      const { data: lastSync } = await supabase
        .from('quickbooks_sync_log')
        .select('created_at')
        .eq('user_id', userInfo.id)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return {
        products: {
          total: productsResult.count || 0,
          synced: productsSynced.count || 0,
          pending: (productsResult.count || 0) - (productsSynced.count || 0)
        },
        customers: {
          total: customersResult.count || 0,
          synced: customersSynced.count || 0,
          pending: (customersResult.count || 0) - (customersSynced.count || 0)
        },
        sales: {
          total: salesResult.count || 0,
          synced: salesSynced.count || 0,
          pending: (salesResult.count || 0) - (salesSynced.count || 0)
        },
        lastSync: lastSync?.created_at || null
      }
    } catch (error) {
      console.error('Error getting sync status:', error)
      return {
        products: { total: 0, synced: 0, pending: 0 },
        customers: { total: 0, synced: 0, pending: 0 },
        sales: { total: 0, synced: 0, pending: 0 },
        lastSync: null
      }
    }
  }

  // Log sync activity
  private async logSync(type: string, status: 'success' | 'error' | 'pending', recordsProcessed: number, userId: string, errorMessage?: string) {
    try {
      await supabase
        .from('quickbooks_sync_log')
        .insert({
          user_id: userId,
          sync_type: type,
          status,
          records_processed: recordsProcessed,
          error_message: errorMessage
        })
    } catch (error) {
      console.error('Error logging sync:', error)
    }
  }
}

export const posQuickBooksIntegration = new POSQuickBooksIntegration()
