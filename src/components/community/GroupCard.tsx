"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface Group {
    id: string;
    name: string;
    members: number;
    totalXp: number;
}

const MOCK_GROUPS: Group[] = [
    { id: '1', name: 'YKS 2026 Tayfa', members: 124, totalXp: 156000 },
    { id: '2', name: 'Early Birds Club', members: 45, totalXp: 89000 },
    { id: '3', name: 'LGS Winners', members: 89, totalXp: 112000 },
];

export function GroupCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Study Groups
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {MOCK_GROUPS.map(group => (
                    <div key={group.id} className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <div>
                            <p className="font-medium text-sm">{group.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {group.members} members • {(group.totalXp / 1000).toFixed(1)}k XP
                            </p>
                        </div>
                        <Button size="sm" variant="secondary">Join</Button>
                    </div>
                ))}
                <Button variant="outline" className="w-full text-xs">View All Groups</Button>
            </CardContent>
        </Card>
    );
}
