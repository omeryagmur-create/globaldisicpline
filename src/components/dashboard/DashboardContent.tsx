"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { XPProgress } from "@/components/dashboard/XPProgress";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DailyMissions } from "@/components/dashboard/DailyMissions";
import { Clock, Trophy, Star, Zap, LayoutDashboard, Flame, Activity, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MissionEngine } from "@/lib/missionEngine";

export interface SessionData {
    id: string;
    user_id: string;
    duration_minutes: number;
    session_type: string | null;
    subject: string | null;
    notes: string | null;
    xp_earned: number;
    started_at: string;
    completed_at: string | null;
    is_completed: boolean;
    created_at: string;
}

export interface UserData {
    id: string;
    email?: string;
}

export interface ProfileData {
    id: string;
    full_name?: string;
    total_xp: number;
    current_streak: number;
    longest_streak: number;
}

interface DashboardContentProps {
    user: UserData;
    profile: ProfileData;
    totalMinutes: number;
    recentSessions: SessionData[];
    totalSessions: number;
    todaySessions: SessionData[];
    yesterdaySessions: SessionData[];
}

export function DashboardContent({
    user,
    profile,
    totalMinutes,
    recentSessions,
    totalSessions,
    todaySessions,
    yesterdaySessions
}: DashboardContentProps) {
    const { t } = useLanguage();

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const hoursDisplay = `${totalHours}h ${remainingMinutes}m`;

    const todayMinutes = todaySessions.reduce((acc: number, s: SessionData) => acc + s.duration_minutes, 0);
    const yesterdayMinutes = yesterdaySessions.reduce((acc: number, s: SessionData) => acc + s.duration_minutes, 0);

    let trend: string;
    let trendType: 'up' | 'down' | 'neutral';

    if (yesterdayMinutes === 0) {
        trend = todayMinutes > 0 ? t.dashboard.firstEntry : t.dashboard.awaitingData;
        trendType = "neutral";
    } else {
        const diff = todayMinutes - yesterdayMinutes;
        const percent = Math.round((diff / yesterdayMinutes) * 100);
        trendType = diff >= 0 ? "up" : "down";
        trend = `${Math.abs(percent)}% ${diff >= 0 ? t.common.yes : t.common.no}`; // Simplified for trend
        // Actually, let's just use up/down arrows or simple words
        trend = `${Math.abs(percent)}% ${diff >= 0 ? '↑' : '↓'}`;
    }

    const currentXP = Number(profile.total_xp || 0);
    const currentLevel = Math.floor(Math.sqrt(currentXP / 100)) + 1;
    const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
    const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
    const xpInThisLevel = currentXP - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progress = Math.min(100, Math.max(0, (xpInThisLevel / xpNeededForNextLevel) * 100));

    const engineMissions = MissionEngine.getDailyMissions(todaySessions, todayMinutes);
    const missions = engineMissions.map(m => ({
        ...m,
        title: m.titleKey ? (t.missions as Record<string, string>)[m.titleKey] : "",
        desc: m.descKey ? (t.missions as Record<string, string>)[m.descKey] : ""
    }));

    const firstName = profile.full_name?.split(' ')[0] || user.email?.split('@')[0] || t.xpProgress.levelTitle_1;
    const [ranking] = useState<number>(() => Math.floor(Math.random() * 100) + 1);


    useEffect(() => {
        MissionEngine.syncDailyMissions(profile.id, () => ({ title: t.missions.title }));
    }, [todaySessions.length, todayMinutes, profile.id, t.missions.title]);

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">

            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent p-6 md:p-8">
                {/* BG Orbs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase tracking-[0.15em]">{t.dashboard.commandCenter}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            {t.dashboard.welcomeBack} <span className="gradient-text">{firstName}</span>
                        </h1>
                        <p className="text-white/40 text-sm font-medium">
                            {todaySessions.length === 0
                                ? t.dashboard.noSessions
                                : `${todaySessions.length} ${todaySessions.length > 1 ? t.dashboard.sessionsCompletedPlural : t.dashboard.sessionsCompleted}`
                            }
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Streak Badge */}
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                            <Flame className="h-4 w-4 text-orange-400" />
                            <div>
                                <p className="text-[10px] text-orange-300/60 font-semibold uppercase tracking-wider leading-none">{t.common.streak}</p>
                                <p className="text-lg font-black text-orange-300 leading-tight">{profile.current_streak} <span className="text-xs font-normal">{t.common.days}</span></p>
                            </div>
                        </div>

                        {/* Level Badge */}
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                            <Star className="h-4 w-4 text-violet-400 fill-violet-400" />
                            <div>
                                <p className="text-[10px] text-violet-300/60 font-semibold uppercase tracking-wider leading-none">{t.common.level}</p>
                                <p className="text-lg font-black text-violet-300 leading-tight">{currentLevel}</p>
                            </div>
                        </div>

                        {/* Quick Action */}
                        <Link href="/focus" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95">
                            <Zap className="h-4 w-4" />
                            {t.dashboard.quickStart}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title={t.dashboard.statStudyTime}
                    value={hoursDisplay}
                    icon={Clock}
                    trend={trend}
                    trendType={trendType}
                    color="text-indigo-400"
                />
                <StatsCard
                    title={t.dashboard.statRanking}
                    value={`#${ranking}`}
                    icon={Trophy}
                    trend={t.dashboard.statTopPercent}
                    trendType="up"
                    color="text-yellow-500"
                />
                <StatsCard
                    title={t.dashboard.statXP}
                    value={`${currentXP.toLocaleString()}`}
                    icon={Star}
                    trend={`${t.common.level} ${currentLevel}`}
                    trendType="neutral"
                    color="text-purple-500"
                />
                <StatsCard
                    title={t.dashboard.statSessions}
                    value={totalSessions.toString()}
                    icon={Activity}
                    trend={`${todaySessions.length} ${t.dashboard.statToday}`}
                    trendType={todaySessions.length > 0 ? "up" : "neutral"}
                    color="text-emerald-400"
                />
            </div>

            {/* Main Content Bento Grid */}
            <div className="grid gap-5 lg:grid-cols-12">
                {/* Left: Large Content */}
                <div className="lg:col-span-8 space-y-5">
                    <XPProgress
                        currentXP={currentXP}
                        currentLevel={currentLevel}
                        progress={progress}
                        nextLevelXP={xpForNextLevel}
                    />
                    <RecentActivity sessions={recentSessions} />
                </div>

                {/* Right: Sidebar Widgets */}
                <div className="lg:col-span-4 space-y-5">
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
