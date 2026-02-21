"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { FriendsList } from "@/components/community/FriendsList";
import { ActivityFeed } from "@/components/community/ActivityFeed";
import { ChallengeWidget } from "@/components/community/ChallengeWidget";
import { GroupCard } from "@/components/community/GroupCard";
import { Users, MessageSquare, Award, Zap } from "lucide-react";

export default function CommunityPage() {
    const { t } = useLanguage();

    const stats = [
        { icon: Users, label: t.community.statFriends, value: "12", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
        { icon: Award, label: t.community.statChallenges, value: "3", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        { icon: Zap, label: t.community.statActive, value: "47", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-teal-500/5 via-transparent to-emerald-500/5 p-6 md:p-8">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-teal-400">
                            <div className="h-6 w-6 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                                <Users className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-[0.15em]">{t.community.pageLabel}</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {t.community.pageTitle} <span className="text-teal-400">{t.community.pageTitleHighlight}</span>
                        </h1>
                        <p className="text-white/30 text-sm font-medium">
                            {t.community.pageSubtitle}
                        </p>
                    </div>

                    {/* Community Quick Stats */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
                            <div key={label} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl ${bg} border ${border}`}>
                                <Icon className={`h-4 w-4 ${color}`} />
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold leading-none">{label}</p>
                                    <p className={`text-base font-black ${color} leading-tight`}>{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Friends */}
                <div className="lg:col-span-3">
                    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
                            <div className="h-7 w-7 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                                <Users className="h-3.5 w-3.5 text-teal-400" />
                            </div>
                            <h2 className="text-sm font-bold text-white">{t.community.sectionFriends}</h2>
                        </div>
                        <div className="p-4">
                            <FriendsList />
                        </div>
                    </div>
                </div>

                {/* Middle: Activity Feed */}
                <div className="lg:col-span-6">
                    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
                            <div className="h-7 w-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                            </div>
                            <h2 className="text-sm font-bold text-white">{t.community.sectionActivity}</h2>
                            <div className="ml-auto flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] text-emerald-400 font-semibold">{t.community.sectionLive}</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <ActivityFeed />
                        </div>
                    </div>
                </div>

                {/* Right: Challenges & Groups */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
                            <div className="h-7 w-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Award className="h-3.5 w-3.5 text-amber-400" />
                            </div>
                            <h2 className="text-sm font-bold text-white">{t.community.sectionChallenges}</h2>
                        </div>
                        <div className="p-4">
                            <ChallengeWidget />
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
                            <div className="h-7 w-7 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <Users className="h-3.5 w-3.5 text-violet-400" />
                            </div>
                            <h2 className="text-sm font-bold text-white">{t.community.sectionGroups}</h2>
                        </div>
                        <div className="p-4">
                            <GroupCard />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
