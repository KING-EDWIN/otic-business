// Error handler to suppress development-only errors
export const suppressDevelopmentErrors = () => {
  if (process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Suppress WebSocket connection errors in development
      if (message.includes('WebSocket connection') && message.includes('failed')) {
        return;
      }
      
      // Suppress 401 errors from unauthenticated health checks
      if (message.includes('401') && message.includes('v1')) {
        return;
      }
      
      // Suppress 404 errors from missing RPC functions (temporary)
      if (message.includes('404') && message.includes('switch_business_context')) {
        return;
      }
      
      // Log other errors normally
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Suppress WebSocket warnings in development
      if (message.includes('WebSocket') && message.includes('closed')) {
        return;
      }
      
      // Log other warnings normally
      originalWarn.apply(console, args);
    };
  }
};

// Initialize error suppression
suppressDevelopmentErrors();
