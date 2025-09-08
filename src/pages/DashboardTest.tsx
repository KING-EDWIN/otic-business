import { useAuth } from '@/contexts/AuthContext'

const DashboardTest = () => {
  const { user, profile, loading } = useAuth()

  console.log('DashboardTest render:', { user, profile, loading })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading... (This should not take more than 1 second)</p>
          <p className="text-sm text-gray-500 mt-2">
            User: {user ? 'Yes' : 'No'} | Profile: {profile ? 'Yes' : 'No'} | Loading: {loading ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Not signed in</h2>
          <p>User: {user ? 'Yes' : 'No'}</p>
          <p>Profile: {profile ? 'Yes' : 'No'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Dashboard Test</h1>
        <p>User: {user.email}</p>
        <p>Profile: {profile?.business_name || 'No profile'}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}

export default DashboardTest
