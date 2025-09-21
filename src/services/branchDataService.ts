import { supabase } from '@/lib/supabaseClient'

// =====================================================
// BRANCH DATA SERVICE
// =====================================================
// This service handles all data collection and management
// for the branch management system

export interface BranchSale {
  id: string
  branch_id: string
  sale_number: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  total_amount: number
  discount_amount: number
  tax_amount: number
  payment_method: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'credit'
  payment_status: 'completed' | 'pending' | 'failed' | 'refunded'
  cashier_id?: string
  supervisor_id?: string
  items_count: number
  is_refunded: boolean
  refund_amount: number
  refund_reason?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface BranchSaleItem {
  id: string
  sale_id: string
  product_id: string
  product_name: string
  product_sku?: string
  product_barcode?: string
  quantity: number
  unit_price: number
  total_price: number
  discount_amount: number
  tax_amount: number
  category?: string
  brand?: string
  created_at: string
}

export interface BranchInventory {
  id: string
  branch_id: string
  product_id: string
  current_stock: number
  minimum_stock: number
  maximum_stock: number
  reorder_point: number
  last_restocked?: string
  last_sold?: string
  cost_price: number
  selling_price: number
  profit_margin: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BranchInventoryMovement {
  id: string
  branch_id: string
  product_id: string
  movement_type: 'in' | 'out' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'return' | 'damage' | 'expired'
  quantity: number
  previous_stock: number
  new_stock: number
  unit_cost: number
  total_cost: number
  reference_number?: string
  reason?: string
  notes?: string
  created_by?: string
  created_at: string
}

export interface BranchDailyMetrics {
  id: string
  branch_id: string
  metric_date: string
  total_sales: number
  total_transactions: number
  total_customers: number
  average_transaction_value: number
  cash_sales: number
  card_sales: number
  mobile_money_sales: number
  bank_transfer_sales: number
  total_discounts: number
  total_tax: number
  net_profit: number
  top_selling_product?: string
  top_selling_category?: string
  peak_hour?: number
  staff_efficiency: number
  customer_satisfaction: number
  created_at: string
}

export interface BranchStaff {
  id: string
  branch_id: string
  user_id: string
  role: 'manager' | 'supervisor' | 'cashier' | 'stock_keeper' | 'sales_assistant' | 'security' | 'cleaner'
  permissions: Record<string, any>
  hire_date: string
  salary: number
  commission_rate: number
  is_active: boolean
  performance_score: number
  created_at: string
  updated_at: string
}

export interface BranchAIInsight {
  id: string
  branch_id: string
  insight_type: 'sales_prediction' | 'inventory_optimization' | 'customer_behavior' | 'staff_performance' | 'revenue_forecast' | 'demand_forecast' | 'price_optimization'
  title: string
  description: string
  confidence_score: number
  impact_level: 'high' | 'medium' | 'low'
  actionable: boolean
  insight_data: Record<string, any>
  recommendations: any[]
  is_implemented: boolean
  implementation_notes?: string
  created_at: string
  expires_at?: string
}

export interface BranchExpense {
  id: string
  branch_id: string
  expense_category: 'rent' | 'utilities' | 'staff' | 'inventory' | 'marketing' | 'maintenance' | 'security' | 'insurance' | 'other'
  expense_type: 'operational' | 'capital' | 'emergency'
  description: string
  amount: number
  currency: string
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'check'
  payment_status: 'pending' | 'paid' | 'cancelled'
  vendor_name?: string
  vendor_contact?: string
  receipt_number?: string
  approved_by?: string
  approved_at?: string
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

class BranchDataService {
  // =====================================================
  // SALES MANAGEMENT
  // =====================================================

  /**
   * Create a new sale
   */
  async createSale(
    branchId: string,
    paymentMethod: string = 'cash',
    cashierId?: string
  ) {
    try {
      const { data, error } = await supabase.rpc('create_branch_sale', {
        branch_id_param: branchId,
        payment_method_param: paymentMethod,
        cashier_id_param: cashierId || null
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating sale:', error)
      throw error
    }
  }

  /**
   * Add item to sale
   */
  async addSaleItem(
    saleId: string,
    productName: string,
    quantity: number = 1,
    unitPrice: number
  ) {
    try {
      const { data, error } = await supabase.rpc('add_sale_item', {
        sale_id_param: saleId,
        product_name_param: productName,
        quantity_param: quantity,
        unit_price_param: unitPrice
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding sale item:', error)
      throw error
    }
  }

  /**
   * Complete sale
   */
  async completeSale(
    saleId: string,
    discountAmount: number = 0,
    taxAmount: number = 0
  ) {
    try {
      const { data, error } = await supabase.rpc('complete_branch_sale', {
        sale_id_param: saleId,
        discount_amount_param: discountAmount,
        tax_amount_param: taxAmount
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error completing sale:', error)
      throw error
    }
  }

  /**
   * Get sales for a branch
   */
  async getBranchSales(
    branchId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<BranchSale[]> {
    try {
      let query = supabase
        .from('branch_sales')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching branch sales:', error)
      throw error
    }
  }

  /**
   * Get sale items for a sale
   */
  async getSaleItems(saleId: string): Promise<BranchSaleItem[]> {
    try {
      const { data, error } = await supabase
        .from('branch_sale_items')
        .select('*')
        .eq('sale_id', saleId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching sale items:', error)
      throw error
    }
  }

  // =====================================================
  // INVENTORY MANAGEMENT
  // =====================================================

  /**
   * Update branch inventory
   */
  async updateInventory(
    branchId: string,
    productId: string,
    quantityChange: number
  ) {
    try {
      const { data, error } = await supabase.rpc('update_branch_inventory', {
        branch_id_param: branchId,
        product_id_param: productId,
        quantity_change_param: quantityChange
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating inventory:', error)
      throw error
    }
  }

  /**
   * Get branch inventory
   */
  async getBranchInventory(branchId: string): Promise<BranchInventory[]> {
    try {
      const { data, error } = await supabase
        .from('branch_inventory')
        .select(`
          *,
          products (
            id,
            name,
            barcode,
            sku,
            category_id,
            supplier_id
          )
        `)
        .eq('branch_id', branchId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching branch inventory:', error)
      throw error
    }
  }

  /**
   * Get inventory movements
   */
  async getInventoryMovements(
    branchId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<BranchInventoryMovement[]> {
    try {
      let query = supabase
        .from('branch_inventory_movements')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching inventory movements:', error)
      throw error
    }
  }

  // =====================================================
  // ANALYTICS & METRICS
  // =====================================================

  /**
   * Get daily metrics for a branch
   */
  async getDailyMetrics(
    branchId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const { data, error } = await supabase.rpc('get_branch_daily_metrics', {
        branch_id_param: branchId,
        start_date_param: startDate,
        end_date_param: endDate
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching daily metrics:', error)
      throw error
    }
  }

  /**
   * Get hourly metrics for a branch
   */
  async getHourlyMetrics(branchId: string, targetDate: string) {
    try {
      const { data, error } = await supabase.rpc('get_branch_hourly_metrics', {
        branch_id_param: branchId,
        date_param: targetDate
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching hourly metrics:', error)
      throw error
    }
  }

  /**
   * Get product performance for a branch
   */
  async getProductPerformance(
    branchId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const { data, error } = await supabase.rpc('get_branch_product_performance', {
        branch_id_param: branchId,
        start_date_param: startDate,
        end_date_param: endDate
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching product performance:', error)
      throw error
    }
  }

  // =====================================================
  // STAFF MANAGEMENT
  // =====================================================

  /**
   * Get staff performance for a branch
   */
  async getStaffPerformance(
    branchId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const { data, error } = await supabase.rpc('get_branch_staff_performance', {
        branch_id_param: branchId,
        start_date_param: startDate,
        end_date_param: endDate
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching staff performance:', error)
      throw error
    }
  }

  /**
   * Record staff attendance
   */
  async recordAttendance(
    branchId: string,
    staffId: string,
    attendanceDate?: string,
    status: string = 'present'
  ) {
    try {
      const { data, error } = await supabase.rpc('record_staff_attendance', {
        branch_id_param: branchId,
        staff_id_param: staffId,
        attendance_date_param: attendanceDate || new Date().toISOString().split('T')[0],
        status_param: status
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error recording attendance:', error)
      throw error
    }
  }

  /**
   * Get branch staff
   */
  async getBranchStaff(branchId: string): Promise<BranchStaff[]> {
    try {
      const { data, error } = await supabase
        .from('branch_staff')
        .select(`
          *,
          user_profiles (
            id,
            full_name,
            phone,
            email
          )
        `)
        .eq('branch_id', branchId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching branch staff:', error)
      throw error
    }
  }

  // =====================================================
  // AI INSIGHTS
  // =====================================================

  /**
   * Generate AI insights for a branch
   */
  async generateAIInsights(branchId: string): Promise<BranchAIInsight[]> {
    try {
      const { data, error } = await supabase.rpc('generate_branch_ai_insights', {
        branch_id_param: branchId
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error generating AI insights:', error)
      throw error
    }
  }

  /**
   * Get AI insights for a branch
   */
  async getAIInsights(branchId: string): Promise<BranchAIInsight[]> {
    try {
      const { data, error } = await supabase
        .from('branch_ai_insights')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching AI insights:', error)
      throw error
    }
  }

  // =====================================================
  // FINANCIAL MANAGEMENT
  // =====================================================

  /**
   * Get branch expenses
   */
  async getBranchExpenses(
    branchId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<BranchExpense[]> {
    try {
      let query = supabase
        .from('branch_expenses')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching branch expenses:', error)
      throw error
    }
  }

  /**
   * Create branch expense
   */
  async createExpense(
    branchId: string,
    expenseCategory: string,
    expenseType: string,
    description: string,
    amount: number,
    paymentMethod: string,
    vendorName?: string,
    vendorContact?: string,
    receiptNumber?: string,
    notes?: string
  ) {
    try {
      const { data, error } = await supabase
        .from('branch_expenses')
        .insert({
          branch_id: branchId,
          expense_category: expenseCategory,
          expense_type: expenseType,
          description,
          amount,
          payment_method: paymentMethod,
          vendor_name: vendorName,
          vendor_contact: vendorContact,
          receipt_number: receiptNumber,
          notes
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating expense:', error)
      throw error
    }
  }

  // =====================================================
  // REAL-TIME DATA COLLECTION
  // =====================================================

  /**
   * Collect real-time metrics for a branch
   */
  async collectRealTimeMetrics(branchId: string) {
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const currentHour = now.getHours()

      // Get today's sales data
      const salesData = await this.getDailyMetrics(branchId, today, today)
      
      // Get hourly data
      const hourlyData = await this.getHourlyMetrics(branchId, today)
      
      // Get current inventory status
      const inventoryData = await this.getBranchInventory(branchId)
      
      // Get staff performance
      const staffData = await this.getStaffPerformance(branchId, today, today)

      return {
        daily: salesData[0] || {
          metric_date: today,
          total_sales: 0,
          total_transactions: 0,
          total_customers: 0,
          average_transaction_value: 0,
          cash_sales: 0,
          card_sales: 0,
          mobile_money_sales: 0,
          bank_transfer_sales: 0,
          net_profit: 0
        },
        hourly: hourlyData,
        inventory: {
          total_items: inventoryData.length,
          low_stock_items: inventoryData.filter(item => item.current_stock <= item.minimum_stock).length,
          out_of_stock_items: inventoryData.filter(item => item.current_stock === 0).length,
          total_value: inventoryData.reduce((sum, item) => sum + (item.current_stock * item.selling_price), 0)
        },
        staff: {
          total_staff: staffData.length,
          average_performance: staffData.reduce((sum, staff) => sum + staff.efficiency_score, 0) / Math.max(staffData.length, 1),
          top_performer: staffData.sort((a, b) => b.total_sales - a.total_sales)[0]
        }
      }
    } catch (error) {
      console.error('Error collecting real-time metrics:', error)
      throw error
    }
  }

  /**
   * Auto-update daily metrics
   */
  async updateDailyMetrics(branchId: string, targetDate?: string) {
    try {
      const date = targetDate || new Date().toISOString().split('T')[0]
      
      // Get sales data for the day
      const salesData = await this.getDailyMetrics(branchId, date, date)
      
      if (salesData.length === 0) {
        // Create empty metrics for the day
        const { data, error } = await supabase
          .from('branch_daily_metrics')
          .insert({
            branch_id: branchId,
            metric_date: date,
            total_sales: 0,
            total_transactions: 0,
            total_customers: 0,
            average_transaction_value: 0,
            cash_sales: 0,
            card_sales: 0,
            mobile_money_sales: 0,
            bank_transfer_sales: 0,
            total_discounts: 0,
            total_tax: 0,
            net_profit: 0,
            staff_efficiency: 0,
            customer_satisfaction: 0
          })
          .select()
          .single()

        if (error) throw error
        return data
      }

      return salesData[0]
    } catch (error) {
      console.error('Error updating daily metrics:', error)
      throw error
    }
  }
}

export const branchDataService = new BranchDataService()
