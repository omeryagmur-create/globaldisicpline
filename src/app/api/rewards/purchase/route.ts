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

        const { rewardId, idempotencyKey } = await request.json();

        if (!rewardId || !idempotencyKey) {
            return NextResponse.json({ error: 'Missing rewardId or idempotencyKey' }, { status: 400 });
        }

        const result = await RewardsService.purchaseReward(supabase, user.id, rewardId, idempotencyKey);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Rewards Purchase API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
