"use client";

import { useTimerStore } from "@/stores/useTimerStore";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

export function TimerControls() {
    const { isRunning, start, pause, reset, timeLeft, initialTime, isZenMode, toggleZenMode } = useTimerStore();

    const isStarted = timeLeft < initialTime;

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex items-center space-x-4">
                <Button
                    variant={isRunning ? "secondary" : "default"}
                    size="lg"
                    onClick={() => isRunning ? pause() : start()}
                    className={cn(
                        "w-44 h-16 rounded-3xl text-xl font-black transition-all duration-500 shadow-xl",
                        isRunning
                            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            : "bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-primary/30"
                    )}
                >
                    {isRunning ? (
                        <>
                            <Pause className="mr-3 h-6 w-6" /> PAUSE
                        </>
                    ) : (
                        <>
                            <Play className="mr-3 h-6 w-6 fill-current" /> {isStarted ? "RESUME" : "START FOCUS"}
                        </>
                    )}
                </Button>

                <div className="flex items-center gap-2">
                    {isStarted && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={reset}
                            className="h-16 w-16 rounded-3xl border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all duration-300 group"
                            title="Reset Timer"
                        >
                            <RefreshCw className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleZenMode}
                        className={cn(
                            "h-16 w-16 rounded-3xl border-2 transition-all duration-300",
                            isZenMode ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" : "hover:bg-indigo-500/10 hover:border-indigo-500/50"
                        )}
                        title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
                    >
                        {isZenMode ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {!isRunning && isStarted && (
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                    Session Paused - Don't give up!
                </p>
            )}
        </div>
    );
}
