/**
 * CSRF Token Service
 * Provides CSRF token generation, validation, and management
 */

export interface CSRFTokenData {
  token: string
  timestamp: number
  expiresAt: number
  sessionId: string
}

export class CSRFTokenService {
  private static readonly TOKEN_LENGTH = 32
  private static readonly TOKEN_EXPIRY_MINUTES = 30
  private static readonly STORAGE_KEY = 'csrf_token'
  private static readonly SESSION_KEY = 'csrf_session_id'

  /**
   * Generates a new CSRF token
   */
  static generateToken(): CSRFTokenData {
    const token = this.generateRandomString(this.TOKEN_LENGTH)
    const timestamp = Date.now()
    const expiresAt = timestamp + (this.TOKEN_EXPIRY_MINUTES * 60 * 1000)
    const sessionId = this.getOrCreateSessionId()

    const tokenData: CSRFTokenData = {
      token,
      timestamp,
      expiresAt,
      sessionId
    }

    // Store token in session storage
    this.storeToken(tokenData)

    return tokenData
  }

  /**
   * Validates a CSRF token
   */
  static validateToken(token: string): { isValid: boolean; reason?: string } {
    try {
      const storedTokenData = this.getStoredToken()

      if (!storedTokenData) {
        return { isValid: false, reason: 'No CSRF token found' }
      }

      if (storedTokenData.token !== token) {
        return { isValid: false, reason: 'CSRF token mismatch' }
      }

      if (Date.now() > storedTokenData.expiresAt) {
        this.clearToken()
        return { isValid: false, reason: 'CSRF token expired' }
      }

      if (storedTokenData.sessionId !== this.getOrCreateSessionId()) {
        return { isValid: false, reason: 'CSRF token session mismatch' }
      }

      return { isValid: true }
    } catch (error) {
      console.error('CSRF token validation error:', error)
      return { isValid: false, reason: 'Token validation error' }
    }
  }

  /**
   * Gets the current CSRF token
   */
  static getCurrentToken(): string | null {
    const tokenData = this.getStoredToken()
    return tokenData ? tokenData.token : null
  }

  /**
   * Refreshes the CSRF token
   */
  static refreshToken(): CSRFTokenData {
    this.clearToken()
    return this.generateToken()
  }

  /**
   * Clears the stored CSRF token
   */
  static clearToken(): void {
    sessionStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Generates a random string for the token
   */
  private static generateRandomString(length: number): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Gets or creates a session ID
   */
  private static getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem(this.SESSION_KEY)
    
    if (!sessionId) {
      sessionId = this.generateRandomString(16)
      sessionStorage.setItem(this.SESSION_KEY, sessionId)
    }

    return sessionId
  }

  /**
   * Stores token data in session storage
   */
  private static storeToken(tokenData: CSRFTokenData): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokenData))
    } catch (error) {
      console.error('Failed to store CSRF token:', error)
    }
  }

  /**
   * Retrieves stored token data from session storage
   */
  private static getStoredToken(): CSRFTokenData | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Failed to retrieve CSRF token:', error)
      return null
    }
  }

  /**
   * Adds CSRF token to request headers
   */
  static addTokenToHeaders(headers: HeadersInit = {}): HeadersInit {
    const token = this.getCurrentToken()
    
    if (!token) {
      console.warn('No CSRF token available for request')
      return headers
    }

    return {
      ...headers,
      'X-CSRF-Token': token
    }
  }

  /**
   * Adds CSRF token to form data
   */
  static addTokenToFormData(formData: FormData): FormData {
    const token = this.getCurrentToken()
    
    if (token) {
      formData.append('_csrf_token', token)
    }

    return formData
  }

  /**
   * Adds CSRF token to JSON data
   */
  static addTokenToJsonData(data: Record<string, any>): Record<string, any> {
    const token = this.getCurrentToken()
    
    if (token) {
      return {
        ...data,
        _csrf_token: token
      }
    }

    return data
  }

  /**
   * Middleware function for validating CSRF tokens in API calls
   */
  static validateRequestToken(request: Request): { isValid: boolean; reason?: string } {
    const token = request.headers.get('X-CSRF-Token') || 
                  (request as any).body?._csrf_token ||
                  new URLSearchParams(request.url.split('?')[1] || '').get('_csrf_token')

    if (!token) {
      return { isValid: false, reason: 'No CSRF token provided' }
    }

    return this.validateToken(token)
  }

  /**
   * Initializes CSRF protection for the application
   */
  static initialize(): void {
    // Generate initial token if none exists
    if (!this.getCurrentToken()) {
      this.generateToken()
    }

    // Set up token refresh on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const tokenData = this.getStoredToken()
        if (tokenData && Date.now() > tokenData.expiresAt - (5 * 60 * 1000)) {
          // Refresh token if it expires within 5 minutes
          this.refreshToken()
        }
      }
    })

    // Clear token on page unload
    window.addEventListener('beforeunload', () => {
      this.clearToken()
    })
  }

  /**
   * Gets token expiry information
   */
  static getTokenInfo(): { expiresIn: number; isExpired: boolean; sessionId: string } | null {
    const tokenData = this.getStoredToken()
    
    if (!tokenData) {
      return null
    }

    const expiresIn = tokenData.expiresAt - Date.now()
    const isExpired = expiresIn <= 0

    return {
      expiresIn: Math.max(0, expiresIn),
      isExpired,
      sessionId: tokenData.sessionId
    }
  }
}