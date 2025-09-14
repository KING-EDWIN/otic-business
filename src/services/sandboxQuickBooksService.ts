import { supabase } from '@/lib/supabaseClient'
import { getCurrentUserInfo } from '@/utils/userUtils'

// Direct Sandbox QuickBooks Service (for testing without OAuth)
export class SandboxQuickBooksService {
  private baseUrl = 'https://sandbox-quickbooks.api.intuit.com'
  private companyId = '9341455307021048' // Your sandbox company ID

  // For sandbox testing, we'll simulate the connection
  async connectToSandbox(): Promise<{ success: boolean; error?: string }> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) {
        return { success: false, error: 'User not authenticated' }
      }

      // For demo mode, always return success without storing in database
      if (userInfo.isDemo) {
        return { success: true }
      }

      // Store a mock token for sandbox testing
      const { error } = await supabase
        .from('quickbooks_tokens')
        .upsert({
          user_id: userInfo.id,
          access_token: 'sandbox_access_token',
          refresh_token: 'sandbox_refresh_token',
          company_id: this.companyId,
          company_name: 'Sandbox Company_US_1',
          expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        })

      if (error) {
        console.error('Error storing sandbox token:', error)
        return { success: false, error: 'Failed to store sandbox connection' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error connecting to sandbox:', error)
      return { success: false, error: 'Failed to connect to sandbox' }
    }
  }

  // Check if connected to sandbox
  async isConnected(): Promise<boolean> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) return false

      // For demo mode, always return true
      if (userInfo.isDemo) {
        return true
      }

      const { data, error } = await supabase
        .from('quickbooks_tokens')
        .select('*')
        .eq('user_id', userInfo.id)
        .eq('company_id', this.companyId)
        .limit(1)

      return !error && data && data.length > 0
    } catch (error) {
      console.error('Error checking sandbox connection:', error)
      return false
    }
  }

  // Get sandbox company info
  async getCompanyInfo(): Promise<{ companyId: string; companyName: string } | null> {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) return null

      const { data, error } = await supabase
        .from('quickbooks_tokens')
        .select('company_id, company_name')
        .eq('user_id', userInfo.id)
        .eq('company_id', this.companyId)
        .limit(1)

      if (error || !data || data.length === 0) return null

      return {
        companyId: data[0].company_id,
        companyName: data[0].company_name
      }
    } catch (error) {
      console.error('Error getting company info:', error)
      return null
    }
  }

  // Simulate getting invoices from sandbox
  async getInvoices(): Promise<any> {
    // Return mock data for sandbox testing
    return {
      QueryResponse: {
        Invoice: [
          {
            Id: '1',
            DocNumber: 'INV-001',
            CustomerRef: { name: 'Test Customer 1' },
            TotalAmt: 150000,
            TxnDate: '2025-01-07',
            Balance: 0
          },
          {
            Id: '2',
            DocNumber: 'INV-002',
            CustomerRef: { name: 'Test Customer 2' },
            TotalAmt: 75000,
            TxnDate: '2025-01-06',
            Balance: 25000
          }
        ]
      }
    }
  }

  // Simulate getting customers from sandbox
  async getCustomers(): Promise<any> {
    return {
      QueryResponse: {
        Customer: [
          {
            Id: '1',
            Name: 'Test Customer 1',
            CompanyName: 'Test Company 1',
            PrimaryEmailAddr: { Address: 'customer1@test.com' },
            PrimaryPhone: { FreeFormNumber: '+256 700 000 001' }
          },
          {
            Id: '2',
            Name: 'Test Customer 2',
            CompanyName: 'Test Company 2',
            PrimaryEmailAddr: { Address: 'customer2@test.com' },
            PrimaryPhone: { FreeFormNumber: '+256 700 000 002' }
          }
        ]
      }
    }
  }

  // Simulate getting items from sandbox
  async getItems(): Promise<any> {
    return {
      QueryResponse: {
        Item: [
          {
            Id: '1',
            Name: 'Test Product 1',
            Sku: 'TEST-001',
            UnitPrice: 50000,
            QtyOnHand: 100,
            Type: 'Inventory'
          },
          {
            Id: '2',
            Name: 'Test Product 2',
            Sku: 'TEST-002',
            UnitPrice: 25000,
            QtyOnHand: 50,
            Type: 'Inventory'
          }
        ]
      }
    }
  }
}

export const sandboxQuickBooksService = new SandboxQuickBooksService()
