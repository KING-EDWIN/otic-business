/**
 * Input Sanitization Service
 * Provides comprehensive input sanitization and validation to prevent XSS attacks
 */

export interface SanitizationOptions {
  maxLength?: number
  allowHtml?: boolean
  stripHtml?: boolean
  trimWhitespace?: boolean
  normalizeUnicode?: boolean
}

export interface ValidationResult {
  isValid: boolean
  sanitizedValue: string
  errors: string[]
  warnings: string[]
}

export class InputSanitizationService {
  /**
   * Sanitizes text input by removing potentially dangerous content
   */
  static sanitizeText(input: string, options: SanitizationOptions = {}): ValidationResult {
    const {
      maxLength = 1000,
      allowHtml = false,
      stripHtml = true,
      trimWhitespace = true,
      normalizeUnicode = true
    } = options

    const errors: string[] = []
    const warnings: string[] = []
    let sanitizedValue = input

    // Handle null/undefined
    if (input === null || input === undefined) {
      return {
        isValid: true,
        sanitizedValue: '',
        errors: [],
        warnings: []
      }
    }

    // Convert to string
    sanitizedValue = String(input)

    // Trim whitespace
    if (trimWhitespace) {
      sanitizedValue = sanitizedValue.trim()
    }

    // Normalize Unicode
    if (normalizeUnicode) {
      sanitizedValue = sanitizedValue.normalize('NFC')
    }

    // Check length
    if (sanitizedValue.length > maxLength) {
      errors.push(`Input exceeds maximum length of ${maxLength} characters`)
      sanitizedValue = sanitizedValue.substring(0, maxLength)
    }

    // Remove HTML tags if not allowed
    if (!allowHtml && stripHtml) {
      const originalLength = sanitizedValue.length
      sanitizedValue = this.stripHtmlTags(sanitizedValue)
      if (sanitizedValue.length !== originalLength) {
        warnings.push('HTML tags have been removed for security')
      }
    }

    // Remove potentially dangerous characters
    sanitizedValue = this.removeDangerousCharacters(sanitizedValue)

    // Check for suspicious patterns
    const suspiciousPatterns = this.detectSuspiciousPatterns(sanitizedValue)
    if (suspiciousPatterns.length > 0) {
      warnings.push(`Potentially suspicious content detected: ${suspiciousPatterns.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
      warnings
    }
  }

  /**
   * Sanitizes email input
   */
  static sanitizeEmail(email: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let sanitizedValue = email

    // Basic sanitization
    const basicResult = this.sanitizeText(email, {
      maxLength: 254, // RFC 5321 limit
      trimWhitespace: true,
      stripHtml: true
    })

    sanitizedValue = basicResult.sanitizedValue
    errors.push(...basicResult.errors)
    warnings.push(...basicResult.warnings)

    // Email-specific validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(sanitizedValue)) {
      errors.push('Invalid email format')
    }

    // Check for suspicious email patterns
    const suspiciousDomains = ['tempmail', '10minutemail', 'guerrillamail', 'mailinator']
    const domain = sanitizedValue.split('@')[1]?.toLowerCase()
    if (domain && suspiciousDomains.some(suspicious => domain.includes(suspicious))) {
      warnings.push('Temporary email address detected')
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue: sanitizedValue.toLowerCase(),
      errors,
      warnings
    }
  }

  /**
   * Sanitizes password input
   */
  static sanitizePassword(password: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let sanitizedValue = password

    // Basic sanitization
    const basicResult = this.sanitizeText(password, {
      maxLength: 128,
      trimWhitespace: false, // Don't trim passwords
      stripHtml: true
    })

    sanitizedValue = basicResult.sanitizedValue
    errors.push(...basicResult.errors)
    warnings.push(...basicResult.warnings)

    // Password strength validation
    if (sanitizedValue.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (sanitizedValue.length > 128) {
      errors.push('Password exceeds maximum length of 128 characters')
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123']
    if (commonPasswords.includes(sanitizedValue.toLowerCase())) {
      warnings.push('Password is commonly used and may be insecure')
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
      warnings
    }
  }

  /**
   * Sanitizes business name input
   */
  static sanitizeBusinessName(name: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let sanitizedValue = name

    // Basic sanitization
    const basicResult = this.sanitizeText(name, {
      maxLength: 100,
      trimWhitespace: true,
      stripHtml: true
    })

    sanitizedValue = basicResult.sanitizedValue
    errors.push(...basicResult.errors)
    warnings.push(...basicResult.warnings)

    // Business name specific validation
    if (sanitizedValue.length < 2) {
      errors.push('Business name must be at least 2 characters long')
    }

    // Remove excessive spaces
    sanitizedValue = sanitizedValue.replace(/\s+/g, ' ')

    // Check for inappropriate content
    const inappropriateWords = ['test', 'demo', 'sample', 'fake']
    if (inappropriateWords.some(word => sanitizedValue.toLowerCase().includes(word))) {
      warnings.push('Business name may contain inappropriate content')
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
      warnings
    }
  }

  /**
   * Sanitizes phone number input
   */
  static sanitizePhoneNumber(phone: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let sanitizedValue = phone

    // Basic sanitization
    const basicResult = this.sanitizeText(phone, {
      maxLength: 20,
      trimWhitespace: true,
      stripHtml: true
    })

    sanitizedValue = basicResult.sanitizedValue
    errors.push(...basicResult.errors)
    warnings.push(...basicResult.warnings)

    // Remove non-numeric characters except +, -, (, ), and spaces
    sanitizedValue = sanitizedValue.replace(/[^\d+\-() ]/g, '')

    // Basic phone validation
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/
    if (!phoneRegex.test(sanitizedValue)) {
      errors.push('Invalid phone number format')
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
      warnings
    }
  }

  /**
   * Strips HTML tags from input
   */
  private static stripHtmlTags(input: string): string {
    return input.replace(/<[^>]*>/g, '')
  }

  /**
   * Removes potentially dangerous characters
   */
  private static removeDangerousCharacters(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  }

  /**
   * Detects suspicious patterns in input
   */
  private static detectSuspiciousPatterns(input: string): string[] {
    const patterns: string[] = []
    const suspiciousPatterns = [
      { pattern: /<script/i, name: 'script tags' },
      { pattern: /javascript:/i, name: 'javascript protocol' },
      { pattern: /data:/i, name: 'data protocol' },
      { pattern: /vbscript:/i, name: 'vbscript protocol' },
      { pattern: /on\w+=/i, name: 'event handlers' },
      { pattern: /eval\(/i, name: 'eval function' },
      { pattern: /expression\(/i, name: 'expression function' },
      { pattern: /url\(/i, name: 'url function' }
    ]

    suspiciousPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(input)) {
        patterns.push(name)
      }
    })

    return patterns
  }

  /**
   * Generates CSRF token
   */
  static generateCSRFToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Validates CSRF token
   */
  static validateCSRFToken(token: string, storedToken: string): boolean {
    if (!token || !storedToken) {
      return false
    }
    return token === storedToken
  }

  /**
   * Sanitizes form data object
   */
  static sanitizeFormData(formData: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        const result = this.sanitizeText(value)
        sanitized[key] = result.sanitizedValue
      } else if (typeof value === 'number') {
        sanitized[key] = value
      } else if (typeof value === 'boolean') {
        sanitized[key] = value
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeText(item).sanitizedValue : item
        )
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeFormData(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }
}

