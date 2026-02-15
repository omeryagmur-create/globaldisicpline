"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/stores/useTimerStore";

interface TimerDisplayProps {
    size?: number;
    strokeWidth?: number;
}

export function TimerDisplay({ size = 300, strokeWidth = 12 }: TimerDisplayProps) {
    const { timeLeft, initialTime, isRunning, tick } = useTimerStore();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                tick();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, tick]);

    const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted/20"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="text-primary transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold tracking-tighter tabular-nums">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-sm text-muted-foreground mt-2 font-medium uppercase tracking-widest">
                    {isRunning ? "Focusing" : "Paused"}
                </span>
            </div>
        </div>
    );
}
