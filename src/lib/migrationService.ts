/**
 * Migration Service
 * Handles migration of data from LocalStorage to Supabase database
 */

import { createSupabaseBrowserClient } from '@/lib/supabase';

const NOTES_PREFIX = 'video_notes_';
const STORAGE_KEY = 'youtube-playlist-data';

interface LocalStorageNote {
    content: string;
    title: string;
    updatedAt: string;
    videoId: string;
}

interface LocalStoragePlaylist {
    videos: { id: string; completed: boolean }[];
    currentIndex: number;
    lastPlayedId: string;
    updatedAt: number;
}

interface LocalStorageData {
    settings: {
        playbackSpeed: number;
        darkMode: boolean;
        volume?: number;
    };
    playlists: {
        [key: string]: LocalStoragePlaylist;
    };
}

interface MigrationResult {
    success: boolean;
    notesCount: number;
    playlistsCount: number;
    progressCount: number;
    errors: string[];
}

/**
 * Migrate notes from LocalStorage to Supabase
 */
export async function migrateNotes(userId: string): Promise<{
    count: number;
    errors: string[];
}> {
    const errors: string[] = [];
    let count = 0;

    try {
        if (typeof window === 'undefined') {
            return { count: 0, errors: ['Migration can only run in browser'] };
        }

        const notes: Array<{ videoId: string; title: string; content: string }> = [];

        // Find all notes in localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(NOTES_PREFIX)) {
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        let data: LocalStorageNote | string;
                        try {
                            data = JSON.parse(raw);
                        } catch {
                            data = {
                                content: raw,
                                title: 'Migrated Note',
                                updatedAt: new Date().toISOString(),
                                videoId: key.replace(NOTES_PREFIX, ''),
                            };
                        }

                        const note = typeof data === 'string'
                            ? {
                                content: data,
                                title: 'Migrated Note',
                                videoId: key.replace(NOTES_PREFIX, ''),
                            }
                            : {
                                content: data.content || '',
                                title: data.title || 'Migrated Note',
                                videoId: data.videoId || key.replace(NOTES_PREFIX, ''),
                            };

                        if (note.content) {
                            notes.push(note);
                        }
                    }
                } catch (e) {
                    errors.push(`Failed to parse note ${key}: ${e}`);
                }
            }
        }

        if (notes.length === 0) {
            return { count: 0, errors };
        }

        // Insert notes into Supabase
        const supabase = createSupabaseBrowserClient();

        for (const note of notes) {
            try {
                const { error } = await supabase.from('notes').insert({
                    user_id: userId,
                    video_id: note.videoId,
                    title: note.title,
                    content: note.content,
                });

                if (error) {
                    // Check if it's a duplicate
                    if (error.code !== '23505') {
                        errors.push(`Failed to insert note for video ${note.videoId}: ${error.message}`);
                    }
                } else {
                    count++;
                }
            } catch (e) {
                errors.push(`Error inserting note: ${e}`);
            }
        }

        return { count, errors };
    } catch (e) {
        errors.push(`Migration error: ${e}`);
        return { count, errors };
    }
}

/**
 * Migrate video progress from LocalStorage to Supabase
 */
export async function migrateProgress(userId: string): Promise<{
    count: number;
    errors: string[];
}> {
    const errors: string[] = [];
    let count = 0;

    try {
        if (typeof window === 'undefined') {
            return { count: 0, errors: ['Migration can only run in browser'] };
        }

        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            return { count: 0, errors };
        }

        const storage: LocalStorageData = JSON.parse(saved);
        const supabase = createSupabaseBrowserClient();

        // Migrate video progress from each playlist
        for (const playlistKey in storage.playlists) {
            const playlist = storage.playlists[playlistKey];

            for (const video of playlist.videos) {
                if (video.completed) {
                    try {
                        const { error } = await supabase.from('video_progress').upsert(
                            {
                                user_id: userId,
                                video_id: video.id,
                                completed: video.completed,
                                watch_time: 0,
                                last_position: 0,
                            },
                            { onConflict: 'user_id,video_id' }
                        );

                        if (error && error.code !== '23505') {
                            errors.push(`Failed to migrate progress for video ${video.id}: ${error.message}`);
                        } else {
                            count++;
                        }
                    } catch (e) {
                        errors.push(`Error migrating progress: ${e}`);
                    }
                }
            }
        }

        return { count, errors };
    } catch (e) {
        errors.push(`Migration error: ${e}`);
        return { count, errors };
    }
}

/**
 * Migrate settings from LocalStorage to Supabase
 */
export async function migrateSettings(userId: string): Promise<{
    success: boolean;
    errors: string[];
}> {
    const errors: string[] = [];

    try {
        if (typeof window === 'undefined') {
            return { success: false, errors: ['Migration can only run in browser'] };
        }

        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            return { success: true, errors };
        }

        const storage: LocalStorageData = JSON.parse(saved);
        const supabase = createSupabaseBrowserClient();

        const { error } = await supabase.from('user_settings').upsert(
            {
                user_id: userId,
                dark_mode: storage.settings.darkMode ?? true,
                playback_speed: storage.settings.playbackSpeed ?? 1.0,
                volume: storage.settings.volume ?? 1.0,
            },
            { onConflict: 'user_id' }
        );

        if (error) {
            errors.push(`Failed to migrate settings: ${error.message}`);
            return { success: false, errors };
        }

        return { success: true, errors };
    } catch (e) {
        errors.push(`Migration error: ${e}`);
        return { success: false, errors };
    }
}

/**
 * Run full migration
 */
export async function runFullMigration(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
        success: false,
        notesCount: 0,
        playlistsCount: 0,
        progressCount: 0,
        errors: [],
    };

    try {
        // Migrate notes
        const notesResult = await migrateNotes(userId);
        result.notesCount = notesResult.count;
        result.errors.push(...notesResult.errors);

        // Migrate progress
        const progressResult = await migrateProgress(userId);
        result.progressCount = progressResult.count;
        result.errors.push(...progressResult.errors);

        // Migrate settings
        const settingsResult = await migrateSettings(userId);
        result.errors.push(...settingsResult.errors);

        result.success = result.errors.length === 0;

        return result;
    } catch (e) {
        result.errors.push(`Full migration error: ${e}`);
        return result;
    }
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
    if (typeof window === 'undefined') return false;

    // Check for notes
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(NOTES_PREFIX)) {
            return true;
        }
    }

    // Check for playlist data
    if (localStorage.getItem(STORAGE_KEY)) {
        return true;
    }

    return false;
}

/**
 * Clear migrated data from LocalStorage
 */
export function clearMigratedData(): void {
    if (typeof window === 'undefined') return;

    // Remove notes
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(NOTES_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Remove playlist data
    localStorage.removeItem(STORAGE_KEY);
}
