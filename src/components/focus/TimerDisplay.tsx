"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/stores/useTimerStore";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
    size?: number;
    strokeWidth?: number;
}

export function TimerDisplay({ size = 300, strokeWidth = 12 }: TimerDisplayProps) {
    const { timeLeft, initialTime, isRunning } = useTimerStore();

    const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            {/* Background Glow */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full transition-all duration-1000 blur-3xl opacity-20",
                    isRunning ? "bg-primary scale-110" : "bg-muted scale-100"
                )}
            />

            <svg width={size} height={size} className="transform -rotate-90 relative z-10">
                <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted/10"
                />

                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="url(#timerGradient)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                    filter={isRunning ? "url(#glow)" : "none"}
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <div className="flex flex-col items-center">
                    <span className={cn(
                        "text-7xl font-black tracking-tighter tabular-nums transition-all duration-300",
                        isRunning ? "text-foreground drop-shadow-sm" : "text-muted-foreground"
                    )}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>

                    <div className={cn(
                        "mt-4 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                        isRunning
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 animate-pulse"
                            : "bg-muted text-muted-foreground"
                    )}>
                        {isRunning ? (
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                                Focused State
                            </span>
                        ) : "Paused"}
                    </div>
                </div>
            </div>
        </div>
    );
}
