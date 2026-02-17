"use client";

import { useSelfDevStore } from "@/stores/useSelfDevStore";
import { useTimerStore } from "@/stores/useTimerStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Clock,
    Tag,
    Play,
    CheckCircle2,
    Circle,
    GripVertical,
    MoreVertical
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Task {
    id: string;
    title: string;
    priority: 'Low' | 'Medium' | 'High';
    estimatedMinutes: number;
    completed: boolean;
}

export function TaskEngine() {
    const { setSession } = useTimerStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [est, setEst] = useState("25");

    const addTask = () => {
        if (!newTask) return;
        const task: Task = {
            id: Math.random().toString(36).substring(7),
            title: newTask,
            priority,
            estimatedMinutes: parseInt(est) || 25,
            completed: false
        };
        setTasks([...tasks, task]);
        setNewTask("");
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const startTaskFocus = (task: Task) => {
        setSession('custom', task.estimatedMinutes * 60, task.title);
        // Redirect or show timer (assuming user is on a page where timer is visible)
    };

    return (
        <Card className="border-border/50 bg-card/30 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">Mission Control</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">Drag-and-drop task architecture.</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <Input
                        placeholder="Define mission objective..."
                        className="flex-1 min-w-[200px]"
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <select
                            className="bg-background border rounded-md px-2 py-1 text-xs font-bold uppercase tracking-widest"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                        <div className="flex items-center gap-1 bg-background border rounded-md px-2 py-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <input
                                type="number"
                                className="w-10 bg-transparent text-xs font-bold text-center outline-none"
                                value={est}
                                onChange={e => setEst(e.target.value)}
                            />
                            <span className="text-[10px] font-black uppercase text-muted-foreground">m</span>
                        </div>
                        <Button size="sm" onClick={addTask}>
                            <Plus className="h-4 w-4 mr-2" /> Deploy
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3">
                    {tasks.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground italic border-2 border-dashed rounded-xl">
                            No active missions. Objective required.
                        </div>
                    )}
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className={cn(
                                "group flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-lg",
                                task.completed ? "bg-primary/5 border-primary/20 opacity-60" : "bg-card border-border/50"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                                <button onClick={() => toggleTask(task.id)}>
                                    {task.completed ? (
                                        <CheckCircle2 className="h-6 w-6 text-primary" />
                                    ) : (
                                        <Circle className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </button>
                                <div>
                                    <div className={cn("font-bold", task.completed && "line-through")}>
                                        {task.title}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] px-1 py-0 h-4 font-black uppercase tracking-tighter",
                                            task.priority === 'High' ? "text-red-500 border-red-500/20" :
                                                task.priority === 'Medium' ? "text-orange-500 border-orange-500/20" : "text-blue-500 border-blue-500/20"
                                        )}>
                                            {task.priority} Priority
                                        </Badge>
                                        <div className="flex items-center text-[10px] font-black text-muted-foreground">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {task.estimatedMinutes}M EST
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!task.completed && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => startTaskFocus(task)}
                                    >
                                        <Play className="h-3 w-3 mr-1 fill-current" /> Focus
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
