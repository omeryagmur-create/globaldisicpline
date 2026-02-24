"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { Zap, Moon, Sun, Bell, User as UserIcon, LogOut, Users, Search, Command } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";

export function Navbar() {
    const { setTheme, theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const supabase = createClient();
    const { profile, fetchProfile } = useUserStore();

    useEffect(() => {
        if (!profile) {
            fetchProfile();
        }
    }, [profile, fetchProfile]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[hsl(224,60%,3%)]/80 backdrop-blur-xl">
            <div className="flex h-16 items-center px-4 md:px-6">
                {/* Logo - hidden on desktop (shown in sidebar) */}
                <div className="mr-4 md:hidden">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-sm text-white">GDE</span>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 md:ml-64 lg:ml-0 max-w-md mx-auto">
                    <button className="group flex items-center gap-3 w-full px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.07] hover:border-indigo-500/30 text-white/30 hover:text-white/60 text-sm transition-all duration-200">
                        <Search className="h-4 w-4" />
                        <span>{t.navbar.search}</span>
                        <div className="ml-auto flex items-center gap-1 text-[11px] border border-white/10 rounded-md px-2 py-0.5">
                            <Command className="h-2.5 w-2.5" />
                            <span>{t.common.searchShortcut}</span>
                        </div>
                    </button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 ml-auto">
                    {/* XP Badge */}
                    {profile && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            <span className="text-xs font-bold text-indigo-300">
                                {profile.total_xp || 0} {t.navbar.xpBadge}
                            </span>
                        </div>
                    )}

                    {/* Language Switcher */}
                    <LanguageSwitcher variant="navbar" className="hidden sm:flex mr-1" />

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-9 w-9 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.07] border border-transparent hover:border-white/10"
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">{t.navbar.themeToggle}</span>
                    </Button>

                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl relative text-white/50 hover:text-white hover:bg-white/[0.07] border border-transparent hover:border-white/10"
                        onClick={() => router.push("/notifications")}
                    >
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-400 ring-2 ring-[hsl(224,60%,3%)]" />
                        <span className="sr-only">{t.navbar.notifications}</span>
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-9 w-9 rounded-xl p-0 border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/10 overflow-hidden transition-all duration-200"
                            >
                                <div className="flex h-full w-full items-center justify-center rounded-xl overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <div className="relative h-full w-full">
                                            <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" unoptimized />
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-br from-indigo-500/30 to-violet-500/30 h-full w-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-indigo-300">
                                                {(profile?.full_name || profile?.email || "U").charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-64 bg-[hsl(224,60%,5%)] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-2"
                            align="end"
                            forceMount
                        >
                            <DropdownMenuLabel className="font-normal px-3 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center border border-indigo-500/20 shrink-0">
                                        {profile?.avatar_url ? (
                                            <div className="relative h-full w-full">
                                                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover rounded-xl" unoptimized />
                                            </div>
                                        ) : (
                                            <span className="text-sm font-bold text-indigo-300">
                                                {(profile?.full_name || profile?.email || "U").charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white leading-none">{profile?.full_name || t.common.profile}</p>
                                        <p className="text-xs text-white/40 mt-1">
                                            {profile?.email || t.navbar.settings}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="bg-white/[0.06] my-1" />

                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-white/[0.07] focus:bg-white/[0.07] text-white/70 hover:text-white">
                                <Link href="/profile" className="flex items-center gap-3">
                                    <UserIcon className="h-4 w-4" /> {t.navbar.viewProfile}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-white/[0.07] focus:bg-white/[0.07] text-white/70 hover:text-white">
                                <Link href="/groups" className="flex items-center gap-3">
                                    <Users className="h-4 w-4" /> {t.sidebar.studyGroups}
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-white/[0.06] my-1" />

                            {/* Mobile Language Switcher */}
                            <div className="sm:hidden px-3 py-2">
                                <LanguageSwitcher variant="dropdown-item" className="w-full" />
                            </div>

                            <DropdownMenuSeparator className="sm:hidden bg-white/[0.06] my-1" />

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-red-500/10 focus:bg-red-500/10 text-red-400/80 hover:text-red-400"
                            >
                                <LogOut className="mr-3 h-4 w-4" />
                                {t.navbar.logout}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}
