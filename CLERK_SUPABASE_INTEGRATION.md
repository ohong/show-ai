# Clerk + Supabase Integration

This project now includes a complete integration between Clerk (authentication) and Supabase (database). Users authenticated with Clerk are automatically synced to your Supabase database.

## 🏗️ Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Clerk     │    │  Next.js    │    │  Supabase   │
│ (Auth)      │◄──►│   App       │◄──►│ (Database)  │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🔧 What's Been Set Up

### 1. **Supabase Client Configuration**
- `src/lib/supabase.ts` - Client-side Supabase configuration
- `src/lib/clerk-supabase.ts` - Integration utilities between Clerk and Supabase

### 2. **User Synchronization**
- Automatic user sync from Clerk to Supabase
- API endpoint: `/api/auth/sync-user`
- React hook: `useSupabaseUser()` for easy data access

### 3. **Database Schema**
- `users` table with Clerk user data
- Automatic timestamps and updates
- Optimized indexes for performance

### 4. **React Components**
- `UserProfile` component showing both Clerk and Supabase data
- Real-time user state management

## 🚀 Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy your:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)

### 2. Update Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Sign in with Clerk
3. Check the UserProfile component - it should show both Clerk and Supabase user data

## 📊 Database Schema

The `users` table includes:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,  -- Links to Clerk user
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## 🛠️ Usage Examples

### Using the Supabase User Hook

```tsx
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

function MyComponent() {
  const { supabaseUser, clerkUser, loading, error } = useSupabaseUser()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <h1>Welcome, {supabaseUser?.first_name}!</h1>
      <p>Email: {supabaseUser?.email}</p>
    </div>
  )
}
```

### Server-Side User Access

```tsx
import { getSupabaseUser } from '@/lib/clerk-supabase'

export async function GET() {
  const user = await getSupabaseUser()
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return Response.json({ user })
}
```

## 🔒 Security Features

- **Row Level Security (RLS)** ready
- **Service Role Key** for server-side operations
- **Anon Key** for client-side operations
- **Automatic user sync** on authentication

## 🎯 Next Steps

1. **Add RLS Policies**: Secure your data with Row Level Security
2. **Extend User Schema**: Add custom fields to the users table
3. **Create User Relations**: Link users to other entities
4. **Add Real-time**: Use Supabase real-time features
5. **Custom Hooks**: Create domain-specific data hooks

## 🐛 Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check your Supabase credentials
2. **"User not found"**: Ensure the sync API is working
3. **Database errors**: Verify the users table exists

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables
3. Test the sync API endpoint directly
4. Check Supabase logs in the dashboard

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
