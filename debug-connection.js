// Debug script to test frontend-backend connection
// Run this in browser console at http://localhost:8080/dashboard

console.log('=== OTIC BUSINESS CONNECTION DEBUG ===');

// Test 1: Check if Supabase client is loaded
console.log('1. Supabase Client:', window.supabase ? 'LOADED' : 'NOT LOADED');

// Test 2: Check Supabase configuration
if (window.supabase) {
  console.log('2. Supabase URL:', window.supabase.supabaseUrl);
  console.log('3. Supabase Key:', window.supabase.supabaseAnonKey ? 'PRESENT' : 'MISSING');
}

// Test 3: Test direct database query
async function testDirectQuery() {
  try {
    const { data, error } = await window.supabase
      .from('sales')
      .select('count(*)')
      .eq('user_id', '00000000-0000-0000-0000-000000000001');
    
    console.log('4. Direct Query Result:', data, error);
  } catch (err) {
    console.log('4. Direct Query Error:', err);
  }
}

// Test 4: Test RPC function call
async function testRPCFunction() {
  try {
    const { data, error } = await window.supabase
      .rpc('get_dashboard_stats', { p_user_id: '00000000-0000-0000-0000-000000000001' });
    
    console.log('5. RPC Function Result:', data, error);
  } catch (err) {
    console.log('5. RPC Function Error:', err);
  }
}

// Test 5: Test user authentication
async function testAuth() {
  try {
    const { data: { user }, error } = await window.supabase.auth.getUser();
    console.log('6. Current User:', user, error);
  } catch (err) {
    console.log('6. Auth Error:', err);
  }
}

// Run all tests
testDirectQuery();
testRPCFunction();
testAuth();

console.log('=== END DEBUG ===');

