"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Clock, BookOpen, Zap, Timer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { FocusSession } from "@/types/database";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
    sessions: FocusSession[];
}

export function RecentActivity({
    sessions,
}: RecentActivityProps) {
    const { t, language } = useLanguage();

    const sessionTypeConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
        pomodoro_25: { label: t.activity.pomodoro25, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: Timer },
        pomodoro_50: { label: t.activity.deepPomodoro, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: Timer },
        deep_focus: { label: t.activity.deepFocus, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: BookOpen },
        custom: { label: t.activity.customSession, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", icon: Zap },
    };

    if (sessions.length === 0) {
        return (
            <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.02] to-transparent p-8 text-center">
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-7 w-7 text-white/20" />
                </div>
                <h3 className="text-sm font-semibold text-white/40 mb-1">{t.activity.noActivity}</h3>
                <p className="text-xs text-white/20">{t.activity.noActivityDesc}</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-white text-sm">{t.activity.title}</h3>
                </div>
                <span className="text-[11px] font-semibold text-white/25">{sessions.length} {t.activity.sessions}</span>
            </div>

            {/* Sessions List */}
            <div className="divide-y divide-white/[0.04]">
                {sessions.map((session, idx) => {
                    const config = sessionTypeConfig[session.session_type || 'custom'] || sessionTypeConfig.custom;
                    const SessionIcon = config.icon;

                    return (
                        <div
                            key={session.id}
                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            {/* Icon */}
                            <div className={cn(
                                "h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                config.bg, config.border
                            )}>
                                <SessionIcon className={cn("h-4 w-4", config.color)} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white/80 truncate">
                                    {session.subject || t.activity.customSession}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={cn("text-[10px] font-medium", config.color)}>
                                        {config.label}
                                    </span>
                                    <span className="text-[10px] text-white/20">•</span>
                                    <span className="text-[10px] text-white/30">
                                        {session.duration_minutes}m
                                    </span>
                                </div>
                            </div>

                            {/* XP & Time */}
                            <div className="text-right shrink-0">
                                <div className="flex items-center gap-1 justify-end">
                                    <Zap className="h-3 w-3 text-indigo-400" />
                                    <span className="text-sm font-bold text-indigo-400">+{session.xp_earned}</span>
                                </div>
                                <p className="text-[10px] text-white/25 mt-0.5">
                                    {formatDistanceToNow(new Date(session.created_at), {
                                        addSuffix: true,
                                        locale: language === 'tr' ? tr : enUS
                                    })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
