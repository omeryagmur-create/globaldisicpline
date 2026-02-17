"use client";

import { useTimerStore, FocusMode } from "@/stores/useTimerStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Coffee, Brain, Timer, Zap, ShieldAlert, Plus, Settings2, PlayCircle } from "lucide-react";
import { useState } from "react";

export function FocusModeSelector() {
    const {
        sessionType,
        setSession,
        setDuration,
        customModes,
        sequences,
        startSequence,
        currentSequenceId
    } = useTimerStore();

    const [customMinutes, setCustomMinutes] = useState("25");
    const [showCustomInput, setShowCustomInput] = useState(false);

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

    const handleSelect = (type: string, duration: number) => {
        setSession(type as any, duration);
        setShowCustomInput(false);
    };

    const handleCustomSubmit = () => {
        const mins = parseInt(customMinutes);
        if (!isNaN(mins) && mins > 0) {
            setDuration(mins * 60);
            setShowCustomInput(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-center gap-2">
                {modes.map((mode) => (
                    <Button
                        key={mode.type}
                        variant={sessionType === mode.type && !currentSequenceId ? "default" : "outline"}
                        onClick={() => handleSelect(mode.type, mode.duration)}
                        className={cn(
                            "rounded-full px-6 transition-all",
                            sessionType === mode.type && !currentSequenceId ? "shadow-lg scale-105 font-bold" : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <mode.icon className="mr-2 h-4 w-4" />
                        {mode.label}
                    </Button>
                ))}

                <Button
                    variant={showCustomInput || sessionType === 'custom' ? "default" : "outline"}
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="rounded-full px-6"
                >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Custom
                </Button>
            </div>

            {showCustomInput && (
                <div className="flex items-center justify-center space-x-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center bg-muted/30 p-2 rounded-xl border border-border/50">
                        <Input
                            type="number"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(e.target.value)}
                            className="w-20 border-none bg-transparent text-center text-lg font-bold focus-visible:ring-0"
                            placeholder="Min"
                        />
                        <span className="mr-3 text-muted-foreground font-medium">min</span>
                        <Button onClick={handleCustomSubmit} size="sm" className="rounded-lg">
                            Set
                        </Button>
                    </div>
                </div>
            )}

            {/* Custom Modes Section */}
            {customModes.length > 0 && (
                <div className="pt-4 border-t border-border/50">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">Custom Modes</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {customModes.map((mode) => (
                            <Button
                                key={mode.id}
                                variant="outline"
                                onClick={() => handleSelect('custom', mode.duration)}
                                className="rounded-full border-dashed"
                            >
                                {mode.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Sequences Section */}
            {sequences.length > 0 && (
                <div className="pt-4 border-t border-border/50">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">Focus Sequences</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {sequences.map((seq) => (
                            <Button
                                key={seq.id}
                                variant={currentSequenceId === seq.id ? "default" : "outline"}
                                onClick={() => startSequence(seq.id)}
                                className={cn(
                                    "rounded-full",
                                    currentSequenceId === seq.id && "bg-orange-500 hover:bg-orange-600"
                                )}
                            >
                                <PlayCircle className="mr-2 h-4 w-4" />
                                {seq.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
