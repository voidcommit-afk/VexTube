import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSupabaseAdmin } from '@/lib/supabase';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/playlists/[id] - Get a specific playlist
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const supabase = createSupabaseAdmin();

        const { data, error } = await supabase
            .from('playlists')
            .select('*')
            .eq('id', id)
            .eq('user_id', session.user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
            }
            console.error('Error fetching playlist:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/playlists/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/playlists/[id] - Update a playlist
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, thumbnailUrl, videoCount, currentIndex } = body;

        const supabase = createSupabaseAdmin();

        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (thumbnailUrl !== undefined) updateData.thumbnail_url = thumbnailUrl;
        if (videoCount !== undefined) updateData.video_count = videoCount;
        if (currentIndex !== undefined) updateData.current_index = currentIndex;

        const { data, error } = await supabase
            .from('playlists')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', session.user.id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
            }
            console.error('Error updating playlist:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT /api/playlists/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/playlists/[id] - Delete a playlist
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const supabase = createSupabaseAdmin();

        const { error } = await supabase
            .from('playlists')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) {
            console.error('Error deleting playlist:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/playlists/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
