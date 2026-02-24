"use client";

import { Zap } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[hsl(224,71%,3%)]">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="orb absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] animate-pulse" />
                <div className="orb absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/8 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="bg-grid absolute inset-0 opacity-10" />
            </div>

            <div className="relative flex flex-col items-center gap-6">
                {/* Logo Pulse */}
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-2xl opacity-40 animate-pulse" />
                    <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                        <Zap className="h-8 w-8 text-white animate-pulse" />
                    </div>
                </div>

                {/* Loading Text */}
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">
                        GDE<span className="text-indigo-400">.</span>OS
                    </h3>
                    <div className="flex items-center gap-1 justify-center">
                        <div className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
