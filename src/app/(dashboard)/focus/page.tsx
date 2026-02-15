import { createClient } from "@/lib/supabase/server";
import { TimerDisplay } from "@/components/focus/TimerDisplay";
import { TimerControls } from "@/components/focus/TimerControls";
import { FocusModeSelector } from "@/components/focus/FocusModeSelector";
import { SessionHistory } from "@/components/focus/SessionHistory";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
        <div className="container mx-auto max-w-4xl py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Focus Mode</h1>
                <p className="text-muted-foreground">Choose a mode and start your session.</p>
            </div>

            <Card className="mb-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center space-y-8 relative z-10">
                    <FocusModeSelector />
                    <TimerDisplay size={320} strokeWidth={16} />
                    <TimerControls />
                </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="md:col-span-2">
                    <SessionHistory history={history} />
                </div>
            </div>
        </div>
    );
}
