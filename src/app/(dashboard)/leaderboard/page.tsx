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
import { Trophy, Zap, ShieldCheck, Users, TrendingUp, Globe, Target, Crown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LeagueTier, LEAGUE_CONFIG } from "@/lib/leagues";
import { cn } from "@/lib/utils";

interface ProfileData {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    country: string | null;
    subscription_tier: string | null;
    current_level?: number;
}

interface RawSnapshot {
    rank_overall: number;
    rank_in_league: number;
    rank_premium_in_league: number;
    season_xp: number;
    league: LeagueTier;
    user_id: string;
    profiles: ProfileData;
}

export interface LeaderboardUser {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    country: string | null;
    total_xp: number;
    current_level?: number;
    tier: string;
    rank: number;
}

export default function LeaderboardPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();
    const [mode, setMode] = useState<"overall" | "league" | "premium">("overall");
    const [selectedLeague, setSelectedLeague] = useState<LeagueTier | null>(null);
    const [myData, setMyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const leagues: LeagueTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster'];

    useEffect(() => {
        async function fetchMe() {
            setLoading(true);
            try {
                const res = await fetch('/api/leaderboard/me');
                if (res.ok) {
                    const data = await res.json();
                    setMyData(data);
                    if (data?.data?.league) {
                        setSelectedLeague(data.data.league);
                    } else {
                        setSelectedLeague('Bronze');
                    }
                }
            } catch (err) {
                console.error("Failed to load my data");
                setSelectedLeague('Bronze');
            }
        }
        fetchMe();
    }, []);

    useEffect(() => {
        async function loadData() {
            if (!selectedLeague) return;
            setLoading(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id);

            let url = `/api/leaderboard?scope=${mode}`;
            if (mode !== 'overall') {
                url += `&league=${selectedLeague}`;
            }

            try {
                const res = await fetch(url);
                const result = await res.json();

                if (result.data) {
                    const processed: LeaderboardUser[] = result.data.map((u: RawSnapshot) => {
                        let rank = u.rank_overall;
                        if (mode === 'league') rank = u.rank_in_league;
                        if (mode === 'premium') rank = u.rank_premium_in_league;

                        return {
                            id: u.profiles.id,
                            full_name: u.profiles.full_name,
                            avatar_url: u.profiles.avatar_url,
                            country: u.profiles.country,
                            current_level: u.profiles.current_level,
                            total_xp: u.season_xp,
                            tier: u.league,
                            rank: rank
                        };
                    });
                    setUsers(processed);
                }
            } catch (err) {
                console.error("Failed to load leaderboard");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [mode, selectedLeague]);

    const top3 = users.slice(0, 3);
    const tableUsers = users.slice(3);

    const stats = [
        { icon: Users, label: t.leaderboard.statStudents || "Total Players", value: `${users.length}+`, color: "text-indigo-400", bg: "bg-indigo-500/5", border: "border-indigo-500/15" },
        { icon: Globe, label: t.leaderboard.statCountries || "Countries", value: `${new Set(users.map(u => u.country).filter(Boolean)).size}`, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/15" },
        { icon: Zap, label: "Top XP", value: users[0]?.total_xp?.toLocaleString() || "—", color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/15" },
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
                        <span className="text-xs font-semibold uppercase tracking-[0.15em]">{t.leaderboard.pageLabel || "Leaderboard"}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        {t.leaderboard.pageTitle || "Global"} <span className="gradient-text">{t.leaderboard.pageTitleHighlight || "Rankings"}</span>
                    </h1>
                </div>

                {/* Scope Toggle */}
                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-fit">
                    <TabsList className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 h-14 gap-1">
                        <TabsTrigger
                            value="overall"
                            className="px-5 h-10 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-white/40 hover:text-white"
                        >
                            <Globe className="h-3.5 w-3.5 mr-1.5" /> {(t.common as any).overall || "Overall"}
                        </TabsTrigger>
                        <TabsTrigger
                            value="league"
                            className="px-5 h-10 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-white/40 hover:text-white"
                        >
                            <Trophy className="h-3.5 w-3.5 mr-1.5" /> {(t.common as any).myLeague || "League"}
                        </TabsTrigger>
                        <TabsTrigger
                            value="premium"
                            className="px-5 h-10 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-white/40 hover:text-white"
                        >
                            <Crown className="h-3.5 w-3.5 mr-1.5" /> {(t.common as any).premium || "Premium"}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* League Filter Chips */}
            {mode !== 'overall' && (
                <div className="flex flex-wrap gap-2">
                    {leagues.map((l) => {
                        const config = LEAGUE_CONFIG[l] || LEAGUE_CONFIG.Bronze;
                        const active = selectedLeague === l;
                        return (
                            <button
                                key={l}
                                onClick={() => setSelectedLeague(l)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all",
                                    active ? "text-white shadow-lg scale-105" : "text-white/40 hover:text-white/80 bg-white/5 border-white/10"
                                )}
                                style={active ? {
                                    backgroundColor: `${config.color}20`,
                                    borderColor: `${config.color}50`,
                                    color: config.color,
                                    textShadow: `0 0 10px ${config.color}40`
                                } : {}}
                            >
                                {l}
                            </button>
                        );
                    })}
                </div>
            )}

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
                        <p className="text-white/30 font-bold text-sm uppercase tracking-widest">{t.leaderboard.loadingTitle || "Syncing"}</p>
                        <p className="text-white/15 text-xs">{t.leaderboard.loadingSubtitle || "With global servers"}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {top3.length > 0 && <LeaderboardHero top3={top3} />}
                    <LeaderboardTable users={tableUsers} currentUserId={currentUserId} />

                    {users.length === 0 && (
                        <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
                            <Trophy className="mx-auto h-12 w-12 text-white/20 mb-4" />
                            <h3 className="text-lg font-bold text-white">No data available</h3>
                            <p className="text-white/40">The season just started or no users have earned XP yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Self Status Box */}
            {myData && myData.data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                                <Target className="h-8 w-8 text-indigo-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Current Rank</div>
                                <div className="text-xl font-black text-white">#{myData.data.rank_in_league} in {myData.data.league}</div>
                                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{myData.data.season_xp} XP Total</div>
                            </div>
                        </div>
                    </div>

                    {myData.distances && (
                        <div className={cn(
                            "p-8 rounded-[40px] flex items-center justify-between group transition-all",
                            myData.distances.distance_to_promote <= 0
                                ? "bg-emerald-500/5 border border-emerald-500/20"
                                : myData.distances.distance_to_relegate <= 0
                                    ? "bg-red-500/5 border border-red-500/20"
                                    : "bg-white/5 border border-white/10"
                        )}>
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "h-16 w-16 rounded-3xl flex items-center justify-center shadow-2xl",
                                    myData.distances.distance_to_promote <= 0
                                        ? "bg-emerald-500/10 border border-emerald-500/20 group-hover:animate-pulse"
                                        : myData.distances.distance_to_relegate <= 0
                                            ? "bg-red-500/10 border border-red-500/20"
                                            : "bg-white/10 border border-white/20"
                                )}>
                                    {myData.distances.distance_to_promote <= 0 ?
                                        <TrendingUp className="h-8 w-8 text-emerald-400" /> :
                                        <ShieldCheck className="h-8 w-8 text-white/40" />
                                    }
                                </div>
                                <div>
                                    <div className={cn("text-[10px] font-black uppercase tracking-[0.3em]",
                                        myData.distances.distance_to_promote <= 0 ? "text-emerald-400" :
                                            myData.distances.distance_to_relegate <= 0 ? "text-red-400" :
                                                "text-white/40"
                                    )}>Season Status</div>
                                    <div className="text-xl font-black text-white">
                                        {myData.distances.distance_to_promote <= 0
                                            ? "Promotion Secured 🚀"
                                            : myData.distances.distance_to_relegate <= 0
                                                ? "Relegation Zone ⚠️"
                                                : "Safe Zone ✅"}
                                    </div>
                                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">
                                        {myData.distances.distance_to_promote > 0
                                            ? `${myData.distances.distance_to_promote} spots away from promotion`
                                            : "Keep it up until season ends!"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
