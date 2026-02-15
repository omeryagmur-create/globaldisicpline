import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
    currentStreak: number;
    longestStreak: number;
}

export function StreakDisplay({
    currentStreak,
    longestStreak,
}: StreakDisplayProps) {
    return (
        <Card className="hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
                        <div className="text-4xl font-bold tracking-tight text-orange-500 flex items-center">
                            {currentStreak}
                            <Flame className="ml-2 h-8 w-8 text-orange-500 animate-pulse" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Best: <span className="text-foreground">{longestStreak} days</span>
                        </p>
                    </div>
                    <div className="relative">
                        {/* Visual indicator logic could be added here */}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
