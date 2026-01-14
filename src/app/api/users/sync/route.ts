import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSupabaseAdmin } from '@/lib/supabase';

// POST /api/users/sync - Sync NextAuth user with Supabase
export async function POST() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, email, name, image } = session.user;

        if (!id || !email) {
            return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
        }

        const supabase = createSupabaseAdmin();

        // Upsert user - create if not exists, update if exists
        const { data, error } = await supabase
            .from('users')
            .upsert(
                {
                    id,
                    email,
                    name: name || null,
                    image: image || null,
                },
                {
                    onConflict: 'id',
                    ignoreDuplicates: false,
                }
            )
            .select()
            .single();

        if (error) {
            console.error('Error syncing user:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in POST /api/users/sync:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET /api/users/sync - Get current user data from Supabase
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseAdmin();

        const { data, error } = await supabase
            .from('users')
            .select('*, user_settings(*)')
            .eq('id', session.user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            console.error('Error fetching user:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/users/sync:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
