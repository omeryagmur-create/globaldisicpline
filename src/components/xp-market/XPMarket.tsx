"use client";

import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Lock, Zap, Activity, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { TypoStriker } from "@/components/games/TypoStriker";

export function XPMarket() {
    const { profile, addXP } = useUserStore();
    const currentXP = profile?.total_xp || 0;
    const [activeFeatures, setActiveFeatures] = useState<Record<string, number>>({});

    const [now, setNow] = useState<number>(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const current = Date.now();
            setNow(current);
            setActiveFeatures(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(key => {
                    if (next[key] < current) {
                        delete next[key];
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const items = [
        {
            id: 'sports_panel',
            name: 'Live Sports Feed',
            description: 'Unlock 60 minutes of real-time scores (Football & F1).',
            cost: 500,
            icon: Activity,
            type: 'feature'
        },
        {
            id: 'typo_game',
            name: 'Typo Striker',
            description: 'Fix typos fast to earn small XP boosts.',
            cost: 200,
            icon: Gamepad2,
            type: 'game'
        },
        {
            id: 'logic_puzzle',
            name: 'Micro Logic',
            description: 'Solve a logic puzzle in under 60 seconds.',
            cost: 300,
            icon: Zap,
            type: 'game'
        }
    ];

    const handleUnlock = (item: typeof items[0]) => {
        if (currentXP < item.cost) {
            toast.error("Insufficient Discipline (XP) to unlock.");
            return;
        }

        // Deduct XP
        addXP(-item.cost, `Unlocked ${item.name}`);

        setActiveFeatures(prev => ({
            ...prev,
            [item.id]: Date.now() + 60 * 60 * 1000 // 60 minutes
        }));

        toast.success(`${item.name} activated for 60 minutes.`);
    };

    const getRemainingTime = (id: string) => {
        const expiry = activeFeatures[id];
        if (!expiry) return null;
        const remaining = Math.max(0, expiry - now);
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                {items.map((item) => {
                    const timeLeft = getRemainingTime(item.id);
                    const isActive = !!timeLeft;

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
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
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
                                        variant={currentXP >= item.cost ? "default" : "outline"}
                                        className="w-full font-black uppercase tracking-widest text-[10px]"
                                        onClick={() => handleUnlock(item)}
                                    >
                                        {currentXP >= item.cost ? (
                                            <>Unlock for {item.cost} XP</>
                                        ) : (
                                            <>
                                                <Lock className="mr-2 h-3 w-3" />
                                                Need {item.cost - currentXP} More
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
                {activeFeatures['sports_panel'] && (
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

                {activeFeatures['typo_game'] && (
                    <div className="animate-in zoom-in duration-300">
                        <TypoStriker />
                    </div>
                )}
            </div>
        </div>
    );
}
