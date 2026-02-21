"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
    variant?: "navbar" | "sidebar" | "floating" | "dropdown-item";
    className?: string;
}

export function LanguageSwitcher({ variant = "navbar", className }: LanguageSwitcherProps) {
    const { language, setLanguage } = useLanguage();

    if (variant === "dropdown-item") {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Globe className="h-4 w-4 text-indigo-400" />
                <span className="text-xs text-white/40 font-semibold">Dil / Language</span>
                <div className="ml-auto flex items-center gap-1 p-0.5 bg-white/[0.06] rounded-lg border border-white/[0.08]">
                    <button
                        onClick={() => setLanguage("tr")}
                        className={cn(
                            "px-2 py-1 text-[10px] font-black rounded-md transition-all",
                            language === "tr"
                                ? "bg-indigo-500 text-white shadow-sm"
                                : "text-white/40 hover:text-white/70"
                        )}
                    >
                        TR
                    </button>
                    <button
                        onClick={() => setLanguage("en")}
                        className={cn(
                            "px-2 py-1 text-[10px] font-black rounded-md transition-all",
                            language === "en"
                                ? "bg-indigo-500 text-white shadow-sm"
                                : "text-white/40 hover:text-white/70"
                        )}
                    >
                        EN
                    </button>
                </div>
            </div>
        );
    }

    if (variant === "floating") {
        return (
            <div className={cn(
                "fixed bottom-6 right-6 z-50 flex items-center gap-1 p-1 bg-[hsl(224,60%,5%)]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50",
                className
            )}>
                <button
                    onClick={() => setLanguage("tr")}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all",
                        language === "tr"
                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                            : "text-white/40 hover:text-white hover:bg-white/[0.06]"
                    )}
                >
                    <span>🇹🇷</span>
                    TR
                </button>
                <button
                    onClick={() => setLanguage("en")}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all",
                        language === "en"
                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                            : "text-white/40 hover:text-white hover:bg-white/[0.06]"
                    )}
                >
                    <span>🇬🇧</span>
                    EN
                </button>
            </div>
        );
    }

    // Default: navbar / sidebar compact toggle
    return (
        <div className={cn(
            "flex items-center gap-0.5 p-0.5 bg-white/[0.05] border border-white/[0.08] rounded-xl",
            className
        )}>
            <button
                onClick={() => setLanguage("tr")}
                title="Türkçe"
                className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-black rounded-lg transition-all",
                    language === "tr"
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "text-white/40 hover:text-white/70"
                )}
            >
                <span className="text-[10px]">🇹🇷</span> TR
            </button>
            <button
                onClick={() => setLanguage("en")}
                title="English"
                className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-black rounded-lg transition-all",
                    language === "en"
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "text-white/40 hover:text-white/70"
                )}
            >
                <span className="text-[10px]">🇬🇧</span> EN
            </button>
        </div>
    );
}
