"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, ShieldCheck } from "lucide-react";

interface LeaderboardUser {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    country: string | null;
    total_xp: number;
    current_level: number;
    tier: string;
    weighted_xp?: number;
}

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();
    const [mode, setMode] = useState<"standard" | "prestige">("standard");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id);

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, country, total_xp, current_level, tier, current_streak')
                .order('total_xp', { ascending: false })
                .limit(50);

            if (!error && data) {
                const processed = data.map(u => ({
                    ...u,
                    weighted_xp: u.total_xp * (1 + (u.current_streak || 0) / 10)
                }));
                setUsers(processed);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const sortedUsers = [...users].sort((a, b) => {
        if (mode === "prestige") {
            return (b.weighted_xp || 0) - (a.weighted_xp || 0);
        }
        return b.total_xp - a.total_xp;
    });

    return (
        <div className="container mx-auto max-w-5xl space-y-8 py-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center">
                        <Trophy className="mr-3 h-10 w-10 text-yellow-500" />
                        Global Leaderboard
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        The elite ranks of the Global Discipline Engine.
                    </p>
                </div>

                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-fit">
                    <TabsList className="bg-muted/50 p-1 h-12">
                        <TabsTrigger value="standard" className="px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Zap className="mr-2 h-4 w-4" /> Standard
                        </TabsTrigger>
                        <TabsTrigger value="prestige" className="px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <ShieldCheck className="mr-2 h-4 w-4" /> Prestige
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Card className="border-primary/10 shadow-xl overflow-hidden bg-card/30 backdrop-blur-md">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black uppercase tracking-tighter">
                                {mode === "prestige" ? "Prestige Rankings" : "World Rankings"}
                            </CardTitle>
                            <CardDescription className="font-medium">
                                {mode === "prestige"
                                    ? "Sorted by Power Multiplier (XP × Consistency factor)"
                                    : "Sorted by total accumulated Experience Points (XP)"}
                            </CardDescription>
                        </div>
                        <div className="hidden md:block">
                            <Badge variant="secondary" className="font-bold text-xs uppercase tracking-widest px-3 py-1">
                                LIVE SYNC ACTIVE
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <LeaderboardTable users={sortedUsers} currentUserId={currentUserId} prestigeMode={mode === "prestige"} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
