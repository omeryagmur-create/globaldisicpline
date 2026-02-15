"use client";

import { useTimerStore } from "@/stores/useTimerStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Coffee, Brain, Timer, Zap, ShieldAlert } from "lucide-react";

export function FocusModeSelector() {
    const { sessionType, setSession } = useTimerStore();

    const modes = [
        {
            type: "pomodoro",
            label: "Pomodoro",
            duration: 25 * 60,
            icon: Timer,
            color: "bg-primary text-primary-foreground",
        },
        {
            type: "deep_focus",
            label: "Deep Focus (1.5x XP)",
            duration: 50 * 60,
            icon: Zap,
            color: "bg-purple-600 text-white",
        },
        {
            type: "survival",
            label: "Survival (2.0x XP)",
            duration: 25 * 60,
            icon: ShieldAlert,
            color: "bg-red-600 text-white",
        },
        {
            type: "short_break",
            label: "Short Break",
            duration: 5 * 60,
            icon: Coffee,
            color: "bg-emerald-500 text-white",
        },
    ];

    const handleSelect = (mode: typeof modes[number]) => {
        // Only set if not already selected or forced
        setSession(mode.type as any, mode.duration);
    };

    return (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
            {modes.map((mode) => (
                <Button
                    key={mode.type}
                    variant={sessionType === mode.type ? "default" : "outline"}
                    onClick={() => handleSelect(mode)}
                    className={cn(
                        "rounded-full px-6 transition-all",
                        sessionType === mode.type ? "shadow-lg scale-105 font-bold" : "text-muted-foreground hover:bg-muted"
                    )}
                >
                    <mode.icon className="mr-2 h-4 w-4" />
                    {mode.label}
                </Button>
            ))}
        </div>
    );
}
