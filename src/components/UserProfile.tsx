'use client'

import { useSupabaseUser } from '@/hooks/useSupabaseUser'

export function UserProfile() {
  const { supabaseUser, clerkUser, loading, error, isSignedIn } = useSupabaseUser()

  if (!isSignedIn) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p>Please sign in to view your profile.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <p>Loading your profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-700">Clerk User Info:</h3>
          <p><strong>ID:</strong> {clerkUser?.id}</p>
          <p><strong>Email:</strong> {clerkUser?.emailAddresses[0]?.emailAddress}</p>
          <p><strong>Name:</strong> {clerkUser?.fullName}</p>
        </div>

        {supabaseUser && (
          <div>
            <h3 className="font-semibold text-gray-700">Supabase User Info:</h3>
            <p><strong>Database ID:</strong> {supabaseUser.id}</p>
            <p><strong>Clerk ID:</strong> {supabaseUser.clerk_id}</p>
            <p><strong>Email:</strong> {supabaseUser.email}</p>
            <p><strong>Name:</strong> {supabaseUser.first_name} {supabaseUser.last_name}</p>
            <p><strong>Created:</strong> {new Date(supabaseUser.created_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  )
}
