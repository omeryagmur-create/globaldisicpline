"use client";

import { useState } from "react";
import {
    Bell,
    BellOff,
    CheckCheck,
    Zap,
    Trophy,
    UserPlus,
    Clock,
    Trash2,
    Settings,
    MoreVertical
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const INITIAL_NOTIFICATIONS = [
    {
        id: "1",
        type: "system",
        title: "Achievement Unlocked!",
        description: "You've focus for 10 hours this week. Level 2 is calling!",
        time: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
        isRead: false,
        icon: trophyIcon
    },
    {
        id: "2",
        type: "social",
        title: "Friend Request",
        description: "Deniz sent you a friend request.",
        time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: false,
        icon: userIcon
    },
    {
        id: "3",
        type: "planner",
        title: "Upcoming Task",
        description: "Math: Complex Numbers session starts in 10 minutes.",
        time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        isRead: true,
        icon: zapIcon
    },
    {
        id: "4",
        type: "system",
        title: "New Update Available",
        description: "We've added Study Groups feature! Check it out now.",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: true,
        icon: bellIcon
    }
];

function trophyIcon() { return <Trophy className="h-4 w-4 text-amber-500" /> }
function userIcon() { return <UserPlus className="h-4 w-4 text-blue-500" /> }
function zapIcon() { return <Zap className="h-4 w-4 text-purple-500" /> }
function bellIcon() { return <Bell className="h-4 w-4 text-primary" /> }

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="container mx-auto max-w-4xl py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
                        <p className="text-muted-foreground">Manage your alerts and activity updates.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllRead}>
                            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={clearAll} className="text-red-500 focus:text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" /> Clear all notifications
                            </DropdownMenuItem>
                            <DropdownMenuItem>Notification settings</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                            <BellOff className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-semibold opacity-50">Inbox Zero!</h3>
                            <p className="text-muted-foreground mt-1">No new notifications at the moment.</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={cn(
                                    "group relative flex gap-4 p-5 rounded-3xl border transition-all duration-300 hover:shadow-md",
                                    n.isRead ? "bg-card/50" : "bg-primary/[0.03] border-primary/20 ring-1 ring-primary/5 shadow-sm"
                                )}
                            >
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl shrink-0 flex items-center justify-center",
                                    n.isRead ? "bg-muted" : "bg-primary/10"
                                )}>
                                    <n.icon />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className={cn("text-base font-bold", !n.isRead && "text-primary")}>
                                            {n.title}
                                            {!n.isRead && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary" />}
                                        </p>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {formatDistanceToNow(n.time)} ago
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed pr-8">
                                        {n.description}
                                    </p>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => deleteNotification(n.id)}>
                                                Delete Alert
                                            </DropdownMenuItem>
                                            {!n.isRead && (
                                                <DropdownMenuItem onClick={() => setNotifications(notifications.map(x => x.id === n.id ? { ...x, isRead: true } : x))}>
                                                    Mark as read
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary transition-colors">
                    View older notifications
                </Button>
            </div>
        </div>
    );
}
