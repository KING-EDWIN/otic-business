/**
 * 🚀 OTIC VISION ENGINE - Frontend Integration
 * Revolutionary RGB-based product recognition system
 * 
 * This engine handles:
 * - Image processing and color analysis
 * - Visual token generation
 * - Similarity matching
 * - Performance optimization
 */

import { supabase } from '@/lib/supabase'

// =====================================================
// 🎨 TYPES & INTERFACES
// =====================================================

export interface ColorCluster {
  r: number
  g: number
  b: number
  percentage: number
  x: number
  y: number
}

export interface SpatialDistribution {
  topLeft: ColorCluster
  topRight: ColorCluster
  bottomLeft: ColorCluster
  bottomRight: ColorCluster
}

export interface LightingProfile {
  lightingType: 'natural' | 'artificial' | 'mixed' | 'studio'
  brightnessLevel: number
  shadowIntensity: number
  lightingDirection: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center'
  colorTemperature: number
}

export interface VisualToken {
  token: string
  tokenHash: string
  colorAnalysis: {
    dominantColors: ColorCluster[]
    colorTemperature: number
    luminance: number
    contrastRatio: number
    saturationProfile: number[]
    hueHistogram: number[]
  }
  spatialAnalysis: {
    colorDistribution: SpatialDistribution
    patternType: 'solid' | 'gradient' | 'brand_logo' | 'text' | 'mixed'
    symmetryScore: number
  }
  lightingAnalysis: LightingProfile
  confidence: number
  generatedAt: Date
}

export interface ProductMatch {
  pvbId: string
  productName: string
  manufacturer?: string
  category?: string
  retailPrice: number
  similarityScore: number
  confidenceLevel: number
  thumbnailUrl?: string
}

export interface RecognitionResult {
  matches: ProductMatch[]
  bestMatch?: ProductMatch
  processingTimeMs: number
  confidence: number
  wasSuccessful: boolean
  error?: string
}

// =====================================================
// 🧮 MATH & PHYSICS UTILITIES
// =====================================================

export class ColorMath {
  /**
   * Convert RGB to HSV for better color analysis
   */
  static rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6
      else if (max === g) h = (b - r) / diff + 2
      else h = (r - g) / diff + 4
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360

    const s = max === 0 ? 0 : diff / max
    const v = max

    return { h, s, v }
  }

  /**
   * Calculate color distance using CIE76 formula
   */
  static colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
    const [r1, g1, b1] = rgb1
    const [r2, g2, b2] = rgb2
    
    const deltaR = r1 - r2
    const deltaG = g1 - g2
    const deltaB = b1 - b2
    
    return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB)
  }

  /**
   * Calculate luminance using relative luminance formula
   */
  static calculateLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static calculateContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
    const lum1 = this.calculateLuminance(...rgb1)
    const lum2 = this.calculateLuminance(...rgb2)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  /**
   * Extract dominant colors using K-means clustering
   */
  static extractDominantColors(imageData: ImageData, numColors: number = 5): ColorCluster[] {
    const pixels = this.getPixelsFromImageData(imageData)
    const clusters = this.kMeansClustering(pixels, numColors)
    
    return clusters.map(cluster => ({
      r: Math.round(cluster.center[0]),
      g: Math.round(cluster.center[1]),
      b: Math.round(cluster.center[2]),
      percentage: cluster.points.length / pixels.length,
      x: cluster.center[0] / 255,
      y: cluster.center[1] / 255
    }))
  }

  private static getPixelsFromImageData(imageData: ImageData): [number, number, number][] {
    const pixels: [number, number, number][] = []
    const data = imageData.data
    
    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      if (a > 128) { // Skip transparent pixels
        pixels.push([r, g, b])
      }
    }
    
    return pixels
  }

  private static kMeansClustering(pixels: [number, number, number][], k: number): Array<{center: [number, number, number], points: [number, number, number][]}> {
    // Initialize centroids randomly
    const centroids: [number, number, number][] = []
    for (let i = 0; i < k; i++) {
      const randomPixel = pixels[Math.floor(Math.random() * pixels.length)]
      centroids.push([...randomPixel])
    }
    
    let clusters: Array<{center: [number, number, number], points: [number, number, number][]}>
    let changed = true
    let iterations = 0
    
    while (changed && iterations < 100) {
      // Assign pixels to nearest centroid
      clusters = centroids.map(centroid => ({ center: [...centroid], points: [] }))
      
      for (const pixel of pixels) {
        let minDistance = Infinity
        let closestCluster = 0
        
        for (let i = 0; i < centroids.length; i++) {
          const distance = this.colorDistance(pixel, centroids[i])
          if (distance < minDistance) {
            minDistance = distance
            closestCluster = i
          }
        }
        
        clusters[closestCluster].points.push(pixel)
      }
      
      // Update centroids
      changed = false
      for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i]
        if (cluster.points.length > 0) {
          const newCenter: [number, number, number] = [
            cluster.points.reduce((sum, p) => sum + p[0], 0) / cluster.points.length,
            cluster.points.reduce((sum, p) => sum + p[1], 0) / cluster.points.length,
            cluster.points.reduce((sum, p) => sum + p[2], 0) / cluster.points.length
          ]
          
          if (this.colorDistance(centroids[i], newCenter) > 1) {
            centroids[i] = newCenter
            changed = true
          }
        }
      }
      
      iterations++
    }
    
    return clusters
  }
}

// =====================================================
// 🎯 SPATIAL ANALYSIS
// =====================================================

export class SpatialAnalyzer {
  /**
   * Analyze spatial distribution of colors
   */
  static analyzeSpatialDistribution(imageData: ImageData, dominantColors: ColorCluster[]): SpatialDistribution {
    const { width, height } = imageData
    const quarterWidth = Math.floor(width / 2)
    const quarterHeight = Math.floor(height / 2)
    
    const regions = {
      topLeft: this.analyzeRegion(imageData, 0, 0, quarterWidth, quarterHeight, dominantColors),
      topRight: this.analyzeRegion(imageData, quarterWidth, 0, width, quarterHeight, dominantColors),
      bottomLeft: this.analyzeRegion(imageData, 0, quarterHeight, quarterWidth, height, dominantColors),
      bottomRight: this.analyzeRegion(imageData, quarterWidth, quarterHeight, width, height, dominantColors)
    }
    
    return regions
  }
  
  private static analyzeRegion(
    imageData: ImageData, 
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number,
    dominantColors: ColorCluster[]
  ): ColorCluster {
    const regionPixels: [number, number, number][] = []
    const data = imageData.data
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const index = (y * imageData.width + x) * 4
        const r = data[index]
        const g = data[index + 1]
        const b = data[index + 2]
        const a = data[index + 3]
        
        if (a > 128) {
          regionPixels.push([r, g, b])
        }
      }
    }
    
    if (regionPixels.length === 0) {
      return { r: 0, g: 0, b: 0, percentage: 0, x: 0, y: 0 }
    }
    
    // Find closest dominant color
    let closestColor = dominantColors[0]
    let minDistance = Infinity
    
    for (const color of dominantColors) {
      const avgR = regionPixels.reduce((sum, p) => sum + p[0], 0) / regionPixels.length
      const avgG = regionPixels.reduce((sum, p) => sum + p[1], 0) / regionPixels.length
      const avgB = regionPixels.reduce((sum, p) => sum + p[2], 0) / regionPixels.length
      
      const distance = ColorMath.colorDistance([avgR, avgG, avgB], [color.r, color.g, color.b])
      
      if (distance < minDistance) {
        minDistance = distance
        closestColor = color
      }
    }
    
    return {
      ...closestColor,
      percentage: regionPixels.length / (imageData.width * imageData.height)
    }
  }
  
  /**
   * Calculate symmetry score
   */
  static calculateSymmetryScore(imageData: ImageData): number {
    const { width, height } = imageData
    const data = imageData.data
    let symmetricPixels = 0
    let totalPixels = 0
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < Math.floor(width / 2); x++) {
        const leftIndex = (y * width + x) * 4
        const rightIndex = (y * width + (width - 1 - x)) * 4
        
        const leftR = data[leftIndex]
        const leftG = data[leftIndex + 1]
        const leftB = data[leftIndex + 2]
        
        const rightR = data[rightIndex]
        const rightG = data[rightIndex + 1]
        const rightB = data[rightIndex + 2]
        
        const distance = ColorMath.colorDistance([leftR, leftG, leftB], [rightR, rightG, rightB])
        
        if (distance < 30) { // Threshold for "similar" colors
          symmetricPixels++
        }
        
        totalPixels++
      }
    }
    
    return totalPixels > 0 ? symmetricPixels / totalPixels : 0
  }
}

// =====================================================
// 💡 LIGHTING ANALYSIS
// =====================================================

export class LightingAnalyzer {
  /**
   * Analyze lighting conditions
   */
  static analyzeLighting(imageData: ImageData): LightingProfile {
    const { width, height } = data = imageData.data
    
    // Calculate overall brightness
    let totalBrightness = 0
    let pixelCount = 0
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      if (a > 128) {
        const luminance = ColorMath.calculateLuminance(r, g, b)
        totalBrightness += luminance
        pixelCount++
      }
    }
    
    const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 0
    
    // Analyze shadow intensity
    const shadowIntensity = this.calculateShadowIntensity(imageData)
    
    // Determine lighting direction
    const lightingDirection = this.determineLightingDirection(imageData)
    
    // Calculate color temperature
    const colorTemperature = this.calculateColorTemperature(imageData)
    
    return {
      lightingType: avgBrightness > 0.7 ? 'studio' : avgBrightness > 0.4 ? 'natural' : 'artificial',
      brightnessLevel: avgBrightness,
      shadowIntensity,
      lightingDirection,
      colorTemperature
    }
  }
  
  private static calculateShadowIntensity(imageData: ImageData): number {
    // Simplified shadow detection
    const { width, height } = imageData
    const data = imageData.data
    let darkPixels = 0
    let totalPixels = 0
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      if (a > 128) {
        const luminance = ColorMath.calculateLuminance(r, g, b)
        if (luminance < 0.3) {
          darkPixels++
        }
        totalPixels++
      }
    }
    
    return totalPixels > 0 ? darkPixels / totalPixels : 0
  }
  
  private static determineLightingDirection(imageData: ImageData): LightingProfile['lightingDirection'] {
    // Simplified lighting direction detection
    const { width, height } = imageData
    const topLeftBrightness = this.getRegionBrightness(imageData, 0, 0, width / 2, height / 2)
    const topRightBrightness = this.getRegionBrightness(imageData, width / 2, 0, width, height / 2)
    const bottomLeftBrightness = this.getRegionBrightness(imageData, 0, height / 2, width / 2, height)
    const bottomRightBrightness = this.getRegionBrightness(imageData, width / 2, height / 2, width, height)
    
    const brightnesses = [
      { direction: 'top_left' as const, brightness: topLeftBrightness },
      { direction: 'top_right' as const, brightness: topRightBrightness },
      { direction: 'bottom_left' as const, brightness: bottomLeftBrightness },
      { direction: 'bottom_right' as const, brightness: bottomRightBrightness }
    ]
    
    const brightest = brightnesses.reduce((max, current) => 
      current.brightness > max.brightness ? current : max
    )
    
    return brightest.direction
  }
  
  private static getRegionBrightness(imageData: ImageData, startX: number, startY: number, endX: number, endY: number): number {
    const data = imageData.data
    let totalBrightness = 0
    let pixelCount = 0
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const index = (y * imageData.width + x) * 4
        const r = data[index]
        const g = data[index + 1]
        const b = data[index + 2]
        const a = data[index + 3]
        
        if (a > 128) {
          totalBrightness += ColorMath.calculateLuminance(r, g, b)
          pixelCount++
        }
      }
    }
    
    return pixelCount > 0 ? totalBrightness / pixelCount : 0
  }
  
  private static calculateColorTemperature(imageData: ImageData): number {
    // Simplified color temperature calculation
    const data = imageData.data
    let totalR = 0
    let totalG = 0
    let totalB = 0
    let pixelCount = 0
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      if (a > 128) {
        totalR += r
        totalG += g
        totalB += b
        pixelCount++
      }
    }
    
    if (pixelCount === 0) return 6500
    
    const avgR = totalR / pixelCount
    const avgG = totalG / pixelCount
    const avgB = totalB / pixelCount
    
    // Convert RGB to color temperature (simplified)
    const n = (avgR - avgG) / (avgG - avgB)
    return 449 * Math.pow(n, 3) + 3525 * Math.pow(n, 2) + 6823.3 * n + 5520.33
  }
}

// =====================================================
// 🚀 MAIN OTIC VISION ENGINE
// =====================================================

export class OticVisionEngine {
  private static instance: OticVisionEngine
  private cache = new Map<string, VisualToken>()
  
  static getInstance(): OticVisionEngine {
    if (!this.instance) {
      this.instance = new OticVisionEngine()
    }
    return this.instance
  }
  
  /**
   * Generate visual token from image
   */
  async generateVisualToken(imageData: ImageData, userId: string, productName: string): Promise<VisualToken> {
    const startTime = performance.now()
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(imageData, userId, productName)
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!
      }
      
      // Extract dominant colors
      const dominantColors = ColorMath.extractDominantColors(imageData, 5)
      
      // Analyze spatial distribution
      const spatialDistribution = SpatialAnalyzer.analyzeSpatialDistribution(imageData, dominantColors)
      
      // Analyze lighting
      const lightingProfile = LightingAnalyzer.analyzeLighting(imageData)
      
      // Calculate additional metrics
      const colorTemperature = lightingProfile.colorTemperature
      const luminance = ColorMath.calculateLuminance(
        dominantColors[0]?.r || 128,
        dominantColors[0]?.g || 128,
        dominantColors[0]?.b || 128
      )
      
      // Calculate contrast ratio
      const contrastRatio = this.calculateOverallContrast(imageData)
      
      // Generate token
      const tokenData = {
        dominantColors,
        spatialDistribution,
        lightingProfile,
        colorTemperature,
        luminance,
        contrastRatio,
        userId,
        productName,
        timestamp: Date.now()
      }
      
      const token = await this.hashTokenData(tokenData)
      const tokenHash = await this.hashString(token)
      
      // Calculate confidence
      const confidence = this.calculateTokenConfidence(dominantColors, spatialDistribution, lightingProfile)
      
      const visualToken: VisualToken = {
        token,
        tokenHash,
        colorAnalysis: {
          dominantColors,
          colorTemperature,
          luminance,
          contrastRatio,
          saturationProfile: dominantColors.map(c => ColorMath.rgbToHsv(c.r, c.g, c.b).s),
          hueHistogram: this.generateHueHistogram(imageData)
        },
        spatialAnalysis: {
          colorDistribution: spatialDistribution,
          patternType: this.determinePatternType(spatialDistribution),
          symmetryScore: SpatialAnalyzer.calculateSymmetryScore(imageData)
        },
        lightingAnalysis: lightingProfile,
        confidence,
        generatedAt: new Date()
      }
      
      // Cache the result
      this.cache.set(cacheKey, visualToken)
      
      const processingTime = performance.now() - startTime
      console.log(`🎯 Visual token generated in ${processingTime.toFixed(2)}ms with confidence ${(confidence * 100).toFixed(1)}%`)
      
      return visualToken
      
    } catch (error) {
      console.error('❌ Error generating visual token:', error)
      throw new Error('Failed to generate visual token')
    }
  }
  
  /**
   * Find matching products in Personalized Visual Bank
   */
  async findMatches(detectedToken: VisualToken, userId: string, minSimilarity: number = 0.85): Promise<RecognitionResult> {
    const startTime = performance.now()
    
    try {
      // Call the database function to find matches
      const { data, error } = await supabase.rpc('find_best_token_match', {
        detected_token_metadata: detectedToken,
        user_id_param: userId,
        min_similarity: minSimilarity
      })
      
      if (error) {
        throw error
      }
      
      const matches: ProductMatch[] = data || []
      const bestMatch = matches.length > 0 ? matches[0] : undefined
      
      const processingTime = performance.now() - startTime
      
      // Log the recognition attempt
      await this.logRecognitionAttempt(detectedToken, userId, matches, processingTime)
      
      return {
        matches,
        bestMatch,
        processingTimeMs: Math.round(processingTime),
        confidence: bestMatch?.confidenceLevel || 0,
        wasSuccessful: matches.length > 0,
        error: matches.length === 0 ? 'No matching products found' : undefined
      }
      
    } catch (error) {
      console.error('❌ Error finding matches:', error)
      return {
        matches: [],
        processingTimeMs: performance.now() - startTime,
        confidence: 0,
        wasSuccessful: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Register a new product in the Personalized Visual Bank
   */
  async registerProduct(
    imageData: ImageData,
    userId: string,
    productData: {
      name: string
      manufacturer?: string
      category?: string
      retailPrice: number
      wholesalePrice?: number
      costPrice?: number
    }
  ): Promise<{ success: boolean; token?: VisualToken; error?: string }> {
    try {
      // Generate visual token
      const visualToken = await this.generateVisualToken(imageData, userId, productData.name)
      
      // Upload image to storage
      const imageUrl = await this.uploadImage(imageData, userId, productData.name)
      
      // Save to database
      const { data, error } = await supabase
        .from('personalised_visual_bank')
        .insert({
          user_id: userId,
          product_name: productData.name,
          manufacturer: productData.manufacturer,
          category: productData.category,
          retail_price: productData.retailPrice,
          wholesale_price: productData.wholesalePrice,
          cost_price: productData.costPrice,
          visual_token: visualToken.token,
          token_hash: visualToken.tokenHash,
          token_metadata: visualToken,
          raw_image_url: imageUrl,
          dominant_colors: visualToken.colorAnalysis.dominantColors,
          color_distribution: visualToken.spatialAnalysis.colorDistribution,
          lighting_profile: visualToken.lightingAnalysis,
          contrast_ratio: visualToken.colorAnalysis.contrastRatio,
          color_temperature: visualToken.colorAnalysis.colorTemperature,
          luminance: visualToken.colorAnalysis.luminance,
          recognition_confidence: visualToken.confidence
        })
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      console.log(`✅ Product "${productData.name}" registered successfully!`)
      
      return {
        success: true,
        token: visualToken
      }
      
    } catch (error) {
      console.error('❌ Error registering product:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  // =====================================================
  // 🔧 PRIVATE HELPER METHODS
  // =====================================================
  
  private generateCacheKey(imageData: ImageData, userId: string, productName: string): string {
    // Create a simple hash of the image data for caching
    const dataHash = Array.from(imageData.data.slice(0, 1000))
      .reduce((hash, byte) => hash + byte.toString(16), '')
    return `${userId}_${productName}_${dataHash}`
  }
  
  private async hashTokenData(data: any): Promise<string> {
    const jsonString = JSON.stringify(data)
    return await this.hashString(jsonString)
  }
  
  private async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  private calculateTokenConfidence(
    dominantColors: ColorCluster[],
    spatialDistribution: SpatialDistribution,
    lightingProfile: LightingProfile
  ): number {
    // Calculate confidence based on various factors
    let confidence = 0.5 // Base confidence
    
    // Color diversity bonus
    if (dominantColors.length >= 3) confidence += 0.1
    
    // Lighting quality bonus
    if (lightingProfile.brightnessLevel > 0.4 && lightingProfile.brightnessLevel < 0.9) {
      confidence += 0.1
    }
    
    // Contrast bonus
    if (dominantColors.some(c => c.percentage > 0.3)) confidence += 0.1
    
    // Shadow penalty
    if (lightingProfile.shadowIntensity > 0.5) confidence -= 0.1
    
    return Math.max(0, Math.min(1, confidence))
  }
  
  private calculateOverallContrast(imageData: ImageData): number {
    const dominantColors = ColorMath.extractDominantColors(imageData, 2)
    if (dominantColors.length < 2) return 1
    
    const color1 = dominantColors[0]
    const color2 = dominantColors[1]
    
    return ColorMath.calculateContrastRatio(
      [color1.r, color1.g, color1.b],
      [color2.r, color2.g, color2.b]
    )
  }
  
  private generateHueHistogram(imageData: ImageData): number[] {
    const histogram = new Array(360).fill(0)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      if (a > 128) {
        const { h } = ColorMath.rgbToHsv(r, g, b)
        histogram[Math.floor(h)]++
      }
    }
    
    // Normalize histogram
    const total = histogram.reduce((sum, count) => sum + count, 0)
    return histogram.map(count => total > 0 ? count / total : 0)
  }
  
  private determinePatternType(spatialDistribution: SpatialDistribution): VisualToken['spatialAnalysis']['patternType'] {
    // Analyze the spatial distribution to determine pattern type
    const colors = [
      spatialDistribution.topLeft,
      spatialDistribution.topRight,
      spatialDistribution.bottomLeft,
      spatialDistribution.bottomRight
    ]
    
    // Check for solid color
    const colorDistances = colors.map(c1 => 
      colors.map(c2 => ColorMath.colorDistance([c1.r, c1.g, c1.b], [c2.r, c2.g, c2.b]))
    )
    
    const avgDistance = colorDistances.flat().reduce((sum, dist) => sum + dist, 0) / colorDistances.flat().length
    
    if (avgDistance < 50) return 'solid'
    if (avgDistance < 100) return 'gradient'
    if (avgDistance < 150) return 'brand_logo'
    return 'mixed'
  }
  
  private async uploadImage(imageData: ImageData, userId: string, productName: string): Promise<string> {
    // Convert ImageData to blob
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = imageData.width
    canvas.height = imageData.height
    ctx?.putImageData(imageData, 0, 0)
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'))
          return
        }
        
        try {
          const fileName = `${userId}/${productName}_${Date.now()}.jpg`
          const { data, error } = await supabase.storage
            .from('otic-vision-images')
            .upload(fileName, blob, {
              contentType: 'image/jpeg',
              upsert: false
            })
          
          if (error) throw error
          
          const { data: urlData } = supabase.storage
            .from('otic-vision-images')
            .getPublicUrl(fileName)
          
          resolve(urlData.publicUrl)
        } catch (error) {
          reject(error)
        }
      }, 'image/jpeg', 0.8)
    })
  }
  
  private async logRecognitionAttempt(
    detectedToken: VisualToken,
    userId: string,
    matches: ProductMatch[],
    processingTime: number
  ): Promise<void> {
    try {
      await supabase.from('token_similarity_log').insert({
        user_id: userId,
        detected_token: detectedToken.token,
        detected_token_hash: detectedToken.tokenHash,
        detected_metadata: detectedToken,
        similarity_score: matches[0]?.similarityScore || 0,
        confidence_level: matches[0]?.confidenceLevel || 0,
        processing_time_ms: Math.round(processingTime),
        was_matched: matches.length > 0,
        was_confirmed: null, // Will be updated when user confirms
        user_feedback: null
      })
    } catch (error) {
      console.error('❌ Error logging recognition attempt:', error)
    }
  }
}

// =====================================================
// 🎯 EXPORT SINGLETON INSTANCE
// =====================================================

export const oticVisionEngine = OticVisionEngine.getInstance()

// =====================================================
// 🚀 UTILITY FUNCTIONS FOR FRONTEND
// =====================================================

/**
 * Convert image file to ImageData
 */
export async function imageFileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      if (imageData) {
        resolve(imageData)
      } else {
        reject(new Error('Failed to get image data'))
      }
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Capture image from video element
 */
export function captureImageFromVideo(video: HTMLVideoElement): ImageData | null {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return null
  
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.drawImage(video, 0, 0)
  
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * Resize ImageData for performance
 */
export function resizeImageData(imageData: ImageData, maxWidth: number = 800, maxHeight: number = 600): ImageData {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return imageData
  
  // Calculate new dimensions
  const aspectRatio = imageData.width / imageData.height
  let newWidth = maxWidth
  let newHeight = maxHeight
  
  if (aspectRatio > 1) {
    newHeight = maxWidth / aspectRatio
  } else {
    newWidth = maxHeight * aspectRatio
  }
  
  canvas.width = newWidth
  canvas.height = newHeight
  
  // Create temporary canvas for original image
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')
  tempCanvas.width = imageData.width
  tempCanvas.height = imageData.height
  tempCtx?.putImageData(imageData, 0, 0)
  
  // Draw resized image
  ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight)
  
  return ctx.getImageData(0, 0, newWidth, newHeight)
}

// =====================================================
// 🎉 OTIC VISION ENGINE READY!
// =====================================================
// This engine provides everything needed for revolutionary RGB-based product recognition!
// Ready for integration with the frontend components!



