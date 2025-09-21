/**
 * Vision API Manager - Switch between different AI APIs
 * 
 * Manages multiple vision APIs and allows switching between them
 * Currently supports: Google Vision API and Hugging Face
 */

import { huggingFaceVisionService } from './huggingFaceVisionService'
import { googleVisionService } from './googleVisionService'
import { openRouterVisionService } from './openRouterVisionService'
import { DetectedObject, DetectionResult } from './huggingFaceVisionService'

export type VisionAPI = 'google' | 'huggingface' | 'openrouter' | 'auto'

export interface ApiStatus {
  name: string
  status: 'ready' | 'error' | 'no-key' | 'checking'
  message: string
  accuracy: 'high' | 'medium' | 'low'
  speed: 'fast' | 'medium' | 'slow'
  cost: 'free' | 'paid'
}

class VisionApiManager {
  private currentApi: VisionAPI = 'auto'

  /**
   * Set the current API
   */
  setApi(api: VisionAPI) {
    this.currentApi = api
    console.log(`🔄 Switched to ${api} API`)
  }

  /**
   * Get current API
   */
  getCurrentApi(): VisionAPI {
    return this.currentApi
  }

  /**
   * Detect objects using the selected API
   */
  async detectObjects(imageFile: File, modelId?: string): Promise<DetectionResult> {
    const api = this.getApiToUse()
    
    switch (api) {
      case 'google':
        return await googleVisionService.detectObjects(imageFile)
      case 'huggingface':
        return await huggingFaceVisionService.detectObjects(imageFile)
      case 'openrouter':
        return await openRouterVisionService.detectObjects(imageFile, modelId)
      default:
        throw new Error('No API selected')
    }
  }

  /**
   * Get which API to use based on current setting
   */
  private getApiToUse(): 'google' | 'huggingface' | 'openrouter' {
      if (this.currentApi === 'auto') {
        // Auto-select best available API (prioritize free OpenRouter models)
        if (openRouterVisionService.isConfigured()) {
          return 'openrouter' // Prefer OpenRouter - now has FREE models!
        } else if (huggingFaceVisionService.isConfigured()) {
          return 'huggingface' // Free fallback
        } else if (googleVisionService.isConfigured()) {
          return 'google' // Paid fallback
        } else {
          throw new Error('No vision APIs configured')
        }
      }
    
    return this.currentApi as 'google' | 'huggingface' | 'openrouter'
  }

  /**
   * Get status of all available APIs
   */
  async getAllApiStatuses(): Promise<ApiStatus[]> {
    const [googleStatus, huggingFaceStatus, openRouterStatus] = await Promise.all([
      googleVisionService.getApiStatus(),
      huggingFaceVisionService.getApiStatus(),
      openRouterVisionService.getApiStatus()
    ])

    return [
      {
        name: 'OpenRouter (Multiple Models)',
        status: openRouterStatus.status,
        message: openRouterStatus.message,
        accuracy: 'high',
        speed: 'fast',
        cost: 'paid'
      },
      {
        name: 'Google Vision API',
        status: googleStatus.status,
        message: googleStatus.message,
        accuracy: 'high',
        speed: 'fast',
        cost: 'paid'
      },
      {
        name: 'Hugging Face DETR',
        status: huggingFaceStatus.status,
        message: huggingFaceStatus.message,
        accuracy: 'medium',
        speed: 'medium',
        cost: 'free'
      }
    ]
  }

  /**
   * Get available APIs
   */
  getAvailableApis(): VisionAPI[] {
    const apis: VisionAPI[] = ['auto']
    
    if (openRouterVisionService.isConfigured()) {
      apis.push('openrouter')
    }
    
    if (googleVisionService.isConfigured()) {
      apis.push('google')
    }
    
    if (huggingFaceVisionService.isConfigured()) {
      apis.push('huggingface')
    }
    
    return apis
  }

  /**
   * Get API recommendations
   */
  getApiRecommendations(): { api: VisionAPI; reason: string }[] {
    const recommendations = []
    
        if (openRouterVisionService.isConfigured()) {
          recommendations.push({
            api: 'openrouter' as VisionAPI,
            reason: 'FREE models available! Grok-4-Fast offers consistent object detection'
          })
        }
    
    if (googleVisionService.isConfigured()) {
      recommendations.push({
        api: 'google' as VisionAPI,
        reason: 'Best accuracy for retail products (calculators, AirPods, etc.)'
      })
    }
    
    if (huggingFaceVisionService.isConfigured()) {
      recommendations.push({
        api: 'huggingface' as VisionAPI,
        reason: 'Free tier, good for testing and basic detection'
      })
    }
    
    recommendations.push({
      api: 'auto' as VisionAPI,
      reason: 'Automatically uses the best available API'
    })
    
    return recommendations
  }
}

// Export singleton instance
export const visionApiManager = new VisionApiManager()
