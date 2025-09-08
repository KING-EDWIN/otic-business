import { supabase } from '@/lib/supabase'

// QuickBooks API Service
export class QuickBooksService {
  private clientId: string
  private clientSecret: string
  private redirectUri: string
  private environment: 'sandbox' | 'production'
  private baseUrl: string

  constructor() {
    this.clientId = import.meta.env.VITE_QB_CLIENT_ID || ''
    this.clientSecret = import.meta.env.VITE_QB_CLIENT_SECRET || ''
    this.redirectUri = import.meta.env.VITE_QB_REDIRECT_URI || 'http://localhost:8080/quickbooks/callback'
    this.environment = (import.meta.env.VITE_QB_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    this.baseUrl = this.environment === 'sandbox' 
      ? 'https://sandbox-quickbooks.api.intuit.com'
      : 'https://quickbooks.api.intuit.com'
  }

  // OAuth 2.0 Authentication
  getAuthorizationUrl(): string {
    const scope = 'com.intuit.quickbooks.accounting com.intuit.quickbooks.payment'
    const state = Math.random().toString(36).substring(7) // Random state for security
    
    return `https://appcenter.intuit.com/connect/oauth2?client_id=${this.clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&access_type=offline&state=${state}`
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string, realmId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth2/v1/tokens/bearer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri
        })
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`)
      }

      const tokenData = await response.json()
      
      // Store tokens in Supabase
      const { error } = await supabase
        .from('quickbooks_tokens')
        .upsert({
          realm_id: realmId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          company_name: tokenData.company_name || 'QuickBooks Company',
          environment: this.environment
        })

      if (error) {
        throw new Error(`Failed to store tokens: ${error.message}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Token exchange error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: tokenData, error: fetchError } = await supabase
        .from('quickbooks_tokens')
        .select('*')
        .limit(1)
        .single()

      if (fetchError || !tokenData) {
        throw new Error('No stored tokens found')
      }

      const response = await fetch(`${this.baseUrl}/oauth2/v1/tokens/bearer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenData.refresh_token
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`)
      }

      const newTokenData = await response.json()
      
      // Update tokens in Supabase
      const { error: updateError } = await supabase
        .from('quickbooks_tokens')
        .update({
          access_token: newTokenData.access_token,
          refresh_token: newTokenData.refresh_token,
          expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString()
        })
        .eq('id', tokenData.id)

      if (updateError) {
        throw new Error(`Failed to update tokens: ${updateError.message}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Token refresh error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get valid access token
  private async getValidAccessToken(): Promise<string | null> {
    try {
      const { data: tokenData, error } = await supabase
        .from('quickbooks_tokens')
        .select('*')
        .limit(1)
        .single()

      if (error || !tokenData) {
        return null
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) <= new Date()) {
        const refreshResult = await this.refreshAccessToken()
        if (!refreshResult.success) {
          return null
        }
        // Fetch updated token
        const { data: updatedToken } = await supabase
          .from('quickbooks_tokens')
          .select('access_token')
          .limit(1)
          .single()
        return updatedToken?.access_token || null
      }

      return tokenData.access_token
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }

  // Make authenticated API request
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    const accessToken = await this.getValidAccessToken()
    if (!accessToken) {
      throw new Error('No valid access token available')
    }

    const { data: tokenData } = await supabase
      .from('quickbooks_tokens')
      .select('realm_id')
      .limit(1)
      .single()

    const url = `${this.baseUrl}/v3/company/${tokenData?.realm_id}${endpoint}`
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`QuickBooks API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  // Customer Management
  async getCustomers() {
    return await this.makeRequest('/customers')
  }

  async createCustomer(customerData: any) {
    return await this.makeRequest('/customers', 'POST', customerData)
  }

  async updateCustomer(customerId: string, customerData: any) {
    return await this.makeRequest(`/customers/${customerId}`, 'PUT', customerData)
  }

  // Invoice Management
  async getInvoices() {
    return await this.makeRequest('/invoices')
  }

  async createInvoice(invoiceData: any) {
    return await this.makeRequest('/invoices', 'POST', invoiceData)
  }

  async updateInvoice(invoiceId: string, invoiceData: any) {
    return await this.makeRequest(`/invoices/${invoiceId}`, 'PUT', invoiceData)
  }

  async sendInvoice(invoiceId: string) {
    return await this.makeRequest(`/invoices/${invoiceId}/send`, 'POST')
  }

  // Item Management (Products)
  async getItems() {
    return await this.makeRequest('/items')
  }

  async createItem(itemData: any) {
    return await this.makeRequest('/items', 'POST', itemData)
  }

  async updateItem(itemId: string, itemData: any) {
    return await this.makeRequest(`/items/${itemId}`, 'PUT', itemData)
  }

  // Reports
  async getProfitAndLossReport(startDate: string, endDate: string) {
    return await this.makeRequest(`/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}`)
  }

  async getBalanceSheetReport(asOfDate: string) {
    return await this.makeRequest(`/reports/BalanceSheet?as_of_date=${asOfDate}`)
  }

  async getCashFlowReport(startDate: string, endDate: string) {
    return await this.makeRequest(`/reports/CashFlow?start_date=${startDate}&end_date=${endDate}`)
  }

  // Sync POS data to QuickBooks
  async syncCustomerFromPOS(posCustomer: any) {
    const qbCustomer = {
      Name: posCustomer.business_name || posCustomer.name,
      CompanyName: posCustomer.business_name,
      PrimaryEmailAddr: { Address: posCustomer.email },
      PrimaryPhone: { FreeFormNumber: posCustomer.phone },
      BillAddr: {
        Line1: posCustomer.address,
        City: posCustomer.city || 'Kampala',
        Country: 'Uganda'
      }
    }

    return await this.createCustomer(qbCustomer)
  }

  async syncProductFromPOS(posProduct: any) {
    const qbItem = {
      Name: posProduct.name,
      Description: posProduct.description || posProduct.name,
      UnitPrice: posProduct.price,
      Type: 'Inventory',
      QtyOnHand: posProduct.stock || 0,
      IncomeAccountRef: { value: '1' }, // Default income account
      AssetAccountRef: { value: '2' }  // Default asset account
    }

    return await this.createItem(qbItem)
  }

  async syncSaleToInvoice(posSale: any, customerId: string) {
    const invoiceData = {
      CustomerRef: { value: customerId },
      Line: posSale.items.map((item: any) => ({
        DetailType: 'SalesItemLineDetail',
        Amount: item.price * item.quantity,
        SalesItemLineDetail: {
          ItemRef: { value: item.product_id },
          Qty: item.quantity,
          UnitPrice: item.price
        }
      })),
      TxnDate: posSale.created_at.split('T')[0],
      DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    }

    return await this.createInvoice(invoiceData)
  }

  // Check connection status
  async checkConnection(): Promise<{ connected: boolean; companyName?: string; error?: string }> {
    try {
      const { data: tokenData, error } = await supabase
        .from('quickbooks_tokens')
        .select('*')
        .limit(1)
        .single()

      if (error || !tokenData) {
        return { connected: false }
      }

      // Test API connection
      await this.makeRequest('/companyinfo/1')
      
      return { 
        connected: true, 
        companyName: tokenData.company_name 
      }
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }
    }
  }
}

export const quickbooksService = new QuickBooksService()