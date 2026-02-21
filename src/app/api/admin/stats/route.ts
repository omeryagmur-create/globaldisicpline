import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Call the optimized RPC
    const { data: stats, error: rpcError } = await supabase.rpc('get_admin_dashboard_stats');

    if (rpcError) {
        logger.error('ADMIN_STATS_RPC_FAIL', rpcError, { userId: user.id });
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    return NextResponse.json(stats);
}
