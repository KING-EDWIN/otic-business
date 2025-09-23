export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class InputValidator {
  /**
   * Validate email address
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = []
    
    if (!email) {
      errors.push('Email is required')
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address')
      }
      
      if (email.length > 254) {
        errors.push('Email address is too long')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate password
   */
  static validatePassword(password: string, confirmPassword?: string): ValidationResult {
    const errors: string[] = []
    
    if (!password) {
      errors.push('Password is required')
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long')
      }
      
      if (password.length > 128) {
        errors.push('Password is too long')
      }
      
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
      }
      
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
      }
      
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number')
      }
      
      if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)')
      }
    }
    
    if (confirmPassword !== undefined && password !== confirmPassword) {
      errors.push('Passwords do not match')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate phone number
   */
  static validatePhone(phone: string): ValidationResult {
    const errors: string[] = []
    
    if (!phone) {
      errors.push('Phone number is required')
    } else {
      // Remove all non-digit characters for validation
      const cleanPhone = phone.replace(/\D/g, '')
      
      if (cleanPhone.length < 7) {
        errors.push('Phone number is too short')
      }
      
      if (cleanPhone.length > 15) {
        errors.push('Phone number is too long')
      }
      
      if (!/^[+]?[\d\s\-\(\)]+$/.test(phone)) {
        errors.push('Please enter a valid phone number')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate name (first name, last name, business name, etc.)
   */
  static validateName(name: string, fieldName: string = 'Name'): ValidationResult {
    const errors: string[] = []
    
    if (!name) {
      errors.push(`${fieldName} is required`)
    } else {
      if (name.length < 2) {
        errors.push(`${fieldName} must be at least 2 characters long`)
      }
      
      if (name.length > 100) {
        errors.push(`${fieldName} is too long`)
      }
      
      if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
        errors.push(`${fieldName} can only contain letters, spaces, hyphens, apostrophes, and periods`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate address
   */
  static validateAddress(address: string): ValidationResult {
    const errors: string[] = []
    
    if (!address) {
      errors.push('Address is required')
    } else {
      if (address.length < 5) {
        errors.push('Address must be at least 5 characters long')
      }
      
      if (address.length > 500) {
        errors.push('Address is too long')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate business name
   */
  static validateBusinessName(businessName: string): ValidationResult {
    const errors: string[] = []
    
    if (!businessName) {
      errors.push('Business name is required')
    } else {
      if (businessName.length < 2) {
        errors.push('Business name must be at least 2 characters long')
      }
      
      if (businessName.length > 200) {
        errors.push('Business name is too long')
      }
      
      if (!/^[a-zA-Z0-9\s\-'\.&,()]+$/.test(businessName)) {
        errors.push('Business name contains invalid characters')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate industry sector
   */
  static validateIndustrySector(industry: string): ValidationResult {
    const errors: string[] = []
    
    if (!industry) {
      errors.push('Industry sector is required')
    } else {
      if (industry.length < 2) {
        errors.push('Industry sector must be at least 2 characters long')
      }
      
      if (industry.length > 100) {
        errors.push('Industry sector is too long')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate city
   */
  static validateCity(city: string): ValidationResult {
    const errors: string[] = []
    
    if (!city) {
      errors.push('City is required')
    } else {
      if (city.length < 2) {
        errors.push('City must be at least 2 characters long')
      }
      
      if (city.length > 100) {
        errors.push('City is too long')
      }
      
      if (!/^[a-zA-Z\s\-'\.]+$/.test(city)) {
        errors.push('City can only contain letters, spaces, hyphens, apostrophes, and periods')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (!input) return ''
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }

  /**
   * Validate and sanitize all form data
   */
  static validateFormData(formData: any, fields: string[]): { isValid: boolean; errors: string[]; sanitizedData: any } {
    const allErrors: string[] = []
    const sanitizedData: any = {}
    
    for (const field of fields) {
      const value = formData[field]
      const sanitizedValue = this.sanitizeInput(value)
      sanitizedData[field] = sanitizedValue
      
      let validation: ValidationResult
      
      switch (field) {
        case 'email':
        case 'emailAddress':
          validation = this.validateEmail(sanitizedValue)
          break
        case 'password':
          validation = this.validatePassword(sanitizedValue, formData.confirmPassword)
          break
        case 'phone':
        case 'phoneNumber':
          validation = this.validatePhone(sanitizedValue)
          break
        case 'businessName':
        case 'companyName':
          validation = this.validateBusinessName(sanitizedValue)
          break
        case 'fullName':
        case 'keyContactPerson':
          validation = this.validateName(sanitizedValue, 'Name')
          break
        case 'address':
        case 'physicalAddress':
          validation = this.validateAddress(sanitizedValue)
          break
        case 'industrySector':
          validation = this.validateIndustrySector(sanitizedValue)
          break
        case 'city':
        case 'cityOfOperation':
          validation = this.validateCity(sanitizedValue)
          break
        default:
          validation = { isValid: true, errors: [] }
      }
      
      if (!validation.isValid) {
        allErrors.push(...validation.errors)
      }
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      sanitizedData
    }
  }
}

export default InputValidator