"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { calculateSuccessRate } from "@/lib/mock-exams";
import { Button } from "@/components/ui/button";

interface SubjectData {
    subject: string;
    correct: number;
    wrong: number;
    empty: number;
}

interface WeakAreasDisplayProps {
    data: SubjectData[];
}

export function WeakAreasDisplay({ data }: WeakAreasDisplayProps) {
    const weakSubjects = data
        .map(item => ({
            ...item,
            rate: calculateSuccessRate(item.correct, item.correct + item.wrong + item.empty)
        }))
        .filter(item => item.rate < 50 && (item.correct + item.wrong + item.empty) > 0)
        .sort((a, b) => a.rate - b.rate);

    if (weakSubjects.length === 0) {
        return (
            <Card className="h-full bg-green-50/50 border-green-100">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-green-800">Strong Performance!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-green-700">You don&apos;t have any subjects with less than 50% success rate. Keep up the good work!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full border-red-100 bg-red-50/10">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center text-red-700">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Focus Areas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Consider spending more study time on these subjects to improve your overall score.
                </p>
                <div className="grid gap-3">
                    {weakSubjects.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm">
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">{item.subject}</span>
                                <span className="text-xs text-muted-foreground">
                                    {(item.correct + item.wrong + item.empty)} questions total
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                                    %{item.rate.toFixed(1)} Success
                                </Badge>
                                <Button size="icon" variant="ghost" className="h-8 w-8" title="Add to planner">
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
