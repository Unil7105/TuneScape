# 🔐 Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication with Google login for TuneSpace.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `aura-harmony` (or any name you prefer)
   - **Database Password**: Generate a strong password
   - **Region**: Choose the closest to your users
5. Click **"Create new project"** and wait for it to be ready

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values and add them to your `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Set Up the Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New query"**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **"Run"** to create the tables

## Step 4: Configure Google OAuth

### In Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Choose **"Web application"**
6. Add these to **Authorized redirect URIs**:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:5173` (for local development)
7. Copy the **Client ID** and **Client Secret**

### In Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Find **Google** and enable it
3. Paste your Google **Client ID** and **Client Secret**
4. Save changes

## Step 5: Configure Site URL

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173`

## Step 6: Test the Integration

1. Restart your dev server: `npm run dev`
2. Open `http://localhost:5173`
3. Click **"Sign in with Google"**
4. You should be redirected to Google login
5. After login, you'll see your profile picture in the header

## Production Deployment

When deploying to production:

1. Update **Site URL** in Supabase to your production URL
2. Add your production URL to **Redirect URLs**
3. Update Google OAuth authorized URIs with your production URL
4. Update environment variables in your hosting platform

## Troubleshooting

### "Invalid redirect URI" error
- Make sure your redirect URI in Google Console exactly matches what Supabase expects
- The format should be: `https://your-project-ref.supabase.co/auth/v1/callback`

### User not saving to database
- Check that RLS policies are correctly applied
- Verify the user is authenticated by checking `supabase.auth.getUser()`

### CORS errors
- Add your development URL to the allowed origins in Supabase settings

## Database Schema Overview

```sql
user_playlists
├── id (UUID, primary key)
├── user_id (UUID, references auth.users)
├── playlist_id (VARCHAR, YouTube playlist ID)
├── playlist_name (VARCHAR)
├── thumbnail_url (TEXT)
├── video_count (INTEGER)
├── created_at (TIMESTAMP)
└── last_played_at (TIMESTAMP)
```

## Features Implemented

✅ Google OAuth login  
✅ User profile display  
✅ Automatic playlist saving  
✅ Playlist management (view, delete)  
✅ Sample playlists for discovery  
✅ Row Level Security (users can only access their own data)  
