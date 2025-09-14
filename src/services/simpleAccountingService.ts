// Simple Accounting Service - Direct Supabase connection
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUserInfo } from '@/utils/userUtils'

export interface SimpleInvoice {
  id: string
  invoice_number: string
  user_id: string
  total: number
  status: string
  created_at: string
}

export interface SimpleExpense {
  id: string
  user_id: string
  amount: number
  description: string
  created_at: string
}

export class SimpleAccountingService {
  private async getUserId(): Promise<string> {
    const userInfo = await getCurrentUserInfo()
    if (!userInfo) {
      throw new Error('User not authenticated')
    }
    return userInfo.id
  }

  async getDashboardStats() {
    const userId = await this.getUserId()
    console.log('🔍 SIMPLE ACCOUNTING: Fetching stats for user:', userId)
    
    try {
      // First, let's check what data exists for this user_id
      console.log('🔍 Checking all data for user_id:', userId)
      
      // Check expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)

      if (expensesError) {
        console.error('❌ Expenses error:', expensesError)
      } else {
        console.log('📊 Expenses found:', expenses?.length || 0, expenses)
      }

      // Check invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)

      if (invoicesError) {
        console.error('❌ Invoices error:', invoicesError)
      } else {
        console.log('📊 Invoices found:', invoices?.length || 0, invoices)
      }

      // Check sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('total, user_id')
        .eq('user_id', userId)

      if (salesError) {
        console.error('❌ Sales error:', salesError)
      } else {
        console.log('📊 Sales found:', sales?.length || 0, sales)
      }

      // Let's also check what user_ids actually exist in the database
      console.log('🔍 Checking all user_ids in database...')
      
      const { data: allExpenses } = await supabase
        .from('expenses')
        .select('user_id')
        .limit(5)
      console.log('📊 All expenses user_ids:', allExpenses)

      const { data: allInvoices } = await supabase
        .from('invoices')
        .select('user_id')
        .limit(5)
      console.log('📊 All invoices user_ids:', allInvoices)

      console.log('📊 SIMPLE ACCOUNTING DATA:', {
        expenses: expenses?.length || 0,
        invoices: invoices?.length || 0,
        sales: sales?.length || 0
      })

      // Calculate totals
      const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
      const totalExpenses = expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0
      const netProfit = totalRevenue - totalExpenses

      const result = {
        totalInvoices: invoices?.length || 0,
        totalRevenue,
        totalExpenses,
        netProfit,
        overdueInvoices: 0,
        recentTransactions: [
          ...(expenses?.slice(0, 3).map(expense => ({
            type: 'expense',
            description: expense.description,
            amount: -expense.amount,
            date: expense.created_at,
            status: 'paid'
          })) || []),
          ...(invoices?.slice(0, 3).map(invoice => ({
            type: 'invoice',
            description: `Invoice ${invoice.invoice_number}`,
            amount: invoice.total,
            date: invoice.created_at,
            status: invoice.status
          })) || [])
        ]
      }

      console.log('✅ SIMPLE ACCOUNTING RESULT:', result)
      return result

    } catch (error) {
      console.error('❌ SIMPLE ACCOUNTING ERROR:', error)
      return {
        totalInvoices: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        overdueInvoices: 0,
        recentTransactions: []
      }
    }
  }

  async getInvoices(): Promise<SimpleInvoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', this.userId)

    if (error) {
      console.error('❌ Get invoices error:', error)
      return []
    }

    return data || []
  }

  async getExpenses(): Promise<SimpleExpense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', this.userId)

    if (error) {
      console.error('❌ Get expenses error:', error)
      return []
    }

    return data || []
  }
}

// Export the simple service
export const getSimpleAccountingService = () => new SimpleAccountingService()
