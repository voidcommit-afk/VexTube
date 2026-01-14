-- VexTube Database Schema
-- Run this SQL in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (syncs with NextAuth.js)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_date DATE,
    current_streak INTEGER DEFAULT 0
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    dark_mode BOOLEAN DEFAULT true,
    playback_speed DECIMAL(3,2) DEFAULT 1.0,
    volume DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    youtube_playlist_id TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    video_count INTEGER DEFAULT 0,
    current_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, youtube_playlist_id)
);

-- Video progress table
CREATE TABLE IF NOT EXISTS video_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
    video_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    watch_time INTEGER DEFAULT 0,
    last_position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    video_id TEXT NOT NULL,
    playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    folder_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_video_id ON notes(video_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_playlists_updated_at ON playlists;
CREATE TRIGGER update_playlists_updated_at
    BEFORE UPDATE ON playlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_progress_updated_at ON video_progress;
CREATE TRIGGER update_video_progress_updated_at
    BEFORE UPDATE ON video_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own settings" ON user_settings
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Playlists policies
CREATE POLICY "Users can view own playlists" ON playlists
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own playlists" ON playlists
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own playlists" ON playlists
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own playlists" ON playlists
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Video progress policies
CREATE POLICY "Users can view own progress" ON video_progress
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own progress" ON video_progress
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own progress" ON video_progress
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own progress" ON video_progress
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Notes policies
CREATE POLICY "Users can view own notes" ON notes
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notes" ON notes
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own notes" ON notes
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Service role bypass for API routes
-- Note: These are automatically applied when using service_role key
