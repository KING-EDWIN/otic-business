// Debug Authentication State
// Run this in the browser console to check auth state

console.log('=== AUTH DEBUG ===');

// Check if we're in demo mode
console.log('Demo mode:', sessionStorage.getItem('demo_mode'));

// Check Supabase auth state
supabase.auth.getSession().then(({ data: { session }, error }) => {
  console.log('Supabase Session:', session);
  console.log('Session Error:', error);
  
  if (session?.user) {
    console.log('User ID:', session.user.id);
    console.log('User Email:', session.user.email);
    
    // Check user profile
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data: profile, error: profileError }) => {
        console.log('User Profile:', profile);
        console.log('Profile Error:', profileError);
      });
  }
});

// Check if there are any React errors
console.log('React DevTools available:', !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__);

// Check for any console errors
const originalError = console.error;
console.error = function(...args) {
  console.log('🚨 CONSOLE ERROR:', ...args);
  originalError.apply(console, args);
};

