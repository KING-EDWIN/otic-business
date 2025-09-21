/**
 * Hugging Face Vision Service - Mobile-Optimized Object Detection
 * 
 * Uses Hugging Face Inference API for fast, accurate object detection
 * Perfect for mobile devices - lightweight and efficient
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
  apiUsed?: string
}

class HuggingFaceVisionService {
  // Using a better object detection model
  private readonly API_URL = 'https://api-inference.huggingface.co/models/facebook/detr-resnet-50'
  private readonly API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY || ''
  
  // Retail-focused object classes we care about
  private readonly RETAIL_OBJECTS = [
    'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl',
    'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot',
    'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'bed',
    'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote',
    'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
    'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
    'hair drier', 'toothbrush', 'backpack', 'umbrella', 'handbag',
    'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
    'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
    'tennis racket', 'person', 'bicycle', 'car', 'motorcycle', 'airplane',
    'calculator', 'headphones', 'earphones', 'speaker', 'microphone', 'camera', 'watch',
    'bus', 'train', 'truck', 'boat', 'traffic light', 'fire hydrant',
    'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse',
    'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'
  ]

  /**
   * Detect objects in image using Hugging Face API
   */
  async detectObjects(imageFile: File): Promise<DetectionResult> {
    const startTime = Date.now()
    
    try {
      console.log('🔍 Starting Hugging Face object detection...')
      
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile)
      
      // Call Hugging Face API
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: base64Image,
          parameters: {
            threshold: 0.5, // Confidence threshold
            max_detections: 20 // Limit detections for performance
          }
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📊 Hugging Face API response:', data)

      // Process results
      const objects = this.processDetectionResults(data, imageFile)
      const processingTime = Date.now() - startTime

      console.log(`✅ Detected ${objects.length} objects in ${processingTime}ms`)

      return {
        success: true,
        objects,
        processingTime,
        apiUsed: 'huggingface'
      }

    } catch (error) {
      console.error('❌ Hugging Face detection error:', error)
      return {
        success: false,
        objects: [],
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        apiUsed: 'huggingface'
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
   * Process Hugging Face API results
   */
  private processDetectionResults(data: any[], imageFile: File): DetectedObject[] {
    if (!Array.isArray(data)) {
      console.warn('⚠️ Unexpected API response format:', data)
      return []
    }

    const objects: DetectedObject[] = []
    
    data.forEach((item, index) => {
      // YOLOv8 returns different format - handle both old and new formats
      let label = item.label || item.class_name || item.class
      let score = item.score || item.confidence || item.conf
      let box = item.box || item.bbox || item.bounding_box
      
      // Check if it's a retail object we care about
      if (label && this.RETAIL_OBJECTS.includes(label.toLowerCase())) {
        // Convert bbox format to our format
        const bbox = this.convertBoundingBox(box, imageFile)
        
        objects.push({
          id: `yolov8_detection_${Date.now()}_${index}`,
          label: label,
          confidence: score || 0.5, // Default confidence if not provided
          bbox: bbox,
          detectedAt: new Date().toISOString()
        })
      }
    })

    // Sort by confidence (highest first)
    objects.sort((a, b) => b.confidence - a.confidence)

    return objects
  }

  /**
   * Convert Hugging Face bbox format to our format
   */
  private convertBoundingBox(hfBox: any, imageFile: File): { x: number; y: number; width: number; height: number } {
    // YOLOv8 and Hugging Face use different coordinate formats
    // We need to convert to pixel coordinates
    const defaultWidth = 640
    const defaultHeight = 480

    if (hfBox && typeof hfBox === 'object') {
      // Handle different bbox formats
      if (hfBox.xmin !== undefined && hfBox.ymin !== undefined && hfBox.xmax !== undefined && hfBox.ymax !== undefined) {
        // Format: {xmin, ymin, xmax, ymax} - normalized coordinates
        return {
          x: Math.round(hfBox.xmin * defaultWidth),
          y: Math.round(hfBox.ymin * defaultHeight),
          width: Math.round((hfBox.xmax - hfBox.xmin) * defaultWidth),
          height: Math.round((hfBox.ymax - hfBox.ymin) * defaultHeight)
        }
      } else if (hfBox.x !== undefined && hfBox.y !== undefined && hfBox.width !== undefined && hfBox.height !== undefined) {
        // Format: {x, y, width, height} - normalized coordinates
        return {
          x: Math.round(hfBox.x * defaultWidth),
          y: Math.round(hfBox.y * defaultHeight),
          width: Math.round(hfBox.width * defaultWidth),
          height: Math.round(hfBox.height * defaultHeight)
        }
      }
    }

    // Fallback
    return { x: 0, y: 0, width: 100, height: 100 }
  }

  /**
   * Get image dimensions for accurate bbox conversion
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.src = URL.createObjectURL(file)
    })
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
        message: 'Hugging Face API key not configured'
      }
    }

    try {
      // Test API with a simple request
      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      })

      if (response.ok) {
        return {
          status: 'ready',
          message: 'Hugging Face API is ready'
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
export const huggingFaceVisionService = new HuggingFaceVisionService()
