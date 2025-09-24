/**
 * OpenRouter Vision API Service - Access to Multiple AI Models with Fallback
 * 
 * Uses OpenRouter to access various AI models for object detection
 * Much more accurate than Hugging Face for specific retail items
 * Now includes fallback mechanism for multiple models
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
  apiUsed: 'openrouter'
  modelUsed: string
}

class OpenRouterVisionService {
  private readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions'
  private readonly API_KEY: string
  
  constructor() {
    // Get the API key from Vite environment
    this.API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''
    
    // Debug logging
    console.log('🔧 OpenRouter Vision Service Initialized:')
    console.log('API Key:', this.API_KEY ? `${this.API_KEY.substring(0, 20)}...` : 'MISSING')
    console.log('Environment check:', {
      'import.meta.env.VITE_OPENROUTER_API_KEY': !!import.meta.env.VITE_OPENROUTER_API_KEY,
      'window.location.hostname': window.location.hostname
    })
  }
  
  // Available models for vision tasks - STANDARDIZED ON GROK FREE ONLY
  private readonly VISION_MODELS = [
    {
      id: 'x-ai/grok-4-fast:free',
      name: 'Grok 4 Fast (FREE)',
      description: 'Consistent object detection - PRIMARY CHOICE',
      cost: 'free'
    }
    // COMMENTED OUT OTHER MODELS FOR CONSISTENCY
    // {
    //   id: 'openrouter/sonoma-dusk-alpha',
    //   name: 'Sonoma Dusk Alpha',
    //   description: 'Excellent for object detection - fallback option',
    //   cost: 'free'
    // },
    // {
    //   id: 'moonshotai/kimi-vl-a3b-thinking',
    //   name: 'Kimi VL A3B Thinking',
    //   description: 'High accuracy vision model - fallback option',
    //   cost: 'paid'
    // },
    // {
    //   id: 'mistralai/mistral-small-3.2-24b-instruct:free',
    //   name: 'Mistral Small 3.2 24B (FREE)',
    //   description: 'Free Mistral model with vision capabilities',
    //   cost: 'free'
    // },
    // {
    //   id: 'anthropic/claude-3.5-sonnet',
    //   name: 'Claude 3.5 Sonnet',
    //   description: 'Best for detailed object analysis',
    //   cost: 'paid'
    // },
    // {
    //   id: 'google/gemini-pro-1.5',
    //   name: 'Google Gemini Pro 1.5',
    //   description: 'Google\'s vision model',
    //   cost: 'paid'
    // }
  ]

  /**
   * Detect objects in image using OpenRouter with fallback models
   */
  async detectObjects(imageFile: File, preferredModelId?: string): Promise<DetectionResult> {
    const startTime = Date.now()
    
    // Get list of models to try (preferred first, then fallbacks)
    const modelsToTry = preferredModelId 
      ? [preferredModelId, ...this.VISION_MODELS.map(m => m.id).filter(id => id !== preferredModelId)]
      : this.VISION_MODELS.map(m => m.id)
    
    console.log('🔍 Starting OpenRouter object detection with fallback models:', modelsToTry)
    
    // Convert image to base64 once
    const base64Image = await this.fileToBase64(imageFile)
    
    // Prepare the prompt for object detection
    const prompt = this.createDetectionPrompt()
    
    // Try each model until one succeeds
    let lastError: Error | null = null
    
    for (let i = 0; i < modelsToTry.length; i++) {
      const modelId = modelsToTry[i]
      
      try {
        console.log(`🎯 Trying model ${i + 1}/${modelsToTry.length}: ${modelId}`)
        
        const response = await this.callOpenRouterAPI(modelId, prompt, base64Image, imageFile.type)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Success with model: ${modelId}`)
          
          const processingTime = Date.now() - startTime
          const objects = this.parseDetectionResponse(data)
          
          return {
            success: true,
            objects,
            processingTime,
            apiUsed: 'openrouter',
            modelUsed: modelId
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error(`❌ Model ${modelId} failed:`, error)
        lastError = error as Error
        
        // If this is the last model, we'll throw the error
        if (i === modelsToTry.length - 1) {
          break
        }
        
        // Wait a bit before trying the next model
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // All models failed, throw the last error
    console.error('❌ All OpenRouter models failed')
    throw lastError || new Error('All vision models failed to process the image')
  }

  /**
   * Call OpenRouter API with specific model
   */
  private async callOpenRouterAPI(modelId: string, prompt: string, base64Image: string, imageType: string): Promise<Response> {
    return fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'OTIC Vision'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${imageType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    })
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
   * Create detection prompt optimized for retail object detection
   */
  private createDetectionPrompt(): string {
    return `Analyze this image and identify all retail products, items, or objects you can see. Focus on:

1. **Product Categories**: clothing, electronics, food, books, tools, accessories, etc.
2. **Specific Items**: shirts, phones, books, shoes, bags, etc.
3. **Brand Names**: if visible (Nike, Apple, Coca-Cola, etc.)

Return a JSON array of objects with this exact structure:
[
  {
    "label": "specific item name",
    "confidence": 0.95,
    "category": "product category"
  }
]

Be very specific with names (e.g., "red t-shirt" not just "clothing", "iPhone" not just "phone").
Include confidence scores from 0.0 to 1.0.
Only include objects you can clearly identify with at least 60% confidence. Be specific with names (e.g., "calculator" not "device", "headphones" not "electronics").`
  }

  /**
   * Parse the detection response from OpenRouter
   */
  private parseDetectionResponse(data: any): DetectedObject[] {
    try {
      const content = data.choices?.[0]?.message?.content
      if (!content) {
        console.warn('No content in OpenRouter response')
        return []
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.warn('No JSON array found in response')
        return []
      }

      const objects = JSON.parse(jsonMatch[0])
      if (!Array.isArray(objects)) {
        console.warn('Parsed content is not an array')
        return []
      }

      // Convert to our format
      return objects.map((obj: any, index: number) => ({
        id: `detected_${Date.now()}_${index}`,
        label: obj.label || 'Unknown Object',
        confidence: Math.min(1.0, Math.max(0.0, obj.confidence || 0.5)),
        bbox: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        },
        detectedAt: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error parsing OpenRouter response:', error)
      return []
    }
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    return this.VISION_MODELS
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
        message: 'OpenRouter API key not configured'
      }
    }

    try {
      // Test API with a simple request to check if it's working
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return {
          status: 'ready',
          message: 'OpenRouter API is ready with free models available'
        }
      } else {
        return {
          status: 'error',
          message: `OpenRouter API error: ${response.status} ${response.statusText}`
        }
      }
    } catch (error) {
      return {
        status: 'error',
        message: `OpenRouter API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

export const openRouterVisionService = new OpenRouterVisionService()
export default openRouterVisionService
