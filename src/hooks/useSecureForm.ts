import { useState, useCallback, useEffect } from 'react'
import { InputSanitizationService } from '@/services/inputSanitizationService'
import { CSRFTokenService } from '@/services/csrfService'
import { toast } from 'sonner'

export interface SecureFormOptions {
  enableCSRF?: boolean
  enableSanitization?: boolean
  showWarnings?: boolean
  autoRefreshToken?: boolean
}

export interface SecureFormState {
  isSubmitting: boolean
  errors: Record<string, string[]>
  warnings: Record<string, string[]>
  csrfToken: string | null
  isValid: boolean
}

export interface SecureFormActions {
  setFieldValue: (field: string, value: string) => void
  setFieldError: (field: string, error: string) => void
  clearFieldError: (field: string) => void
  clearAllErrors: () => void
  validateField: (field: string, value: string, type?: 'email' | 'password' | 'businessName' | 'phone' | 'text') => boolean
  validateForm: (formData: Record<string, any>) => boolean
  submitForm: (formData: Record<string, any>, submitFn: (data: any) => Promise<any>) => Promise<any>
  refreshCSRFToken: () => void
}

export const useSecureForm = (options: SecureFormOptions = {}) => {
  const {
    enableCSRF = true,
    enableSanitization = true,
    showWarnings = true,
    autoRefreshToken = true
  } = options

  const [state, setState] = useState<SecureFormState>({
    isSubmitting: false,
    errors: {},
    warnings: {},
    csrfToken: null,
    isValid: true
  })

  // Initialize CSRF token
  useEffect(() => {
    if (enableCSRF) {
      const token = CSRFTokenService.getCurrentToken()
      if (!token) {
        CSRFTokenService.generateToken()
      }
      setState(prev => ({ ...prev, csrfToken: CSRFTokenService.getCurrentToken() }))
    }
  }, [enableCSRF])

  // Auto-refresh CSRF token
  useEffect(() => {
    if (enableCSRF && autoRefreshToken) {
      const interval = setInterval(() => {
        const tokenInfo = CSRFTokenService.getTokenInfo()
        if (tokenInfo && tokenInfo.expiresIn < 5 * 60 * 1000) { // Less than 5 minutes
          CSRFTokenService.refreshToken()
          setState(prev => ({ ...prev, csrfToken: CSRFTokenService.getCurrentToken() }))
        }
      }, 60000) // Check every minute

      return () => clearInterval(interval)
    }
  }, [enableCSRF, autoRefreshToken])

  const setFieldValue = useCallback((field: string, value: string) => {
    // Clear any existing errors for this field
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: [] },
      warnings: { ...prev.warnings, [field]: [] }
    }))
  }, [])

  const setFieldError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: [...(prev.errors[field] || []), error] }
    }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: [] }
    }))
  }, [])

  const clearAllErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      warnings: {}
    }))
  }, [])

  const validateField = useCallback((
    field: string, 
    value: string, 
    type: 'email' | 'password' | 'businessName' | 'phone' | 'text' = 'text'
  ): boolean => {
    if (!enableSanitization) {
      return true
    }

    let result

    switch (type) {
      case 'email':
        result = InputSanitizationService.sanitizeEmail(value)
        break
      case 'password':
        result = InputSanitizationService.sanitizePassword(value)
        break
      case 'businessName':
        result = InputSanitizationService.sanitizeBusinessName(value)
        break
      case 'phone':
        result = InputSanitizationService.sanitizePhoneNumber(value)
        break
      default:
        result = InputSanitizationService.sanitizeText(value)
    }

    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: result.errors },
      warnings: { ...prev.warnings, [field]: result.warnings }
    }))

    // Show warnings if enabled
    if (showWarnings && result.warnings.length > 0) {
      toast.warning(`${field}: ${result.warnings.join(', ')}`)
    }

    return result.isValid
  }, [enableSanitization, showWarnings])

  const validateForm = useCallback((formData: Record<string, any>): boolean => {
    let isValid = true
    const errors: Record<string, string[]> = {}
    const warnings: Record<string, string[]> = {}

    for (const [field, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        let result

        // Determine field type based on field name
        if (field.toLowerCase().includes('email')) {
          result = InputSanitizationService.sanitizeEmail(value)
        } else if (field.toLowerCase().includes('password')) {
          result = InputSanitizationService.sanitizePassword(value)
        } else if (field.toLowerCase().includes('business') || field.toLowerCase().includes('name')) {
          result = InputSanitizationService.sanitizeBusinessName(value)
        } else if (field.toLowerCase().includes('phone')) {
          result = InputSanitizationService.sanitizePhoneNumber(value)
        } else {
          result = InputSanitizationService.sanitizeText(value)
        }

        if (!result.isValid) {
          isValid = false
          errors[field] = result.errors
        }

        if (result.warnings.length > 0) {
          warnings[field] = result.warnings
        }
      }
    }

    setState(prev => ({
      ...prev,
      errors,
      warnings,
      isValid
    }))

    // Show warnings if enabled
    if (showWarnings) {
      Object.entries(warnings).forEach(([field, fieldWarnings]) => {
        if (fieldWarnings.length > 0) {
          toast.warning(`${field}: ${fieldWarnings.join(', ')}`)
        }
      })
    }

    return isValid
  }, [showWarnings])

  const submitForm = useCallback(async (
    formData: Record<string, any>, 
    submitFn: (data: any) => Promise<any>
  ): Promise<any> => {
    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      // Validate form
      if (!validateForm(formData)) {
        toast.error('Please fix the form errors before submitting')
        return { error: { message: 'Form validation failed' } }
      }

      // Sanitize form data
      const sanitizedData = enableSanitization 
        ? InputSanitizationService.sanitizeFormData(formData)
        : formData

      // Add CSRF token if enabled
      const dataWithCSRF = enableCSRF 
        ? CSRFTokenService.addTokenToJsonData(sanitizedData)
        : sanitizedData

      // Submit form
      const result = await submitFn(dataWithCSRF)

      // Clear errors on successful submission
      clearAllErrors()

      return result
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('An error occurred while submitting the form')
      return { error }
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }, [validateForm, enableSanitization, enableCSRF, clearAllErrors])

  const refreshCSRFToken = useCallback(() => {
    if (enableCSRF) {
      CSRFTokenService.refreshToken()
      setState(prev => ({ ...prev, csrfToken: CSRFTokenService.getCurrentToken() }))
    }
  }, [enableCSRF])

  return {
    state,
    actions: {
      setFieldValue,
      setFieldError,
      clearFieldError,
      clearAllErrors,
      validateField,
      validateForm,
      submitForm,
      refreshCSRFToken
    }
  }
}
