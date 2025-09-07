// Hybrid Accounting Service
// Combines Supabase data with QuickFile API for comprehensive accounting

import { AkauntingSupabaseService } from './accountingService'
import { getQuickFileService } from './quickfileService'

export class HybridAccountingService {
  private supabaseService: AkauntingSupabaseService
  private quickfileService: any

  constructor() {
    this.supabaseService = new AkauntingSupabaseService()
    this.quickfileService = getQuickFileService()
  }

  // Use Supabase for data storage and QuickFile for external sync
  async getDashboardStats() {
    // Always use Supabase for real-time data
    return await this.supabaseService.getDashboardStats()
  }

  async getCustomers() {
    return await this.supabaseService.getCustomers()
  }

  async createCustomer(customer: any) {
    const result = await this.supabaseService.createCustomer(customer)
    
    // Sync with QuickFile if available
    if (this.quickfileService) {
      try {
        await this.quickfileService.createCustomer({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          country: 'UG' // Uganda
        })
      } catch (error) {
        console.warn('QuickFile sync failed:', error)
      }
    }
    
    return result
  }

  async getInvoices() {
    return await this.supabaseService.getInvoices()
  }

  async createInvoice(invoice: any) {
    const result = await this.supabaseService.createInvoice(invoice)
    
    // Sync with QuickFile if available
    if (this.quickfileService) {
      try {
        await this.quickfileService.createInvoice({
          customerId: invoice.customer_id,
          invoiceNumber: invoice.invoice_number,
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          status: invoice.status,
          currency: invoice.currency_code,
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          total: invoice.total,
          notes: invoice.notes,
          items: invoice.items.map((item: any) => ({
            description: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.total,
            vatRate: 18 // Uganda VAT rate
          }))
        })
      } catch (error) {
        console.warn('QuickFile sync failed:', error)
      }
    }
    
    return result
  }

  async getExpenses() {
    return await this.supabaseService.getExpenses()
  }

  async createExpense(expense: any) {
    const result = await this.supabaseService.createExpense(expense)
    
    // Sync with QuickFile if available
    if (this.quickfileService) {
      try {
        await this.quickfileService.createExpense({
          date: expense.paid_at,
          description: expense.description,
          amount: expense.amount,
          category: 'Business Expense',
          paymentMethod: expense.payment_method,
          reference: expense.reference
        })
      } catch (error) {
        console.warn('QuickFile sync failed:', error)
      }
    }
    
    return result
  }

  async getAccounts() {
    return await this.supabaseService.getAccounts()
  }

  async getExpenseCategories() {
    return await this.supabaseService.getExpenseCategories()
  }

  // QuickFile specific methods
  async syncWithQuickFile() {
    if (!this.quickfileService) {
      throw new Error('QuickFile service not configured')
    }

    try {
      // Sync customers
      const customers = await this.getCustomers()
      for (const customer of customers) {
        await this.quickfileService.createCustomer({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          country: 'UG'
        })
      }

      // Sync invoices
      const invoices = await this.getInvoices()
      for (const invoice of invoices) {
        await this.quickfileService.createInvoice({
          customerId: invoice.customer_id,
          invoiceNumber: invoice.invoice_number,
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          status: invoice.status,
          currency: invoice.currency_code,
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          total: invoice.total,
          notes: invoice.notes,
          items: invoice.items.map((item: any) => ({
            description: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.total,
            vatRate: 18
          }))
        })
      }

      return { success: true, message: 'Sync completed successfully' }
    } catch (error) {
      console.error('QuickFile sync error:', error)
      throw error
    }
  }

  async getQuickFileReports(startDate: string, endDate: string) {
    if (!this.quickfileService) {
      throw new Error('QuickFile service not configured')
    }

    try {
      const [profitLoss, balanceSheet] = await Promise.all([
        this.quickfileService.getProfitLossReport(startDate, endDate),
        this.quickfileService.getBalanceSheetReport(startDate, endDate)
      ])

      return {
        profitLoss,
        balanceSheet
      }
    } catch (error) {
      console.error('QuickFile reports error:', error)
      throw error
    }
  }
}

// Factory function
export const getHybridAccountingService = () => {
  return new HybridAccountingService()
}
