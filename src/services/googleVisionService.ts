/**
 * Google Vision API Service - High Accuracy Object Detection
 * 
 * Uses Google Cloud Vision API for extremely accurate object detection
 * Much better than Hugging Face for retail products
 */

export interface DetectedObject {
  id: string
  label: string
  confidence: number
  bbox: {
    x: number
    y: number
    width: number
    height: number
  }
  detectedAt: string
}

export interface DetectionResult {
  success: boolean
  objects: DetectedObject[]
  processingTime: number
  error?: string
  apiUsed: 'google' | 'huggingface'
}

class GoogleVisionService {
  private readonly API_URL = 'https://vision.googleapis.com/v1/images:annotate'
  private readonly API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY || ''
  
  // Retail-focused object classes we care about
  private readonly RETAIL_OBJECTS = [
    'Calculator', 'Headphones', 'Earbuds', 'AirPods', 'Phone', 'Smartphone',
    'Bottle', 'Wine glass', 'Cup', 'Mug', 'Book', 'Laptop', 'Computer',
    'Mouse', 'Keyboard', 'Remote control', 'Television', 'TV', 'Monitor',
    'Chair', 'Table', 'Desk', 'Bag', 'Backpack', 'Suitcase', 'Watch',
    'Sunglasses', 'Glasses', 'Hat', 'Shoe', 'Sneakers', 'Shirt', 'T-shirt',
    'Pants', 'Jeans', 'Dress', 'Jacket', 'Coat', 'Sweater', 'Hoodie',
    'Food', 'Apple', 'Banana', 'Orange', 'Pizza', 'Sandwich', 'Burger',
    'Cake', 'Donut', 'Cookie', 'Candy', 'Chocolate', 'Coffee', 'Tea',
    'Beer', 'Wine', 'Soda', 'Water', 'Juice', 'Milk', 'Cereal', 'Bread',
    'Toy', 'Game', 'Puzzle', 'Doll', 'Action figure', 'Board game',
    'Tool', 'Hammer', 'Screwdriver', 'Wrench', 'Drill', 'Saw',
    'Electronics', 'Camera', 'Speaker', 'Microphone', 'Charger', 'Cable',
    'Furniture', 'Sofa', 'Couch', 'Bed', 'Mattress', 'Pillow', 'Lamp',
    'Clock', 'Mirror', 'Vase', 'Plant', 'Flower', 'Tree', 'Car', 'Vehicle',
    'Bicycle', 'Motorcycle', 'Truck', 'Bus', 'Train', 'Airplane', 'Boat'
  ]

  /**
   * Detect objects in image using Google Vision API
   */
  async detectObjects(imageFile: File): Promise<DetectionResult> {
    const startTime = Date.now()
    
    try {
      console.log('🔍 Starting Google Vision object detection...')
      
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile)
      
      // Call Google Vision API
      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'OBJECT_LOCALIZATION',
                maxResults: 50
              },
              {
                type: 'LABEL_DETECTION',
                maxResults: 50
              }
            ]
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📊 Google Vision API response:', data)

      // Process results
      const objects = this.processDetectionResults(data, imageFile)
      const processingTime = Date.now() - startTime

      console.log(`✅ Google Vision detected ${objects.length} objects in ${processingTime}ms`)

      return {
        success: true,
        objects,
        processingTime,
        apiUsed: 'google'
      }

    } catch (error) {
      console.error('❌ Google Vision detection error:', error)
      return {
        success: false,
        objects: [],
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        apiUsed: 'google'
      }
    }
  }

  /**
   * Convert file to base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data:image/...;base64, prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Process Google Vision API results
   */
  private processDetectionResults(data: any, imageFile: File): DetectedObject[] {
    if (!data.responses || !data.responses[0]) {
      console.warn('⚠️ Unexpected Google Vision API response format:', data)
      return []
    }

    const response = data.responses[0]
    const objects: DetectedObject[] = []
    
    // Process object localizations (more accurate)
    if (response.localizedObjectAnnotations) {
      response.localizedObjectAnnotations.forEach((obj: any, index: number) => {
        if (this.RETAIL_OBJECTS.some(retail => 
          obj.name.toLowerCase().includes(retail.toLowerCase()) ||
          retail.toLowerCase().includes(obj.name.toLowerCase())
        )) {
          const bbox = this.convertGoogleBoundingBox(obj.boundingPoly, imageFile)
          
          objects.push({
            id: `google_detection_${Date.now()}_${index}`,
            label: obj.name,
            confidence: obj.score,
            bbox: bbox,
            detectedAt: new Date().toISOString()
          })
        }
      })
    }

    // Process label detections (fallback)
    if (response.labelAnnotations && objects.length === 0) {
      response.labelAnnotations.forEach((label: any, index: number) => {
        if (this.RETAIL_OBJECTS.some(retail => 
          label.description.toLowerCase().includes(retail.toLowerCase()) ||
          retail.toLowerCase().includes(label.description.toLowerCase())
        )) {
          objects.push({
            id: `google_label_${Date.now()}_${index}`,
            label: label.description,
            confidence: label.score,
            bbox: { x: 0, y: 0, width: 100, height: 100 }, // No bbox for labels
            detectedAt: new Date().toISOString()
          })
        }
      })
    }

    // Sort by confidence (highest first)
    objects.sort((a, b) => b.confidence - a.confidence)

    return objects
  }

  /**
   * Convert Google Vision bbox format to our format
   */
  private convertGoogleBoundingBox(boundingPoly: any, imageFile: File): { x: number; y: number; width: number; height: number } {
    // Google Vision uses normalized coordinates (0-1)
    // We need to convert to pixel coordinates
    const defaultWidth = 640
    const defaultHeight = 480

    if (boundingPoly.normalizedVertices && boundingPoly.normalizedVertices.length >= 4) {
      const vertices = boundingPoly.normalizedVertices
      const x = Math.round(vertices[0].x * defaultWidth)
      const y = Math.round(vertices[0].y * defaultHeight)
      const width = Math.round((vertices[2].x - vertices[0].x) * defaultWidth)
      const height = Math.round((vertices[2].y - vertices[0].y) * defaultHeight)
      
      return { x, y, width, height }
    }

    // Fallback
    return { x: 0, y: 0, width: 100, height: 100 }
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.API_KEY
  }

  /**
   * Get API status
   */
  async getApiStatus(): Promise<{ status: 'ready' | 'error' | 'no-key'; message: string }> {
    if (!this.API_KEY) {
      return {
        status: 'no-key',
        message: 'Google Vision API key not configured'
      }
    }

    try {
      // Test API with a simple request
      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: { content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }, // 1x1 pixel
            features: [{ type: 'LABEL_DETECTION', maxResults: 1 }]
          }]
        })
      })

      if (response.ok) {
        return {
          status: 'ready',
          message: 'Google Vision API is ready'
        }
      } else if (response.status === 403) {
        return {
          status: 'error',
          message: 'Google Vision API requires billing to be enabled. Please enable billing in Google Cloud Console.'
        }
      } else {
        return {
          status: 'error',
          message: `API error: ${response.status} ${response.statusText}`
        }
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

// Export singleton instance
export const googleVisionService = new GoogleVisionService()
