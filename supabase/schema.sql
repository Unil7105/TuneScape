-- Supabase Database Schema for TuneSpace Music App
-- Run this in your Supabase SQL Editor (https://app.supabase.com -> SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_playlists table
CREATE TABLE IF NOT EXISTS user_playlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    playlist_id VARCHAR(255) NOT NULL,
    playlist_name VARCHAR(500) NOT NULL,
    thumbnail_url TEXT,
    video_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_played_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure unique playlist per user
    UNIQUE(user_id, playlist_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_playlists_user_id ON user_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playlists_last_played ON user_playlists(last_played_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_playlists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own playlists
CREATE POLICY "Users can view own playlists" ON user_playlists
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own playlists
CREATE POLICY "Users can insert own playlists" ON user_playlists
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own playlists
CREATE POLICY "Users can update own playlists" ON user_playlists
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own playlists
CREATE POLICY "Users can delete own playlists" ON user_playlists
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON user_playlists TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
