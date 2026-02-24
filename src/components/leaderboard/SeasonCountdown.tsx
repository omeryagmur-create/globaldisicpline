"use client";

import React, { useState, useEffect } from "react";
import { Timer, Zap } from "lucide-react";

interface SeasonCountdownProps {
    secondsUntilEnd: number;
    seasonEndsAt: string | null;
}

export const SeasonCountdown = ({ secondsUntilEnd, seasonEndsAt }: SeasonCountdownProps) => {
    const [timeLeft, setTimeLeft] = useState(secondsUntilEnd);

    useEffect(() => {
        setTimeLeft(secondsUntilEnd);
    }, [secondsUntilEnd]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    if (!seasonEndsAt) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <Zap className="h-5 w-5 text-amber-400" />
                <div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">Sezon Hazırlanıyor</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Sıralamalar yakında aktifleşecek</p>
                </div>
            </div>
        );
    }

    if (timeLeft <= 0) {
        return (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3">
                <Timer className="h-5 w-5 text-indigo-400 animate-pulse" />
                <div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">Sezon Kapanıyor</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Sonuçlar hesaplanıyor...</p>
                </div>
            </div>
        );
    }

    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Timer className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 leading-none mb-1.5">Sezon Bitişine Kalan</p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-white tabular-nums">{days}</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase">Gün</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-white tabular-nums">{hours.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase">S</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-white tabular-nums">{minutes.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase">D</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-white tabular-nums text-indigo-400">{seconds.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase">S</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Bitiş Tarihi</p>
                <p className="text-xs font-black text-white/60">
                    {new Date(seasonEndsAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
        </div>
    );
};
