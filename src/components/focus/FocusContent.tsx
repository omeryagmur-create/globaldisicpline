"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TimerDisplay } from "@/components/focus/TimerDisplay";
import { TimerControls } from "@/components/focus/TimerControls";
import { FocusModeSelector } from "@/components/focus/FocusModeSelector";
import { SessionHistory } from "@/components/focus/SessionHistory";
import { FocusModeBuilder } from "@/components/focus/FocusModeBuilder";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brain, History, Settings2, Zap, BookOpen, Target, Clock, X, Maximize2 } from "lucide-react";
import { useTimerStore } from "@/stores/useTimerStore";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

import { FocusSession } from "@/types/database";

interface FocusContentProps {
    history: FocusSession[];
}

export function FocusContent({ history }: FocusContentProps) {
    const { t } = useLanguage();
    const { isZenMode, toggleZenMode } = useTimerStore();
    const [isActuallyFullscreen, setIsActuallyFullscreen] = useState(false);

    const QUOTES = useMemo(() => [
        t.focus.quote1,
        t.focus.quote2,
        t.focus.quote3,
        t.focus.quote4,
        t.focus.quote5,
    ], [t.focus.quote1, t.focus.quote2, t.focus.quote3, t.focus.quote4, t.focus.quote5]);

    const [activeQuote, setActiveQuote] = useState(QUOTES[0]);

    useEffect(() => {
        setActiveQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, [isZenMode, QUOTES]);

    const features = [
        { icon: Clock, label: t.focus.pomodoro25, xp: t.focus.xp10, color: "text-rose-400", bg: "bg-rose-500/5", border: "border-rose-500/15" },
        { icon: BookOpen, label: t.focus.deepFocusMode, xp: t.focus.xp15, color: "text-indigo-400", bg: "bg-indigo-500/5", border: "border-indigo-500/15" },
        { icon: Target, label: t.focus.customMode, xp: t.focus.xp10, color: "text-violet-400", bg: "bg-violet-500/5", border: "border-violet-500/15" },
    ];

    const filteredHistory = history.filter(s => !s.session_type?.startsWith('reward_'));

    // Handle browser fullscreen events
    useEffect(() => {
        const handleFsChange = () => {
            setIsActuallyFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const handleBrowserFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-6 space-y-8">
            {/* Zen Mode Overlay */}
            {isZenMode && (
                <div className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center animate-in fade-in duration-700 pointer-events-auto">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
                        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
                    </div>

                    <div className="relative z-[100000] flex flex-col items-center space-y-12 w-full max-w-4xl px-6 text-center">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-3 text-indigo-400/60 mb-2">
                                <Brain className="h-5 w-5" />
                                <span className="text-xs font-black uppercase tracking-[0.3em] font-mono">Zen Focus Activated</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-medium text-white/40 italic">
                                &quot;{activeQuote}&quot;
                            </h2>
                        </div>

                        <div className="relative pointer-events-none scale-110 md:scale-125 transition-transform duration-1000">
                            <div className="absolute -inset-20 bg-indigo-500/5 rounded-full blur-[100px] animate-pulse" />
                            <TimerDisplay size={450} strokeWidth={12} />
                        </div>

                        <div className="w-full flex flex-col items-center gap-8 pointer-events-auto relative z-[100001]">
                            <TimerControls />

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={toggleZenMode}
                                    className="text-white/20 hover:text-white/60 hover:bg-white/5 rounded-full px-6 flex items-center gap-2 transition-all cursor-pointer pointer-events-auto"
                                >
                                    <X className="h-4 w-4" /> Exit Zen Mode
                                </Button>
                                {!isActuallyFullscreen && (
                                    <Button
                                        variant="ghost"
                                        onClick={handleBrowserFullscreen}
                                        className="text-white/20 hover:text-white/60 hover:bg-white/5 rounded-full px-6 flex items-center gap-2 transition-all cursor-pointer pointer-events-auto"
                                    >
                                        <Maximize2 className="h-4 w-4" /> Go Fullscreen
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            {!isZenMode && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <div className="h-6 w-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <Brain className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-[0.15em]">{t.focus.pageLabel}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            {t.focus.pageTitle} <span className="gradient-text">{t.focus.pageTitleHighlight}</span> {t.focus.pageTitleEnd}
                        </h1>
                        <p className="text-white/30 font-medium italic text-sm max-w-lg">&quot;{activeQuote}&quot;</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                            <Zap className="h-4 w-4 text-indigo-400" />
                            <span className="text-xs font-bold text-white/60">{t.focus.xpBoost}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-6 items-start", isZenMode && "hidden")}>

                {/* Timer Card */}
                <div className="lg:col-span-8">
                    <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 p-6 md:p-10">
                        {/* Ambient backgrounds */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-500/5 blur-3xl rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center space-y-8">
                            {/* Mode Selector */}
                            <div className="w-full">
                                <FocusModeSelector />
                            </div>

                            {/* Timer Ring */}
                            <div className="relative group">
                                <div className="absolute -inset-8 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="relative timer-glow">
                                    <TimerDisplay size={360} strokeWidth={16} />
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="w-full flex justify-center">
                                <TimerControls />
                            </div>
                        </div>
                    </div>

                    {/* XP Multiplier Info */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        {features.map(({ icon: Icon, label, xp, color, bg, border }) => (
                            <div key={label} className={`rounded-xl border ${bg} ${border} p-3 flex items-center gap-2.5 transition-all hover:scale-[1.02]`}>
                                <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                                <div>
                                    <p className="text-xs font-semibold text-white/60 leading-none">{label}</p>
                                    <p className={`text-xs font-bold ${color} mt-0.5`}>{xp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="sticky top-24">
                        <Tabs defaultValue="history" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-1 mb-4 h-12">
                                <TabsTrigger
                                    value="history"
                                    className="rounded-xl text-xs font-bold data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                                >
                                    <History className="h-3.5 w-3.5 mr-1.5" />
                                    {t.focus.timerHistory}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="builder"
                                    className="rounded-xl text-xs font-bold data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                                >
                                    <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                                    {t.focus.timerBuilder}
                                </TabsTrigger>
                            </TabsList>

                            <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">
                                <TabsContent value="history" className="mt-0 p-4">
                                    <SessionHistory history={filteredHistory} />
                                </TabsContent>
                                <TabsContent value="builder" className="mt-0 p-4">
                                    <FocusModeBuilder />
                                </TabsContent>
                            </div>
                        </Tabs>

                        {/* Pro Tip Card */}
                        <div className="mt-4 p-4 rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/5 to-transparent">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                    <Brain className="h-3.5 w-3.5 text-indigo-400" />
                                </div>
                                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{t.focus.tipTitle}</span>
                            </div>
                            <p className="text-xs text-white/40 leading-relaxed">
                                {t.focus.tipContent} <span className="text-white/60 font-semibold">{t.focus.tipRule}</span> {t.focus.tipContent2}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
