import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // Calculate Active Users securely (users with a SESSION_COMPLETE event in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Grouping by user_id to count distinct active users would require RPC in supabase
    // For now we get the distinct profiles with last_activity_date > 7 days ago, OR we can use focus sessions
    const { data: recentSessions } = await supabase
        .from('focus_sessions')
        .select('user_id')
        .gte('created_at', sevenDaysAgo.toISOString());

    // Count distinct user IDs
    const activeUserIds = new Set(recentSessions?.map(s => s.user_id));
    const activeUsers = activeUserIds.size;

    const { data: focusSessions } = await supabase
        .from('focus_sessions')
        .select('duration_minutes');

    let totalFocusHours = 0;
    if (focusSessions) {
        const totalMin = focusSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
        totalFocusHours = Math.round(totalMin / 60);
    }

    // Attempting basic retention calculation
    // Retention D1 ~ estimate based on recent returning users vs total created yesterday
    // Since we don't have historical sign up tracking out-of-the-box easily without rpc, we provide a placeholder wrapper for the UI
    const retentionD1 = 45; // Placeholder % until full D1 cohort logic is built via RPC
    const retentionD7 = 32; // Placeholder %

    return NextResponse.json({
        totalUsers: totalUsers || 0,
        activeUsers,
        totalFocusHours,
        totalRevenue: 0, // Not implemented yet
        growth: 0, // Mock for now
        retentionD1,
        retentionD7
    });
}
