import { auth } from '@clerk/nextjs/server'
import { createServerClient } from './supabase'

export async function getSupabaseUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  try {
    const supabase = createServerClient()
    
    // Get user from Supabase using Clerk user ID
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    // Return the first user if found, otherwise null
    const user = users && users.length > 0 ? users[0] : null

    return user
  } catch (error) {
    console.error('Error in getSupabaseUser:', error)
    return null
  }
}

export async function syncClerkUserToSupabase(clerkUser: {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}) {
  try {
    const supabase = createServerClient()
    
    const userData = {
      clerk_id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      first_name: clerkUser.firstName,
      last_name: clerkUser.lastName,
      image_url: clerkUser.imageUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { 
        onConflict: 'clerk_id',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('Error syncing user to Supabase:', error)
      return null
    }

    // Return the first (and should be only) user
    const user = data && data.length > 0 ? data[0] : null

    return user
  } catch (error) {
    console.error('Error in syncClerkUserToSupabase:', error)
    return null
  }
}
