import { useAuth } from '@/contexts/AuthContext'

const AuthTest = () => {
  const { user, profile, loading, signIn, signOut } = useAuth()

  const handleSignIn = async () => {
    const { error } = await signIn('test@oticbusiness.com', 'test123456')
    if (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Auth Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'None'}</p>
            <p><strong>Profile:</strong> {profile ? profile.business_name : 'None'}</p>
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            {!user ? (
              <button
                onClick={handleSignIn}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sign In (test@oticbusiness.com)
              </button>
            ) : (
              <button
                onClick={signOut}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({ user, profile, loading }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default AuthTest
