"use client";

import { useSelfDevStore } from "@/stores/useSelfDevStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, Flame, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function HabitGrid() {
    const { habits, toggleHabit, addHabit, deleteHabit, selectedPath } = useSelfDevStore();
    const [newHabitName, setNewHabitName] = useState("");

    const handleAdd = () => {
        if (!newHabitName || !selectedPath) return;
        addHabit({ name: newHabitName, path: selectedPath });
        setNewHabitName("");
    };

    const filteredHabits = habits.filter(h => h.path === selectedPath);

    return (
        <Card className="border-border/50 bg-card/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Behavior Grid</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">Daily discipline maintenance.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="New habit..."
                        className="h-9 w-40 md:w-60"
                        value={newHabitName}
                        onChange={e => setNewHabitName(e.target.value)}
                    />
                    <Button size="sm" onClick={handleAdd} disabled={!selectedPath}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3">
                    {filteredHabits.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground italic">
                            No habits added for this path yet. Lead with action.
                        </div>
                    )}
                    {filteredHabits.map((habit) => (
                        <div
                            key={habit.id}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border transition-all",
                                habit.completedToday ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-transparent hover:border-border"
                            )}
                        >
                            <div className="flex items-center space-x-4">
                                <button onClick={() => toggleHabit(habit.id)}>
                                    {habit.completedToday ? (
                                        <CheckCircle2 className="h-6 w-6 text-primary fill-primary/10" />
                                    ) : (
                                        <Circle className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </button>
                                <div>
                                    <span className={cn("font-bold text-lg", habit.completedToday && "line-through text-muted-foreground")}>
                                        {habit.name}
                                    </span>
                                    <div className="flex items-center text-xs font-black text-orange-500 uppercase tracking-widest mt-0.5">
                                        <Flame className="h-3 w-3 mr-1" />
                                        {habit.streak} DAY STREAK
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => deleteHabit(habit.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
