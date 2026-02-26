"use client";

import { useEffect, useState } from "react";
import {
    Trophy,
    Star,
    Gift,
    Zap,
    Target,
    Shield,
    Lock,
    Award,
    CheckCircle2,
    Loader2,
    Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUserStore } from "@/stores/useUserStore";
import Image from "next/image";
import toast from "react-hot-toast";
import { RewardsDashboard } from "@/services/RewardsService";

export default function RewardsPage() {
    const { t } = useLanguage();
    const { profile, fetchProfile } = useUserStore();
    const [dashboard, setDashboard] = useState<RewardsDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [resetTime, setResetTime] = useState<string>("");

    const loadDashboard = async () => {
        try {
            const res = await fetch("/api/rewards/dashboard");
            if (!res.ok) throw new Error("Failed to fetch dashboard");
            const data = await res.json();
            setDashboard(data);
        } catch (error) {
            console.error(error);
            toast.error(t.common.systemError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();

        // Daily Reset Timer Logic
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setResetTime(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const handlePurchase = async (rewardId: string, cost: number) => {
        if (!profile) return;
        if (profile.total_xp < cost) {
            toast.error(t.auth.errorUnexpected); // Or more specific "Insufficient XP"
            return;
        }

        setProcessingId(rewardId);
        try {
            const idempotencyKey = `buy:${profile.id}:${rewardId}:${Date.now()}`;
            const res = await fetch("/api/rewards/purchase", {
                method: "POST",
                body: JSON.stringify({ rewardId, idempotencyKey }),
            });
            const result = await res.json();

            if (result.success) {
                toast.success(result.message || "Success!");
                await Promise.all([loadDashboard(), fetchProfile()]);
            } else {
                toast.error(result.message || "Failed.");
            }
        } catch (error) {
            toast.error(t.common.systemError);
        } finally {
            setProcessingId(null);
        }
    };

    const handleClaim = async (missionId: string) => {
        setProcessingId(missionId);
        try {
            const res = await fetch("/api/rewards/claim", {
                method: "POST",
                body: JSON.stringify({ missionId }),
            });
            const result = await res.json();

            if (result.success) {
                toast.success(result.xp_reward ? `+${result.xp_reward} XP Earned!` : "Reward Claimed!");
                await Promise.all([loadDashboard(), fetchProfile()]);
            } else {
                toast.error(result.message || "Failed to claim.");
            }
        } catch (error) {
            toast.error(t.common.systemError);
        } finally {
            setProcessingId(null);
        }
    };

    const getBadgeIcon = (type: string) => {
        switch (type) {
            case "early_sessions": return Zap;
            case "daily_minutes": return Target;
            case "streak_days": return Star;
            default: return Award;
        }
    };

    const getBadgeColor = (category: string) => {
        switch (category) {
            case "milestone": return { text: "text-amber-500", bg: "bg-amber-500/10" };
            case "social": return { text: "text-blue-500", bg: "bg-blue-500/10" };
            default: return { text: "text-primary", bg: "bg-primary/10" };
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

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
                            <h2 className="text-4xl font-black">{dashboard?.availableXP.toLocaleString()} XP</h2>
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
                            <h2 className="text-4xl font-black">{dashboard?.badges.filter(b => b.unlocked).length} / {dashboard?.badges.length}</h2>
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
                            <h2 className="text-4xl font-black">{profile?.current_league || "Bronze"}</h2>
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
                    {dashboard?.badges.map((badge) => {
                        const Icon = getBadgeIcon(badge.requirementType);
                        const colors = getBadgeColor(badge.category);
                        return (
                            <Card key={badge.id} className={cn(
                                "group hover:shadow-xl transition-all duration-300 overflow-hidden",
                                !badge.unlocked && "opacity-80 grayscale-[0.5]"
                            )}>
                                <div className={cn("h-40 flex items-center justify-center relative", colors.bg)}>
                                    <Icon className={cn("h-16 w-16 transition-transform group-hover:scale-110", colors.text)} />
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
                        );
                    })}
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
                    {dashboard?.catalog.map((item) => {
                        // @ts-ignore - 'purchased' exists but TS might be lagging on translations.ts update
                        const purchasedLabel = t.rewards.purchased || "Purchased";

                        return (
                            <Card key={item.id} className="group overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300">
                                <div className="h-48 overflow-hidden relative">
                                    {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <Gift className="h-12 w-12 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-white/90 text-black border-none hover:bg-white capitalize">{item.category}</Badge>
                                    </div>
                                    {item.isPurchased && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                            <Badge variant="secondary" className="scale-125 font-bold uppercase tracking-widest">{purchasedLabel}</Badge>
                                        </div>
                                    )}
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{item.title}</CardTitle>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="p-1 rounded-full bg-primary/10">
                                            <Zap className="h-4 w-4 text-primary fill-primary" />
                                        </div>
                                        <span className="font-black text-lg">{item.costXP.toLocaleString()} XP</span>
                                    </div>
                                    {item.durationMinutes && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{item.durationMinutes} {t.common.minutes}</span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardFooter>
                                    <Button
                                        className="w-full rounded-xl h-12 text-lg font-bold"
                                        onClick={() => handlePurchase(item.id, item.costXP)}
                                        disabled={item.isPurchased || processingId === item.id}
                                    >
                                        {processingId === item.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {item.isPurchased ? purchasedLabel : t.rewards.purchaseButton}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* Daily Missions */}
            <section className="bg-muted/30 p-8 rounded-3xl border-2 border-dashed border-primary/20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black">{t.rewards.dailyMissions}</h3>
                        <p className="text-muted-foreground">{t.rewards.resetTime} <span className="font-mono text-primary font-bold">{resetTime}</span></p>
                    </div>
                </div>
                <div className="space-y-4">
                    {dashboard?.missions.map((mission) => (
                        <div key={mission.id} className={cn(
                            "flex items-center justify-between p-4 rounded-2xl bg-background border shadow-sm transition-all",
                            mission.isClaimed && "bg-muted shadow-none opacity-60"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center",
                                    mission.isClaimed ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary"
                                )}>
                                    {mission.isClaimed ? <CheckCircle2 className="h-6 w-6" /> : <Star className="h-6 w-6" />}
                                </div>
                                <div className="max-w-md">
                                    <p className="font-bold">{mission.title}</p>
                                    <p className="text-xs text-muted-foreground">{mission.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="font-black text-primary">+{mission.rewardXP} XP</Badge>
                                <Button
                                    size="sm"
                                    variant={mission.isClaimed ? "ghost" : "outline"}
                                    disabled={mission.isClaimed || processingId === mission.id}
                                    onClick={() => handleClaim(mission.id)}
                                >
                                    {processingId === mission.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {mission.isClaimed ? t.rewards.claimedButton : t.rewards.claimButton}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
