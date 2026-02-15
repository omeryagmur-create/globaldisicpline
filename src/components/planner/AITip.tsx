"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const TIPS = [
    "Studies show that studying in 90-minute blocks with 15-minute breaks maximizes retention.",
    "Don't forget to stay hydrated! Your brain needs water to process complex information.",
    "Active recall is 50% more effective than passive reading. Try to quiz yourself on the topics listed for today.",
    "Consistency is key. Even if you can't finish all tasks, try to complete at least one to keep your streak alive.",
    "A 20-minute power nap after a heavy study session can help consolidate memories.",
    "Try explains today's topics to an imaginary audience. If you can explain it simply, you understand it well."
];

export function AITip() {
    const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];

    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
                <div className="flex gap-3 items-start">
                    <Sparkles className="h-5 w-5 text-primary shrink-0" />
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-primary">AI Study Coach Tip</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {randomTip}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
