"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Flame, Trophy, TrendingUp } from "lucide-react";

interface StreakDisplayProps {
    currentStreak: number;
    longestStreak: number;
}

export function StreakDisplay({
    currentStreak,
    longestStreak,
}: StreakDisplayProps) {
    const { t } = useLanguage();

    const streakMessages: Record<number, { label: string; color: string }> = {
        0: { label: t.streak.startJourney, color: "text-white/30" },
        1: { label: t.streak.justStarted, color: "text-orange-300" },
        3: { label: t.streak.gettingWarm, color: "text-orange-400" },
        7: { label: t.streak.onFire, color: "text-orange-400" },
        14: { label: t.streak.unstoppable, color: "text-amber-400" },
        30: { label: t.streak.legendStatus, color: "text-yellow-400" },
    };

    const getStreakMessage = (streak: number) => {
        const keys = Object.keys(streakMessages).map(Number).sort((a, b) => b - a);
        for (const key of keys) {
            if (streak >= key) return streakMessages[key];
        }
        return streakMessages[0];
    };

    const info = getStreakMessage(currentStreak);
    const isPersonalBest = currentStreak >= longestStreak && currentStreak > 0;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/15 bg-gradient-to-br from-orange-500/5 via-amber-500/3 to-transparent p-5 group transition-all duration-300 hover:-translate-y-0.5">
            {/* Flame glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center">
                            <Flame className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30">{t.streak.dailyStreak}</p>
                            <p className={`text-xs font-semibold ${info.color}`}>{info.label}</p>
                        </div>
                    </div>

                    {isPersonalBest && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <Trophy className="h-3 w-3 text-yellow-400" />
                            <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider">{t.streak.personalBest}</span>
                        </div>
                    )}
                </div>

                {/* Main Counter */}
                <div className="flex items-end gap-3 mb-4">
                    <div className="relative">
                        <span className="text-6xl font-black text-white leading-none">{currentStreak}</span>
                        {currentStreak > 0 && (
                            <div className="absolute -top-1 -right-3 h-5 w-5">
                                <div className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-ping-soft" />
                                <div className="relative h-5 w-5 rounded-full bg-orange-400/20 border border-orange-400/30 flex items-center justify-center">
                                    <Flame className="h-2.5 w-2.5 text-orange-400" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-semibold text-white/40">{t.common.days}</p>
                        <p className="text-xs text-white/20">{t.streak.inRow}</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="flex-1 text-center p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-0.5">{t.streak.personalBest}</p>
                        <p className="text-lg font-black text-white/70">{longestStreak}<span className="text-xs font-normal text-white/30 ml-0.5">d</span></p>
                    </div>
                    <div className="flex-1 text-center p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-0.5">{t.streak.today}</p>
                        <div className="flex items-center justify-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                            <p className="text-sm font-black text-emerald-400">+1</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
