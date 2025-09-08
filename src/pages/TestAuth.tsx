import { useAuth } from '@/contexts/AuthContext'

const TestAuth = () => {
  const { user, profile, subscription, session, loading } = useAuth()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Auth State</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? 'Yes' : 'No'}</p>
              <p><strong>Profile:</strong> {profile ? 'Yes' : 'No'}</p>
              <p><strong>Subscription:</strong> {subscription ? 'Yes' : 'No'}</p>
              <p><strong>Session:</strong> {session ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Details</h2>
            <div className="space-y-2">
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              <p><strong>Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Profile Tier:</strong> {profile?.tier || 'None'}</p>
              <p><strong>Business Name:</strong> {profile?.business_name || 'None'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>
            <div className="space-y-2">
              <p><strong>Access Token:</strong> {session?.access_token ? 'Present' : 'None'}</p>
              <p><strong>Refresh Token:</strong> {session?.refresh_token ? 'Present' : 'None'}</p>
              <p><strong>Expires At:</strong> {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'None'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Raw Data</h2>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify({ user, profile, subscription, session, loading }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestAuth
