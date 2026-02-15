"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultData {
    name: string;
    value: number;
    color: string;
}

interface ResultsChartProps {
    correct: number;
    wrong: number;
    empty: number;
    netScore: number;
}

export function ResultsChart({ correct, wrong, empty, netScore }: ResultsChartProps) {
    const data: ResultData[] = [
        { name: "Correct", value: correct, color: "#22c55e" }, // green-500
        { name: "Wrong", value: wrong, color: "#ef4444" },   // red-500
        { name: "Empty", value: empty, color: "#94a3b8" },   // slate-400
    ];

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full relative">
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
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                        <div className="text-3xl font-bold">{Number(netScore).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Net Score</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
