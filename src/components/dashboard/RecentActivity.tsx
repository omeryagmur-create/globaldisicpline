import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FocusSession } from "@/types/database"; // Using database type directly

interface RecentActivityProps {
    sessions: FocusSession[];
}

export function RecentActivity({
    sessions,
}: RecentActivityProps) {
    if (sessions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <Clock className="h-8 w-8 mb-2 opacity-50" />
                        <p>No activity yet.</p>
                        <p className="text-xs">Start a focus session to see it here!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {session.subject || "Study Session"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {session.session_type === 'pomodoro_25' ? 'Pomodoro (25m)' : 'Deep Work'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-green-600">+{session.xp_earned} XP</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
