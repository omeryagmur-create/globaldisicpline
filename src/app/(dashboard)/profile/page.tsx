"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
    User,
    Settings,
    LogOut,
    Trash2,
    Save,
    Camera,
    Globe,
    BookOpen,
    Calendar as CalendarIcon,
    Shield,
    Moon,
    Sun,
    Lock,
    Zap,
    Star,
    Crown,
    Share2
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ProfilePage() {
    const { setTheme, theme } = useTheme();
    const { profile, loading, fetchProfile } = useUserStore();
    const { t, language } = useLanguage();
    const [updating, setUpdating] = useState(false);
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [country, setCountry] = useState("");
    const [examSystem, setExamSystem] = useState("");
    const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "");
            setAvatarUrl(profile.avatar_url || "");
            setCountry(profile.country || "TR");
            setExamSystem(profile.exam_system || "YKS");
            if (profile.target_exam_date) {
                setTargetDate(new Date(profile.target_exam_date));
            }
        }
    }, [profile]);

    const handleUpdateProfile = async () => {
        if (!profile) return;
        setUpdating(true);

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    country: country,
                    exam_system: examSystem,
                    target_exam_date: targetDate?.toISOString().split('T')[0],
                    updated_at: new Date().toISOString(),
                })
                .eq("id", profile.id);

            if (error) throw error;

            await fetchProfile();
            toast.success(t.profile.updateSuccess);
        } catch (error: unknown) {
            toast.error((error as Error).message || t.profile.updateError);
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push("/login");
            toast.success(t.auth.successLogin); // Using a generalized "success" from auth or could define more
        } catch (error: unknown) {
            toast.error((error as Error).message);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(t.profile.deleteConfirm);

        if (!confirmed) return;

        try {
            toast.loading(t.common.loading);
            await supabase.auth.signOut();
            router.push("/");
            toast.dismiss();
            toast.success(t.profile.deleteAccount);
        } catch (error: unknown) {
            toast.error((error as Error).message);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] w-full items-center justify-center">
                <div className="relative size-12">
                    <div className="absolute inset-0 rounded-full border-2 border-white/[0.05]" />
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    const currentXP = Number(profile?.total_xp || 0);
    const currentLevel = profile?.current_level || 1;

    return (
        <div className="max-w-5xl mx-auto py-6 space-y-6 pb-16">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400">
                    <User className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em]">{t.profile.pageLabel}</span>
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">{t.profile.pageTitle}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                {/* Left Column: Identity Card */}
                <div className="md:col-span-4 space-y-4">
                    {/* Avatar Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-indigo-500/5 to-transparent p-6">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center gap-4">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/30 to-violet-500/30 rounded-full blur-md" />
                                <Avatar className="w-24 h-24 border-2 border-indigo-500/30 relative z-10">
                                    <AvatarImage src={avatarUrl} />
                                    <AvatarFallback className="text-2xl font-black bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300">
                                        {(fullName || profile?.email || "U").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-indigo-500 border-2 border-[hsl(224,71%,3%)] flex items-center justify-center hover:bg-indigo-600 transition-colors z-20">
                                    <Camera className="h-3.5 w-3.5 text-white" />
                                </button>
                            </div>

                            <div className="text-center">
                                <h2 className="text-lg font-black text-white">{fullName || "Your Name"}</h2>
                                <p className="text-xs text-white/30 mt-0.5">{profile?.email}</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="w-full grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
                                <div className="text-center p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Star className="h-3 w-3 text-violet-400 fill-violet-400" />
                                    </div>
                                    <p className="text-sm font-black text-violet-300">{currentLevel}</p>
                                    <p className="text-[9px] text-white/25 uppercase tracking-wider">{t.profile.statLevel}</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Zap className="h-3 w-3 text-indigo-400" />
                                    </div>
                                    <p className="text-sm font-black text-indigo-300">{currentXP.toLocaleString()}</p>
                                    <p className="text-[9px] text-white/25 uppercase tracking-wider">{t.profile.statXP}</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Crown className="h-3 w-3 text-amber-400" />
                                    </div>
                                    <p className="text-sm font-black text-amber-300 capitalize">{profile?.subscription_tier || "Free"}</p>
                                    <p className="text-[9px] text-white/25 uppercase tracking-wider">{t.profile.statTier}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.02] to-transparent p-4 space-y-2">
                        <p className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-3">{t.profile.accountActions}</p>
                        <Button
                            variant="ghost"
                            className="w-full justify-start h-11 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 font-semibold text-sm transition-all"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2.5 h-4 w-4" /> {t.profile.signOut}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start h-11 rounded-xl text-white/20 hover:text-red-400/60 hover:bg-red-500/5 font-semibold text-sm transition-all"
                            onClick={handleDeleteAccount}
                        >
                            <Trash2 className="mr-2.5 h-4 w-4" /> {t.profile.deleteAccount}
                        </Button>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="md:col-span-8 space-y-4">

                    {/* Personal Information */}
                    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.02] to-transparent p-5">
                        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/[0.06]">
                            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <User className="h-4 w-4 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">{t.profile.personalInfo}</h3>
                                <p className="text-xs text-white/30">{t.profile.personalInfoDesc}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t.profile.fullName}</Label>
                                <Input
                                    id="fullName"
                                    placeholder={t.profile.fullNamePlaceholder}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-white/[0.04] border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl h-11 text-white placeholder:text-white/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="avatarUrl" className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t.profile.avatarUrl}</Label>
                                <Input
                                    id="avatarUrl"
                                    placeholder={t.profile.avatarUrlPlaceholder}
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    className="bg-white/[0.04] border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl h-11 text-white placeholder:text-white/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Study Preferences */}
                    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.02] to-transparent p-5">
                        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/[0.06]">
                            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Settings className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">{t.profile.studyPrefs}</h3>
                                <p className="text-xs text-white/30">{t.profile.studyPrefsDesc}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                                        <Globe className="h-3.5 w-3.5" /> {t.profile.country}
                                    </Label>
                                    <Select value={country} onValueChange={setCountry}>
                                        <SelectTrigger className="bg-white/[0.04] border-white/10 focus:border-indigo-500/50 rounded-xl h-11 text-white">
                                            <SelectValue placeholder={t.profile.selectCountry} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[hsl(224,60%,5%)] border border-white/10 rounded-xl">
                                            <SelectItem value="TR">Turkey 🇹🇷</SelectItem>
                                            <SelectItem value="US">USA 🇺🇸</SelectItem>
                                            <SelectItem value="GB">UK 🇬🇧</SelectItem>
                                            <SelectItem value="DE">Germany 🇩🇪</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                                        <BookOpen className="h-3.5 w-3.5" /> {t.profile.examSystem}
                                    </Label>
                                    <Select value={examSystem} onValueChange={setExamSystem}>
                                        <SelectTrigger className="bg-white/[0.04] border-white/10 focus:border-indigo-500/50 rounded-xl h-11 text-white">
                                            <SelectValue placeholder={t.profile.selectSystem} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[hsl(224,60%,5%)] border border-white/10 rounded-xl">
                                            <SelectItem value="YKS">YKS (Turkey)</SelectItem>
                                            <SelectItem value="LGS">LGS (Turkey)</SelectItem>
                                            <SelectItem value="KPSS">KPSS (Turkey)</SelectItem>
                                            <SelectItem value="SAT">SAT (Global)</SelectItem>
                                            <SelectItem value="IELTS">IELTS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                                    <CalendarIcon className="h-3.5 w-3.5" /> {t.profile.targetDate}
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-11 rounded-xl bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/20 text-white",
                                                !targetDate && "text-white/30"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {targetDate ? format(targetDate, "PPP", { locale: language === 'tr' ? tr : enUS }) : <span>{t.profile.targetDatePlaceholder}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-[hsl(224,60%,5%)] border border-white/10 rounded-2xl">
                                        <Calendar
                                            mode="single"
                                            selected={targetDate}
                                            onSelect={setTargetDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.02] to-transparent p-5">
                        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/[0.06]">
                            <div className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <Settings className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">{t.profile.preferences}</h3>
                                <p className="text-xs text-white/30">{t.profile.prefsDesc}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div>
                                    <Label className="text-sm font-semibold text-white/70">{t.profile.darkMode}</Label>
                                    <p className="text-xs text-white/30">{t.profile.darkModeDesc}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="h-9 w-9 rounded-xl bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white/70 hover:text-white"
                                >
                                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div>
                                    <Label className="text-sm font-semibold text-white/70">{t.profile.notifications}</Label>
                                    <p className="text-xs text-white/30">{t.profile.notificationsDesc}</p>
                                </div>
                                <button
                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                    className={cn(
                                        "w-12 h-6 rounded-full p-0.5 transition-all duration-300 ease-in-out relative",
                                        notificationsEnabled ? "bg-indigo-500" : "bg-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out",
                                        notificationsEnabled ? "translate-x-6" : "translate-x-0"
                                    )} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Plan & Security */}
                    <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/5 to-transparent p-5">
                        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-amber-500/10">
                            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">{t.profile.privacyPlan}</h3>
                            </div>
                        </div>

                        {/* Current Plan */}
                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <Crown className="h-5 w-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">{t.profile.currentPlan}</p>
                                    <p className="font-black text-lg text-white">{profile?.subscription_tier?.toUpperCase() || "FREE"}</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => router.push("/premium")}
                                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs px-4 h-9 shadow-lg shadow-amber-500/20"
                            >
                                {t.common.upgradeButton}
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-start gap-1 rounded-xl bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20 text-white/60 hover:text-white transition-all">
                                <Lock className="h-4 w-4 text-indigo-400" />
                                <span className="text-xs font-semibold">{t.profile.changePassword}</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-start gap-1 rounded-xl bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20 text-white/60 hover:text-white transition-all">
                                <Share2 className="h-4 w-4 text-violet-400" />
                                <span className="text-xs font-semibold">{t.profile.studyGroups}</span>
                            </Button>
                        </div>

                        <Button
                            className="w-full mt-4 h-12 text-sm font-bold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            onClick={handleUpdateProfile}
                            disabled={updating}
                        >
                            {updating ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    {t.common.savingChanges}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="h-4 w-4" /> {t.common.saveChanges}
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
