"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CheckCircle2, Zap, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Mission {
    id: string;
    title: string;
    description: string;
    rewardXP: number;
    progress: number;
    isClaimed: boolean;
}

interface DailyMissionsProps {
    missions: Mission[];
}

const missionIcons = [Target, Zap, Trophy];
const missionColors = [
    { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", progress: "bg-indigo-500" },
    { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", progress: "bg-violet-500" },
    { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", progress: "bg-amber-500" },
];

export function DailyMissions({ missions: providedMissions }: DailyMissionsProps) {
    const { t } = useLanguage();

    // We map the provided missions to translated versions if they match the IDs in our i18n
    // If not, we use provided ones. Assuming missions come with ids '1', '2', '3'
    const missions = providedMissions;
    const completedMissions = missions.filter(m => m.isClaimed).length;
    const totalMissions = missions.length;
    const overallProgress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

    return (
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-amber-400" />
                        </div>
                        <h3 className="font-bold text-white text-sm">{t.missions.title}</h3>
                    </div>
                    <div className={cn(
                        "px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border",
                        completedMissions === totalMissions
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-white/5 border-white/10 text-white/40"
                    )}>
                        {completedMissions}/{totalMissions} {t.common.done}
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="space-y-1.5">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-white/25 font-medium">{Math.round(overallProgress)}{t.missions.progress}</p>
                </div>
            </div>

            {/* Missions List */}
            <div className="p-3 space-y-2">
                {missions.map((mission, idx) => {
                    const colors = missionColors[idx % missionColors.length];
                    const Icon = missionIcons[idx % missionIcons.length];

                    return (
                        <div
                            key={mission.id}
                            className={cn(
                                "relative p-3.5 rounded-xl border transition-all duration-200 group",
                                mission.isClaimed
                                    ? "bg-emerald-500/5 border-emerald-500/15 opacity-70"
                                    : "bg-white/[0.03] border-white/[0.07] hover:border-white/15"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={cn(
                                    "mt-0.5 h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 transition-all",
                                    mission.isClaimed
                                        ? "bg-emerald-500/10 border-emerald-500/20"
                                        : cn(colors.bg, colors.border)
                                )}>
                                    {mission.isClaimed ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                        <Icon className={cn("h-4 w-4", colors.text)} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={cn(
                                            "text-sm font-semibold leading-tight",
                                            mission.isClaimed ? "text-white/40 line-through" : "text-white/80"
                                        )}>
                                            {mission.title}
                                        </p>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                            <Zap className="h-3 w-3 text-indigo-400" />
                                            <span className="text-[11px] font-bold text-indigo-400">+{mission.rewardXP}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{mission.description}</p>

                                    {/* Progress bar */}
                                    {!mission.isClaimed && mission.progress > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-500", colors.progress)}
                                                    style={{ width: `${mission.progress}%` }}
                                                />
                                            </div>
                                            <p className="text-[9px] text-white/25">{mission.progress}% {t.missions.complete}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
