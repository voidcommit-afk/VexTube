import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSupabaseAdmin } from '@/lib/supabase';

// GET /api/settings - Get user settings
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseAdmin();

        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Settings don't exist, return defaults
                return NextResponse.json({
                    dark_mode: true,
                    playback_speed: 1.0,
                    volume: 1.0,
                });
            }
            console.error('Error fetching settings:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/settings - Update user settings
export async function PUT(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { darkMode, playbackSpeed, volume } = body;

        const supabase = createSupabaseAdmin();

        // Upsert settings
        const { data, error } = await supabase
            .from('user_settings')
            .upsert(
                {
                    user_id: session.user.id,
                    dark_mode: darkMode ?? true,
                    playback_speed: playbackSpeed ?? 1.0,
                    volume: volume ?? 1.0,
                },
                {
                    onConflict: 'user_id',
                }
            )
            .select()
            .single();

        if (error) {
            console.error('Error updating settings:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT /api/settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
