import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSupabaseAdmin } from '@/lib/supabase';

// GET /api/playlists - Get all playlists for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseAdmin();

        const { data, error } = await supabase
            .from('playlists')
            .select('*')
            .eq('user_id', session.user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching playlists:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/playlists:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/playlists - Create or update a playlist
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { youtubePlaylistId, title, thumbnailUrl, videoCount, currentIndex } = body;

        if (!youtubePlaylistId || !title) {
            return NextResponse.json(
                { error: 'youtubePlaylistId and title are required' },
                { status: 400 }
            );
        }

        const supabase = createSupabaseAdmin();

        // Upsert - create or update based on unique constraint
        const { data, error } = await supabase
            .from('playlists')
            .upsert(
                {
                    user_id: session.user.id,
                    youtube_playlist_id: youtubePlaylistId,
                    title,
                    thumbnail_url: thumbnailUrl || null,
                    video_count: videoCount || 0,
                    current_index: currentIndex || 0,
                },
                {
                    onConflict: 'user_id,youtube_playlist_id',
                }
            )
            .select()
            .single();

        if (error) {
            console.error('Error creating/updating playlist:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/playlists:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
