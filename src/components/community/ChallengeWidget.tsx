"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Challenge {
    id: string;
    title: string;
    description: string;
    participants: number;
    daysLeft: number;
    progress?: number; // If user joined
    status: 'active' | 'available';
}

const MOCK_CHALLENGES: Challenge[] = [
    { id: '1', title: 'Calculus Marathon', description: 'Study math for 10 hours this week', participants: 15, daysLeft: 3, progress: 65, status: 'active' },
    { id: '2', title: 'Morning Focus', description: 'Complete 5 sessions before 9 AM', participants: 42, daysLeft: 5, status: 'available' },
];

export function ChallengeWidget() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Challenges
                </CardTitle>
                <Button size="sm" variant="ghost" className="text-xs h-8">Create New</Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {MOCK_CHALLENGES.map(challenge => (
                    <div key={challenge.id} className="border rounded-lg p-3 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium text-sm">{challenge.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">{challenge.description}</p>
                            </div>
                            {challenge.status === 'active' ? (
                                <Badge variant="default" className="bg-green-600 text-[10px] px-1.5 py-0 h-5">Active</Badge>
                            ) : (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">Open</Badge>
                            )}
                        </div>

                        <div className="flex items-center text-xs text-muted-foreground space-x-3">
                            <span className="flex items-center"><Users className="h-3 w-3 mr-1" /> {challenge.participants}</span>
                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {challenge.daysLeft}d left</span>
                        </div>

                        {challenge.status === 'active' && challenge.progress !== undefined ? (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Progress</span>
                                    <span>{challenge.progress}%</span>
                                </div>
                                <Progress value={challenge.progress} className="h-1.5" />
                            </div>
                        ) : (
                            <Button size="sm" className="w-full text-xs h-8">Join Challenge</Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

