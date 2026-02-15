"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateSuccessRate } from "@/lib/mock-exams";

interface SubjectData {
    subject: string;
    correct: number;
    wrong: number;
    empty: number;
    net: number;
}

interface SubjectBreakdownProps {
    data: SubjectData[];
}

export function SubjectBreakdown({ data }: SubjectBreakdownProps) {
    // Sort by success rate ascending (weakest first)
    const sortedData = [...data].sort((a, b) => {
        const rateA = calculateSuccessRate(a.correct, a.correct + a.wrong + a.empty);
        const rateB = calculateSuccessRate(b.correct, b.correct + b.wrong + b.empty);
        return rateA - rateB;
    });

    const getSuccessColor = (rate: number) => {
        if (rate >= 70) return "text-green-600 bg-green-50 border-green-200";
        if (rate >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Subject Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Subject</TableHead>
                                <TableHead className="text-center text-green-600">Correct</TableHead>
                                <TableHead className="text-center text-red-600">Wrong</TableHead>
                                <TableHead className="text-center text-gray-500">Empty</TableHead>
                                <TableHead className="text-center font-bold">Net</TableHead>
                                <TableHead className="text-right">Success Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedData.map((item, index) => {
                                const total = item.correct + item.wrong + item.empty;
                                const rate = calculateSuccessRate(item.correct, total);

                                return (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.subject}</TableCell>
                                        <TableCell className="text-center text-green-600 font-medium">{item.correct}</TableCell>
                                        <TableCell className="text-center text-red-600 font-medium">{item.wrong}</TableCell>
                                        <TableCell className="text-center text-gray-500">{item.empty}</TableCell>
                                        <TableCell className="text-center font-bold">{Number(item.net).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className={getSuccessColor(rate)}>
                                                %{rate.toFixed(1)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
