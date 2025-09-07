# Google OAuth Setup for Otic Business

## Prerequisites
1. Google Cloud Console account
2. Supabase project with authentication enabled

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/v1/callback` (for development)
5. Copy the Client ID and Client Secret

## Step 2: Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable Google provider
4. Add your Google OAuth credentials:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
5. Save the configuration

## Step 3: Environment Variables

Add these to your `.env.local` file:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Go to the sign-up page
3. Click "Continue with Google"
4. Complete the OAuth flow
5. You should be redirected to the complete profile page

## Features Implemented

### Sign In Page
- Google sign-in button with proper styling
- Handles OAuth redirect to dashboard

### Sign Up Page  
- Google sign-up button with proper styling
- Handles OAuth redirect to complete profile page

### Complete Profile Page
- Business details form for OAuth users
- Pre-fills with Google profile data when available
- Creates user profile and subscription in database
- Redirects to dashboard after completion

### AuthContext Updates
- Added `signInWithGoogle()` and `signUpWithGoogle()` methods
- Handles OAuth user profile creation
- Redirects users without profiles to complete profile page

## User Flow

1. **New User (Google Sign-up)**:
   - Clicks "Continue with Google" on sign-up page
   - Completes Google OAuth
   - Redirected to complete profile page
   - Fills business details
   - Redirected to dashboard

2. **Existing User (Google Sign-in)**:
   - Clicks "Continue with Google" on sign-in page
   - Completes Google OAuth
   - Redirected directly to dashboard

3. **OAuth User without Profile**:
   - Automatically redirected to complete profile page
   - Must complete business details before accessing dashboard

## Security Notes

- All OAuth flows use secure HTTPS redirects
- User profiles are created with proper validation
- Subscriptions are automatically created based on selected tier
- Demo account remains available for testing

## Troubleshooting

1. **"Google sign-in failed"**: Check Google OAuth credentials and redirect URIs
2. **"No user found"**: Ensure Supabase auth is properly configured
3. **Profile creation errors**: Check database permissions and RLS policies
4. **Redirect issues**: Verify redirect URIs match exactly in Google Console

## Next Steps

1. Configure Google OAuth in your Supabase project
2. Test the complete flow
3. Deploy to production with production redirect URIs
4. Consider adding other OAuth providers (Facebook, GitHub, etc.)
