import { createClient } from "@/lib/supabase/server";
import { TimerDisplay } from "@/components/focus/TimerDisplay";
import { TimerControls } from "@/components/focus/TimerControls";
import { FocusModeSelector } from "@/components/focus/FocusModeSelector";
import { SessionHistory } from "@/components/focus/SessionHistory";
import { FocusModeBuilder } from "@/components/focus/FocusModeBuilder";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brain } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Focus Timer - Global Discipline Engine",
    description: "Stay focused and track your study sessions.",
};

async function getFocusData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { history: [] };

    const { data: history } = await supabase
        .from("focus_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

    return { history: history || [] };
}

const QUOTES = [
    "Ayrıcalık disiplini takip eder.",
    "Büyük şeyler, küçük şeylerin bir araya gelmesiyle oluşur.",
    "Bugün yapacakların, yarınki seni belirler.",
    "Disiplin, ne istediğinle, neyi en çok istediğin arasındaki seçimdir.",
    "Zorluklar seni durdurmamalı, seni güçlendirmeli.",
];

export default async function FocusPage() {
    const { history } = await getFocusData();
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    return (
        <div className="container mx-auto max-w-5xl py-10 space-y-12 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
                    Focus Mode
                </h1>
                <p className="text-muted-foreground text-xl italic font-serif max-w-2xl mx-auto">
                    "{randomQuote}"
                </p>
                <div className="flex justify-center gap-2 pt-2">
                    <span className="h-1.5 w-8 rounded-full bg-primary/20" />
                    <span className="h-1.5 w-16 rounded-full bg-primary" />
                    <span className="h-1.5 w-8 rounded-full bg-primary/20" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                    <Card className="overflow-hidden relative shadow-2xl border-primary/10 bg-card/50 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.03] pointer-events-none" />
                        <CardContent className="p-8 md:p-16 flex flex-col items-center justify-center space-y-12 relative z-10">
                            <FocusModeSelector />
                            <div className="relative group">
                                <div className="absolute -inset-8 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <TimerDisplay size={360} strokeWidth={16} />
                            </div>
                            <TimerControls />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 h-full">
                    <div className="sticky top-24 space-y-6">
                        <Tabs defaultValue="history" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="history">History</TabsTrigger>
                                <TabsTrigger value="builder">Engine</TabsTrigger>
                            </TabsList>
                            <Card className="border-primary/5 bg-card/30 backdrop-blur-lg">
                                <CardContent className="p-4">
                                    <TabsContent value="history" className="mt-0">
                                        <SessionHistory history={history} />
                                    </TabsContent>
                                    <TabsContent value="builder" className="mt-0">
                                        <FocusModeBuilder />
                                    </TabsContent>
                                </CardContent>
                            </Card>
                        </Tabs>

                        {/* Quick Tip Card */}
                        <Card className="border-primary/10 bg-primary/5">
                            <CardContent className="p-6">
                                <h4 className="text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Brain className="h-4 w-4" /> Pro Tip
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Deep Focus sessions give 1.5x XP. Try the 50/10 rule for max productivity and burnout prevention.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
