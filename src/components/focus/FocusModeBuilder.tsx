"use client";

import { useTimerStore, FocusMode, FocusSequence } from "@/stores/useTimerStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Layers, Flame, Clock } from "lucide-react";
import { useState } from "react";

export function FocusModeBuilder() {
    const { addCustomMode, addSequence, customModes, sequences, deleteCustomMode } = useTimerStore();

    const [modeForm, setModeForm] = useState({
        name: "",
        duration: 25,
        breakDuration: 5,
        xpMultiplier: 1.0,
        intensity: "medium" as const
    });

    const [seqForm, setSeqForm] = useState<{
        name: string;
        cycles: { duration: number; type: 'focus' | 'break' }[];
    }>({
        name: "",
        cycles: [{ duration: 25, type: "focus" }]
    });

    const handleAddMode = () => {
        if (!modeForm.name) return;
        addCustomMode({
            id: Math.random().toString(36).substring(7),
            name: modeForm.name,
            duration: modeForm.duration * 60,
            breakDuration: modeForm.breakDuration * 60,
            xpMultiplier: modeForm.xpMultiplier,
            intensity: modeForm.intensity
        });
        setModeForm({ name: "", duration: 25, breakDuration: 5, xpMultiplier: 1.0, intensity: "medium" });
    };

    const handleAddSeqCycle = () => {
        setSeqForm(prev => ({
            ...prev,
            cycles: [...prev.cycles, { duration: 5, type: "break" as const }]
        }));
    };

    const handleAddSequence = () => {
        if (!seqForm.name) return;
        addSequence({
            id: Math.random().toString(36).substring(7),
            name: seqForm.name,
            cycles: seqForm.cycles.map(c => ({ ...c, duration: c.duration * 60 }))
        });
        setSeqForm({ name: "", cycles: [{ duration: 25, type: "focus" }] });
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        <Flame className="mr-2 h-5 w-5 text-orange-500" />
                        Create Custom Mode
                    </CardTitle>
                    <CardDescription>Define a specific focus environment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Mode Name (e.g. War Mode)"
                        value={modeForm.name}
                        onChange={e => setModeForm({ ...modeForm, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Work (Min)</label>
                            <Input
                                type="number"
                                value={modeForm.duration}
                                onChange={e => setModeForm({ ...modeForm, duration: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Break (Min)</label>
                            <Input
                                type="number"
                                value={modeForm.breakDuration}
                                onChange={e => setModeForm({ ...modeForm, breakDuration: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">XP Multiplier</label>
                        <Input
                            type="number"
                            step="0.1"
                            value={modeForm.xpMultiplier}
                            onChange={e => setModeForm({ ...modeForm, xpMultiplier: parseFloat(e.target.value) })}
                        />
                    </div>
                    <Button className="w-full" onClick={handleAddMode}>
                        <Plus className="mr-2 h-4 w-4" /> Save Mode
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-orange-500/5">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        <Layers className="mr-2 h-5 w-5 text-orange-500" />
                        Build Focus Sequence
                    </CardTitle>
                    <CardDescription>Chain multiple sessions together.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Sequence Name"
                        value={seqForm.name}
                        onChange={e => setSeqForm({ ...seqForm, name: e.target.value })}
                    />
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                        {seqForm.cycles.map((cycle, idx) => (
                            <div key={idx} className="flex items-center space-x-2 bg-background/50 p-2 rounded-lg border border-border/50">
                                <span className="text-xs font-bold w-4">{idx + 1}.</span>
                                <select
                                    className="bg-transparent text-sm focus:outline-none"
                                    value={cycle.type}
                                    onChange={e => {
                                        const newCycles = [...seqForm.cycles];
                                        newCycles[idx].type = e.target.value as any;
                                        setSeqForm({ ...seqForm, cycles: newCycles });
                                    }}
                                >
                                    <option value="focus">Focus</option>
                                    <option value="break">Break</option>
                                </select>
                                <Input
                                    type="number"
                                    className="h-8 w-16"
                                    value={cycle.duration}
                                    onChange={e => {
                                        const newCycles = [...seqForm.cycles];
                                        newCycles[idx].duration = parseInt(e.target.value);
                                        setSeqForm({ ...seqForm, cycles: newCycles });
                                    }}
                                />
                                <span className="text-xs text-muted-foreground">m</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1" onClick={handleAddSeqCycle}>
                            <Plus className="mr-2 h-4 w-4" /> Add Step
                        </Button>
                        <Button className="flex-1" onClick={handleAddSequence}>
                            Save Sequence
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
