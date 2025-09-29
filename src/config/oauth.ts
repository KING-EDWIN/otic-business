// Google OAuth Configuration for oticbusiness.com
export const GOOGLE_OAUTH_CONFIG = {
  // Production domain
  production: {
    domain: 'oticbusiness.com',
    redirectUri: 'https://oticbusiness.com/auth/callback',
    authorizedOrigins: [
      'https://oticbusiness.com',
      'https://www.oticbusiness.com'
    ]
  },
  
  // Development domain
  development: {
    domain: 'localhost',
    redirectUri: 'http://localhost:8081/auth/callback',
    authorizedOrigins: [
      'http://localhost:8081',
      'http://localhost:8080'
    ]
  }
}

// Get current environment config
export const getOAuthConfig = () => {
  const isProduction = window.location.hostname === 'oticbusiness.com' || 
                      window.location.hostname === 'www.oticbusiness.com'
  
  return isProduction ? GOOGLE_OAUTH_CONFIG.production : GOOGLE_OAUTH_CONFIG.development
}

// Instructions for Google Cloud Console setup
export const GOOGLE_SETUP_INSTRUCTIONS = `
To configure Google OAuth for oticbusiness.com:

1. Go to Google Cloud Console (https://console.cloud.google.com/)
2. Select your project or create a new one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     * https://oticbusiness.com
     * https://www.oticbusiness.com
     * http://localhost:8081 (for development)
   - Add authorized redirect URIs:
     * https://oticbusiness.com/auth/callback
     * http://localhost:8081/auth/callback
5. Copy the Client ID and Client Secret
6. Update Supabase Auth settings with these credentials
`
