"use client";

import { useTimerStore, FocusMode } from "@/stores/useTimerStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Coffee, Brain, Timer, Zap, ShieldAlert, Plus, Settings2, PlayCircle, Infinity, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type ViewMode = 'pomodoro' | 'deep_focus' | 'custom' | null;

export function FocusModeSelector() {
    const {
        isRunning,
        timeLeft,
        initialTime,
        sessionType,
        setSession,
        setDuration,
        customModes,
        sequences,
        startSequence,
        currentSequenceId,
        deleteCustomMode,
        deleteSequence
    } = useTimerStore();

    const [activeView, setActiveView] = useState<ViewMode>(null);
    const [customMinutes, setCustomMinutes] = useState("25");
    const [cycleCount, setCycleCount] = useState<number | 'infinite'>(4);
    const { t } = useLanguage();

    // A session is considered "active" if the timer has moved or is currently running
    const isSessionActive = isRunning || (timeLeft < initialTime && timeLeft > 0);

    // Sync activeView with running sequence on mount or when sequence changes
    useEffect(() => {
        if (currentSequenceId === 'system-pomodoro-sequence') {
            setActiveView('pomodoro');
        } else if (currentSequenceId === 'system-deep-focus-sequence') {
            setActiveView('deep_focus');
        } else if (sessionType === 'custom' && !currentSequenceId) {
            setActiveView('custom');
        } else if (sessionType === 'pomodoro' && !currentSequenceId) {
            setActiveView('pomodoro');
        } else if (sessionType === 'deep_focus' && !currentSequenceId) {
            setActiveView('deep_focus');
        }
    }, [currentSequenceId, sessionType]);

    // ─── CLEANUP OLD SEQUENCES ──────────────────────────────────────
    useEffect(() => {
        const hasLegacy = sequences.some(s =>
            s.id.startsWith('temp-') ||
            ((s.name.includes('Pomodoro') || s.name.includes('Odak')) && !s.id.startsWith('system-'))
        );
        if (hasLegacy) {
            const cleanSequences = sequences.filter(s =>
                !s.id.startsWith('temp-') &&
                ((!s.name.includes('Pomodoro') && !s.name.includes('Odak')) || s.id.startsWith('system-'))
            );
            useTimerStore.setState({ sequences: cleanSequences });
        }
    }, [sequences.length]);
    // ──────────────────────────────────────────────────────────────

    const modes = [
        {
            type: "pomodoro" as const,
            label: "Pomodoro",
            duration: 25 * 60,
            icon: Timer,
            color: "bg-primary text-primary-foreground",
        },
        {
            type: "deep_focus" as const,
            label: "Deep Focus (1.5x XP)",
            duration: 50 * 60,
            icon: Zap,
            color: "bg-purple-600 text-white",
        },
    ];

    const handleSelect = (type: ViewMode) => {
        // If we are active, clicking should just highlight but not necessarily toggle the config
        if (activeView === type) {
            setActiveView(null);
            return;
        }
        setActiveView(type);
    };

    const handleStartPomodoro = () => {
        const cycles: { duration: number; type: 'focus' | 'break' }[] = [];
        const iterations = cycleCount === 'infinite' ? 100 : cycleCount;

        for (let i = 1; i <= iterations; i++) {
            cycles.push({ duration: 25 * 60, type: 'focus' });
            if (i % 4 === 0) {
                cycles.push({ duration: 15 * 60, type: 'break' });
            } else {
                cycles.push({ duration: 5 * 60, type: 'break' });
            }
        }

        const tempId = `system-pomodoro-sequence`;
        useTimerStore.getState().addSequence({
            id: tempId,
            name: `${t.focus.pomodoroCycles} (${cycleCount === 'infinite' ? '∞' : cycleCount})`,
            cycles
        });
        startSequence(tempId);
        setActiveView('pomodoro');
    };

    const handleStartDeepFocus = () => {
        const cycles: { duration: number; type: 'focus' | 'break' }[] = [];
        const iterations = cycleCount === 'infinite' ? 100 : cycleCount;

        for (let i = 1; i <= iterations; i++) {
            cycles.push({ duration: 50 * 60, type: 'focus' });
            cycles.push({ duration: 10 * 60, type: 'break' });
        }

        const tempId = `system-deep-focus-sequence`;
        useTimerStore.getState().addSequence({
            id: tempId,
            name: `${t.focus.deepFocusCycles} (${cycleCount === 'infinite' ? '∞' : cycleCount})`,
            cycles
        });
        startSequence(tempId);
        setActiveView('deep_focus');
    };

    const handleCustomSubmit = () => {
        const mins = parseInt(customMinutes);
        if (!isNaN(mins) && mins > 0) {
            setDuration(mins * 60);
            setActiveView('custom');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-center gap-2">
                {modes.map((mode) => {
                    const isActive = activeView === mode.type;
                    return (
                        <Button
                            key={mode.type}
                            variant={isActive ? "default" : "outline"}
                            onClick={() => handleSelect(mode.type)}
                            className={cn(
                                "rounded-full px-6 transition-all",
                                isActive ? (mode.type === 'deep_focus' ? "bg-purple-600 hover:bg-purple-700 shadow-lg scale-105 font-bold" : "shadow-lg scale-105 font-bold") : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <mode.icon className="mr-2 h-4 w-4" />
                            {mode.label}
                        </Button>
                    );
                })}

                <Button
                    variant={activeView === 'custom' ? "default" : "outline"}
                    onClick={() => handleSelect('custom')}
                    className={cn(
                        "rounded-full px-6 transition-all",
                        activeView === 'custom' && "shadow-lg scale-105 font-bold"
                    )}
                >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Custom
                </Button>
            </div>

            {/* Config Panels - Hidden when session is active to save space */}
            {!isSessionActive && (
                <div className="animate-in fade-in slide-in-from-top-4">
                    {activeView === 'custom' && (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="flex items-center bg-muted/30 p-2 rounded-xl border border-border/50">
                                <Input
                                    type="number"
                                    value={customMinutes}
                                    onChange={(e) => setCustomMinutes(e.target.value)}
                                    className="w-20 border-none bg-transparent text-center text-lg font-bold focus-visible:ring-0"
                                    placeholder="25"
                                />
                                <span className="mr-3 text-muted-foreground font-medium">min</span>
                                <Button onClick={handleCustomSubmit} size="sm" className="rounded-lg">
                                    Set
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeView === 'pomodoro' && (
                        <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-white/[0.03] border border-white/[0.07]">
                            <p className="text-sm font-bold text-white/60 uppercase tracking-widest">{t.focus.howManyCycles}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {[1, 2, 4, 8].map((n) => (
                                    <Button
                                        key={n}
                                        variant={cycleCount === n ? "default" : "outline"}
                                        onClick={() => setCycleCount(n)}
                                        className="rounded-xl h-12 w-16 text-lg font-bold"
                                    >
                                        {n}
                                    </Button>
                                ))}
                                <Button
                                    variant={cycleCount === 'infinite' ? "default" : "outline"}
                                    onClick={() => setCycleCount('infinite')}
                                    className="rounded-xl h-12 px-6 text-xs font-bold uppercase"
                                >
                                    <Infinity className="h-4 w-4 mr-2" />
                                    {t.focus.untilStopped}
                                </Button>
                            </div>
                            <Button
                                onClick={handleStartPomodoro}
                                className="w-full max-w-[200px] h-12 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20"
                            >
                                <Timer className="h-4 w-4 mr-2" />
                                {t.focus.startPomodoro}
                            </Button>
                        </div>
                    )}

                    {activeView === 'deep_focus' && (
                        <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-white/[0.03] border border-white/[0.07]">
                            <p className="text-sm font-bold text-white/60 uppercase tracking-widest">{t.focus.howManyCycles}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {[1, 2, 4, 8].map((n) => (
                                    <Button
                                        key={n}
                                        variant={cycleCount === n ? "default" : "outline"}
                                        onClick={() => setCycleCount(n)}
                                        className="rounded-xl h-12 w-16 text-lg font-bold"
                                    >
                                        {n}
                                    </Button>
                                ))}
                                <Button
                                    variant={cycleCount === 'infinite' ? "default" : "outline"} // fixed a potential bug here
                                    onClick={() => setCycleCount('infinite')}
                                    className="rounded-xl h-12 px-6 text-xs font-bold uppercase"
                                >
                                    <Infinity className="h-4 w-4 mr-2" />
                                    {t.focus.untilStopped}
                                </Button>
                            </div>
                            <Button
                                onClick={handleStartDeepFocus}
                                className="w-full max-w-[200px] h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/20"
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                {t.focus.startDeepFocus}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Custom Modes Section */}
            {customModes.length > 0 && !isSessionActive && (
                <div className="pt-4 border-t border-border/50">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">Custom Modes</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {customModes.map((mode) => (
                            <div key={mode.id} className="relative group/btn">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSession('custom', mode.duration);
                                        setActiveView('custom');
                                    }}
                                    className="rounded-full border-dashed pr-8"
                                >
                                    {mode.name}
                                </Button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteCustomMode(mode.id);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-rose-500/40 hover:text-rose-500 opacity-0 group-hover/btn:opacity-100 transition-all"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sequences Section */}
            {sequences.filter(s =>
                !s.id.startsWith('system-') &&
                !s.id.startsWith('temp-') &&
                !s.name.includes('Pomodoro') &&
                !s.name.includes('Odak')
            ).length > 0 && !isSessionActive && (
                    <div className="pt-4 border-t border-border/50">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">Focus Sequences</h3>
                        <div className="flex flex-wrap justify-center gap-2">
                            {sequences.filter(s =>
                                !s.id.startsWith('system-') &&
                                !s.id.startsWith('temp-') &&
                                !s.name.includes('Pomodoro') &&
                                !s.name.includes('Odak')
                            ).map((seq) => (
                                <div key={seq.id} className="relative group/btn">
                                    <Button
                                        variant={currentSequenceId === seq.id ? "default" : "outline"}
                                        onClick={() => {
                                            startSequence(seq.id);
                                            setActiveView('custom');
                                        }}
                                        className={cn(
                                            "rounded-full pr-8",
                                            currentSequenceId === seq.id && "bg-orange-500 hover:bg-orange-600 font-bold"
                                        )}
                                    >
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        {seq.name}
                                    </Button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSequence(seq.id);
                                        }}
                                        className={cn(
                                            "absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover/btn:opacity-100 transition-all",
                                            currentSequenceId === seq.id ? "text-white/40 hover:text-white" : "text-rose-500/40 hover:text-rose-500"
                                        )}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
        </div>
    );
}
