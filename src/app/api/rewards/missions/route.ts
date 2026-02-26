import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { RewardsService } from '@/services/RewardsService';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dashboard = await RewardsService.getRewardsDashboard(supabase, user.id);

        return NextResponse.json(dashboard.missions);
    } catch (error: any) {
        console.error('Missions API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
