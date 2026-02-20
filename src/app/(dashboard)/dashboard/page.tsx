import { StatsCard } from "@/components/dashboard/StatsCard";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { XPProgress } from "@/components/dashboard/XPProgress";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DailyMissions } from "@/components/dashboard/DailyMissions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Clock, Trophy, Target, Star, Calendar } from "lucide-react";
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
        yesterdaySessionsResult
    ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.rpc("get_total_study_minutes", { p_user_id: user.id }),
        supabase.from("focus_sessions")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_completed", true)
            .order("created_at", { ascending: false })
            .limit(5),
        supabase.from("focus_sessions")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id)
            .eq("is_completed", true),
        supabase.from("focus_sessions")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_completed", true)
            .gte("completed_at", startOfToday),
        supabase.from("focus_sessions")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_completed", true)
            .gte("completed_at", startOfYesterday)
            .lt("completed_at", startOfToday),
    ]);

    let profile = profileResult.data;
    if (profileResult.error) {
        // Attempt self-healing
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

    return {
        user,
        profile,
        totalMinutes: statsResult.data || 0,
        recentSessions: recentSessionsResult.data || [],
        totalSessions: totalSessionsResult.count || 0,
        todaySessions: todaySessionsResult.data || [],
        yesterdaySessions: yesterdaySessionsResult.data || [],
    };
}

export default async function DashboardPage() {
    const {
        user,
        profile,
        totalMinutes,
        recentSessions,
        totalSessions,
        todaySessions,
        yesterdaySessions
    } = await getDashboardData();

    if (!profile) {
        return (
            <div className="flex items-center justify-center p-8 text-red-500">
                Error loading profile data. Please contact support.
            </div>
        );
    }

    // Calculate Focus Time Stats
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const hoursDisplay = `${totalHours}h ${remainingMinutes}m`;

    const todayMinutes = todaySessions.reduce((acc: number, s: any) => acc + s.duration_minutes, 0);
    const yesterdayMinutes = yesterdaySessions.reduce((acc: number, s: any) => acc + s.duration_minutes, 0);

    let trend: string;
    let trendType: 'up' | 'down' | 'neutral';

    if (yesterdayMinutes === 0) {
        trend = todayMinutes > 0 ? "First sessions!" : "Start today!";
        trendType = "neutral";
    } else {
        const diff = todayMinutes - yesterdayMinutes;
        const percent = Math.round((diff / yesterdayMinutes) * 100);
        trendType = diff >= 0 ? "up" : "down";
        trend = `${Math.abs(percent)}% ${diff >= 0 ? 'increase' : 'decrease'}`;
    }

    // XP Logic (aligned with DB: Level = floor(sqrt(total_xp / 100)) + 1)
    const currentXP = Number(profile.total_xp || 0);
    const currentLevel = Math.floor(Math.sqrt(currentXP / 100)) + 1;
    const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
    const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
    const xpInThisLevel = currentXP - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progress = Math.min(100, Math.max(0, (xpInThisLevel / xpNeededForNextLevel) * 100));

    // Missions Logic
    const hasDeepFocusToday = todaySessions.some((s: any) => s.session_type === 'deep_focus');
    const missions = [
        {
            id: "m1",
            title: "Deep Work Initiation",
            desc: "Complete one session in Deep Focus mode",
            reward: 150,
            progress: hasDeepFocusToday ? 100 : 0,
            isCompleted: hasDeepFocusToday
        },
        {
            id: "m2",
            title: "Discipline Master",
            desc: "Study for 2 hours (120 min) today",
            reward: 300,
            progress: Math.min(100, Math.round((todayMinutes / 120) * 100)),
            isCompleted: todayMinutes >= 120
        },
        {
            id: "m3",
            title: "Consistency King",
            desc: "Complete at least 3 sessions today",
            reward: 100,
            progress: Math.min(100, Math.round((todaySessions.length / 3) * 100)),
            isCompleted: todaySessions.length >= 3
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {profile.full_name || user.email}!
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Focus Time"
                    value={hoursDisplay}
                    icon={Clock}
                    trend={trend}
                    trendType={trendType}
                    color="text-blue-500"
                />
                <StatsCard
                    title="Current Streak"
                    value={`${profile.current_streak} days`}
                    icon={Target}
                    trend={`Longest: ${profile.longest_streak}d`}
                    trendType="neutral"
                    color="text-orange-500"
                />
                <StatsCard
                    title="Total XP"
                    value={`${currentXP} XP`}
                    icon={Star}
                    trend={`Lvl ${currentLevel}`}
                    trendType="neutral"
                    color="text-yellow-500"
                />
                <StatsCard
                    title="Sessions Completed"
                    value={totalSessions.toString()}
                    icon={Calendar}
                    trend={`${todaySessions.length} today`}
                    trendType="neutral"
                    color="text-purple-500"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 space-y-4">
                    <XPProgress
                        currentXP={currentXP}
                        currentLevel={currentLevel}
                        progress={progress}
                        nextLevelXP={xpForNextLevel}
                    />
                    <RecentActivity sessions={recentSessions} />
                </div>
                <div className="col-span-3 space-y-4">
                    <StreakDisplay
                        currentStreak={profile.current_streak}
                        longestStreak={profile.longest_streak}
                    />
                    <DailyMissions missions={missions} />
                </div>
            </div>
        </div>
    );
}
