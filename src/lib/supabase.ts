import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  created_at: string
  tier: 'free_trial' | 'basic' | 'standard' | 'premium'
  business_name?: string
  phone?: string
  address?: string
}

export interface Product {
  id: string
  name: string
  barcode: string
  price: number
  cost: number
  stock: number
  category_id?: string
  supplier_id?: string
  user_id: string
  created_at: string
}

export interface Sale {
  id: string
  user_id: string
  total: number
  payment_method: 'cash' | 'mobile_money' | 'card' | 'flutterwave'
  created_at: string
  receipt_number: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  price: number
  product?: Product
}

export interface Subscription {
  id: string
  user_id: string
  tier: 'free_trial' | 'basic' | 'standard' | 'premium'
  status: 'trial' | 'active' | 'expired' | 'cancelled'
  expires_at: string
  created_at: string
}
