import { createClient } from "@/lib/supabase/server";
import { TimerDisplay } from "@/components/focus/TimerDisplay";
import { TimerControls } from "@/components/focus/TimerControls";
import { FocusModeSelector } from "@/components/focus/FocusModeSelector";
import { SessionHistory } from "@/components/focus/SessionHistory";
import { FocusModeBuilder } from "@/components/focus/FocusModeBuilder";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

export default async function FocusPage() {
    const { history } = await getFocusData();

    return (
        <div className="container mx-auto max-w-4xl py-8 space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Focus Mode</h1>
                <p className="text-muted-foreground text-lg italic">"Ayrıcalık disiplini takip eder."</p>
            </div>

            <Card className="overflow-hidden relative shadow-2xl border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center space-y-10 relative z-10">
                    <FocusModeSelector />
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <TimerDisplay size={340} strokeWidth={14} />
                    </div>
                    <TimerControls />
                </CardContent>
            </Card>

            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="history">Session History</TabsTrigger>
                    <TabsTrigger value="builder">Engine Builder (v3.5)</TabsTrigger>
                </TabsList>
                <TabsContent value="history">
                    <SessionHistory history={history} />
                </TabsContent>
                <TabsContent value="builder">
                    <FocusModeBuilder />
                </TabsContent>
            </Tabs>
        </div>
    );
}
