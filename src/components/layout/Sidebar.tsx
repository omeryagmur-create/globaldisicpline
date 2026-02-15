"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Timer,
    Trophy,
    BookOpen,
    BarChart2,
    Users,
    MessageSquare,
    Crown,
    Settings,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
        },
        {
            title: "Focus Timer",
            icon: Timer,
            href: "/focus",
        },
        {
            title: "Leaderboard",
            icon: Trophy,
            href: "/leaderboard",
        },
        {
            title: "Rewards",
            icon: Gift,
            href: "/rewards",
        },
        {
            title: "Study Planner",
            icon: BookOpen,
            href: "/planner",
        },
        {
            title: "Mock Analysis",
            icon: BarChart2,
            href: "/mock-analysis",
        },
        {
            title: "Study Groups",
            icon: Users,
            href: "/groups",
        },
        {
            title: "Premium",
            icon: Crown,
            href: "/premium",
            variant: "premium",
        },
        {
            title: "Profile",
            icon: Settings,
            href: "/profile",
        },
    ];

    return (
        <div className={cn("pb-12 w-64 border-r min-h-screen bg-card/30 backdrop-blur-md hidden md:block fixed left-0 top-0 pt-16 z-30", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <span
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transparent transition-all duration-200",
                                        pathname === item.href ? "bg-accent/80 text-accent-foreground shadow-sm" : "transparent",
                                        item.variant === "premium" ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10" : ""
                                    )}
                                >
                                    <item.icon className={cn("mr-2 h-4 w-4", item.variant === "premium" ? "text-amber-500" : "")} />
                                    <span>{item.title}</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
