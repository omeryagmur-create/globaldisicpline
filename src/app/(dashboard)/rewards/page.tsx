"use client";

import {
    Trophy,
    Star,
    Gift,
    Zap,
    Target,
    Shield,
    Lock,
    Award,
    CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Image from "next/image";

export default function RewardsPage() {
    const { t } = useLanguage();

    const BADGES = [
        {
            id: "1",
            title: "Early Bird",
            description: "Complete 10 focus sessions before 08:00 AM.",
            progress: 70,
            unlocked: false,
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            id: "2",
            title: "Deep Work Master",
            description: "Focus for more than 4 hours in a single day.",
            progress: 100,
            unlocked: true,
            icon: Target,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            id: "3",
            title: "Study Streak (7 Days)",
            description: "Maintain a study streak for 7 consecutive days.",
            progress: 42,
            unlocked: false,
            icon: Star,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            id: "4",
            title: "Community Pillar",
            description: "Help 5 people in the study groups.",
            progress: 100,
            unlocked: true,
            icon: Award,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        }
    ];

    const REWARDS = [
        {
            id: "r1",
            title: "Premium Theme: Vaporwave",
            cost: "5,000 XP",
            image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=200&auto=format&fit=crop",
            type: t.rewards.cosmetic
        },
        {
            id: "r2",
            title: "1.2x XP Booster (1 Hour)",
            cost: "2,000 XP",
            image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop",
            type: t.rewards.boost
        },
        {
            id: "r3",
            title: "Focus Music: Lo-Fi Beats Pack",
            cost: "3,500 XP",
            image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=200&auto=format&fit=crop",
            type: t.rewards.music
        }
    ];

    return (
        <div className="container mx-auto max-w-6xl py-10 space-y-12">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    <Trophy className="h-4 w-4" /> {t.rewards.title}
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight">{t.rewards.heroTitle}</h1>
                <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                    {t.rewards.heroSubtitle}
                </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none">
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium opacity-80 uppercase tracking-widest">{t.rewards.statAvailableXP}</p>
                            <h2 className="text-4xl font-black">12,450 XP</h2>
                        </div>
                        <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Zap className="h-8 w-8 text-white fill-white" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{t.rewards.statBadgesEarned}</p>
                            <h2 className="text-4xl font-black">8 / 24</h2>
                        </div>
                        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                            <Award className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{t.rewards.statCurrentTier}</p>
                            <h2 className="text-4xl font-black">Gold</h2>
                        </div>
                        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Badges Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{t.rewards.sectionBadges}</h3>
                    <Button variant="link" className="text-primary hover:no-underline font-bold">{t.rewards.viewAll}</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {BADGES.map((badge) => (
                        <Card key={badge.id} className={cn(
                            "group hover:shadow-xl transition-all duration-300 overflow-hidden",
                            !badge.unlocked && "opacity-80 grayscale-[0.5]"
                        )}>
                            <div className={cn("h-40 flex items-center justify-center relative", badge.bg)}>
                                <badge.icon className={cn("h-16 w-16 transition-transform group-hover:scale-110", badge.color)} />
                                {badge.unlocked ? (
                                    <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    </div>
                                ) : (
                                    <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <CardHeader className="text-center">
                                <CardTitle className="text-lg">{badge.title}</CardTitle>
                                <CardDescription className="text-xs">{badge.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                                    <span>{t.rewards.progress}</span>
                                    <span>{badge.progress}%</span>
                                </div>
                                <Progress value={badge.progress} className="h-1.5" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Shop Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{t.rewards.sectionShop}</h3>
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Gift className="h-5 w-5" /> {t.rewards.shopSubtitle}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {REWARDS.map((item) => (
                        <Card key={item.id} className="group overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300">
                            <div className="h-48 overflow-hidden relative">
                                <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-white/90 text-black border-none hover:bg-white">{item.type}</Badge>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors">{item.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="p-1 rounded-full bg-primary/10">
                                        <Zap className="h-4 w-4 text-primary fill-primary" />
                                    </div>
                                    <span className="font-black text-lg">{item.cost}</span>
                                </div>
                            </CardHeader>
                            <CardFooter>
                                <Button className="w-full rounded-xl h-12 text-lg font-bold">{t.rewards.purchaseButton}</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Daily Missions */}
            <section className="bg-muted/30 p-8 rounded-3xl border-2 border-dashed border-primary/20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black">{t.rewards.dailyMissions}</h3>
                        <p className="text-muted-foreground">{t.rewards.resetTime} 6 hours 12 minutes</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[
                        { title: "Morning Monk", desc: "Start a focus session before 9 AM", reward: "+200 XP", done: true },
                        { title: "Deep Thinker", desc: "Focus for 2 hours total today", reward: "+500 XP", done: false },
                        { title: "Planner Pro", desc: "Mark 5 tasks as completed", reward: "+300 XP", done: false }
                    ].map((mission, i) => (
                        <div key={i} className={cn(
                            "flex items-center justify-between p-4 rounded-2xl bg-background border shadow-sm transition-all",
                            mission.done && "bg-muted shadow-none opacity-60"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center",
                                    mission.done ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary"
                                )}>
                                    {mission.done ? <CheckCircle2 className="h-6 w-6" /> : <Star className="h-6 w-6" />}
                                </div>
                                <div>
                                    <p className="font-bold">{mission.title}</p>
                                    <p className="text-xs text-muted-foreground">{mission.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="font-black text-primary">{mission.reward}</Badge>
                                <Button size="sm" variant={mission.done ? "ghost" : "outline"} disabled={mission.done}>
                                    {mission.done ? t.rewards.claimedButton : t.rewards.claimButton}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
