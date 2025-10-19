import { auth, currentUser } from '@clerk/nextjs/server'
import { syncClerkUserToSupabase } from '@/lib/clerk-supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Syncing user:', clerkUser.id, clerkUser.emailAddresses[0]?.emailAddress)

    const supabaseUser = await syncClerkUserToSupabase(clerkUser)
    
    if (!supabaseUser) {
      console.error('Failed to sync user to Supabase')
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 })
    }

    console.log('User synced successfully:', supabaseUser.id)

    return NextResponse.json({ 
      success: true, 
      user: supabaseUser 
    })
  } catch (error) {
    console.error('Error in sync-user API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
