import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSupabaseAdmin } from '@/lib/supabase';

// GET /api/progress - Get video progress for the authenticated user
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
            .from('video_progress')
            .select('*')
            .eq('user_id', session.user.id);

        if (videoId) {
            query = query.eq('video_id', videoId);
        }

        if (playlistId) {
            query = query.eq('playlist_id', playlistId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching progress:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/progress - Update video progress
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { videoId, playlistId, completed, watchTime, lastPosition } = body;

        if (!videoId) {
            return NextResponse.json(
                { error: 'videoId is required' },
                { status: 400 }
            );
        }

        const supabase = createSupabaseAdmin();

        // Upsert progress - update if exists, insert if not
        const { data, error } = await supabase
            .from('video_progress')
            .upsert(
                {
                    user_id: session.user.id,
                    video_id: videoId,
                    playlist_id: playlistId || null,
                    completed: completed ?? false,
                    watch_time: watchTime ?? 0,
                    last_position: lastPosition ?? 0,
                },
                {
                    onConflict: 'user_id,video_id',
                }
            )
            .select()
            .single();

        if (error) {
            console.error('Error updating progress:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update user streak on video completion
        if (completed) {
            await updateUserStreak(session.user.id, supabase);
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper function to update user streak
async function updateUserStreak(userId: string, supabase: ReturnType<typeof createSupabaseAdmin>) {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Get current user streak data
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('last_activity_date, current_streak')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error('Error fetching user for streak:', fetchError);
            return;
        }

        let newStreak = 1;

        if (user?.last_activity_date) {
            const lastDate = new Date(user.last_activity_date);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Same day, no change
                return;
            } else if (diffDays === 1) {
                // Consecutive day, increment streak
                newStreak = (user.current_streak || 0) + 1;
            }
            // If more than 1 day, streak resets to 1
        }

        // Update user streak
        await supabase
            .from('users')
            .update({
                last_activity_date: today,
                current_streak: newStreak,
            })
            .eq('id', userId);
    } catch (error) {
        console.error('Error updating streak:', error);
    }
}
