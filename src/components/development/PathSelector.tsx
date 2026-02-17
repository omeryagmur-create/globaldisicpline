"use client";

import { useSelfDevStore } from "@/stores/useSelfDevStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, HeartPulse, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { DevelopmentPath } from "@/types/self-development";

export function PathSelector() {
    const { selectedPath, setPath } = useSelfDevStore();

    const paths: { id: DevelopmentPath; label: string; desc: string; icon: any; color: string }[] = [
        {
            id: 'Internal',
            label: 'Internal (İçsel)',
            desc: 'Mental strength, reflection, and discipline.',
            icon: Brain,
            color: 'bg-indigo-500',
        },
        {
            id: 'Physical',
            label: 'Physical (Fiziksel)',
            desc: 'Fitness, sleep quality, and energy levels.',
            icon: HeartPulse,
            color: 'bg-rose-500',
        },
        {
            id: 'Social',
            label: 'Social (Sosyal)',
            desc: 'Communication, confidence, and status.',
            icon: Users,
            color: 'bg-amber-500',
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {paths.map((path) => (
                <Card
                    key={path.id}
                    className={cn(
                        "relative cursor-pointer transition-all hover:scale-105 hover:shadow-xl group",
                        selectedPath === path.id ? "border-primary ring-2 ring-primary/20" : "border-border/50"
                    )}
                    onClick={() => setPath(path.id)}
                >
                    <div className={cn(
                        "absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity",
                        selectedPath === path.id && "opacity-100"
                    )}>
                        <ShieldCheck className="text-primary h-6 w-6" />
                    </div>
                    <CardHeader>
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg", path.color)}>
                            <path.icon className="h-6 w-6" />
                        </div>
                        <CardTitle>{path.label}</CardTitle>
                        <CardDescription>{path.desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant={selectedPath === path.id ? "default" : "outline"}
                            className="w-full font-bold uppercase tracking-wider"
                        >
                            {selectedPath === path.id ? "Path Active" : "Select Path"}
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
