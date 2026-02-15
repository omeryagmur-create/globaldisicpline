import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface XPProgressProps {
    currentXP: number;
    currentLevel: number;
    progress: number;
    nextLevelXP: number;
}

export function XPProgress({
    currentXP,
    currentLevel,
    progress,
    nextLevelXP,
}: XPProgressProps) {
    return (
        <Card className="hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-purple-500 fill-current" />
                        <span className="text-sm font-medium text-muted-foreground">Level {currentLevel}</span>
                    </div>
                    <span className="text-sm font-medium text-purple-500">{currentXP} / {nextLevelXP} XP</span>
                </div>
                <Progress value={progress} className="h-2 bg-purple-100 dark:bg-purple-900/20" />
                <p className="mt-2 text-xs text-muted-foreground">
                    {Math.round((nextLevelXP - currentXP))} XP until Level {currentLevel + 1}
                </p>
            </CardContent>
        </Card>
    );
}
