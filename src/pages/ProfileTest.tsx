import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'

const ProfileTest = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProfile = async () => {
    if (!user?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('Manually fetching profile for user:', user.id)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Profile fetch error:', error)
        setError(error.message)
      } else {
        console.log('Profile fetched successfully:', data)
        setProfile(data)
      }
    } catch (err) {
      console.error('Profile fetch failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <p><strong>User ID:</strong> {user?.id || 'None'}</p>
          <p><strong>Email:</strong> {user?.email || 'None'}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Data</h2>
          {loading && <p>Loading profile...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {profile && (
            <div>
              <p><strong>Business Name:</strong> {profile.business_name}</p>
              <p><strong>Tier:</strong> {profile.tier}</p>
              <p><strong>Phone:</strong> {profile.phone}</p>
              <p><strong>Address:</strong> {profile.address}</p>
            </div>
          )}
          <button
            onClick={fetchProfile}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Profile
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Raw Profile Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default ProfileTest
