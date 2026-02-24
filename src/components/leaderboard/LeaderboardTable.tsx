"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Medal,
    Crown,
    TrendingUp,
    ShieldCheck,
    Zap,
    Target,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LEAGUE_CONFIG, LeagueTier } from "@/lib/leagues";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface LeaderboardUser {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    country: string | null;
    total_xp: number;
    current_level?: number;
    tier: string;
    rank: number;
    current_streak?: number;
    weighted_xp?: number;
}

interface LeaderboardTableProps {
    users: LeaderboardUser[];
    currentUserId?: string;
    prestigeMode?: boolean;
}

export function LeaderboardTable({ users, currentUserId, prestigeMode }: LeaderboardTableProps) {
    const { t } = useLanguage();

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-6 w-6 text-yellow-400 filter drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />;
            case 2:
                return <Medal className="h-6 w-6 text-slate-300" />;
            case 3:
                return <Medal className="h-6 w-6 text-amber-600" />;
            default:
                return <span className="font-black text-white/20 w-6 text-center text-sm">#{rank}</span>;
        }
    };

    const getTierStyle = (tier: string) => {
        const t = (tier || 'Bronze') as LeagueTier;
        const config = LEAGUE_CONFIG[t] || LEAGUE_CONFIG.Bronze;
        return {
            color: config.color,
            borderColor: `${config.color}30`,
            backgroundColor: `${config.color}05`,
        };
    };

    const getLeagueTitleTranslated = (tier: string) => {
        const mapping: Record<string, string> = {
            'Bronze': t.leagues.bronzeTitle,
            'Silver': t.leagues.silverTitle,
            'Gold': t.leagues.goldTitle,
            'Diamond': t.leagues.diamondTitle,
            'Elite': t.leagues.eliteTitle,
        };
        return mapping[tier] || t.leagues.bronzeTitle;
    };

    return (
        <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/[0.02] border-b border-white/5">
                        <TableRow className="hover:bg-transparent border-none h-16">
                            <TableHead className="w-[100px] text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t.leaderboard.rank}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t.leaderboard.pilotIdentity}</TableHead>
                            <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t.leaderboard.status}</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/40 pr-10">
                                {t.leaderboard.totalPower}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => {
                            const isCurrentUser = user.id === currentUserId;
                            const leagueTitle = getLeagueTitleTranslated(user.tier);

                            return (
                                <TableRow
                                    key={user.id}
                                    className={cn(
                                        "transition-all border-b border-white/5 h-20 group relative",
                                        isCurrentUser ? "bg-indigo-500/10 hover:bg-indigo-500/20" : "hover:bg-white/[0.03]"
                                    )}
                                >
                                    <TableCell className="font-medium text-center">
                                        <div className="flex justify-center items-center drop-shadow-xl transition-transform group-hover:scale-110 duration-500">
                                            {getRankIcon(user.rank)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity" />
                                                <Avatar className="h-12 w-12 border border-white/10 relative z-10 shadow-xl">
                                                    <AvatarImage src={user.avatar_url || ""} alt={user.full_name || "User"} />
                                                    <AvatarFallback className="text-xs font-black bg-white/5 text-white/40">
                                                        {(user.full_name || "U")[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "font-black text-white tracking-tight text-base leading-tight group-hover:text-indigo-400 transition-colors",
                                                    isCurrentUser && "text-indigo-400"
                                                )}>
                                                    {user.full_name || "Anonymous Pilot"}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {user.country && (
                                                        <span className="text-xs mr-1 opacity-60 grayscale group-hover:grayscale-0 transition-all">{getFlagEmoji(user.country)}</span>
                                                    )}
                                                    {user.current_level && (
                                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                                                            {t.common.level} {user.current_level}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant="outline"
                                                className="px-3 py-1 text-[10px] font-black uppercase tracking-widest border shadow-lg group-hover:scale-105 transition-transform"
                                                style={getTierStyle(user.tier)}
                                            >
                                                {leagueTitle}
                                            </Badge>
                                            {user.current_streak && user.current_streak >= 3 && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest">
                                                    <TrendingUp className="h-3 w-3" />
                                                    {t.leaderboard.onFire}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums pr-10">
                                        <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xl font-black tracking-tighter text-white">
                                                    {(prestigeMode && user.weighted_xp ? user.weighted_xp : user.total_xp).toLocaleString()}
                                                </span>
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{t.leaderboard.energyUnits}</span>
                                            </div>
                                            <Zap className="h-5 w-5 text-indigo-400 fill-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                                            <ChevronRight className="size-4 text-white/10 group-hover:text-white/40 transition-colors hidden md:block" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

        </div>
    );
}

function getFlagEmoji(countryCode: string) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
