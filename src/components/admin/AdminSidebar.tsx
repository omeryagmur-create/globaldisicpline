"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShieldAlert,
    BookOpen,
    ArrowLeft
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
            href: "/system-control",
        },
        {
            title: "User Management",
            icon: Users,
            href: "/system-control/users",
        },
        {
            title: "Exam Systems",
            icon: BookOpen,
            href: "/system-control/exams",
        },
        {
            title: "Restrictions",
            icon: ShieldAlert,
            href: "/system-control/restrictions",
        },
    ];

    return (
        <div className={cn("pb-12 w-64 border-r border-white/5 min-h-screen bg-[#0b0c14] hidden md:block fixed left-0 top-0 pt-16 z-30", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-4 px-4 text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">
                        Command Center
                    </h2>
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={cn(
                                        "group flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                                        pathname === item.href
                                            ? "bg-indigo-500/10 text-indigo-400 shadow-sm"
                                            : "text-white/50 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn("mr-3 h-4 w-4", pathname === item.href ? "text-indigo-400" : "text-white/30")} />
                                    <span>{item.title}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="px-3 py-2 mt-auto">
                    <h2 className="mb-4 px-4 text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">
                        Navigation
                    </h2>
                    <div className="space-y-1">
                        <Link href="/dashboard">
                            <div
                                className="group flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
                            >
                                <ArrowLeft className="mr-3 h-4 w-4 text-white/20" />
                                <span>Exit Control</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
