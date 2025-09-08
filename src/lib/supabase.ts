import { createClient } from '@supabase/supabase-js'

// Get environment variables with better error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly set
console.log('🔍 Environment Variables Check:')
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please set these in your Vercel environment variables.')
}

// Fallback to demo credentials for development
const fallbackUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8'

export const supabase = createClient(
  supabaseUrl || fallbackUrl, 
  supabaseAnonKey || fallbackKey
)

// Database types
export interface User {
  id: string
  email: string
  created_at: string
  tier: 'free_trial' | 'basic' | 'standard' | 'premium' | 'start_smart' | 'grow_intelligence' | 'enterprise_advantage'
  business_name?: string
  phone?: string
  address?: string
  email_verified?: boolean
  verification_timestamp?: string
  verified_by?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  barcode: string
  wholesale_barcode?: string
  price: number
  cost: number
  stock: number
  min_stock?: number
  category?: string
  supplier?: string
  unit_type?: 'piece' | 'kg' | 'liter' | 'box' | 'pack'
  selling_type?: 'retail' | 'wholesale' | 'both'
  category_id?: string
  supplier_id?: string
  user_id: string
  created_at: string
  updated_at?: string
}

export interface Sale {
  id: string
  user_id: string
  customer_name?: string
  customer_phone?: string
  payment_method: 'cash' | 'mobile_money' | 'card' | 'flutterwave'
  subtotal: number
  discount: number
  tax: number
  total: number
  receipt_number: string
  created_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  price: number
  subtotal: number
  created_at: string
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
