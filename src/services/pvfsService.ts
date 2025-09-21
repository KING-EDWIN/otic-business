import { supabase } from '@/lib/supabaseClient'

export interface VFTCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export interface VisualFilterTag {
  id: string
  tag_name: string
  category_id: string
  last_used: string | null
  confidence_score: number
  created_at: string
}

export interface VFTProduct {
  id: string
  vft_id: string
  brand_name: string
  product_name: string
  description: string
  price: number
  cost: number
  profit_margin: number
  stock_quantity: number
  min_stock_level: number
  barcode: string | null
  sku: string | null
  weight: number | null
  dimensions: string | null
  color: string | null
  size: string | null
  material: string | null
  country_of_origin: string | null
  supplier: string | null
  created_at: string
  updated_at: string
}

export interface ProductVisualFingerprint {
  id: string
  product_id: string
  image_url: string
  angle_type: 'front' | 'back' | 'side' | 'top'
  confidence_score: number
  image_hash: string | null
  file_size: number | null
  dimensions: string | null
  created_at: string
}

export interface VisualScanResult {
  id: string
  vft_name: string
  detected_objects: any[]
  confidence_score: number
  scan_location: string
  created_at: string
}

export interface VFTAnalytics {
  vft_name: string
  total_scans: number
  total_sales: number
  total_revenue: number
  avg_confidence: number
  most_used_hour: number
  most_used_day: number
}

export interface SimilarProduct {
  similar_product_id: string
  similarity_score: number
  similarity_reason: string
}

class PVFSService {
  /**
   * Get all VFT categories
   */
  async getCategories(): Promise<VFTCategory[]> {
    const { data, error } = await supabase
      .from('vft_categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('❌ Error fetching categories:', error)
      throw error
    }

    return data || []
  }

  /**
   * Create a new VFT
   */
  async createVFT(
    tagName: string,
    categoryId: string,
    confidenceScore: number = 0.0
  ): Promise<string> {
    const maxRetries = 3
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`createVFT: Attempt ${attempt}/${maxRetries}`)
        
        // Use the same authentication pattern as the main system
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('createVFT: Auth error:', userError)
          lastError = new Error('Authentication error: ' + userError.message)
          if (attempt < maxRetries) continue
          throw lastError
        }
        
        if (!user) {
          console.error('createVFT: User not authenticated')
          lastError = new Error('User not authenticated')
          if (attempt < maxRetries) continue
          throw lastError
        }

        // First, check if VFT already exists
        console.log('🔍 Checking if VFT already exists:', tagName, 'for user:', user.id)
        const { data: existingVFT, error: fetchError } = await supabase
          .from('visual_filter_tags')
          .select('*')
          .eq('user_id', user.id)
          .eq('tag_name', tagName)
          .single()
        
        if (existingVFT) {
          console.log('✅ VFT already exists, returning existing ID:', existingVFT.id)
          return existingVFT.id
        }
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('❌ Error checking for existing VFT:', fetchError)
          throw fetchError
        }
        
        // VFT doesn't exist, create it
        console.log('🆕 VFT does not exist, creating new one:', tagName)
        const { data, error } = await supabase.rpc('create_vft', {
          p_tag_name: tagName,
          p_category_id: categoryId,
          p_confidence_score: confidenceScore
        })

        if (error) {
          console.error('❌ Error creating VFT:', error)
          console.log('🔍 Error details - code:', error.code, 'message:', error.message)
          
          // Handle specific error cases
          if (error.message?.includes('function create_vft') || error.code === 'PGRST202') {
            throw new Error('Database schema not set up. Please run the PVFS schema in Supabase first.')
          }
          
          if (error.code === '42501') {
            throw new Error('Access denied. Please check your permissions.')
          }
          
          if (error.message?.includes('access control checks')) {
            lastError = new Error('Access control error. Please refresh the page and try again.')
            if (attempt < maxRetries) continue
            throw lastError
          }
          
          throw error
        }

        console.log('✅ VFT created successfully')
        return data
      } catch (err) {
        console.error(`❌ Error creating VFT (attempt ${attempt}):`, err)
        lastError = err
        
        // If it's a network error, retry
        if (err instanceof TypeError && err.message.includes('Load failed')) {
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in ${attempt * 1000}ms...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
          throw new Error('Network connection failed after multiple attempts. Please check your internet connection and try again.')
        }
        
        // For other errors, don't retry
        throw err
      }
    }
    
    throw lastError
  }

  /**
   * Register a product with VFT
   */
  async registerVFTProduct(
    vftId: string,
    brandName: string,
    productName: string,
    description: string,
    price: number,
    cost: number,
    stockQuantity: number = 0,
    barcode?: string,
    sku?: string,
    weight?: number,
    dimensions?: string,
    color?: string,
    size?: string,
    material?: string,
    countryOfOrigin?: string,
    supplier?: string
  ): Promise<string> {
    const maxRetries = 3
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`registerVFTProduct: Attempt ${attempt}/${maxRetries}`)
        
        const { data, error } = await supabase.rpc('register_vft_product', {
        p_vft_id: vftId,
        p_brand_name: brandName,
        p_product_name: productName,
        p_description: description,
        p_price: price,
        p_cost: cost,
        p_stock_quantity: stockQuantity,
        p_barcode: barcode,
        p_sku: sku,
        p_weight: weight,
        p_dimensions: dimensions,
        p_color: color,
        p_size: size,
        p_material: material,
        p_country_of_origin: countryOfOrigin,
        p_supplier: supplier
      })

      if (error) {
        console.error('❌ Error registering VFT product:', error)
        
        // If RPC function doesn't exist, provide helpful error message
        if (error.message?.includes('function register_vft_product') || error.code === 'PGRST202') {
          throw new Error('Database schema not set up. Please run the PVFS schema in Supabase first.')
        }
        
        if (error.message?.includes('access control checks')) {
          lastError = new Error('Access control error. Please refresh the page and try again.')
          if (attempt < maxRetries) continue
          throw lastError
        }
        
        throw error
      }

      console.log('✅ VFT product registered successfully')
      return data
      } catch (err) {
        console.error(`❌ Error registering VFT product (attempt ${attempt}):`, err)
        lastError = err
        
        // If it's a network error, retry
        if (err instanceof TypeError && err.message.includes('Load failed')) {
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in ${attempt * 1000}ms...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
          throw new Error('Network connection failed after multiple attempts. Please check your internet connection and try again.')
        }
        
        // For other errors, don't retry
        throw err
      }
    }
    
    throw lastError
  }

  /**
   * Log a visual scan
   */
  async logVisualScan(
    vftName: string,
    detectedObjects: any[],
    confidenceScore: number,
    scanLocation: string = 'mobile',
    productId?: string,
    scanImageUrl?: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc('log_visual_scan', {
      p_product_id: productId,
      p_vft_name: vftName,
      p_scan_image_url: scanImageUrl,
      p_detected_objects: detectedObjects,
      p_confidence_score: confidenceScore,
      p_scan_location: scanLocation
    })

    if (error) {
      console.error('❌ Error logging visual scan:', error)
      throw error
    }

    return data
  }

  /**
   * Get products by VFT for POS with retry logic
   */
  async getProductsByVFT(vftName: string): Promise<VFTProduct[]> {
    const maxRetries = 3
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Fetching products for VFT "${vftName}" (attempt ${attempt}/${maxRetries})`)
        
        // Use direct query instead of RPC function to avoid column reference issues
        const { data, error } = await supabase
          .from('vft_products')
          .select(`
            id,
            vft_id,
            brand_name,
            product_name,
            description,
            price,
            cost,
            profit_margin,
            stock_quantity,
            min_stock_level,
            barcode,
            sku,
            weight,
            dimensions,
            color,
            size,
            material,
            country_of_origin,
            supplier,
            created_at,
            updated_at,
            visual_filter_tags!inner(id, tag_name)
          `)
          .eq('visual_filter_tags.tag_name', vftName)
          .eq('visual_filter_tags.user_id', (await supabase.auth.getUser()).data.user?.id)
          .gt('stock_quantity', 0)
          .order('created_at', { ascending: false })

        if (error) {
          console.error(`❌ Error fetching products by VFT (attempt ${attempt}):`, error)
          
          // If it's a network error, retry
          if (error.message?.includes('Load failed') || error.message?.includes('network')) {
            if (attempt < maxRetries) {
              console.log(`⏳ Retrying in ${attempt * 1000}ms...`)
              await new Promise(resolve => setTimeout(resolve, attempt * 1000))
              continue
            }
            throw new Error('Network connection failed after multiple attempts. Please check your internet connection and try again.')
          }
          
          throw error
        }

        console.log('✅ Products fetched successfully:', data?.length || 0, 'products for VFT:', vftName)

        // Map the data to match the expected interface
        return (data || []).map(product => ({
          id: product.id,
          vft_id: product.vft_id,
          brand_name: product.brand_name,
          product_name: product.product_name,
          description: product.description || '',
          price: product.price,
          cost: product.cost || 0,
          profit_margin: product.profit_margin,
          stock_quantity: product.stock_quantity,
          min_stock_level: product.min_stock_level || 5,
          barcode: product.barcode,
          sku: product.sku,
          weight: product.weight,
          dimensions: product.dimensions,
          color: product.color,
          size: product.size,
          material: product.material,
          country_of_origin: product.country_of_origin,
          supplier: product.supplier,
          created_at: product.created_at,
          updated_at: product.updated_at
        }))
      } catch (err) {
        console.error(`❌ Error fetching products by VFT (attempt ${attempt}):`, err)
        lastError = err
        
        // If it's a network error, retry
        if (err instanceof TypeError && err.message.includes('Load failed')) {
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in ${attempt * 1000}ms...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
          throw new Error('Network connection failed after multiple attempts. Please check your internet connection and try again.')
        }
        
        // For other errors, don't retry
        throw err
      }
    }
    
    throw lastError
  }

  /**
   * Detect similar products
   */
  async detectSimilarProducts(productId: string): Promise<SimilarProduct[]> {
    const { data, error } = await supabase.rpc('detect_similar_products', {
      p_product_id: productId
    })

    if (error) {
      console.error('❌ Error detecting similar products:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get VFT analytics
   */
  async getVFTAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<VFTAnalytics[]> {
    const { data, error } = await supabase.rpc('get_vft_analytics', {
      p_start_date: startDate,
      p_end_date: endDate
    })

    if (error) {
      console.error('❌ Error fetching VFT analytics:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get user's VFTs with retry logic and comprehensive error handling
   */
  async getUserVFTs(): Promise<VisualFilterTag[]> {
    const maxRetries = 3
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Fetching user VFTs (attempt ${attempt}/${maxRetries})`)
        
        // Check network connectivity first
        if (!navigator.onLine) {
          throw new Error('No internet connection. Please check your network and try again.')
        }

        // Check if user is authenticated with better error handling
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('Auth error in getUserVFTs:', userError)
          throw new Error('Authentication error. Please refresh the page and try again.')
        }
        if (!user) {
          throw new Error('User not authenticated. Please sign in and try again.')
        }

        const { data, error } = await supabase
          .from('visual_filter_tags')
          .select(`
            *,
            vft_categories (
              id,
              name,
              icon,
              color
            )
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error(`❌ Error fetching user VFTs (attempt ${attempt}):`, error)
          
          // Handle specific error types
          if (error.code === 'PGRST301' || error.message?.includes('503')) {
            throw new Error('Service temporarily unavailable. Please try again in a moment.')
          }
          
          if (error.code === 'PGRST116' || error.message?.includes('access control')) {
            throw new Error('Access denied. Please refresh the page and try again.')
          }
          
          if (error.message?.includes('Load failed') || error.message?.includes('network')) {
            if (attempt < maxRetries) {
              console.log(`⏳ Retrying in ${attempt * 1000}ms...`)
              await new Promise(resolve => setTimeout(resolve, attempt * 1000))
              continue
            }
            throw new Error('Network connection failed after multiple attempts. Please check your internet connection and try again.')
          }
          
          throw error
        }

        console.log('✅ User VFTs fetched successfully:', data?.length || 0, 'VFTs')
        return data || []
      } catch (err) {
        console.error(`❌ Error fetching user VFTs (attempt ${attempt}):`, err)
        lastError = err
        
        // Handle specific error types with retry logic
        if (err instanceof TypeError && err.message.includes('Load failed') || 
            err.message?.includes('503') || err.message?.includes('Service temporarily unavailable')) {
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in ${attempt * 1000}ms...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            continue
          }
          throw new Error('Service temporarily unavailable. Please try again in a moment.')
        }
        
        // For authentication errors, don't retry
        if (err.message?.includes('not authenticated')) {
          throw err
        }
        
        // For service unavailable errors, retry with exponential backoff
        if (err.message?.includes('Service temporarily unavailable') || err.message?.includes('503')) {
          if (attempt < maxRetries) {
            console.log(`⏳ Service unavailable, retrying in ${attempt * 2000}ms...`)
            await new Promise(resolve => setTimeout(resolve, attempt * 2000))
            continue
          }
          throw new Error('Service is temporarily unavailable. Please try again later.')
        }
        
        // For other errors, don't retry
        throw err
      }
    }
    
    throw lastError
  }

  /**
   * Get user's VFT products
   */
  async getUserVFTProducts(): Promise<VFTProduct[]> {
    const { data, error } = await supabase
      .from('vft_products')
      .select(`
        *,
        visual_filter_tags (
          id,
          tag_name,
          vft_categories (
            id,
            name,
            icon,
            color
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching user VFT products:', error)
      throw error
    }

    return data || []
  }

  /**
   * Add visual fingerprint to product
   */
  async addVisualFingerprint(
    productId: string,
    imageUrl: string,
    angleType: 'front' | 'back' | 'side' | 'top',
    confidenceScore: number = 0.0,
    imageHash?: string,
    fileSize?: number,
    dimensions?: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from('product_visual_fingerprints')
      .insert({
        product_id: productId,
        image_url: imageUrl,
        angle_type: angleType,
        confidence_score: confidenceScore,
        image_hash: imageHash,
        file_size: fileSize,
        dimensions: dimensions
      })
      .select('id')
      .single()

    if (error) {
      console.error('❌ Error adding visual fingerprint:', error)
      throw error
    }

    return data.id
  }

  /**
   * Get visual fingerprints for a product
   */
  async getProductVisualFingerprints(productId: string): Promise<ProductVisualFingerprint[]> {
    const { data, error } = await supabase
      .from('product_visual_fingerprints')
      .select('*')
      .eq('product_id', productId)
      .order('angle_type')

    if (error) {
      console.error('❌ Error fetching visual fingerprints:', error)
      throw error
    }

    return data || []
  }

  /**
   * Update product stock
   */
  async updateProductStock(productId: string, newStock: number): Promise<void> {
    const { error } = await supabase
      .from('vft_products')
      .update({ stock_quantity: newStock })
      .eq('id', productId)

    if (error) {
      console.error('❌ Error updating product stock:', error)
      throw error
    }
  }

  /**
   * Get visual scan history
   */
  async getVisualScanHistory(limit: number = 50): Promise<VisualScanResult[]> {
    const { data, error } = await supabase
      .from('visual_scan_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching visual scan history:', error)
      throw error
    }

    return data || []
  }

  /**
   * Check for duplicate products using AI
   */
  async checkForDuplicates(productId: string): Promise<SimilarProduct[]> {
    const similarProducts = await this.detectSimilarProducts(productId)
    
    // Filter for high similarity (>= 0.7)
    return similarProducts.filter(product => product.similarity_score >= 0.7)
  }

  /**
   * Log similarity action
   */
  async logSimilarityAction(
    product1Id: string,
    product2Id: string,
    similarityScore: number,
    similarityReason: string,
    userAction: 'ignore' | 'merge' | 'separate'
  ): Promise<void> {
    const { error } = await supabase
      .from('product_similarity_log')
      .insert({
        product1_id: product1Id,
        product2_id: product2Id,
        similarity_score: similarityScore,
        similarity_reason: similarityReason,
        user_action: userAction
      })

    if (error) {
      console.error('❌ Error logging similarity action:', error)
      throw error
    }
  }
}

// Export singleton instance
export const pvfsService = new PVFSService()
