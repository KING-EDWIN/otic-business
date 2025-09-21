/**
 * 🚀 OTIC VISION REACT HOOKS
 * Easy-to-use React hooks for OTIC Vision functionality
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  oticVisionEngine, 
  imageFileToImageData, 
  captureImageFromVideo, 
  resizeImageData,
  type VisualToken,
  type RecognitionResult,
  type ProductMatch
} from '@/services/oticVisionEngine'
import { useAuth } from '@/contexts/AuthContext'

// =====================================================
// 🎥 CAMERA HOOK
// =====================================================

export interface CameraState {
  isActive: boolean
  stream: MediaStream | null
  error: string | null
  isSupported: boolean
}

export interface CameraControls {
  startCamera: () => Promise<void>
  stopCamera: () => void
  captureImage: () => ImageData | null
  switchCamera: () => Promise<void>
}

export function useCamera(): CameraState & CameraControls {
  const [state, setState] = useState<CameraState>({
    isActive: false,
    stream: null,
    error: null,
    isSupported: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  })
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  
  const startCamera = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Camera not supported on this device' }))
      return
    }
    
    try {
      setState(prev => ({ ...prev, error: null }))
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      streamRef.current = stream
      setState(prev => ({ ...prev, stream, isActive: true }))
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      toast.success('Camera activated!')
    } catch (error) {
      console.error('Camera error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera'
      setState(prev => ({ ...prev, error: errorMessage }))
      toast.error('Camera access denied')
    }
  }, [facingMode, state.isSupported])
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    setState(prev => ({ ...prev, stream: null, isActive: false }))
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])
  
  const captureImage = useCallback((): ImageData | null => {
    if (!videoRef.current || !state.isActive) return null
    
    const imageData = captureImageFromVideo(videoRef.current)
    return imageData ? resizeImageData(imageData, 800, 600) : null
  }, [state.isActive])
  
  const switchCamera = useCallback(async () => {
    if (!state.isActive) return
    
    stopCamera()
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    
    // Wait a bit before starting new camera
    setTimeout(() => {
      startCamera()
    }, 100)
  }, [state.isActive, startCamera, stopCamera])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])
  
  return {
    ...state,
    startCamera,
    stopCamera,
    captureImage,
    switchCamera,
    videoRef
  }
}

// =====================================================
// 🎯 RECOGNITION HOOK
// =====================================================

export interface RecognitionState {
  isAnalyzing: boolean
  result: RecognitionResult | null
  error: string | null
  processingTime: number
}

export interface RecognitionControls {
  recognizeProduct: (imageData: ImageData) => Promise<void>
  clearResult: () => void
  confirmMatch: (match: ProductMatch, confirmed: boolean) => Promise<void>
}

export function useRecognition(): RecognitionState & RecognitionControls {
  const { user } = useAuth()
  const [state, setState] = useState<RecognitionState>({
    isAnalyzing: false,
    result: null,
    error: null,
    processingTime: 0
  })
  
  const recognizeProduct = useCallback(async (imageData: ImageData) => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }))
      return
    }
    
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }))
    
    try {
      const startTime = performance.now()
      
      // Generate visual token
      const visualToken = await oticVisionEngine.generateVisualToken(
        imageData, 
        user.id, 
        'detected_product'
      )
      
      // Find matches
      const result = await oticVisionEngine.findMatches(visualToken, user.id)
      
      const processingTime = performance.now() - startTime
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        result,
        processingTime: Math.round(processingTime)
      }))
      
      if (result.wasSuccessful && result.bestMatch) {
        toast.success(`Product recognized: ${result.bestMatch.productName}`)
      } else {
        toast.info('No matching products found. Consider registering this product.')
      }
      
    } catch (error) {
      console.error('Recognition error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Recognition failed'
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage
      }))
      
      toast.error('Recognition failed')
    }
  }, [user?.id])
  
  const clearResult = useCallback(() => {
    setState({
      isAnalyzing: false,
      result: null,
      error: null,
      processingTime: 0
    })
  }, [])
  
  const confirmMatch = useCallback(async (match: ProductMatch, confirmed: boolean) => {
    try {
      // Update the recognition log with user feedback
      const { error } = await supabase
        .from('token_similarity_log')
        .update({
          was_confirmed: confirmed,
          user_feedback: confirmed ? 'correct' : 'incorrect',
          confirmed_at: new Date().toISOString()
        })
        .eq('pvb_id', match.pvbId)
        .eq('user_id', user?.id)
      
      if (error) throw error
      
      // Update product recognition count
      if (confirmed) {
        await supabase
          .from('personalised_visual_bank')
          .update({
            recognition_count: supabase.sql`recognition_count + 1`,
            last_recognized_at: new Date().toISOString()
          })
          .eq('id', match.pvbId)
      }
      
      toast.success(confirmed ? 'Match confirmed!' : 'Match rejected')
      
    } catch (error) {
      console.error('Error confirming match:', error)
      toast.error('Failed to confirm match')
    }
  }, [user?.id])
  
  return {
    ...state,
    recognizeProduct,
    clearResult,
    confirmMatch
  }
}

// =====================================================
// 📝 REGISTRATION HOOK
// =====================================================

export interface RegistrationState {
  isRegistering: boolean
  token: VisualToken | null
  error: string | null
  success: boolean
}

export interface RegistrationControls {
  registerProduct: (imageData: ImageData, productData: ProductData) => Promise<void>
  clearRegistration: () => void
}

export interface ProductData {
  name: string
  manufacturer?: string
  category?: string
  retailPrice: number
  wholesalePrice?: number
  costPrice?: number
}

export function useRegistration(): RegistrationState & RegistrationControls {
  const { user } = useAuth()
  const [state, setState] = useState<RegistrationState>({
    isRegistering: false,
    token: null,
    error: null,
    success: false
  })
  
  const registerProduct = useCallback(async (imageData: ImageData, productData: ProductData) => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }))
      return
    }
    
    setState(prev => ({ ...prev, isRegistering: true, error: null, success: false }))
    
    try {
      const result = await oticVisionEngine.registerProduct(imageData, user.id, productData)
      
      if (result.success && result.token) {
        setState(prev => ({
          ...prev,
          isRegistering: false,
          token: result.token,
          success: true
        }))
        
        toast.success(`Product "${productData.name}" registered successfully!`)
      } else {
        setState(prev => ({
          ...prev,
          isRegistering: false,
          error: result.error || 'Registration failed'
        }))
        
        toast.error(result.error || 'Registration failed')
      }
      
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      
      setState(prev => ({
        ...prev,
        isRegistering: false,
        error: errorMessage
      }))
      
      toast.error('Registration failed')
    }
  }, [user?.id])
  
  const clearRegistration = useCallback(() => {
    setState({
      isRegistering: false,
      token: null,
      error: null,
      success: false
    })
  }, [])
  
  return {
    ...state,
    registerProduct,
    clearRegistration
  }
}

// =====================================================
// 🎯 COMBINED OTIC VISION HOOK
// =====================================================

export interface OticVisionState {
  // Camera
  camera: CameraState & CameraControls
  
  // Recognition
  recognition: RecognitionState & RecognitionControls
  
  // Registration
  registration: RegistrationState & RegistrationControls
  
  // Combined actions
  captureAndRecognize: () => Promise<void>
  captureAndRegister: (productData: ProductData) => Promise<void>
}

export function useOticVision(): OticVisionState {
  const camera = useCamera()
  const recognition = useRecognition()
  const registration = useRegistration()
  
  const captureAndRecognize = useCallback(async () => {
    const imageData = camera.captureImage()
    if (imageData) {
      await recognition.recognizeProduct(imageData)
    } else {
      toast.error('Failed to capture image')
    }
  }, [camera, recognition])
  
  const captureAndRegister = useCallback(async (productData: ProductData) => {
    const imageData = camera.captureImage()
    if (imageData) {
      await registration.registerProduct(imageData, productData)
    } else {
      toast.error('Failed to capture image')
    }
  }, [camera, registration])
  
  return {
    camera,
    recognition,
    registration,
    captureAndRecognize,
    captureAndRegister
  }
}

// =====================================================
// 📊 ANALYTICS HOOK
// =====================================================

export interface VisionAnalytics {
  totalProducts: number
  totalRecognitions: number
  successRate: number
  averageProcessingTime: number
  topProducts: Array<{
    name: string
    recognitionCount: number
    successRate: number
  }>
  recentActivity: Array<{
    timestamp: Date
    action: 'recognition' | 'registration'
    productName: string
    success: boolean
  }>
}

export function useVisionAnalytics(): {
  analytics: VisionAnalytics | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
} {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<VisionAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const refresh = useCallback(async () => {
    if (!user?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Get recognition stats
      const { data: stats, error: statsError } = await supabase
        .from('recognition_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (statsError) throw statsError
      
      // Get top products
      const { data: topProducts, error: topProductsError } = await supabase
        .from('top_recognized_products')
        .select('*')
        .eq('user_id', user.id)
        .limit(10)
      
      if (topProductsError) throw topProductsError
      
      // Get recent activity
      const { data: recentActivity, error: activityError } = await supabase
        .from('token_similarity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false })
        .limit(20)
      
      if (activityError) throw activityError
      
      setAnalytics({
        totalProducts: stats?.total_products || 0,
        totalRecognitions: stats?.total_recognitions || 0,
        successRate: stats?.avg_similarity_score || 0,
        averageProcessingTime: 0, // Would need to calculate from logs
        topProducts: topProducts?.map(p => ({
          name: p.product_name,
          recognitionCount: p.recognition_count,
          successRate: p.success_rate
        })) || [],
        recentActivity: recentActivity?.map(a => ({
          timestamp: new Date(a.detected_at),
          action: a.was_matched ? 'recognition' : 'registration',
          productName: 'Unknown', // Would need to join with PVB
          success: a.was_confirmed || false
        })) || []
      })
      
    } catch (error) {
      console.error('Analytics error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [user?.id])
  
  // Load analytics on mount
  useEffect(() => {
    refresh()
  }, [refresh])
  
  return {
    analytics,
    loading,
    error,
    refresh
  }
}

// =====================================================
// 🎉 HOOKS READY!
// =====================================================
// These hooks provide everything needed for easy OTIC Vision integration!
// Just import and use in your React components!


