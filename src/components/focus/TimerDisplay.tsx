"use client";

import { useTimerStore } from "@/stores/useTimerStore";
import { cn } from "@/lib/utils";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function TimerDisplay() {
    const { timeLeft, initialTime, isRunning, currentSequenceId, currentSequenceStep, sequences, sessionType } = useTimerStore();
    const { t } = useLanguage();

    const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // Sequence Info
    const currentSequence = currentSequenceId ? sequences.find(s => s.id === currentSequenceId) : null;
    const totalSteps = currentSequence?.cycles.length || 0;
    const currentStepNum = currentSequenceStep + 1;
    const isBreak = sessionType === 'short_break' || currentSequence?.cycles[currentSequenceStep]?.type === 'break';

    return (
        <div className="relative flex items-center justify-center">
            {/* Background Glow */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full transition-all duration-1000 blur-[80px] opacity-20",
                    isRunning ? (isBreak ? "bg-emerald-500 scale-125" : "bg-indigo-500 scale-125") : "bg-white/5 scale-100"
                )}
            />

            <div className="relative z-10">
                <AnimatedCircularProgressBar
                    max={100}
                    min={0}
                    value={progress}
                    gaugePrimaryColor={isBreak ? "rgb(16 185 129)" : "rgb(99 102 241)"}
                    gaugeSecondaryColor="rgba(255, 255, 255, 0.05)"
                    className="size-[360px] text-5xl font-black"
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        {/* Session Progress Indicator */}
                        {currentSequence && (
                            <div className="mb-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">
                                    {t.focus.step} {currentStepNum} / {totalSteps}
                                </span>
                            </div>
                        )}

                        <span className={cn(
                            "text-7xl font-black tracking-tighter tabular-nums transition-all duration-300 text-white",
                            !isRunning && "text-white/40"
                        )}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>

                        <div className={cn(
                            "mt-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border",
                            isRunning
                                ? (isBreak
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                                    : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/10")
                                : "bg-white/5 text-white/20 border-white/5"
                        )}>
                            {isRunning ? (
                                <span className="flex items-center gap-2">
                                    <span className={cn("h-2 w-2 rounded-full animate-pulse", isBreak ? "bg-emerald-400" : "bg-indigo-400")} />
                                    {isBreak ? (initialTime > 5 * 60 ? t.focus.longBreak : t.focus.onBreak) : t.focus.focusing}
                                </span>
                            ) : "Engine Paused"}
                        </div>
                    </div>
                </AnimatedCircularProgressBar>
            </div>
        </div>
    );
}
