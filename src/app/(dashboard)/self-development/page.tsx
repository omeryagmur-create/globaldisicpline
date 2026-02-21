"use client";

import { useSelfDevStore } from "@/stores/useSelfDevStore";
import { PathSelector } from "@/components/development/PathSelector";
import { HabitGrid } from "@/components/development/HabitGrid";
import { TaskEngine } from "@/components/development/TaskEngine";
import { DailyReflectionForm } from "@/components/development/DailyReflection";
import { XPMarket } from "@/components/xp-market/XPMarket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Rocket,
    Target,
    BarChart3,
    ChevronRight,
    ShoppingCart,
    Layout,
    CheckSquare,
    PenLine,
    LineChart,
    Activity
} from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";

export default function SelfDevPage() {
    const { selectedPath } = useSelfDevStore();
    const { league, profile } = useUserStore();

    return (
        <div className="container mx-auto max-w-6xl py-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-primary">Kendini Geliştirme</h1>
                    <p className="text-muted-foreground text-xl font-medium mt-2">Personal Development & Focus Operating System</p>
                </div>
                <div className="flex items-center bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 backdrop-blur-sm shadow-xl shadow-primary/5">
                    <Rocket className="mr-3 h-6 w-6 text-primary" />
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary/70">Current Intelligence</div>
                        <div className="text-xl font-black text-primary">{league} League</div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-8">
                    <TabsTrigger value="overview" className="px-6">
                        <Layout className="h-4 w-4 mr-2" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="px-6">
                        <CheckSquare className="h-4 w-4 mr-2" /> Mission Control
                    </TabsTrigger>
                    <TabsTrigger value="reflection" className="px-6">
                        <PenLine className="h-4 w-4 mr-2" /> Analysis
                    </TabsTrigger>
                    <TabsTrigger value="market" className="px-6">
                        <ShoppingCart className="h-4 w-4 mr-2" /> XP Market
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="px-6">
                        <LineChart className="h-4 w-4 mr-2" /> Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    {!selectedPath ? (
                        <div className="space-y-8">
                            <div className="flex items-center space-x-3 text-2xl font-black uppercase tracking-tighter">
                                <Target className="h-7 w-7 text-primary" />
                                <h2>Select Your Growth Axis</h2>
                            </div>
                            <PathSelector />
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-12">
                            <div className="md:col-span-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center">
                                        <Activity className="mr-3 h-8 w-8 text-primary" />
                                        Active Path: {selectedPath}
                                    </h2>
                                    <button
                                        onClick={() => useSelfDevStore.getState().setPath(null as unknown as "Internal" | "Physical" | "Social")}
                                        className="text-sm font-bold text-muted-foreground hover:text-primary flex items-center transition-colors px-4 py-2 rounded-lg bg-muted/50"
                                    >
                                        Change Branch <ChevronRight className="h-4 w-4 ml-1" />
                                    </button>
                                </div>

                                <HabitGrid />
                            </div>

                            <div className="md:col-span-4 space-y-8">
                                <Card className="border-primary/20 bg-primary/5 sticky top-24 shadow-2xl shadow-primary/5 p-1">
                                    <div className="p-1 border border-primary/10 rounded-xl">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-black uppercase tracking-widest text-primary">Operative Status</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    <span>Branch Progress</span>
                                                    <span className="text-primary">12%</span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary w-[12%] shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-background border border-border/50 space-y-3 shadow-inner">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Today&apos;s Protocol</div>
                                                <div className="font-bold text-sm tracking-tight capitalize">{selectedPath} Focus Protocol</div>
                                                <div className="text-[10px] text-muted-foreground italic leading-tight">&quot;Efficiency is the only metric that matters.&quot;</div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-background/80 p-3 rounded-lg border border-border/50 text-center">
                                                    <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Status</div>
                                                    <div className="text-lg font-black">{profile?.current_level || '01'}</div>
                                                </div>
                                                <div className="bg-background/80 p-3 rounded-lg border border-border/50 text-center">
                                                    <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">League</div>
                                                    <div className="text-lg font-black text-orange-500">{league[0]}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="tasks">
                    <TaskEngine />
                </TabsContent>

                <TabsContent value="reflection">
                    <div className="max-w-3xl mx-auto">
                        <DailyReflectionForm />
                    </div>
                </TabsContent>

                <TabsContent value="market">
                    <XPMarket />
                </TabsContent>

                <TabsContent value="analytics">
                    <div className="grid gap-8 md:grid-cols-2">
                        <Card className="border-border/50 bg-card/10">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold uppercase tracking-tight flex items-center">
                                    <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                                    Growth Trajectory
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-64 flex flex-col items-center justify-center text-center p-8">
                                <Activity className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                                <p className="italic text-muted-foreground font-medium">
                                    Insufficient data points. Establish a 7-day routine to visualize discipline coefficients.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-border/50 bg-card/10">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold uppercase tracking-tight flex items-center">
                                    <Target className="mr-2 h-5 w-5 text-primary" />
                                    Consistency Heatmap
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-64 flex items-center justify-center">
                                <div className="grid grid-cols-7 gap-1 opacity-20">
                                    {Array.from({ length: 49 }).map((_, i) => (
                                        <div key={i} className="h-4 w-4 bg-primary/20 rounded-sm" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
