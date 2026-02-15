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
import { Trophy, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    country: string | null;
    total_xp: number;
    current_level: number;
    tier: string;
}

interface LeaderboardTableProps {
    users: LeaderboardUser[];
    currentUserId?: string;
}

export function LeaderboardTable({ users, currentUserId }: LeaderboardTableProps) {
    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Crown className="h-5 w-5 text-yellow-500" />;
            case 1:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 2:
                return <Medal className="h-5 w-5 text-amber-700" />;
            default:
                return <span className="font-bold text-muted-foreground w-5 text-center">{index + 1}</span>;
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case 'diamond': return "bg-cyan-500/20 text-cyan-500 border-cyan-500/50";
            case 'platinum': return "bg-slate-300/20 text-slate-300 border-slate-300/50";
            case 'gold': return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
            case 'silver': return "bg-gray-400/20 text-gray-400 border-gray-400/50";
            default: return "bg-orange-700/20 text-orange-700 border-orange-700/50"; // Bronze
        }
    };

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px] text-center">Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden md:table-cell">Country</TableHead>
                        <TableHead className="hidden md:table-cell">Level</TableHead>
                        <TableHead className="text-right">Total XP</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user, index) => (
                        <TableRow
                            key={user.id}
                            className={cn(
                                user.id === currentUserId ? "bg-primary/5 hover:bg-primary/10" : ""
                            )}
                        >
                            <TableCell className="font-medium text-center">
                                <div className="flex justify-center items-center">
                                    {getRankIcon(index)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarImage src={user.avatar_url || ""} alt={user.full_name || "User"} />
                                        <AvatarFallback>{(user.full_name || "U")[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium truncate max-w-[150px] md:max-w-xs block">
                                            {user.full_name || "Anonymous User"}
                                            {user.id === currentUserId && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                                        </span>
                                        <Badge variant="outline" className={cn("w-fit text-[10px] px-1 py-0 h-4 md:hidden", getTierColor(user.tier))}>
                                            {user.tier || 'Bronze'}
                                        </Badge>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {user.country ? (
                                    <span className="text-2xl" title={user.country}>
                                        {getFlagEmoji(user.country)}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium">Lvl {user.current_level}</span>
                                    <Badge variant="outline" className={cn("w-fit text-[10px] px-1 py-0 h-4", getTierColor(user.tier))}>
                                        {user.tier || 'Bronze'}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-bold tabular-nums">
                                {user.total_xp.toLocaleString()} XP
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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
