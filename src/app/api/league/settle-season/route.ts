import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify admin
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { seasonId } = await request.json();
        if (!seasonId) {
            return NextResponse.json({ error: 'seasonId is required' }, { status: 400 });
        }

        // Call RPC
        const { error: rpcError } = await supabase.rpc('settle_league_movements', { p_season_id: seasonId });

        if (rpcError) {
            console.error('Error settling season:', rpcError);
            return NextResponse.json({ error: 'Failed to settle season' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Season settled successfully' });

    } catch (error: any) {
        console.error('Settle season error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
