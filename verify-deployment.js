// Quick deployment verification script
console.log('🔍 Verifying Otic Business Deployment...\n');

// Check environment variables
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_QB_CLIENT_ID',
  'VITE_QB_CLIENT_SECRET',
  'VITE_QB_REDIRECT_URI',
  'VITE_QB_ENVIRONMENT',
  'VITE_QB_COMPANY_ID',
  'VITE_MISTRAL_API_KEY',
  'VITE_ADMIN_API_SECRET',
  'NODE_ENV'
];

console.log('📋 Required Environment Variables:');
requiredVars.forEach(varName => {
  const value = import.meta.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
  }
});

console.log('\n🔗 Current Configuration:');
console.log(`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}`);
console.log(`QB Redirect URI: ${import.meta.env.VITE_QB_REDIRECT_URI}`);
console.log(`Environment: ${import.meta.env.NODE_ENV}`);

console.log('\n🌐 Domain Check:');
console.log(`Current URL: ${window.location.href}`);
console.log(`Expected Domain: oticbusiness.com`);
console.log(`Domain Match: ${window.location.hostname === 'oticbusiness.com' ? '✅' : '❌'}`);

console.log('\n📝 Next Steps:');
console.log('1. Add missing environment variables in Coolify');
console.log('2. Redeploy (not restart) the application');
console.log('3. Check Supabase CORS settings');
console.log('4. Verify QuickBooks redirect URI');



