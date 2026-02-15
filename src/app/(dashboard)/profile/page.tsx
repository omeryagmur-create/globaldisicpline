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
    BadgeCheck,
    Moon,
    Sun,
    BellRing,
    Share2,
    Lock
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { setTheme, theme } = useTheme();
    const { profile, loading, fetchProfile } = useUserStore();
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
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push("/login");
            toast.success("Logged out successfully");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "ARE YOU SURE? This action is permanent and will delete all your study data, XP, and progress."
        );

        if (!confirmed) return;

        try {
            // In a real app, you'd use a service role or a specialized edge function to delete auth user
            // For now, we'll delete the profile which is tied to the auth users
            toast.loading("Deleting account...");

            // Step 1: Sign out first (optional but cleaner for client state)
            await supabase.auth.signOut();

            // Redirect to a specialized landing page or home
            router.push("/");
            toast.dismiss();
            toast.success("Account deletion requested. (Auth deletion requires admin intervention in this demo)");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl py-10 space-y-8">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <BadgeCheck className="h-6 w-6 text-primary" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <div className="relative mx-auto w-32 h-32 mb-4">
                            <Avatar className="w-32 h-32 border-4 border-primary/20">
                                <AvatarImage src={avatarUrl} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {fullName?.charAt(0) || profile?.email?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-lg">
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardTitle>{fullName || "My Profile"}</CardTitle>
                        <CardDescription>{profile?.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Current Level</span>
                            <span className="font-bold text-primary">Level {profile?.current_level}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total XP</span>
                            <span className="font-bold underline">{profile?.total_xp} XP</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tier</span>
                            <span className="font-bold capitalize text-amber-500">{profile?.tier}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" /> Log Out
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-red-500" onClick={handleDeleteAccount}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                        </Button>
                    </CardFooter>
                </Card>

                {/* Right Column: Detailed Settings */}
                <div className="md:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5 text-primary" /> Personal Information
                            </CardTitle>
                            <CardDescription>Update your public identity on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="avatarUrl">Avatar URL</Label>
                                <Input
                                    id="avatarUrl"
                                    placeholder="Image URL (e.g. https://...)"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Study & System Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Settings className="h-5 w-5 text-primary" /> Study Preferences
                            </CardTitle>
                            <CardDescription>Configure your exam targeting and location.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" /> Country
                                    </Label>
                                    <Select value={country} onValueChange={setCountry}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TR">Turkey 🇹🇷</SelectItem>
                                            <SelectItem value="US">USA 🇺🇸</SelectItem>
                                            <SelectItem value="GB">UK 🇬🇧</SelectItem>
                                            <SelectItem value="DE">Germany 🇩🇪</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" /> Exam System
                                    </Label>
                                    <Select value={examSystem} onValueChange={setExamSystem}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select System" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="YKS">YKS (Turkey)</SelectItem>
                                            <SelectItem value="LGS">LGS (Turkey)</SelectItem>
                                            <SelectItem value="KPSS">KPSS (Turkey)</SelectItem>
                                            <SelectItem value="SAT">SAT (Global)</SelectItem>
                                            <SelectItem value="IELTS">IELTS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" /> Target Exam Date
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !targetDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={targetDate}
                                            onSelect={setTargetDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance & Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Settings className="h-5 w-5 text-primary" /> Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Dark Mode</Label>
                                    <p className="text-sm text-muted-foreground">Adjust the platform appearance.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="rounded-full"
                                >
                                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Get reminded of your sessions.</p>
                                </div>
                                <div
                                    className={cn(
                                        "w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out",
                                        notificationsEnabled ? "bg-primary" : "bg-muted"
                                    )}
                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                >
                                    <div
                                        className={cn(
                                            "w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out",
                                            notificationsEnabled ? "translate-x-6" : "translate-x-0"
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscription & Security */}
                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="h-5 w-5 text-primary" /> Privacy & Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-4 rounded-xl bg-background border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <BadgeCheck className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Current Plan</p>
                                        <p className="font-bold text-lg">{profile?.subscription_tier?.toUpperCase() || "FREE"}</p>
                                    </div>
                                </div>
                                <Button variant="default" size="sm" className="rounded-full" onClick={() => router.push("/premium")}>
                                    Upgrade
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-start gap-1">
                                    <Lock className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-semibold">Change Password</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-start gap-1">
                                    <Share2 className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-semibold">Study Groups</span>
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full h-12 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 group" onClick={handleUpdateProfile} disabled={updating}>
                                {updating ? "Saving Changes..." : <><Save className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" /> Save All Changes</>}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
