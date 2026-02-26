"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Lock, Zap, Activity, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { TypoStriker } from "@/components/games/TypoStriker";
import { RewardsDashboard } from "@/services/RewardsService";

export function XPMarket() {
    const { profile, fetchProfile } = useUserStore();
    const [dashboard, setDashboard] = useState<RewardsDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [now, setNow] = useState<number>(Date.now());

    const loadDashboard = async () => {
        try {
            const res = await fetch("/api/rewards/dashboard");
            if (!res.ok) throw new Error("Failed to fetch dashboard");
            const data = await res.json();
            setDashboard(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const marketItems = dashboard?.catalog.filter(item =>
        item.category === 'feature' || item.category === 'game'
    ) || [];

    const handleUnlock = async (rewardId: string, cost: number) => {
        if (!profile) return;
        if (profile.total_xp < cost) {
            toast.error("Insufficient Discipline (XP) to unlock.");
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
                toast.success(result.message || "Purchase successful!");
                await Promise.all([loadDashboard(), fetchProfile()]);
            } else {
                toast.error(result.message || "Purchase failed.");
            }
        } catch (error) {
            toast.error("An error occurred during transaction.");
        } finally {
            setProcessingId(null);
        }
    };

    const getRemainingTime = (expiresAt: string | null) => {
        if (!expiresAt) return null;
        const remaining = Math.max(0, new Date(expiresAt).getTime() - now);
        if (remaining === 0) return null;
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getIcon = (title: string) => {
        if (title.includes('Sports')) return Activity;
        if (title.includes('Typo')) return Gamepad2;
        return Zap;
    };

    const currentXP = profile?.total_xp || 0;

    if (loading && !dashboard) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">XP Privilege Market</h2>
                    <p className="text-muted-foreground font-medium">Trade discipline for functional rewards.</p>
                </div>
                <div className="bg-primary/20 px-4 py-2 rounded-xl border border-primary/30 flex items-center">
                    <Zap className="h-5 w-5 text-primary mr-2 fill-primary" />
                    <span className="font-black text-xl">{currentXP.toLocaleString()}</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {marketItems.map((item) => {
                    const timeLeft = getRemainingTime(item.expiresAt);
                    const isActive = item.isPurchased && !!timeLeft;
                    const Icon = getIcon(item.title);

                    return (
                        <Card key={item.id} className={cn(
                            "relative overflow-hidden group border-border/50 transition-all",
                            isActive ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:border-primary/50"
                        )}>
                            <CardHeader className="pb-2">
                                <div className={cn(
                                    "h-10 w-10 rounded-lg flex items-center justify-center mb-2 transition-transform",
                                    isActive ? "bg-primary text-primary-foreground scale-110" : "bg-muted group-hover:scale-110"
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                                <CardDescription className="text-xs">{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-2">
                                {isActive ? (
                                    <div className="w-full flex items-center justify-center py-2 bg-primary/10 rounded-lg border border-primary/20">
                                        <Clock className="h-4 w-4 mr-2 text-primary animate-pulse" />
                                        <span className="font-black text-xs text-primary">{timeLeft} REMAINING</span>
                                    </div>
                                ) : (
                                    <Button
                                        variant={currentXP >= item.costXP ? "default" : "outline"}
                                        className="w-full font-black uppercase tracking-widest text-[10px]"
                                        onClick={() => handleUnlock(item.id, item.costXP)}
                                        disabled={processingId === item.id}
                                    >
                                        {processingId === item.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : currentXP >= item.costXP ? (
                                            <>Unlock for {item.costXP} XP</>
                                        ) : (
                                            <>
                                                <Lock className="mr-2 h-3 w-3" />
                                                Need {item.costXP - currentXP} More
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {dashboard?.catalog.find(i => i.title.includes('Sports') && i.isPurchased && getRemainingTime(i.expiresAt)) && (
                    <div className="p-6 rounded-2xl bg-black border border-primary/30 animate-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse" />
                                <h3 className="text-white font-black uppercase tracking-widest text-sm">Live Operative Feed</h3>
                            </div>
                            <Badge variant="outline" className="text-primary border-primary/20">Active Session</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { event: 'PL: MCI vs ARS', score: '2-2' },
                                { event: 'F1: Jeddah GP', score: 'VER P1' },
                                { event: 'CL: RM vs BAY', score: '1-0' },
                                { event: 'NBA: LAL vs GSW', score: '102-98' }
                            ].map((match, i) => (
                                <div key={i} className="bg-muted/10 p-2 rounded-lg border border-white/5">
                                    <div className="text-[10px] text-muted-foreground font-bold">{match.event}</div>
                                    <div className="text-white font-black text-xs">{match.score}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {dashboard?.catalog.find(i => i.title.includes('Typo') && i.isPurchased && getRemainingTime(i.expiresAt)) && (
                    <div className="animate-in zoom-in duration-300">
                        <TypoStriker />
                    </div>
                )}
            </div>
        </div>
    );
}
