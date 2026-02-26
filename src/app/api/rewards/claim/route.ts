import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { RewardsService } from '@/services/RewardsService';

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { missionId, xpReward } = await request.json();

        if (!missionId || xpReward === undefined) {
            return NextResponse.json({ error: 'Missing missionId or xpReward' }, { status: 400 });
        }

        const result = await RewardsService.claimMission(supabase, user.id, missionId, xpReward);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Mission Claim API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
