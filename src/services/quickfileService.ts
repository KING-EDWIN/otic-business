// QuickFile API Integration
// Free accounting software for UK businesses with comprehensive API

export interface QuickFileConfig {
  apiKey: string
  accountId: string
  baseUrl: string
}

export interface QuickFileCustomer {
  id?: string
  name: string
  email?: string
  phone?: string
  address?: string
  postcode?: string
  country: string
}

export interface QuickFileInvoice {
  id?: string
  customerId: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
  currency: string
  subtotal: number
  tax: number
  total: number
  notes?: string
  items: QuickFileInvoiceItem[]
}

export interface QuickFileInvoiceItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  vatRate: number
}

export interface QuickFileExpense {
  id?: string
  date: string
  description: string
  amount: number
  category: string
  paymentMethod: string
  reference?: string
}

export class QuickFileService {
  private config: QuickFileConfig

  constructor(config: QuickFileConfig) {
    this.config = config
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    const url = `${this.config.baseUrl}/api/${endpoint}`
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Account-ID': this.config.accountId
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`QuickFile API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('QuickFile API request failed:', error)
      throw error
    }
  }

  // Customer Management
  async getCustomers(): Promise<QuickFileCustomer[]> {
    const response = await this.makeRequest('customers')
    return response.data || []
  }

  async createCustomer(customer: Omit<QuickFileCustomer, 'id'>): Promise<QuickFileCustomer> {
    const response = await this.makeRequest('customers', 'POST', customer)
    return response.data
  }

  async updateCustomer(id: string, customer: Partial<QuickFileCustomer>): Promise<QuickFileCustomer> {
    const response = await this.makeRequest(`customers/${id}`, 'PUT', customer)
    return response.data
  }

  // Invoice Management
  async getInvoices(): Promise<QuickFileInvoice[]> {
    const response = await this.makeRequest('invoices')
    return response.data || []
  }

  async createInvoice(invoice: Omit<QuickFileInvoice, 'id'>): Promise<QuickFileInvoice> {
    const response = await this.makeRequest('invoices', 'POST', invoice)
    return response.data
  }

  async updateInvoice(id: string, invoice: Partial<QuickFileInvoice>): Promise<QuickFileInvoice> {
    const response = await this.makeRequest(`invoices/${id}`, 'PUT', invoice)
    return response.data
  }

  async sendInvoice(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest(`invoices/${id}/send`, 'POST')
    return response
  }

  async markInvoiceAsPaid(id: string, paymentData: {
    paidAt: string
    amount: number
    paymentMethod: string
  }): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest(`invoices/${id}/pay`, 'POST', paymentData)
    return response
  }

  // Expense Management
  async getExpenses(): Promise<QuickFileExpense[]> {
    const response = await this.makeRequest('expenses')
    return response.data || []
  }

  async createExpense(expense: Omit<QuickFileExpense, 'id'>): Promise<QuickFileExpense> {
    const response = await this.makeRequest('expenses', 'POST', expense)
    return response.data
  }

  // Financial Reports
  async getProfitLossReport(startDate: string, endDate: string): Promise<any> {
    const response = await this.makeRequest(`reports/profit-loss?start_date=${startDate}&end_date=${endDate}`)
    return response.data
  }

  async getBalanceSheetReport(startDate: string, endDate: string): Promise<any> {
    const response = await this.makeRequest(`reports/balance-sheet?start_date=${startDate}&end_date=${endDate}`)
    return response.data
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<{
    totalInvoices: number
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    overdueInvoices: number
    recentTransactions: any[]
  }> {
    try {
      const [invoices, expenses] = await Promise.all([
        this.getInvoices(),
        this.getExpenses()
      ])

      const totalRevenue = invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + inv.total, 0)

      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
      const netProfit = totalRevenue - totalExpenses
      const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue').length

      const recentTransactions = [
        ...invoices.slice(0, 5).map(inv => ({
          type: 'invoice',
          description: `Invoice ${inv.invoiceNumber}`,
          amount: inv.total,
          date: inv.issueDate,
          status: inv.status.toLowerCase()
        })),
        ...expenses.slice(0, 5).map(exp => ({
          type: 'expense',
          description: exp.description,
          amount: -exp.amount,
          date: exp.date,
          status: 'paid'
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return {
        totalInvoices: invoices.length,
        totalRevenue,
        totalExpenses,
        netProfit,
        overdueInvoices,
        recentTransactions: recentTransactions.slice(0, 10)
      }
    } catch (error) {
      console.error('Error fetching QuickFile dashboard stats:', error)
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
}

// Factory function to get QuickFile service
export const getQuickFileService = (): QuickFileService | null => {
  const apiKey = import.meta.env.VITE_QUICKFILE_API_KEY
  const accountId = import.meta.env.VITE_QUICKFILE_ACCOUNT_ID
  const baseUrl = import.meta.env.VITE_QUICKFILE_BASE_URL || 'https://api.quickfile.co.uk'

  if (!apiKey || !accountId) {
    console.warn('QuickFile API credentials not configured')
    return null
  }

  return new QuickFileService({
    apiKey,
    accountId,
    baseUrl
  })
}


