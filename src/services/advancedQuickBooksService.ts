import { supabase } from '@/lib/supabase'
import { getCurrentUserInfo } from '@/utils/userUtils'

interface QuickBooksCompany {
  Id: string
  CompanyName: string
  LegalName: string
  Country: string
  CurrencyRef: any
  CompanyAddr: any
  CustomerCommunicationAddr: any
  PrimaryPhone: any
  WebAddr: any
  Email: any
  FiscalYearStartMonth: string
  domain: string
  sparse: boolean
  MetaData: any
}

interface QuickBooksAccount {
  Id: string
  Name: string
  AccountType: string
  AccountSubType: string
  CurrentBalance: number
  Classification: string
  FullyQualifiedName: string
  Active: boolean
  MetaData: any
}

interface QuickBooksInvoice {
  Id: string
  DocNumber: string
  SyncToken: string
  MetaData: any
  CustomField: any[]
  PrivateNote: string
  TxnDate: string
  DueDate: string
  SalesTermRef: any
  CustomerRef: { value: string; name: string }
  CustomerMemo: any
  BillAddr: any
  ShipAddr: any
  FreeFormAddress: boolean
  TotalAmt: number
  HomeTotalAmt: number
  ApplyTaxAfterDiscount: boolean
  PrintStatus: string
  EmailStatus: string
  BillEmail: any
  RecurDataRef: any
  Balance: number
  HomeBalance: number
  Deposit: number
  AllowIPNPayment: boolean
  AllowOnlinePayment: boolean
  AllowOnlineCreditCardPayment: boolean
  AllowOnlineACHPayment: boolean
  Domain: string
  sparse: boolean
  Line: any[]
  TxnTaxDetail: any
  LinkedTxn: any[]
  OverrideDocNumber: boolean
  EmailStatus: string
  PrintStatus: string
}

interface QuickBooksCustomer {
  Id: string
  SyncToken: string
  MetaData: any
  Title: string
  GivenName: string
  FamilyName: string
  MiddleName: string
  Suffix: string
  FullyQualifiedName: string
  CompanyName: string
  DisplayName: string
  PrintOnCheckName: string
  Active: boolean
  PrimaryPhone: any
  PrimaryEmailAddr: any
  WebAddr: any
  DefaultTaxCodeRef: any
  EligibleForCommission: boolean
  CustomerTypeRef: any
  ResaleNum: string
  JobInfo: any
  Taxable: boolean
  BillAddr: any
  ShipAddr: any
  OtherContactInfo: any
  NameValue: any[]
  Notes: string
  OpenBalanceDate: string
  BalanceWithJobs: number
  Balance: number
  CreditLimit: number
  AcctNum: string
  CurrencyRef: any
  OverDueBalance: number
  TotalRevenue: number
  TotalExpense: number
  HomeBalance: number
  RecurDataRef: any
  IsProject: boolean
  PreferredDeliveryMethod: string
  ResaleNum: string
  domain: string
  sparse: boolean
}

interface QuickBooksItem {
  Id: string
  SyncToken: string
  MetaData: any
  Name: string
  Sku: string
  Description: string
  Active: boolean
  SubItem: boolean
  ParentRef: any
  Level: number
  FullyQualifiedName: string
  Taxable: boolean
  SalesTaxIncluded: boolean
  UnitPrice: number
  Type: string
  IncomeAccountRef: any
  PurchaseDesc: string
  PurchaseCost: number
  ExpenseAccountRef: any
  AssetAccountRef: any
  TrackQtyOnHand: boolean
  QtyOnHand: number
  QtyOnSalesOrder: number
  QtyOnPurchaseOrder: number
  InvStartDate: string
  domain: string
  sparse: boolean
}

interface QuickBooksPayment {
  Id: string
  SyncToken: string
  MetaData: any
  TxnDate: string
  TotalAmt: number
  UnappliedAmt: number
  ProcessPayment: boolean
  PaymentRefNum: string
  PaymentMethodRef: any
  DepositToAccountRef: any
  CustomerRef: any
  Line: any[]
  PrivateNote: string
  domain: string
  sparse: boolean
}

interface QuickBooksExpense {
  Id: string
  SyncToken: string
  MetaData: any
  TxnDate: string
  PaymentType: string
  AccountRef: any
  Line: any[]
  TxnTaxDetail: any
  PrivateNote: string
  TotalAmt: number
  HomeTotalAmt: number
  ProcessPayment: boolean
  domain: string
  sparse: boolean
}

interface QuickBooksReport {
  Header: any
  Columns: any
  Rows: any[]
  Summary: any
}

interface DashboardMetrics {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  grossProfit: number
  operatingExpenses: number
  accountsReceivable: number
  accountsPayable: number
  cashBalance: number
  totalAssets: number
  totalLiabilities: number
  equity: number
  vatCollected: number
  vatPaid: number
  netVat: number
  efrisVat: number
  efrisIncome: number
  efrisWithholding: number
  totalCustomers: number
  totalInvoices: number
  totalItems: number
  overdueInvoices: number
  recentTransactions: any[]
  topCustomers: any[]
  topItems: any[]
  monthlyRevenue: any[]
  monthlyExpenses: any[]
  profitLossData: any
  balanceSheetData: any
  cashFlowData: any
}

export class AdvancedQuickBooksService {
  private baseUrl = 'https://sandbox-quickbooks.api.intuit.com'
  private companyId = '9341455307021048'
  private accessToken: string | null = null
  private mistralApiKey = import.meta.env.VITE_MISTRAL_API_KEY

  constructor() {
    this.loadAccessToken()
  }

  private async loadAccessToken() {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) return

      const { data, error } = await supabase
        .from('quickbooks_tokens')
        .select('access_token')
        .eq('user_id', userInfo.id)
        .eq('company_id', this.companyId)
        .limit(1)

      if (!error && data && data.length > 0) {
        this.accessToken = data[0].access_token
      }
    } catch (error) {
      console.error('Error loading access token:', error)
    }
  }

  private async makeAPICall(endpoint: string, method: string = 'GET', body?: any) {
    if (!this.accessToken) {
      await this.loadAccessToken()
    }

    if (!this.accessToken) {
      throw new Error('No QuickBooks access token available')
    }

    const response = await fetch(`${this.baseUrl}/v3/company/${this.companyId}/${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`QuickBooks API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  // Check if QuickBooks is connected
  async isConnected(): Promise<boolean> {
    try {
      await this.loadAccessToken()
      if (!this.accessToken) return false

      const response = await fetch(`${this.baseUrl}/v3/company/${this.companyId}/companyinfo/1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      })

      return response.ok
    } catch (error) {
      console.error('QuickBooks connection check failed:', error)
      return false
    }
  }

  // Get company information
  async getCompanyInfo(): Promise<QuickBooksCompany | null> {
    try {
      const response = await this.makeAPICall('companyinfo/1')
      return response.QueryResponse?.CompanyInfo?.[0] || null
    } catch (error) {
      console.error('Error fetching company info:', error)
      return null
    }
  }

  // Get comprehensive dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      console.log('🔄 Fetching comprehensive QuickBooks dashboard data...')
      
      // Fetch all data in parallel
      const [
        companyInfo,
        accounts,
        invoices,
        customers,
        items,
        payments,
        expenses,
        profitLossReport,
        balanceSheetReport,
        cashFlowReport
      ] = await Promise.all([
        this.getCompanyInfo(),
        this.getChartOfAccounts(),
        this.getInvoices(),
        this.getCustomers(),
        this.getItems(),
        this.getPayments(),
        this.getExpenses(),
        this.getProfitLossReport(),
        this.getBalanceSheetReport(),
        this.getCashFlowReport()
      ])

      // Calculate comprehensive metrics
      const revenueAccounts = accounts.filter(acc => 
        acc.AccountType === 'Income' || acc.AccountSubType === 'SalesOfProductIncome'
      )
      const expenseAccounts = accounts.filter(acc => 
        acc.AccountType === 'Expense'
      )
      const assetAccounts = accounts.filter(acc => 
        acc.AccountType === 'Asset'
      )
      const liabilityAccounts = accounts.filter(acc => 
        acc.AccountType === 'Liability'
      )

      const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + (acc.CurrentBalance || 0), 0)
      const totalExpenses = Math.abs(expenseAccounts.reduce((sum, acc) => sum + (acc.CurrentBalance || 0), 0))
      const netIncome = totalRevenue - totalExpenses
      const grossProfit = totalRevenue - Math.abs(expenseAccounts
        .filter(acc => acc.AccountSubType === 'CostOfGoodsSold')
        .reduce((sum, acc) => sum + (acc.CurrentBalance || 0), 0))

      // VAT Calculations (18% in Uganda)
      const vatRate = 0.18
      const vatCollected = totalRevenue * vatRate
      const vatPaid = totalExpenses * vatRate
      const netVat = vatCollected - vatPaid

      // EFRIS Calculations
      const efrisVat = totalRevenue * vatRate
      const efrisIncome = netIncome * 0.30
      const efrisWithholding = totalRevenue * 0.06

      const accountsReceivable = assetAccounts
        .filter(acc => acc.AccountSubType === 'AccountsReceivable')
        .reduce((sum, acc) => sum + (acc.CurrentBalance || 0), 0)

      const accountsPayable = liabilityAccounts
        .filter(acc => acc.AccountSubType === 'AccountsPayable')
        .reduce((sum, acc) => sum + (acc.CurrentBalance || 0), 0)

      const cashBalance = assetAccounts
        .filter(acc => acc.AccountSubType === 'CashAndCashEquivalents')
        .reduce((sum, acc) => sum + (acc.CurrentBalance || 0), 0)

      const totalAssets = assetAccounts.reduce((sum, acc) => sum + (acc.CurrentBalance || 0), 0)
      const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + (acc.CurrentBalance || 0), 0)
      const equity = totalAssets - totalLiabilities

      // Recent transactions (last 10)
      const recentTransactions = [
        ...invoices.slice(0, 5).map(inv => ({
          type: 'Invoice',
          id: inv.Id,
          description: `Invoice ${inv.DocNumber}`,
          amount: inv.TotalAmt,
          date: inv.TxnDate,
          status: inv.Balance > 0 ? 'Outstanding' : 'Paid'
        })),
        ...payments.slice(0, 3).map(pay => ({
          type: 'Payment',
          id: pay.Id,
          description: `Payment ${pay.PaymentRefNum}`,
          amount: pay.TotalAmt,
          date: pay.TxnDate,
          status: 'Completed'
        })),
        ...expenses.slice(0, 2).map(exp => ({
          type: 'Expense',
          id: exp.Id,
          description: `Expense ${exp.Id}`,
          amount: exp.TotalAmt,
          date: exp.TxnDate,
          status: 'Recorded'
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

      // Top customers by revenue
      const topCustomers = customers
        .map(customer => ({
          id: customer.Id,
          name: customer.DisplayName,
          totalRevenue: customer.TotalRevenue || 0,
          balance: customer.Balance || 0,
          invoices: invoices.filter(inv => inv.CustomerRef?.value === customer.Id).length
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)

      // Top items by sales
      const topItems = items
        .filter(item => item.Type === 'Inventory' || item.Type === 'Service')
        .map(item => ({
          id: item.Id,
          name: item.Name,
          sku: item.Sku,
          unitPrice: item.UnitPrice || 0,
          qtyOnHand: item.QtyOnHand || 0,
          type: item.Type
        }))
        .sort((a, b) => b.unitPrice - a.unitPrice)
        .slice(0, 5)

      // Monthly revenue and expenses (last 12 months)
      const monthlyRevenue = this.calculateMonthlyData(invoices, 'revenue')
      const monthlyExpenses = this.calculateMonthlyData(expenses, 'expenses')

      // Overdue invoices
      const overdueInvoices = invoices.filter(inv => {
        const dueDate = new Date(inv.DueDate)
        const today = new Date()
        return inv.Balance > 0 && dueDate < today
      }).length

      console.log('✅ QuickBooks dashboard data loaded successfully')

      return {
        totalRevenue,
        totalExpenses,
        netIncome,
        grossProfit,
        operatingExpenses: totalExpenses - Math.abs(expenseAccounts
          .filter(acc => acc.AccountSubType === 'CostOfGoodsSold')
          .reduce((sum, acc) => sum + (acc.CurrentBalance || 0), 0)),
        accountsReceivable,
        accountsPayable,
        cashBalance,
        totalAssets,
        totalLiabilities,
        equity,
        vatCollected,
        vatPaid,
        netVat,
        efrisVat,
        efrisIncome,
        efrisWithholding,
        totalCustomers: customers.length,
        totalInvoices: invoices.length,
        totalItems: items.length,
        overdueInvoices,
        recentTransactions,
        topCustomers,
        topItems,
        monthlyRevenue,
        monthlyExpenses,
        profitLossData: profitLossReport,
        balanceSheetData: balanceSheetReport,
        cashFlowData: cashFlowReport
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      throw error
    }
  }

  // Get chart of accounts
  async getChartOfAccounts(): Promise<QuickBooksAccount[]> {
    try {
      const response = await this.makeAPICall('accounts')
      return response.QueryResponse?.Account || []
    } catch (error) {
      console.error('Error fetching chart of accounts:', error)
      return []
    }
  }

  // Get invoices
  async getInvoices(): Promise<QuickBooksInvoice[]> {
    try {
      const response = await this.makeAPICall('invoices')
      return response.QueryResponse?.Invoice || []
    } catch (error) {
      console.error('Error fetching invoices:', error)
      return []
    }
  }

  // Get customers
  async getCustomers(): Promise<QuickBooksCustomer[]> {
    try {
      const response = await this.makeAPICall('customers')
      return response.QueryResponse?.Customer || []
    } catch (error) {
      console.error('Error fetching customers:', error)
      return []
    }
  }

  // Get items
  async getItems(): Promise<QuickBooksItem[]> {
    try {
      const response = await this.makeAPICall('items')
      return response.QueryResponse?.Item || []
    } catch (error) {
      console.error('Error fetching items:', error)
      return []
    }
  }

  // Get payments
  async getPayments(): Promise<QuickBooksPayment[]> {
    try {
      const response = await this.makeAPICall('payments')
      return response.QueryResponse?.Payment || []
    } catch (error) {
      console.error('Error fetching payments:', error)
      return []
    }
  }

  // Get expenses
  async getExpenses(): Promise<QuickBooksExpense[]> {
    try {
      const response = await this.makeAPICall('purchases')
      return response.QueryResponse?.Purchase || []
    } catch (error) {
      console.error('Error fetching expenses:', error)
      return []
    }
  }

  // Get profit and loss report
  async getProfitLossReport(startDate?: string, endDate?: string): Promise<QuickBooksReport | null> {
    try {
      const start = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
      const end = endDate || new Date().toISOString().split('T')[0]
      
      const response = await this.makeAPICall(
        `reports/ProfitAndLoss?start_date=${start}&end_date=${end}`
      )
      return response.QueryResponse?.Report?.[0] || null
    } catch (error) {
      console.error('Error fetching P&L report:', error)
      return null
    }
  }

  // Get balance sheet report
  async getBalanceSheetReport(asOfDate?: string): Promise<QuickBooksReport | null> {
    try {
      const asOf = asOfDate || new Date().toISOString().split('T')[0]
      
      const response = await this.makeAPICall(
        `reports/BalanceSheet?as_of_date=${asOf}`
      )
      return response.QueryResponse?.Report?.[0] || null
    } catch (error) {
      console.error('Error fetching balance sheet:', error)
      return null
    }
  }

  // Get cash flow report
  async getCashFlowReport(startDate?: string, endDate?: string): Promise<QuickBooksReport | null> {
    try {
      const start = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
      const end = endDate || new Date().toISOString().split('T')[0]
      
      const response = await this.makeAPICall(
        `reports/CashFlow?start_date=${start}&end_date=${end}`
      )
      return response.QueryResponse?.Report?.[0] || null
    } catch (error) {
      console.error('Error fetching cash flow report:', error)
      return null
    }
  }

  // Calculate monthly data
  private calculateMonthlyData(data: any[], type: 'revenue' | 'expenses'): any[] {
    const monthlyData = []
    const currentDate = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      const year = date.getFullYear()
      
      const monthData = data.filter(item => {
        const itemDate = new Date(item.TxnDate)
        return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === year
      })
      
      const amount = monthData.reduce((sum, item) => {
        if (type === 'revenue') {
          return sum + (item.TotalAmt || 0)
        } else {
          return sum + (item.TotalAmt || 0)
        }
      }, 0)
      
      monthlyData.push({
        month: monthName,
        year: year,
        amount: amount,
        count: monthData.length
      })
    }
    
    return monthlyData
  }

  // Create invoice
  async createInvoice(invoiceData: any): Promise<any> {
    try {
      const response = await this.makeAPICall('invoices', 'POST', invoiceData)
      return response.QueryResponse?.Invoice?.[0] || null
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw error
    }
  }

  // Create customer
  async createCustomer(customerData: any): Promise<any> {
    try {
      const response = await this.makeAPICall('customers', 'POST', customerData)
      return response.QueryResponse?.Customer?.[0] || null
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  // Get vendors
  async getVendors(): Promise<any[]> {
    try {
      const response = await this.makeAPICall('vendors')
      return response.QueryResponse?.Vendor || []
    } catch (error) {
      console.error('Error fetching vendors:', error)
      return []
    }
  }

  // Get transactions
  async getTransactions(): Promise<any[]> {
    try {
      const response = await this.makeAPICall('transactions')
      return response.QueryResponse?.Transaction || []
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }

  // Get AR Aging report
  async getARAging(): Promise<any> {
    try {
      const response = await this.makeAPICall('reports/AR_Aging')
      return response.QueryResponse?.Report?.[0] || null
    } catch (error) {
      console.error('Error fetching AR aging report:', error)
      return null
    }
  }

  // Get AP Aging report
  async getAPAging(): Promise<any> {
    try {
      const response = await this.makeAPICall('reports/AP_Aging')
      return response.QueryResponse?.Report?.[0] || null
    } catch (error) {
      console.error('Error fetching AP aging report:', error)
      return null
    }
  }

  // Get inventory valuation
  async getInventoryValuation(): Promise<any> {
    try {
      const response = await this.makeAPICall('reports/InventoryValuationSummary')
      return response.QueryResponse?.Report?.[0] || null
    } catch (error) {
      console.error('Error fetching inventory valuation:', error)
      return null
    }
  }

  // Sync with POS data
  async syncWithPOS(): Promise<any> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) throw new Error('User not authenticated')

      // Get POS sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', userInfo.id)

      if (salesError) throw salesError

      // Sync sales as invoices
      const syncResults = []
      for (const sale of sales || []) {
        try {
          const invoiceData = {
            Line: [{
              DetailType: 'SalesItemLineDetail',
              Amount: sale.total_amount,
              SalesItemLineDetail: {
                ItemRef: { value: '1', name: 'POS Sale' }
              }
            }],
            CustomerRef: { value: '1', name: 'POS Customer' }
          }
          
          const invoice = await this.createInvoice(invoiceData)
          syncResults.push({ saleId: sale.id, invoiceId: invoice?.Id })
        } catch (error) {
          console.error(`Error syncing sale ${sale.id}:`, error)
        }
      }

      return syncResults
    } catch (error) {
      console.error('Error syncing with POS:', error)
      throw error
    }
  }
}

export const advancedQuickBooksService = new AdvancedQuickBooksService()