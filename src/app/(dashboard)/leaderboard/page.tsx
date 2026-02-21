"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
const LeaderboardTable = dynamic(() => import("@/components/leaderboard/LeaderboardTable").then(mod => mod.LeaderboardTable), {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-white/[0.02] rounded-3xl" />
});
const LeaderboardHero = dynamic(() => import("@/components/leaderboard/LeaderboardHero").then(mod => mod.LeaderboardHero), {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse bg-white/[0.02] rounded-3xl" />
});
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Zap, ShieldCheck, Users, TrendingUp, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface LeaderboardUser {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    country: string | null;
    total_xp: number;
    current_level: number;
    tier: string;
    weighted_xp?: number;
}

export default function LeaderboardPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();
    const [mode, setMode] = useState<"standard" | "prestige">("standard");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id);

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, country, total_xp, current_level, tier, current_streak')
                .order('total_xp', { ascending: false })
                .limit(50);

            if (!error && data) {
                const processed = data.map(u => ({
                    ...u,
                    weighted_xp: u.total_xp * (1 + (u.current_streak || 0) / 10)
                }));
                setUsers(processed);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const sortedUsers = [...users].sort((a, b) => {
        if (mode === "prestige") {
            return (b.weighted_xp || 0) - (a.weighted_xp || 0);
        }
        return b.total_xp - a.total_xp;
    });

    const top3 = sortedUsers.slice(0, 3);
    const tableUsers = sortedUsers.slice(3);

    const stats = [
        { icon: Users, label: t.leaderboard.statStudents, value: `${users.length}+`, color: "text-indigo-400", bg: "bg-indigo-500/5", border: "border-indigo-500/15" },
        { icon: Globe, label: t.leaderboard.statCountries, value: `${new Set(users.map(u => u.country).filter(Boolean)).size}`, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/15" },
        { icon: TrendingUp, label: t.leaderboard.statTopScore, value: users[0]?.total_xp?.toLocaleString() || "—", color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/15" },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-4 pb-16">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-400">
                        <div className="h-6 w-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Trophy className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.15em]">{t.leaderboard.pageLabel}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        {t.leaderboard.pageTitle} <span className="gradient-text">{t.leaderboard.pageTitleHighlight}</span>
                    </h1>
                    <p className="text-white/30 font-medium text-sm max-w-lg">
                        {t.leaderboard.pageSubtitle}
                    </p>
                </div>

                {/* Mode Toggle */}
                <Tabs value={mode} onValueChange={(v) => setMode(v as "standard" | "prestige")} className="w-fit">
                    <TabsList className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 h-14 gap-1">
                        <TabsTrigger
                            value="standard"
                            className="px-5 h-10 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-white/40 hover:text-white"
                        >
                            <Zap className="h-3.5 w-3.5 mr-1.5" /> {t.leaderboard.modeStandard}
                        </TabsTrigger>
                        <TabsTrigger
                            value="prestige"
                            className="px-5 h-10 data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-white/40 hover:text-white"
                        >
                            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> {t.leaderboard.modePrestige}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-3">
                {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
                    <div key={label} className={`rounded-2xl border ${bg} ${border} p-4 flex items-center gap-3`}>
                        <div className={`h-9 w-9 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-4.5 w-4.5 ${color}`} />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">{label}</p>
                            <p className={`text-xl font-black ${color} leading-none mt-0.5`}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-6">
                    <div className="relative size-16">
                        <div className="absolute inset-0 rounded-full border-2 border-white/[0.05]" />
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        <div className="absolute inset-2 rounded-full border-2 border-violet-500/30 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-white/30 font-bold text-sm uppercase tracking-widest">{t.leaderboard.loadingTitle}</p>
                        <p className="text-white/15 text-xs">{t.leaderboard.loadingSubtitle}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {top3.length > 0 && <LeaderboardHero top3={top3} />}
                    <LeaderboardTable users={tableUsers} currentUserId={currentUserId} prestigeMode={mode === "prestige"} />
                </div>
            )}
        </div>
    );
}
