# Clerk Authentication Setup

This project now includes Clerk authentication integration. Follow these steps to complete the setup:

## 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application in your Clerk dashboard

## 2. Get Your API Keys

1. In your Clerk Dashboard, navigate to the [API Keys page](https://dashboard.clerk.com/last-active?path=api-keys)
2. Copy your **Publishable Key** and **Secret Key**

## 3. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Open `.env.local` and replace the placeholder values with your actual keys:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
   CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
   ```

   **Important**: Make sure to use your actual keys from the Clerk Dashboard, not the placeholder values!

3. If you see the "keyless mode" error, it means your environment variables are not set correctly. Double-check that:
   - Your `.env.local` file exists in the project root
   - The keys are correctly copied from your Clerk Dashboard
   - There are no extra spaces or quotes around the values

## 4. Configure Authentication (Optional)

You can customize the authentication experience in your Clerk Dashboard:

- **Sign-in/Sign-up pages**: Customize the appearance and fields
- **Social providers**: Enable Google, GitHub, etc.
- **User management**: Set up user roles and permissions

## 5. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit your application and you should see:
   - Sign In and Sign Up buttons when not authenticated
   - User button with profile when authenticated

## Features Included

- ✅ Middleware protection using `clerkMiddleware()`
- ✅ ClerkProvider wrapping the entire app
- ✅ Sign In/Sign Up buttons for unauthenticated users
- ✅ User button for authenticated users
- ✅ Automatic redirects and session management

## Next Steps

- Customize the authentication UI in your Clerk Dashboard
- Add protected routes using Clerk's `<SignedIn>` and `<SignedOut>` components
- Implement user-specific features using Clerk's user data
