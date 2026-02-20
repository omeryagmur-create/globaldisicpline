"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Star, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Mission {
    id: string;
    title: string;
    desc: string;
    reward: number;
    progress: number;
    isCompleted: boolean;
}

interface DailyMissionsProps {
    missions: Mission[];
}

export function DailyMissions({ missions }: DailyMissionsProps) {
    const totalMissions = missions.length;
    const completedMissions = missions.filter(m => m.isCompleted).length;
    const overallProgress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

    return (
        <Card className="overflow-hidden border-2 border-primary/10">
            <CardHeader className="bg-primary/[0.03] border-b pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> Daily Missions
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {completedMissions}/{totalMissions} DONE
                    </Badge>
                </div>
                <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                        <span>Daily Progress</span>
                        <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-muted/50">
                    {missions.map((mission) => (
                        <div
                            key={mission.id}
                            className={cn(
                                "p-4 flex items-center justify-between group transition-colors",
                                mission.isCompleted ? "bg-muted/30" : "hover:bg-primary/[0.02]"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {mission.isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                </div>
                                <div>
                                    <p className={cn(
                                        "text-sm font-bold leading-none",
                                        mission.isCompleted && "text-muted-foreground line-through decoration-2"
                                    )}>
                                        {mission.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{mission.desc}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <div className="flex items-center gap-1 text-[10px] font-black text-primary">
                                    <Zap className="h-3 w-3 fill-primary" /> +{mission.reward} XP
                                </div>
                                {mission.progress > 0 && !mission.isCompleted && (
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                        {mission.progress}%
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
