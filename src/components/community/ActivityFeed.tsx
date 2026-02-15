"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";

interface ActivityItem {
    id: string;
    userId: string;
    username: string;
    avatarUrl?: string;
    action: string;
    target?: string;
    timestamp: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
    { id: '1', userId: '1', username: 'Ali Veli', action: 'completed a 50-min study session', target: 'Mathematics', timestamp: '10m ago' },
    { id: '2', userId: '2', username: 'Ayşe Yılmaz', action: 'joined a new challenge', target: 'Calculus Marathon', timestamp: '1h ago' },
    { id: '3', userId: '1', username: 'Ali Veli', action: 'reached level 15', timestamp: '2h ago' },
    { id: '4', userId: '5', username: 'Mehmet Demir', action: 'completed a mock exam', target: 'TYT Deneme 3', timestamp: '3h ago' },
    { id: '5', userId: '6', username: 'Selin Ak', action: 'started a new streak', timestamp: '5h ago' },
    { id: '6', userId: '2', username: 'Ayşe Yılmaz', action: 'earned the "Early Bird" badge', timestamp: '6h ago' },
];

export function ActivityFeed() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary" />
                    Activity Feed
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[500px] w-full px-4">
                    <div className="space-y-6 pb-6">
                        {MOCK_ACTIVITY.map((item, index) => (
                            <div key={item.id} className="flex gap-4 relative">
                                {index !== MOCK_ACTIVITY.length - 1 && (
                                    <div className="absolute left-[19px] top-10 w-[2px] h-full bg-muted -z-10" />
                                )}
                                <Avatar className="h-10 w-10 border-2 border-background">
                                    <AvatarImage src={item.avatarUrl} />
                                    <AvatarFallback>{item.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 pt-1">
                                    <p className="text-sm">
                                        <span className="font-semibold">{item.username}</span> {item.action} {item.target && <span className="font-medium text-primary">{item.target}</span>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
