import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard - Global Discipline Engine",
    description: "Track your progress and stay disciplined.",
};

async function getDashboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

    const [
        profileResult,
        statsResult,
        recentSessionsResult,
        totalSessionsResult,
        todaySessionsResult,
        yesterdaySessionsResult,
        totalUserCountResult
    ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.rpc("get_total_study_minutes", { p_user_id: user.id }),
        supabase.from("focus_sessions")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_completed", true)
            .not("session_type", "ilike", "reward_mission_%")
            .order("created_at", { ascending: false })
            .limit(5),
        supabase.from("focus_sessions")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id)
            .eq("is_completed", true)
            .not("session_type", "ilike", "reward_mission_%"),
        supabase.from("focus_sessions")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_completed", true)
            .not("session_type", "ilike", "reward_mission_%")
            .gte("completed_at", startOfToday),
        supabase.from("focus_sessions")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_completed", true)
            .not("session_type", "ilike", "reward_mission_%")
            .gte("completed_at", startOfYesterday)
            .lt("completed_at", startOfToday),
        supabase.from("profiles")
            .select("*", { count: "exact", head: true }),
    ]);

    let profile = profileResult.data;
    if (profileResult.error) {
        const { data: newProfile } = await supabase
            .from("profiles")
            .upsert({
                id: user.id,
                email: user.email!,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            })
            .select()
            .single();
        profile = newProfile;
    }

    // Calculate real ranking
    const { count: higherRankCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('total_xp', profile?.total_xp || 0);

    const ranking = (higherRankCount || 0) + 1;

    return {
        user,
        profile,
        totalMinutes: statsResult.data || 0,
        recentSessions: recentSessionsResult.data || [],
        totalSessions: totalSessionsResult.count || 0,
        todaySessions: todaySessionsResult.data || [],
        yesterdaySessions: yesterdaySessionsResult.data || [],
        ranking,
        totalUserCount: totalUserCountResult.count || 1,
    };
}

export default async function DashboardPage() {
    const data = await getDashboardData();

    if (!data.profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-red-400 font-bold uppercase tracking-widest rounded-3xl border border-red-500/20 bg-red-500/5">
                System Error: Registry Core Offline
            </div>
        );
    }

    return (
        <DashboardContent
            user={data.user}
            profile={data.profile}
            totalMinutes={data.totalMinutes}
            recentSessions={data.recentSessions}
            totalSessions={data.totalSessions}
            todaySessions={data.todaySessions}
            yesterdaySessions={data.yesterdaySessions}
            ranking={data.ranking}
            totalUserCount={data.totalUserCount}
        />
    );
}
