import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSupabaseAdmin } from '@/lib/supabase';

// GET /api/notes - Get all notes for the authenticated user
export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get('videoId');
        const playlistId = searchParams.get('playlistId');

        const supabase = createSupabaseAdmin();

        let query = supabase
            .from('notes')
            .select('*')
            .eq('user_id', session.user.id)
            .order('updated_at', { ascending: false });

        if (videoId) {
            query = query.eq('video_id', videoId);
        }

        if (playlistId) {
            query = query.eq('playlist_id', playlistId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching notes:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/notes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/notes - Create a new note
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { videoId, playlistId, title, content, tags } = body;

        if (!videoId || !title || !content) {
            return NextResponse.json(
                { error: 'videoId, title, and content are required' },
                { status: 400 }
            );
        }

        const supabase = createSupabaseAdmin();

        const { data, error } = await supabase
            .from('notes')
            .insert({
                user_id: session.user.id,
                video_id: videoId,
                playlist_id: playlistId || null,
                title,
                content,
                tags: tags || [],
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating note:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/notes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
