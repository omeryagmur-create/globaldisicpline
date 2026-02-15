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

    const [profileResult, statsResult, sessionsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.rpc("get_total_study_minutes", { p_user_id: user.id }),
        supabase.from("focus_sessions")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_completed", true)
            .order("created_at", { ascending: false })
            .limit(5),
    ]);

    if (profileResult.error) {
        console.error("Profile error:", profileResult.error);

        // Attempt self-healing: Create profile if missing
        const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .upsert({
                id: user.id,
                email: user.email!,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                total_xp: 0,
                current_level: 1,
                subscription_tier: 'free',
                tier: 'bronze',
                current_streak: 0,
                longest_streak: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (createError) {
            console.error("Failed to recover profile:", createError);
            // Return minimal data to prevent page crash, UI will show error
            return { user, profile: null, totalMinutes: 0, recentSessions: [] };
        }

        return {
            user,
            profile: newProfile,
            totalMinutes: statsResult.data || 0,
            recentSessions: sessionsResult.data || [],
        };
    }

    return {
        user,
        profile: profileResult.data,
        totalMinutes: statsResult.data || 0,
        recentSessions: sessionsResult.data || [],
    };
}

export default async function DashboardPage() {
    const { user, profile, totalMinutes, recentSessions } = await getDashboardData();

    if (!profile) {
        return (
            <div className="flex items-center justify-center p-8 text-red-500">
                Error loading profile data. Please contact support.
            </div>
        );
    }

    // Calculate stats
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const hoursDisplay = `${totalHours}h ${remainingMinutes}m`;

    // XP Logic (simplified)
    const currentXP = profile.total_xp || 0;
    const currentLevel = profile.current_level || 1;
    const nextLevelXP = currentLevel * 1000; // Example: 1000 XP per level
    const progress = (currentXP % 1000) / 1000 * 100; // Example progress

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
                    trend="+2.5h"
                    trendType="up"
                    color="text-blue-500"
                />
                <StatsCard
                    title="Current Streak"
                    value={`${profile.current_streak} days`}
                    icon={Target}
                    trend="Keep it up!"
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
                    value={recentSessions.length.toString()} // This should be total count ideally
                    icon={Calendar}
                    trend="Last 7 days"
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
                        nextLevelXP={nextLevelXP}
                    />
                    <RecentActivity sessions={recentSessions} />
                </div>
                <div className="col-span-3 space-y-4">
                    <StreakDisplay
                        currentStreak={profile.current_streak}
                        longestStreak={profile.longest_streak}
                    />
                    <DailyMissions />
                    {/* Add more widgets here like Daily Goal or Next Exam Countdown */}
                </div>
            </div>
        </div>
    );
}
