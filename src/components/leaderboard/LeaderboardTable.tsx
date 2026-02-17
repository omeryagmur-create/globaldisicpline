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
    Trophy,
    Medal,
    Crown,
    Star,
    TrendingUp,
    ShieldAlert,
    ShieldCheck,
    Timer,
    Zap,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LEAGUE_CONFIG, LeagueTier, getLeagueTitle } from "@/lib/leagues";

interface LeaderboardUser {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    country: string | null;
    total_xp: number;
    current_level: number;
    tier: string;
    current_streak?: number;
    weighted_xp?: number;
}

interface LeaderboardTableProps {
    users: LeaderboardUser[];
    currentUserId?: string;
    prestigeMode?: boolean;
}

export function LeaderboardTable({ users, currentUserId, prestigeMode }: LeaderboardTableProps) {
    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Crown className="h-5 w-5 text-yellow-500 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] animate-pulse" />;
            case 1:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 2:
                return <Medal className="h-5 w-5 text-amber-700" />;
            default:
                return <span className="font-black text-muted-foreground w-5 text-center italic">{(index + 1).toString().padStart(2, '0')}</span>;
        }
    };

    const getTierStyle = (tier: string) => {
        const t = (tier || 'Bronze') as LeagueTier;
        const config = LEAGUE_CONFIG[t] || LEAGUE_CONFIG.Bronze;
        return {
            color: config.color,
            borderColor: `${config.color}40`,
            backgroundColor: `${config.color}10`,
            boxShadow: `0 0 10px ${config.color}20`
        };
    };

    return (
        <div className="space-y-6">
            {/* Phase 3.5: Micro-League Status Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary/70">Tactical Pool</div>
                        <div className="text-sm font-black tracking-tight">Region-Alpha (20 Operators)</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="h-3 w-3" /> Promotion Zone
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-muted/50 border-b border-border/50">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[80px] text-center text-[10px] font-black uppercase tracking-widest">Rank</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Operator Identity</TableHead>
                            <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-widest">Region</TableHead>
                            <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">
                                Power ({prestigeMode ? "Weighted" : "Raw"})
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => {
                            const isCurrentUser = user.id === currentUserId;
                            const leagueTitle = getLeagueTitle((user.tier || 'Bronze') as LeagueTier);

                            return (
                                <TableRow
                                    key={user.id}
                                    className={cn(
                                        "transition-all border-b border-border/10",
                                        isCurrentUser ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-primary/5"
                                    )}
                                >
                                    <TableCell className="font-medium text-center">
                                        <div className="flex justify-center items-center">
                                            {getRankIcon(index)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className="h-10 w-10 border-2 border-border/50 shadow-sm">
                                                    <AvatarImage src={user.avatar_url || ""} alt={user.full_name || "User"} />
                                                    <AvatarFallback className="text-[10px] font-black bg-muted">
                                                        {(user.full_name || "U")[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {/* Prestige Star Placeholder for top tier players */}
                                                {(user.tier === 'Elite' || user.tier === 'Diamond') && (
                                                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 border border-background shadow-lg">
                                                        <Star className="h-2.5 w-2.5 fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "font-bold truncate max-w-[120px] md:max-w-xs block leading-tight tracking-tight",
                                                    isCurrentUser && "text-primary"
                                                )}>
                                                    {user.full_name || "Anonymous Operator"}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="w-fit text-[9px] px-1.5 py-0 h-4 md:hidden font-black uppercase tracking-tighter mt-0.5"
                                                    style={getTierStyle(user.tier)}
                                                >
                                                    {leagueTitle}
                                                </Badge>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {user.country ? (
                                            <span className="text-2xl filter drop-shadow-md" title={user.country}>
                                                {getFlagEmoji(user.country)}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground font-black text-[10px] opacity-30">NA</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-xs">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase opacity-70 flex items-center">
                                                    <Target className="h-2.5 w-2.5 mr-1" />
                                                    Lvl {user.current_level}
                                                </span>
                                                {user.current_streak && (
                                                    <span className="text-[9px] font-black text-orange-500 uppercase flex items-center bg-orange-500/10 px-1 rounded">
                                                        <TrendingUp className="h-2 w-2 mr-1" />
                                                        {user.current_streak}D
                                                    </span>
                                                )}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="w-fit text-[10px] px-1.5 py-0 h-5 font-black uppercase tracking-widest shadow-sm"
                                                style={getTierStyle(user.tier)}
                                            >
                                                {leagueTitle}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="text-lg font-black tracking-tighter text-primary/90">
                                                {(prestigeMode && user.weighted_xp ? user.weighted_xp : user.total_xp).toLocaleString()}
                                            </span>
                                            <Zap className="h-3 w-3 text-primary fill-primary" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>

                </Table>
            </div>

            {/* Loss Aversion Alert (Current User Context) */}
            {currentUserId && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-red-500/70">Demotion Warning</div>
                            <div className="text-sm font-black text-white italic tracking-tight">"You are at risk of dropping to a lower rank. Defensive action required."</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-red-500/20">
                        <Timer className="h-4 w-4 text-red-500 animate-pulse" />
                        <span className="text-xs font-black text-white tabular-nums tracking-widest">47:12:04</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper to convert country code to flag emoji
function getFlagEmoji(countryCode: string) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
