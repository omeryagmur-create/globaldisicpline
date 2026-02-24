"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Star, Zap } from "lucide-react";

import { LeagueTier, LEAGUE_CONFIG } from "@/lib/leagues";

interface XPProgressProps {
    currentXP: number;
    currentLevel: number;
    progress: number;
    nextLevelXP: number;
    league?: string;
}

export function XPProgress({
    currentXP,
    currentLevel,
    progress,
    nextLevelXP,
    league
}: XPProgressProps) {
    const { t } = useLanguage();

    const currentLeague = (league || 'Bronze') as LeagueTier;
    const config = LEAGUE_CONFIG[currentLeague] || LEAGUE_CONFIG.Bronze;
    const title = config.title;
    const color = config.color;

    const xpRemaining = nextLevelXP - currentXP;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/5 to-transparent p-6 group transition-all duration-300 hover:-translate-y-0.5">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl -mr-24 -mt-24" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-2xl border flex items-center justify-center"
                                style={{
                                    backgroundColor: `${color}20`,
                                    borderColor: `${color}40`,
                                    color: color,
                                    textShadow: `0 0 10px ${color}`
                                }}>
                                <span className="text-lg font-black">{currentLevel}</span>
                            </div>
                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center p-0.5"
                                style={{
                                    backgroundColor: color,
                                }}>
                                <Star className="h-full w-full text-black fill-black" />
                            </div>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30">{t.xpProgress.currentRank}</p>
                            <h3 className="text-lg font-bold" style={{ color: color, textShadow: `0 0 10px ${color}50` }}>{title}</h3>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30">{t.xpProgress.totalXP}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <Zap className="h-3.5 w-3.5 text-violet-400" />
                            <span className="text-lg font-black text-violet-300">{currentXP.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40 font-medium">{t.common.level} {currentLevel}</span>
                        <span className="text-white/40 font-medium">{t.common.level} {currentLevel + 1}</span>
                    </div>

                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full rounded-full xp-bar relative overflow-hidden transition-all duration-1000 ease-out"
                            style={{ width: `${Math.max(2, progress)}%` }}
                        >
                            {/* Shimmer overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_linear_infinite] bg-[length:200%_auto]" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <p className="text-xs text-white/30">
                            <span className="text-violet-400 font-semibold">
                                {t.xpProgress.xpToNext.replace('{xp}', xpRemaining.toLocaleString())}
                            </span>
                        </p>
                        <p className="text-xs font-bold text-white/40">{Math.round(progress)}%</p>
                    </div>
                </div>

                {/* Milestone Dots */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                    {[25, 50, 75, 100].map((milestone) => (
                        <div
                            key={milestone}
                            className={`flex-1 flex flex-col items-center gap-1.5 text-center`}
                        >
                            <div className={`h-2 w-2 rounded-full ${progress >= milestone ? 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.6)]' : 'bg-white/15'}`} />
                            <span className={`text-[9px] font-bold ${progress >= milestone ? 'text-violet-400' : 'text-white/20'}`}>{milestone}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
