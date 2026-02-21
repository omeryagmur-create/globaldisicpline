"use client";

import { MoveRight, Crown, Medal, ArrowUpRight } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface TopUser {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    total_xp: number;
    current_level: number;
    tier: string;
}

interface LeaderboardHeroProps {
    top3: TopUser[];
}

export const LeaderboardHero = ({
    top3
}: LeaderboardHeroProps) => {
    const { t } = useLanguage();
    const winner = top3[0];
    const runnerUps = top3.slice(1);

    return (
        <div className="border border-white/10 rounded-[40px] overflow-hidden bg-white/5 backdrop-blur-3xl shadow-2xl mb-12">
            <div className="grid lg:grid-cols-2">
                {/* Featured #1 Pilot */}
                <div className="p-8 lg:p-16 space-y-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 relative group hover:bg-white/[0.02] transition-colors overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                {t.leaderboard.heroLabel}
                            </div>
                        </div>

                        <div className="flex items-end gap-6">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-yellow-400/20 rounded-full blur-2xl animate-pulse" />
                                <Avatar className="size-24 border-2 border-yellow-400 relative z-10">
                                    <AvatarImage src={winner?.avatar_url || ""} />
                                    <AvatarFallback className="bg-white/5 font-black text-white/40">{(winner?.full_name || "U")[0]}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 -right-2 size-10 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-[#0b0c14] z-20">
                                    <Crown size={20} className="text-[#0b0c14] fill-[#0b0c14]" />
                                </div>
                            </div>
                            <div className="space-y-1 pb-2">
                                <h2 className="text-4xl font-black text-white tracking-tighter">
                                    {winner?.full_name || t.common.profile}
                                </h2>
                                <p className="text-white/40 font-black uppercase tracking-widest text-xs">
                                    {t.common.level} {winner?.current_level} • {winner?.tier} Elite
                                </p>
                            </div>
                        </div>

                        <p className="text-white/60 font-medium leading-relaxed max-w-md italic">
                            {t.leaderboard.heroQuote}
                        </p>
                    </div>

                    <div className="pt-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t.leaderboard.heroPowerLevel}</div>
                                <div className="text-3xl font-black text-white">{winner?.total_xp.toLocaleString()}</div>
                            </div>
                            <div className="h-10 w-px bg-white/5" />
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{t.leaderboard.heroWinStatus}</div>
                                <div className="text-xl font-black text-green-400 flex items-center gap-1">
                                    {t.leaderboard.heroSecure} <ArrowUpRight size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* #2 and #3 Runners up */}
                <div className="grid grid-rows-2">
                    {runnerUps.map((user, i) => (
                        <div key={user.id} className={cn(
                            "p-8 lg:p-12 flex items-center justify-between group hover:bg-white/[0.02] transition-colors relative",
                            i === 0 && "border-b border-white/5"
                        )}>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <Avatar className={cn(
                                        "size-16 border-2",
                                        i === 0 ? "border-slate-300" : "border-amber-700"
                                    )}>
                                        <AvatarImage src={user.avatar_url || ""} />
                                        <AvatarFallback>{(user.full_name || "U")[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 size-7 rounded-full flex items-center justify-center border-2 border-[#0b0c14]",
                                        i === 0 ? "bg-slate-300" : "bg-amber-700"
                                    )}>
                                        <Medal size={14} className="text-[#0b0c14] fill-[#0b0c14]" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">
                                        {t.leaderboard.rankNo}#{i + 2} {i === 0 ? t.leaderboard.challenger : t.leaderboard.contender}
                                    </div>
                                    <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">
                                        {user.full_name}
                                    </h3>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-0.5">
                                        {user.total_xp.toLocaleString()} {t.leaderboard.energyUnits}
                                    </p>
                                </div>
                            </div>
                            <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoveRight className="text-white/20" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
