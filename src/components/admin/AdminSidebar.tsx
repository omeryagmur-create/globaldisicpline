"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShieldAlert,
    BookOpen,
    ArrowLeft,
    Settings
} from "lucide-react";

interface AdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            href: "/admin",
        },
        {
            title: "User Management",
            icon: Users,
            href: "/admin/users",
        },
        {
            title: "Exam Systems",
            icon: BookOpen,
            href: "/admin/exams",
        },
        {
            title: "Restrictions",
            icon: ShieldAlert,
            href: "/admin/restrictions",
        },
        // {
        //     title: "Settings",
        //     icon: Settings,
        //     href: "/admin/settings",
        // }
    ];

    return (
        <div className={cn("pb-12 w-64 border-r min-h-screen bg-card/50 backdrop-blur-md hidden md:block fixed left-0 top-0 pt-16 z-30", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                        Admin Panel
                    </h2>
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transparent transition-all duration-200",
                                        pathname === item.href ? "bg-accent/80 text-accent-foreground shadow-sm" : "transparent"
                                    )}
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.title}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="px-3 py-2 mt-auto">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                        System
                    </h2>
                    <div className="space-y-1">
                        <Link href="/dashboard">
                            <div
                                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transparent transition-all duration-200 text-muted-foreground"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                <span>Back to App</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
