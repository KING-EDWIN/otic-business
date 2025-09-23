// Image Storage Service
// This service handles image storage for both Supabase and dedicated server scenarios

import { supabase } from '@/lib/supabaseClient'

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

export interface ImageStorageConfig {
  provider: 'supabase' | 'local' | 's3' | 'cdn'
  bucket?: string
  baseUrl?: string
  uploadPath?: string
}

class ImageStorageService {
  private config: ImageStorageConfig

  constructor(config: ImageStorageConfig) {
    this.config = config
  }

  /**
   * Upload image to storage
   */
  async uploadImage(
    file: File, 
    path: string, 
    options?: { compress?: boolean; maxWidth?: number; maxHeight?: number; quality?: number }
  ): Promise<ImageUploadResult> {
    try {
      let fileToUpload = file

      // Compress image if requested
      if (options?.compress !== false) {
        fileToUpload = await this.compressImage(file, {
          maxWidth: options?.maxWidth || 800,
          maxHeight: options?.maxHeight || 600,
          quality: options?.quality || 0.8
        })
      }

      switch (this.config.provider) {
        case 'supabase':
          return await this.uploadToSupabase(fileToUpload, path)
        case 'local':
          return await this.uploadToLocal(fileToUpload, path)
        case 's3':
          return await this.uploadToS3(fileToUpload, path)
        case 'cdn':
          return await this.uploadToCDN(fileToUpload, path)
        default:
          throw new Error(`Unsupported storage provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Upload to Supabase Storage
   */
  private async uploadToSupabase(file: File, path: string): Promise<ImageUploadResult> {
    try {
      const { data, error } = await supabase.storage
        .from(this.config.bucket || 'product-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(this.config.bucket || 'product-images')
        .getPublicUrl(data.path)

      return {
        success: true,
        url: publicUrl,
        path: data.path
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Supabase upload failed'
      }
    }
  }

  /**
   * Upload to local server (for dedicated server)
   */
  private async uploadToLocal(file: File, path: string): Promise<ImageUploadResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', path)

      const response = await fetch(`${this.config.baseUrl}/api/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        url: result.url,
        path: result.path
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Local upload failed'
      }
    }
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(file: File, path: string): Promise<ImageUploadResult> {
    try {
      // This would require AWS SDK
      // For now, return a placeholder
      return {
        success: false,
        error: 'S3 upload not implemented yet'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'S3 upload failed'
      }
    }
  }

  /**
   * Upload to CDN
   */
  private async uploadToCDN(file: File, path: string): Promise<ImageUploadResult> {
    try {
      // This would depend on your CDN provider
      // For now, return a placeholder
      return {
        success: false,
        error: 'CDN upload not implemented yet'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CDN upload failed'
      }
    }
  }

  /**
   * Compress image before upload
   */
  private async compressImage(
    file: File, 
    options: { maxWidth: number; maxHeight: number; quality: number }
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > options.maxWidth) {
          height = (height * options.maxWidth) / width
          width = options.maxWidth
        }
        
        if (height > options.maxHeight) {
          width = (width * options.maxHeight) / height
          height = options.maxHeight
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', options.quality)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Delete image from storage
   */
  async deleteImage(path: string): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'supabase':
          const { error } = await supabase.storage
            .from(this.config.bucket || 'product-images')
            .remove([path])
          return !error
        case 'local':
          const response = await fetch(`${this.config.baseUrl}/api/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
          })
          return response.ok
        default:
          return false
      }
    } catch (error) {
      console.error('Image deletion error:', error)
      return false
    }
  }

  /**
   * Get image URL
   */
  getImageUrl(path: string): string {
    switch (this.config.provider) {
      case 'supabase':
        const { data: { publicUrl } } = supabase.storage
          .from(this.config.bucket || 'product-images')
          .getPublicUrl(path)
        return publicUrl
      case 'local':
        return `${this.config.baseUrl}/uploads/${path}`
      case 's3':
        return `https://${this.config.bucket}.s3.amazonaws.com/${path}`
      case 'cdn':
        return `${this.config.baseUrl}/${path}`
      default:
        return path
    }
  }
}

// Configuration for different environments
export const imageStorageConfigs = {
  // Current Supabase setup
  supabase: {
    provider: 'supabase' as const,
    bucket: 'product-images'
  },
  
  // Future dedicated server setup
  local: {
    provider: 'local' as const,
    baseUrl: import.meta.env.VITE_SUPABASE_URL || window.location.origin,
    uploadPath: '/uploads'
  },
  
  // Future S3 setup
  s3: {
    provider: 's3' as const,
    bucket: 'your-bucket',
    baseUrl: 'https://your-bucket.s3.amazonaws.com'
  },
  
  // Future CDN setup
  cdn: {
    provider: 'cdn' as const,
    baseUrl: 'https://cdn.yourserver.com'
  }
}

// Create service instance based on environment
const getImageStorageService = (): ImageStorageService => {
  // For now, always use Supabase storage
  const config = imageStorageConfigs.supabase
  
  return new ImageStorageService(config)
}

export const imageStorageService = getImageStorageService()
export default ImageStorageService
