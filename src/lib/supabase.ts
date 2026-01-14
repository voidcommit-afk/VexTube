import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Browser client for client-side usage (without strict typing to avoid TS issues)
export function createSupabaseBrowserClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Standard client for server-side usage
export function createSupabaseClient() {
    return createClient(supabaseUrl, supabaseAnonKey);
}

// Admin client with service role key (server-side only)
export function createSupabaseAdmin() {
    if (!supabaseServiceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
    }
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Singleton for server components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverClient: any = null;

export function getSupabaseServer() {
    if (!serverClient) {
        serverClient = createSupabaseClient();
    }
    return serverClient;
}

// Type definitions for reference (not used for client typing)
export interface Note {
    id: string;
    user_id: string;
    video_id: string;
    playlist_id: string | null;
    title: string;
    content: string;
    tags: string[] | null;
    folder_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface Playlist {
    id: string;
    user_id: string;
    youtube_playlist_id: string;
    title: string;
    thumbnail_url: string | null;
    video_count: number;
    current_index: number;
    created_at: string;
    updated_at: string;
}

export interface VideoProgress {
    id: string;
    user_id: string;
    playlist_id: string | null;
    video_id: string;
    completed: boolean;
    watch_time: number;
    last_position: number;
    created_at: string;
    updated_at: string;
}

export interface UserSettings {
    id: string;
    user_id: string;
    dark_mode: boolean;
    playback_speed: number;
    volume: number;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    created_at: string;
    updated_at: string;
    last_activity_date: string | null;
    current_streak: number;
}
