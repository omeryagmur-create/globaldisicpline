"use client";

import { useSelfDevStore } from "@/stores/useSelfDevStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { BookOpen, Target, Calendar, Save } from "lucide-react";
import toast from "react-hot-toast";

export function DailyReflectionForm() {
    const { dailyPerformance, dailyJournal, setDailyStats, addReflection } = useSelfDevStore();

    const handleSave = () => {
        addReflection({
            date: new Date().toISOString().split('T')[0],
            journal: dailyJournal,
            performanceScore: dailyPerformance
        });
        toast.success("Intelligence report filed for today.");
    };

    return (
        <Card className="border-border/50 bg-card/30 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center">
                    <BookOpen className="mr-3 h-7 w-7 text-primary" />
                    After-Action Report
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">Daily self-analysis and course correction.</p>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center">
                            <Target className="mr-2 h-4 w-4" /> Performance Score: {dailyPerformance}/10
                        </label>
                    </div>
                    <Slider
                        value={[dailyPerformance]}
                        max={10}
                        step={1}
                        onValueChange={(v: number[]) => setDailyStats(v[0], dailyJournal)}
                        className="py-4"
                    />
                    <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                        <span>Failure</span>
                        <span>Standard</span>
                        <span>Elite</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center">
                        <Calendar className="mr-2 h-4 w-4" /> Intelligence Log (Journal)
                    </label>
                    <Textarea
                        placeholder="Observation, strategy, and upcoming challenges..."
                        className="min-h-[150px] bg-muted/20 border-border/50 focus:border-primary/50 transition-all font-medium italic"
                        value={dailyJournal}
                        onChange={(e) => setDailyStats(dailyPerformance, e.target.value)}
                    />
                </div>

                <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={handleSave}>
                    <Save className="mr-2 h-5 w-5" /> File Report & Earn XP
                </Button>
            </CardContent>
        </Card>
    );
}
