"use client";

import { useState } from "react";
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProgressChart } from "./ProgressChart";
import { AITip } from "./AITip";
import { StudyPlan, DailyTask } from "@/types/user";

interface PlannerViewProps {
    plan: StudyPlan;
    tasks: DailyTask[];
    onToggleTask: (taskId: string, completed: boolean) => Promise<void>;
}

export function PlannerView({ plan, tasks, onToggleTask }: PlannerViewProps) {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const filteredTasks = tasks.filter((task) =>
        isSameDay(new Date(task.task_date), selectedDate)
    );

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Your Study Plan</h2>
                    <p className="text-muted-foreground">
                        {plan.total_weeks} weeks until {format(new Date(plan.exam_date), "PP")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 7)))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="min-w-[140px]">
                        {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 7)))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const completedTasks = tasks.filter(t => isSameDay(new Date(t.task_date), day) && t.is_completed).length;
                    const totalTasks = tasks.filter(t => isSameDay(new Date(t.task_date), day)).length;

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-lg border transition-all hover:bg-muted/50",
                                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card",
                                isSameDay(day, new Date()) && !isSelected && "border-blue-500/50"
                            )}
                        >
                            <span className="text-xs text-muted-foreground uppercase mb-1">
                                {format(day, "EEE")}
                            </span>
                            <span className={cn("text-lg font-bold", isSelected && "text-primary")}>
                                {format(day, "d")}
                            </span>
                            <div className="mt-2 flex gap-0.5 h-1.5 w-full px-2">
                                {/* Tiny dots or bar for tasks */}
                                {totalTasks > 0 && (
                                    <div className={cn(
                                        "h-full w-full rounded-full",
                                        totalTasks === completedTasks ? "bg-green-500" : "bg-primary/30"
                                    )} />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Tasks for {format(selectedDate, "EEEE, MMMM do")}</span>
                                <Badge variant="outline">{filteredTasks.length} tasks</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredTasks.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No tasks scheduled for this day. Enjoy your free time!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group cursor-pointer"
                                            onClick={() => onToggleTask(task.id, !task.is_completed)}
                                        >
                                            <div className={cn("mt-1", task.is_completed ? "text-green-500" : "text-muted-foreground group-hover:text-primary")}>
                                                {task.is_completed ? (
                                                    <CheckCircle className="h-5 w-5" />
                                                ) : (
                                                    <Circle className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className={cn("font-medium leading-none", task.is_completed && "line-through text-muted-foreground")}>
                                                    {task.subject}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {task.topic || "General Study"} • {task.estimated_duration} min
                                                </p>
                                            </div>
                                            {task.is_completed && (
                                                <Badge variant="secondary" className="text-green-600 bg-green-500/10">Completed</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <ProgressChart tasks={tasks} />
                    <AITip />
                </div>
            </div>
        </div>
    );
}
