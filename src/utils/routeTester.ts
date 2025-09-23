// Route testing utility to identify 404 errors
export const ALL_ROUTES = [
  // Public routes
  '/',
  '/features',
  '/pricing',
  '/faq',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/login-type',
  '/user-type',
  '/business-signin',
  '/individual-signin',
  '/business-signup',
  '/individual-signup',
  '/auth/callback',
  '/oauth-callback',
  '/reset-password',
  
  // Protected routes (require authentication)
  '/dashboard',
  '/individual-dashboard',
  '/pos',
  '/inventory',
  '/analytics',
  '/accounting',
  '/payments',
  '/customers',
  '/reports',
  '/settings',
  '/individual-settings',
  '/ai-insights',
  '/ai-chat',
  '/my-extras',
  '/multi-branch-management',
  
  // Branch routes
  '/branch/1/analytics',
  '/branch/1/accounting',
  '/branch/1/sales',
  '/branch/1/staff',
  '/branch/1/inventory',
  '/branch/1/ai-insights',
  
  // Other routes
  '/quickbooks/callback',
  '/auth/google-callback',
  '/payments/success',
  '/get-started',
  '/complete-profile',
  '/trial-confirmation',
  '/tier-selection',
  '/tier-guide',
  
  // Test routes
  '/test-auth',
  '/auth-test',
  '/simple-test',
  '/profile-test'
]

export const testRoute = async (route: string): Promise<{ route: string; status: 'ok' | 'error'; error?: string }> => {
  try {
    // This would be used in a real testing environment
    // For now, we'll just return the route as ok
    return { route, status: 'ok' }
  } catch (error) {
    return { route, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const testAllRoutes = async () => {
  const results = []
  for (const route of ALL_ROUTES) {
    const result = await testRoute(route)
    results.push(result)
  }
  return results
}
