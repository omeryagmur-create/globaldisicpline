"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import {
    LayoutDashboard,
    Timer,
    Trophy,
    BookOpen,
    BarChart2,
    Users,
    Gift,
    Crown,
    Settings,
    Rocket,
    Zap,
    ChevronRight,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { t } = useLanguage();

    interface SidebarItem {
        title: string;
        icon: React.ElementType;
        href: string;
        color: string;
        variant?: "premium";
    }

    interface MenuGroup {
        label: string;
        items: SidebarItem[];
    }

    const menuGroups: MenuGroup[] = [
        {
            label: t.sidebar.groupCore,
            items: [
                { title: t.sidebar.dashboard, icon: LayoutDashboard, href: "/dashboard", color: "text-indigo-400" },
                { title: t.sidebar.focusTimer, icon: Timer, href: "/focus", color: "text-violet-400" },
                { title: t.sidebar.leaderboard, icon: Trophy, href: "/leaderboard", color: "text-amber-400" },
                { title: t.sidebar.rewards, icon: Gift, href: "/rewards", color: "text-rose-400" },
            ]
        },
        {
            label: t.sidebar.groupGrowth,
            items: [
                { title: t.sidebar.studyPlanner, icon: BookOpen, href: "/planner", color: "text-emerald-400" },
                { title: t.sidebar.selfDevelopment, icon: Rocket, href: "/self-development", color: "text-sky-400" },
                { title: t.sidebar.mockAnalysis, icon: BarChart2, href: "/mock-analysis", color: "text-orange-400" },
            ]
        },
        {
            label: t.sidebar.groupCommunity,
            items: [
                { title: t.sidebar.studyGroups, icon: Users, href: "/groups", color: "text-teal-400" },
                { title: t.sidebar.premium, icon: Crown, href: "/premium", color: "text-amber-400", variant: "premium" },
            ]
        },
        {
            label: t.sidebar.groupAccount,
            items: [
                { title: t.sidebar.profile, icon: Settings, href: "/profile", color: "text-slate-400" },
            ]
        }
    ];

    return (
        <div className={cn(
            "pb-6 w-64 min-h-screen fixed left-0 top-0 pt-16 z-30 hidden md:flex flex-col",
            "bg-[hsl(224,60%,3%)] border-r border-white/[0.06]",
            className
        )}>
            {/* Logo */}
            <div className="px-5 py-5 border-b border-white/[0.06]">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-white tracking-tight">GlobalDiscipline</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">{t.common.active}</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
                {menuGroups.map((group) => (
                    <div key={group.label}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/25 px-3 mb-2">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                const isPremium = item.variant === "premium";

                                return (
                                    <Link key={item.href} href={item.href}>
                                        <span className={cn(
                                            "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative",
                                            isActive
                                                ? "bg-indigo-500/15 text-white shadow-sm"
                                                : "text-white/50 hover:text-white hover:bg-white/[0.05]",
                                            isPremium && !isActive && "text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10",
                                            isPremium && isActive && "bg-amber-400/15 text-amber-300",
                                        )}>
                                            {/* Active indicator */}
                                            {isActive && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-full" />
                                            )}

                                            <item.icon className={cn(
                                                "h-4 w-4 shrink-0 transition-transform duration-200",
                                                isActive ? item.color : "text-white/30 group-hover:text-white/60",
                                                isActive && "scale-110",
                                                isPremium && "text-amber-400",
                                            )} />

                                            <span className="flex-1">{item.title}</span>

                                            {isActive && (
                                                <ChevronRight className="h-3 w-3 opacity-60" />
                                            )}

                                            {isPremium && (
                                                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-md">
                                                    PRO
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom XP Preview */}
            <div className="px-4 pb-4 space-y-4">
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white/60">{t.sidebar.dailyGoal}</span>
                        <span className="text-xs font-bold text-indigo-400">75%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 xp-bar"
                            style={{ width: '75%' }}
                        />
                    </div>
                    <p className="text-[11px] text-white/30 mt-2">90 {t.sidebar.minOf} 120 min</p>
                </div>

                <div className="px-1">
                    <LanguageSwitcher className="w-full" />
                </div>
            </div>
        </div>
    );
}
