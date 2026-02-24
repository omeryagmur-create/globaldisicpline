import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify admin
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Call RPC
        const { data: nextSeasonId, error: rpcError } = await supabase.rpc('start_next_season');

        if (rpcError) {
            console.error('Error starting next season:', rpcError);
            return NextResponse.json({ error: 'Failed to start next season' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Next season started successfully', seasonId: nextSeasonId });

    } catch (error: any) {
        console.error('Start next season error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
