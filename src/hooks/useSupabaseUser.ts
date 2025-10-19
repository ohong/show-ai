'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

interface SupabaseUser {
  id: string
  clerk_id: string
  email: string
  first_name: string
  last_name: string
  image_url: string
  created_at: string
  updated_at: string
}

export function useSupabaseUser() {
  const { user: clerkUser, isLoaded } = useUser()
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded) return
      
      if (!clerkUser) {
        setSupabaseUser(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // First, try to get existing user from Supabase
        const { data: users, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', clerkUser.id)

        if (fetchError) {
          console.error('Error fetching user from Supabase:', fetchError)
          throw fetchError
        }

        const existingUser = users && users.length > 0 ? users[0] : null

        if (existingUser) {
          setSupabaseUser(existingUser)
          setLoading(false)
          return
        }

        // If user doesn't exist, sync from Clerk to Supabase
        const response = await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to sync user')
        }

        const { user: syncedUser } = await response.json()
        setSupabaseUser(syncedUser)
      } catch (err) {
        console.error('Error syncing user:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [clerkUser, isLoaded])

  return {
    supabaseUser,
    clerkUser,
    loading,
    error,
    isSignedIn: !!clerkUser,
  }
}
