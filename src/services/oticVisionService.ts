/**
 * OTIC Vision Service - RGB Token-based Product Recognition
 * 
 * This service implements the core RGB token generation and similarity matching
 * for visual product recognition without requiring ML training.
 */

import { supabase } from '@/lib/supabaseClient'

export interface RGBToken {
  histogram: number[]
  dominantColors: Array<{ r: number; g: number; b: number; percentage: number }>
  spatialDistribution: {
    topLeft: { r: number; g: number; b: number; percentage: number }
    topRight: { r: number; g: number; b: number; percentage: number }
    bottomLeft: { r: number; g: number; b: number; percentage: number }
    bottomRight: { r: number; g: number; b: number; percentage: number }
  }
  imageFeatures: {
    brightness: number
    contrast: number
    colorTemperature: number
    aspectRatio: number
  }
  tokenHash: string
  generatedAt: string
}

export interface ProductMatch {
  productId: string
  productName: string
  manufacturer: string
  category: string
  price: number
  costPrice: number
  similarityScore: number
  confidence: number
  imageUrl?: string
}

export interface TokenSimilarityLog {
  id: string
  productId: string
  detectedToken: RGBToken
  similarityScore: number
  matchedAt: string
  isMatch: boolean
}

class OticVisionService {
  private readonly HISTOGRAM_BINS = 8 // 8x8x8 = 512 bins for RGB histogram
  private readonly SIMILARITY_THRESHOLD = 0.85 // 85% similarity threshold
  private readonly MAX_PIXELS_SAMPLE = 2000 // Limit pixel processing for performance

  /**
   * Generate RGB token from image data
   */
  async generateToken(imageData: ImageData): Promise<RGBToken> {
    console.log('🎨 Generating RGB token from image...')
    
    const { width, height, data } = imageData
    
    // Sample pixels for performance
    const sampledPixels = this.samplePixels(data, width, height)
    console.log(`📊 Sampled ${sampledPixels.length} pixels from ${width}x${height} image`)
    
    // Generate RGB histogram
    const histogram = this.generateRGBHistogram(sampledPixels)
    
    // Extract dominant colors
    const dominantColors = this.extractDominantColors(sampledPixels)
    
    // Analyze spatial distribution
    const spatialDistribution = this.analyzeSpatialDistribution(sampledPixels, width, height)
    
    // Calculate image features
    const imageFeatures = this.calculateImageFeatures(sampledPixels, width, height)
    
    // Generate token hash
    const tokenHash = this.generateTokenHash(histogram, dominantColors, imageFeatures)
    
    const token: RGBToken = {
      histogram,
      dominantColors,
      spatialDistribution,
      imageFeatures,
      tokenHash,
      generatedAt: new Date().toISOString()
    }
    
    console.log('✅ RGB token generated:', {
      histogramBins: histogram.length,
      dominantColors: dominantColors.length,
      tokenHash: tokenHash.substring(0, 16) + '...'
    })
    
    return token
  }

  /**
   * Sample pixels from image data for performance
   */
  private samplePixels(data: Uint8ClampedArray, width: number, height: number) {
    const pixels = []
    const totalPixels = width * height
    const step = Math.max(1, Math.floor(totalPixels / this.MAX_PIXELS_SAMPLE))
    
    for (let i = 0; i < data.length && pixels.length < this.MAX_PIXELS_SAMPLE; i += step * 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      if (a > 128) { // Skip transparent pixels
        const pixelIndex = i / 4
        pixels.push({
          r, g, b,
          x: pixelIndex % width,
          y: Math.floor(pixelIndex / width)
        })
      }
    }
    
    return pixels
  }

  /**
   * Generate RGB histogram (8x8x8 = 512 bins)
   */
  private generateRGBHistogram(pixels: any[]): number[] {
    const bins = this.HISTOGRAM_BINS
    const histogram = new Array(bins * bins * bins).fill(0)
    
    pixels.forEach(pixel => {
      const rBin = Math.floor(pixel.r / (256 / bins))
      const gBin = Math.floor(pixel.g / (256 / bins))
      const bBin = Math.floor(pixel.b / (256 / bins))
      
      const index = rBin * bins * bins + gBin * bins + bBin
      histogram[index]++
    })
    
    // Normalize histogram
    const totalPixels = pixels.length
    return histogram.map(count => count / totalPixels)
  }

  /**
   * Extract dominant colors using color quantization
   */
  private extractDominantColors(pixels: any[]): Array<{ r: number; g: number; b: number; percentage: number }> {
    if (pixels.length === 0) return []
    
    // Quantize colors to reduce noise
    const quantize = (value: number) => Math.floor(value / 32) * 32
    const colorMap = new Map<string, number>()
    
    pixels.forEach(pixel => {
      const quantizedR = quantize(pixel.r)
      const quantizedG = quantize(pixel.g)
      const quantizedB = quantize(pixel.b)
      const key = `${quantizedR},${quantizedG},${quantizedB}`
      
      colorMap.set(key, (colorMap.get(key) || 0) + 1)
    })
    
    // Convert to array and sort by frequency
    const colorCounts = Array.from(colorMap.entries())
      .map(([key, count]) => {
        const [r, g, b] = key.split(',').map(Number)
        return { r, g, b, count }
      })
      .sort((a, b) => b.count - a.count)
    
    const totalPixels = pixels.length
    return colorCounts
      .slice(0, 5) // Top 5 colors
      .filter(c => c.count > totalPixels * 0.02) // At least 2% of pixels
      .map(c => ({
        r: c.r,
        g: c.g,
        b: c.b,
        percentage: c.count / totalPixels
      }))
  }

  /**
   * Analyze spatial distribution of colors
   */
  private analyzeSpatialDistribution(pixels: any[], width: number, height: number) {
    const regions = {
      topLeft: { x: 0, y: 0, width: width / 2, height: height / 2 },
      topRight: { x: width / 2, y: 0, width: width / 2, height: height / 2 },
      bottomLeft: { x: 0, y: height / 2, width: width / 2, height: height / 2 },
      bottomRight: { x: width / 2, y: height / 2, width: width / 2, height: height / 2 }
    }
    
    const distribution: any = {}
    
    Object.entries(regions).forEach(([regionName, region]) => {
      const regionPixels = pixels.filter(pixel => 
        pixel.x >= region.x && pixel.x < region.x + region.width &&
        pixel.y >= region.y && pixel.y < region.y + region.height
      )
      
      if (regionPixels.length > 0) {
        // Calculate average color in this region
        const avgR = Math.round(regionPixels.reduce((sum, p) => sum + p.r, 0) / regionPixels.length)
        const avgG = Math.round(regionPixels.reduce((sum, p) => sum + p.g, 0) / regionPixels.length)
        const avgB = Math.round(regionPixels.reduce((sum, p) => sum + p.b, 0) / regionPixels.length)
        
        distribution[regionName] = {
          r: avgR,
          g: avgG,
          b: avgB,
          percentage: regionPixels.length / pixels.length
        }
      }
    })
    
    return distribution
  }

  /**
   * Calculate image features
   */
  private calculateImageFeatures(pixels: any[], width: number, height: number) {
    if (pixels.length === 0) {
      return { brightness: 0, contrast: 0, colorTemperature: 6500, aspectRatio: 1 }
    }
    
    // Calculate average brightness
    const avgBrightness = pixels.reduce((sum, pixel) => {
      return sum + (pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114) / 255
    }, 0) / pixels.length
    
    // Calculate contrast
    const brightnessValues = pixels.map(pixel => 
      pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114
    )
    const maxBrightness = Math.max(...brightnessValues)
    const minBrightness = Math.min(...brightnessValues)
    const contrast = maxBrightness - minBrightness
    
    // Calculate color temperature (simplified)
    const avgR = pixels.reduce((sum, p) => sum + p.r, 0) / pixels.length
    const avgG = pixels.reduce((sum, p) => sum + p.g, 0) / pixels.length
    const avgB = pixels.reduce((sum, p) => sum + p.b, 0) / pixels.length
    const colorTemperature = 6500 + (avgR - avgB) * 100
    
    return {
      brightness: avgBrightness,
      contrast: contrast / 255, // Normalize to 0-1
      colorTemperature,
      aspectRatio: width / height
    }
  }

  /**
   * Generate token hash for quick comparison
   */
  private generateTokenHash(histogram: number[], dominantColors: any[], imageFeatures: any): string {
    const hashData = {
      histogram: histogram.slice(0, 64), // First 64 bins for hash
      dominantColors: dominantColors.slice(0, 3), // Top 3 colors
      features: imageFeatures
    }
    
    const hashString = JSON.stringify(hashData)
    let hash = 0
    
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16)
  }

  /**
   * Calculate similarity between two RGB tokens
   */
  calculateSimilarity(tokenA: RGBToken, tokenB: RGBToken): number {
    // Weighted similarity calculation
    let totalSimilarity = 0
    let weights = 0
    
    // 1. Histogram similarity (50% weight)
    const histogramSimilarity = this.calculateHistogramSimilarity(tokenA.histogram, tokenB.histogram)
    totalSimilarity += histogramSimilarity * 0.5
    weights += 0.5
    
    // 2. Dominant color similarity (30% weight)
    const colorSimilarity = this.calculateColorSimilarity(tokenA.dominantColors, tokenB.dominantColors)
    totalSimilarity += colorSimilarity * 0.3
    weights += 0.3
    
    // 3. Spatial distribution similarity (20% weight)
    const spatialSimilarity = this.calculateSpatialSimilarity(tokenA.spatialDistribution, tokenB.spatialDistribution)
    totalSimilarity += spatialSimilarity * 0.2
    weights += 0.2
    
    return weights > 0 ? totalSimilarity / weights : 0
  }

  /**
   * Calculate histogram similarity using cosine similarity
   */
  calculateHistogramSimilarity(histA: number[], histB: number[]): number {
    if (histA.length !== histB.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < histA.length; i++) {
      dotProduct += histA[i] * histB[i]
      normA += histA[i] * histA[i]
      normB += histB[i] * histB[i]
    }
    
    if (normA === 0 || normB === 0) return 0
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Calculate dominant color similarity
   */
  calculateColorSimilarity(colorsA: any[], colorsB: any[]): number {
    if (colorsA.length === 0 || colorsB.length === 0) return 0
    
    let totalSimilarity = 0
    let matches = 0
    
    colorsA.forEach(colorA => {
      let bestMatch = 0
      colorsB.forEach(colorB => {
        const distance = Math.sqrt(
          Math.pow(colorA.r - colorB.r, 2) +
          Math.pow(colorA.g - colorB.g, 2) +
          Math.pow(colorA.b - colorB.b, 2)
        )
        const similarity = Math.max(0, 1 - distance / 441) // 441 is max RGB distance
        bestMatch = Math.max(bestMatch, similarity)
      })
      totalSimilarity += bestMatch * colorA.percentage
      matches += colorA.percentage
    })
    
    return matches > 0 ? totalSimilarity / matches : 0
  }

  /**
   * Calculate spatial distribution similarity
   */
  calculateSpatialSimilarity(distA: any, distB: any): number {
    const regions = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
    let totalSimilarity = 0
    let matches = 0
    
    regions.forEach(region => {
      if (distA[region] && distB[region]) {
        const distance = Math.sqrt(
          Math.pow(distA[region].r - distB[region].r, 2) +
          Math.pow(distA[region].g - distB[region].g, 2) +
          Math.pow(distA[region].b - distB[region].b, 2)
        )
        const similarity = Math.max(0, 1 - distance / 441)
        totalSimilarity += similarity
        matches++
      }
    })
    
    return matches > 0 ? totalSimilarity / matches : 0
  }

  /**
   * Find best product match from database
   */
  async findBestMatch(detectedToken: RGBToken, userId: string): Promise<ProductMatch[]> {
    console.log('🔍 Searching for product matches...')
    
    try {
      // Get all products from user's visual bank
      const { data: products, error } = await supabase
        .from('personalised_visual_bank')
        .select('*')
        .eq('user_id', userId)
      
      if (error) {
        console.error('❌ Database error:', error)
        return []
      }
      
      if (!products || products.length === 0) {
        console.log('📊 No products in visual bank')
        return []
      }
      
      console.log(`📊 Found ${products.length} products in visual bank`)
      
      // Calculate similarity with each product
      const matches: ProductMatch[] = []
      
      for (const product of products) {
        try {
          const storedToken = typeof product.token_metadata === 'string' 
            ? JSON.parse(product.token_metadata)
            : product.token_metadata
          
          const similarity = this.calculateSimilarity(detectedToken, storedToken)
          
          console.log(`🔍 Comparing with ${product.product_name}: ${(similarity * 100).toFixed(1)}%`)
          
          if (similarity >= this.SIMILARITY_THRESHOLD) {
            matches.push({
              productId: product.id,
              productName: product.product_name,
              manufacturer: product.manufacturer,
              category: product.category,
              price: product.retail_price,
              costPrice: product.cost_price,
              similarityScore: similarity,
              confidence: similarity,
              imageUrl: product.raw_image_url
            })
          }
        } catch (parseError) {
          console.error('❌ Error parsing token metadata for', product.product_name, parseError)
        }
      }
      
      // Sort by similarity score
      matches.sort((a, b) => b.similarityScore - a.similarityScore)
      
      console.log(`✅ Found ${matches.length} matches above ${(this.SIMILARITY_THRESHOLD * 100)}% similarity`)
      return matches
      
    } catch (error) {
      console.error('❌ Error finding matches:', error)
      return []
    }
  }

  /**
   * Log token similarity for analytics
   */
  async logTokenSimilarity(
    productId: string, 
    detectedToken: RGBToken, 
    similarityScore: number, 
    isMatch: boolean
  ): Promise<void> {
    try {
      const logEntry = {
        product_id: productId,
        detected_token: detectedToken,
        similarity_score: similarityScore,
        matched_at: new Date().toISOString(),
        is_match: isMatch
      }
      
      const { error } = await supabase
        .from('token_similarity_log')
        .insert(logEntry)
      
      if (error) {
        console.error('❌ Error logging similarity:', error)
      } else {
        console.log('📊 Token similarity logged successfully')
      }
    } catch (error) {
      console.error('❌ Error logging token similarity:', error)
    }
  }
}

// Export singleton instance
export const oticVisionService = new OticVisionService()
