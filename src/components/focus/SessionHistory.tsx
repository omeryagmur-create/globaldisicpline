import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

type SessionItem = { id: string; session_type?: string; created_at: string; xp_earned?: number; duration_minutes?: number };

export function SessionHistory({ history }: { history: SessionItem[] }) {
    if (history.length === 0) return null;

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {history.map((session) => (
                        <div key={session.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                            <div>
                                <p className="font-medium text-sm">
                                    {session.session_type === 'pomodoro' ? 'Pomodoro' : 'Focus Session'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(session.created_at), "PP p")}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-green-600 font-bold">+{session.xp_earned} XP</span>
                                <p className="text-xs text-muted-foreground">{session.duration_minutes} min</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
