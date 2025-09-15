import { supabase } from '@/lib/supabaseClient'

export interface ReceiptItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Receipt {
  id: string
  receipt_number: string
  business_id: string
  user_id: string
  employee_id?: string
  total_amount: number
  payment_method: 'cash' | 'credit' | 'mobile_money' | 'card'
  payment_status: 'pending' | 'completed' | 'refunded'
  items: ReceiptItem[]
  customer_info?: {
    name?: string
    email?: string
    phone?: string
  }
  tax_amount: number
  discount_amount: number
  created_at: string
  updated_at: string
}

export class ReceiptService {
  // Create a new receipt
  static async createReceipt(
    businessId: string,
    userId: string,
    employeeId: string,
    items: ReceiptItem[],
    paymentMethod: 'cash' | 'credit' | 'mobile_money' | 'card',
    customerInfo?: {
      name?: string
      email?: string
      phone?: string
    },
    taxAmount: number = 0,
    discountAmount: number = 0
  ): Promise<{ success: boolean; receipt?: Receipt; error?: string }> {
    try {
      // Generate receipt number
      const { data: receiptNumber, error: receiptNumberError } = await supabase
        .rpc('generate_receipt_number')

      if (receiptNumberError) {
        console.error('Error generating receipt number:', receiptNumberError)
        return { success: false, error: 'Failed to generate receipt number' }
      }

      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)

      // Create receipt
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          receipt_number: receiptNumber,
          business_id: businessId,
          user_id: userId,
          employee_id: employeeId,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          payment_status: 'completed',
          items: items,
          customer_info: customerInfo,
          tax_amount: taxAmount,
          discount_amount: discountAmount
        })
        .select()
        .single()

      if (receiptError) {
        console.error('Error creating receipt:', receiptError)
        return { success: false, error: 'Failed to create receipt' }
      }

      // Create receipt items
      const receiptItems = items.map(item => ({
        receipt_id: receipt.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }))

      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(receiptItems)

      if (itemsError) {
        console.error('Error creating receipt items:', itemsError)
        // Don't fail the operation, just log the error
      }

      return { success: true, receipt }
    } catch (error) {
      console.error('Error in createReceipt:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Get receipts for a business
  static async getBusinessReceipts(
    businessId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ success: boolean; receipts?: Receipt[]; error?: string }> {
    try {
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select(`
          *,
          receipt_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching receipts:', error)
        return { success: false, error: 'Failed to fetch receipts' }
      }

      return { success: true, receipts: receipts || [] }
    } catch (error) {
      console.error('Error in getBusinessReceipts:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Get receipt by ID
  static async getReceiptById(
    receiptId: string
  ): Promise<{ success: boolean; receipt?: Receipt; error?: string }> {
    try {
      const { data: receipt, error } = await supabase
        .from('receipts')
        .select(`
          *,
          receipt_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('id', receiptId)
        .single()

      if (error) {
        console.error('Error fetching receipt:', error)
        return { success: false, error: 'Failed to fetch receipt' }
      }

      return { success: true, receipt }
    } catch (error) {
      console.error('Error in getReceiptById:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Get receipts by date range
  static async getReceiptsByDateRange(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<{ success: boolean; receipts?: Receipt[]; error?: string }> {
    try {
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select(`
          *,
          receipt_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('business_id', businessId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching receipts by date range:', error)
        return { success: false, error: 'Failed to fetch receipts' }
      }

      return { success: true, receipts: receipts || [] }
    } catch (error) {
      console.error('Error in getReceiptsByDateRange:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Get receipt statistics
  static async getReceiptStats(
    businessId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      let query = supabase
        .from('receipts')
        .select('total_amount, payment_method, created_at')
        .eq('business_id', businessId)

      if (startDate && endDate) {
        query = query
          .gte('created_at', startDate)
          .lte('created_at', endDate)
      }

      const { data: receipts, error } = await query

      if (error) {
        console.error('Error fetching receipt stats:', error)
        return { success: false, error: 'Failed to fetch receipt statistics' }
      }

      const stats = {
        totalReceipts: receipts?.length || 0,
        totalAmount: receipts?.reduce((sum, receipt) => sum + receipt.total_amount, 0) || 0,
        averageAmount: receipts?.length > 0 
          ? receipts.reduce((sum, receipt) => sum + receipt.total_amount, 0) / receipts.length 
          : 0,
        paymentMethods: receipts?.reduce((acc, receipt) => {
          acc[receipt.payment_method] = (acc[receipt.payment_method] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}
      }

      return { success: true, stats }
    } catch (error) {
      console.error('Error in getReceiptStats:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}
