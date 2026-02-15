"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Task {
    is_completed: boolean;
}

interface ProgressChartProps {
    tasks: Task[];
}

export function ProgressChart({ tasks }: ProgressChartProps) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.is_completed).length;
    const remainingTasks = totalTasks - completedTasks;

    const data = [
        { name: "Completed", value: completedTasks },
        { name: "Remaining", value: remainingTasks },
    ];

    const COLORS = ["#10b981", "#3b82f633"];

    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Overall Progress</CardTitle>
                <CardDescription>Target: {totalTasks} total tasks</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full relative">
                    {totalTasks > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center border-2 border-dashed rounded-full border-muted/20">
                            <span className="text-xs text-muted-foreground">No data</span>
                        </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold">{percent}%</span>
                        <span className="text-xs text-muted-foreground uppercase">Done</span>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-green-500">{completedTasks}</p>
                        <p className="text-xs text-muted-foreground">COMPLETED</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-primary">{remainingTasks}</p>
                        <p className="text-xs text-muted-foreground">REMAINING</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
