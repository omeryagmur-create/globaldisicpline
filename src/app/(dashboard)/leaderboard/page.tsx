"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const LeaderboardTable = dynamic(() => import("@/components/leaderboard/LeaderboardTable").then(mod => mod.LeaderboardTable), {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-white/[0.02] rounded-3xl" />
});
const LeaderboardHero = dynamic(() => import("@/components/leaderboard/LeaderboardHero").then(mod => mod.LeaderboardHero), {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse bg-white/[0.02] rounded-3xl" />
});
const SeasonCountdown = dynamic(() => import("@/components/leaderboard/SeasonCountdown").then(mod => mod.SeasonCountdown), {
    ssr: false,
    loading: () => <div className="h-20 animate-pulse bg-white/[0.02] rounded-2xl" />
});

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Zap, ShieldCheck, Users, TrendingUp, Globe, Target, Crown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LeagueTier, LEAGUE_CONFIG } from "@/lib/leagues";

interface ProfileData {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    country: string | null;
    subscription_tier: string | null;
    current_level?: number;
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

const LEAGUES: LeagueTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster'];

export default function LeaderboardPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();
    const [mode, setMode] = useState<"overall" | "league" | "premium" | "all_time">("overall");
    const [selectedLeague, setSelectedLeague] = useState<LeagueTier>('Bronze');
    const [myData, setMyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [metadata, setMetadata] = useState<any>(null);
    const [offset, setOffset] = useState(0);
    const PAGE_SIZE = 50;

    // Step 1: Get current user (fast, client-side)
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setCurrentUserId(user?.id);
        });
    }, []);

    // Step 2: Load my data AND leaderboard in PARALLEL on mount
    useEffect(() => {
        if (initialized) return;
        setInitialized(true);
        setLoading(true);

        const mePromise = fetch('/api/leaderboard/me')
            .then(r => r.ok ? r.json() : null)
            .catch(() => null);

        const leaderboardPromise = fetch('/api/leaderboard?scope=overall&limit=50')
            .then(r => r.ok ? r.json() : { data: [] })
            .catch(() => ({ data: [] }));

        Promise.all([mePromise, leaderboardPromise]).then(([me, board]) => {
            if (me?.data?.league) {
                setSelectedLeague(me.data.league as LeagueTier);
                setMyData(me);
            }
            if (board?.data) {
                setUsers(formatSnapshots(board.data, 'overall'));
                setTotalCount(board.metadata?.total_count ?? board.data.length);
                setMetadata(board.metadata);
            }
            setLoading(false);
        });
    }, [initialized]);

    const loadLeaderboard = useCallback(async (scope: string, league: LeagueTier, newOffset = 0, append = false) => {
        setLoading(true);
        let url = `/api/leaderboard?scope=${scope}&limit=${PAGE_SIZE}&offset=${newOffset}`;
        if (scope === 'league' || scope === 'premium') url += `&league=${league}`;

        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.error("Leaderboard API error", res.status);
                setLoading(false);
                return;
            }
            const result = await res.json();
            if (result.data) {
                const formatted = formatSnapshots(result.data, scope);
                setUsers(prev => append ? [...prev, ...formatted] : formatted);
                setOffset(newOffset);
                setTotalCount(result.metadata?.total_count ?? null);
                setMetadata(result.metadata);
            }
        } catch (err) {
            console.error("Failed to load leaderboard", err);
        } finally {
            setLoading(false);
        }
    }, [PAGE_SIZE]);

    // Reload when mode or league changes (but not on first run)
    const [firstRun, setFirstRun] = useState(true);
    useEffect(() => {
        if (firstRun) { setFirstRun(false); return; }
        setOffset(0);
        loadLeaderboard(mode, selectedLeague, 0, false);
    }, [mode, selectedLeague, loadLeaderboard, firstRun]);

    const top3 = users.slice(0, 3);
    const tableUsers = users.slice(3);
    const scoreLabel = mode === 'all_time' ? 'TOPLAM XP' : t.leaderboard.energyUnits;

    const activeLeagueConfig = LEAGUE_CONFIG[selectedLeague] || LEAGUE_CONFIG.Bronze;

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-4 pb-16">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-400">
                        <div className="h-6 w-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Trophy className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.15em]">Leaderboard</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        Global <span className="gradient-text">Rankings</span>
                    </h1>
                </div>

                {/* Scope Toggle */}
                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-fit">
                    <TabsList className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 h-14 gap-1">
                        <TabsTrigger value="overall" className="px-5 h-10 data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-white/40 hover:text-white">
                            <Globe className="h-3.5 w-3.5 mr-1.5" /> Genel
                        </TabsTrigger>
                        <TabsTrigger value="league" className="px-5 h-10 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-white/40 hover:text-white">
                            <Trophy className="h-3.5 w-3.5 mr-1.5" /> Ligim
                        </TabsTrigger>
                        <TabsTrigger value="premium" className="px-5 h-10 data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-white/40 hover:text-white">
                            <Crown className="h-3.5 w-3.5 mr-1.5" /> Premium
                        </TabsTrigger>
                        <TabsTrigger value="all_time" className="px-5 h-10 data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-white/40 hover:text-white">
                            <Zap className="h-3.5 w-3.5 mr-1.5" /> Tüm Zamanlar
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Countdown Banner - Only for seasonal modes */}
            {mode !== 'all_time' && metadata && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                    <SeasonCountdown
                        secondsUntilEnd={metadata.seconds_until_end || 0}
                        seasonEndsAt={metadata.season_ends_at}
                    />
                </div>
            )}

            {/* Season Info Banner */}
            {mode !== 'all_time' && metadata?.is_all_zero_top && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Zap className="h-5 w-5 text-indigo-400 animate-pulse" />
                    <div>
                        <p className="text-sm font-bold text-white">Sezon Yeni Başladı! 🚀</p>
                        <p className="text-xs text-white/50">Sıralama ilk XP kazanımlarıyla birlikte netleşecektir. Şimdi çalışmaya başla ve zirveye yerleş!</p>
                    </div>
                </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest px-2">
                    <TrendingUp className="h-3 w-3" />
                    {mode === 'all_time'
                        ? "Bu sıralama Toplam XP değerlerine göre hesaplanır"
                        : "Bu sıralama Sezon XP değerlerine göre hesaplanır"}
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-[10px] text-white/20 font-medium">
                    <ShieldCheck className="h-3 w-3" />
                    {mode === 'all_time'
                        ? "Eşitlik durumunda: Toplam XP (Azalan) -> Kullanıcı ID (Artan)"
                        : "Eşitlik durumunda: Sezon XP (Azalan) -> Kullanıcı ID (Artan)"}
                </div>
            </div>

            {/* League Filter Chips */}
            {(mode === 'league' || mode === 'premium') && (
                <div className="flex flex-wrap gap-2">
                    {LEAGUES.map((l) => {
                        const config = LEAGUE_CONFIG[l] || LEAGUE_CONFIG.Bronze;
                        const active = selectedLeague === l;
                        return (
                            <button
                                key={l}
                                onClick={() => setSelectedLeague(l)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200",
                                    active ? "scale-105 shadow-lg" : "text-white/40 hover:text-white/80 bg-white/5 border-white/10"
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

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { icon: Users, label: "Toplam Oyuncu", value: totalCount !== null ? totalCount.toLocaleString() : `${users.length}`, color: "text-indigo-400", bg: "bg-indigo-500/5", border: "border-indigo-500/15" },
                    { icon: Globe, label: "Ülke", value: `${new Set(users.map(u => u.country).filter(Boolean)).size}`, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/15" },
                    { icon: Zap, label: mode === 'all_time' ? "En Yüksek Toplam XP" : "En Yüksek Sezon XP", value: users[0]?.total_xp?.toLocaleString() || "—", color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/15" },
                ].map(({ icon: Icon, label, value, color, bg, border }) => (
                    <div key={label} className={`rounded-2xl border ${bg} ${border} p-4 flex items-center gap-3`}>
                        <div className={`h-9 w-9 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">{label}</p>
                            <p className={`text-xl font-black ${color} leading-none mt-0.5`}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="h-80 flex flex-col items-center justify-center gap-6">
                    <div className="relative size-14">
                        <div className="absolute inset-0 rounded-full border-2 border-white/[0.05]" />
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        <div className="absolute inset-2 rounded-full border-2 border-violet-500/30 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                    </div>
                    <p className="text-white/30 font-bold text-sm uppercase tracking-widest">Yükleniyor...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
                    <Trophy className="mx-auto h-12 w-12 text-white/20 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Bu ligde henüz kimse yok</h3>
                    <p className="text-white/40 text-sm">Sezon yeni başladı veya bu ligde XP kazanan kullanıcı bulunmuyor.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {top3.length > 0 && <LeaderboardHero top3={top3} scoreLabel={scoreLabel} />}
                    <LeaderboardTable users={tableUsers} currentUserId={currentUserId} scoreLabel={scoreLabel} />

                    {/* Pagination Footer */}
                    {totalCount !== null && (
                        <div className="flex items-center justify-between px-2">
                            <p className="text-xs text-white/30 font-semibold">
                                {users.length.toLocaleString()} / {totalCount.toLocaleString()} oyuncu gösteriliyor
                            </p>
                            {users.length < totalCount && (
                                <button
                                    onClick={() => loadLeaderboard(mode, selectedLeague, offset + PAGE_SIZE, true)}
                                    disabled={loading}
                                    className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                                >
                                    {loading ? 'Yükleniyor...' : 'Daha Fazla Göster'}
                                </button>
                            )}
                            {users.length >= totalCount && totalCount > PAGE_SIZE && (
                                <span className="text-xs text-white/20 font-bold uppercase tracking-widest">Tüm oyuncular yüklendi ✓</span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* My Status Card */}
            {myData?.data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-5 hover:bg-white/[0.08] transition-all">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: mode === 'all_time' ? '#06b6d420' : `${activeLeagueConfig.color}20`, border: `1px solid ${mode === 'all_time' ? '#06b6d440' : activeLeagueConfig.color + '40'}` }}>
                            <Target className="h-7 w-7" style={{ color: mode === 'all_time' ? '#06b6d4' : activeLeagueConfig.color }} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: mode === 'all_time' ? '#06b6d4' : activeLeagueConfig.color }}>
                                {mode === 'all_time' ? 'Tüm Zamanlar Sıralaman' : 'Mevcut Sıralaman'}
                            </p>
                            <p className="text-xl font-black text-white">
                                #{mode === 'all_time' ? myData.data.rank_all_time : myData.data.rank_in_league}
                                {mode !== 'all_time' && ` — ${myData.data.league}`}
                            </p>
                            <div className="flex gap-4 mt-1">
                                {mode !== 'all_time' && (
                                    <p className="text-[10px] text-white/50 uppercase tracking-widest leading-none">
                                        <span className="text-white font-bold">{myData.data.season_xp?.toLocaleString()} XP</span> Sezon
                                    </p>
                                )}
                                <p className="text-[10px] text-white/30 uppercase tracking-widest leading-none">
                                    <span className="text-white/60 font-bold">{myData.data.total_xp?.toLocaleString()} XP</span> Toplam
                                </p>
                            </div>
                        </div>
                    </div>

                    {mode !== 'all_time' && myData.distances && (
                        <div className={cn(
                            "p-6 rounded-3xl flex items-center gap-5 transition-all",
                            myData.distances.distance_to_promote <= 0
                                ? "bg-emerald-500/5 border border-emerald-500/20"
                                : myData.distances.distance_to_relegate <= 0
                                    ? "bg-red-500/5 border border-red-500/20"
                                    : "bg-white/5 border border-white/10"
                        )}>
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0",
                                myData.distances.distance_to_promote <= 0 ? "bg-emerald-500/10 border border-emerald-500/20" :
                                    myData.distances.distance_to_relegate <= 0 ? "bg-red-500/10 border border-red-500/20" :
                                        "bg-white/10 border border-white/20"
                            )}>
                                {myData.distances.distance_to_promote <= 0 ?
                                    <TrendingUp className="h-7 w-7 text-emerald-400" /> :
                                    <ShieldCheck className="h-7 w-7 text-white/40" />
                                }
                            </div>
                            <div>
                                <p className={cn("text-[10px] font-black uppercase tracking-[0.3em]",
                                    myData.distances.distance_to_promote <= 0 ? "text-emerald-400" :
                                        myData.distances.distance_to_relegate <= 0 ? "text-red-400" : "text-white/40"
                                )}>Sezon Durumu</p>
                                <p className="text-xl font-black text-white">
                                    {myData.distances.distance_to_promote <= 0 ? "Yükselme Bölgesi 🚀" :
                                        myData.distances.distance_to_relegate <= 0 ? "Düşme Tehlikesi ⚠️" : "Güvenli Bölge ✅"}
                                </p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">
                                    {myData.distances.distance_to_promote > 0
                                        ? `${myData.distances.distance_to_promote} kişi önünde yükselebilirsin`
                                        : "Sezonu böyle bitir!"}
                                </p>
                            </div>
                        </div>
                    )}

                    {mode === 'all_time' && (
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-5 hover:bg-white/[0.08] transition-all">
                            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                <Crown className="h-7 w-7 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Genel Başarım</p>
                                <p className="text-xl font-black text-white">Efsaneler Arasında</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Disiplin yolculuğun devam ediyor</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function formatSnapshots(data: any[], scope: string): LeaderboardUser[] {
    return data.map((u: any) => {
        let rank = u.rank_overall ?? 1;
        if (scope === 'league') rank = u.rank_in_league ?? 1;
        if (scope === 'premium') rank = u.rank_premium_in_league ?? 1;

        const profile = u.profiles || {};
        return {
            id: profile.id || u.user_id,
            full_name: profile.full_name ?? null,
            avatar_url: profile.avatar_url ?? null,
            country: profile.country ?? null,
            current_level: profile.current_level ?? undefined,
            total_xp: u.season_xp ?? u.total_xp ?? 0,
            tier: u.league || 'Bronze',
            rank,
        };
    });
}
