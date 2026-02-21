"use client";

import { useTimerStore } from "@/stores/useTimerStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Layers, Flame } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function FocusModeBuilder() {
    const { addCustomMode, addSequence } = useTimerStore();
    const { t } = useLanguage();

    const [modeForm, setModeForm] = useState({
        name: "",
        duration: 25,
        breakDuration: 5,
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
            xpMultiplier: 1.0,
            intensity: modeForm.intensity
        });
        setModeForm({ name: "", duration: 25, breakDuration: 5, intensity: "medium" });
    };

    const handleAddSeqCycle = () => {
        setSeqForm(prev => ({
            ...prev,
            cycles: [...prev.cycles, { duration: 5, type: "break" as const }]
        }));
    };

    const handleRemoveStep = (index: number) => {
        if (seqForm.cycles.length <= 1) return;
        setSeqForm(prev => ({
            ...prev,
            cycles: prev.cycles.filter((_, i) => i !== index)
        }));
    };

    const handleAddSequence = () => {
        if (!seqForm.name) return;
        addSequence({
            id: Math.random().toString(36).substring(7),
            name: seqForm.name,
            cycles: seqForm.cycles.map(c => ({ ...c, duration: Number(c.duration) * 60 }))
        });
        setSeqForm({ name: "", cycles: [{ duration: 25, type: "focus" }] });
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="grid gap-8 grid-cols-1">
                {/* Custom Mode Builder */}
                <div className="relative group/card">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur opacity-75 group-hover/card:opacity-100 transition duration-1000 group-hover/card:duration-200"></div>
                    <div className="relative flex flex-col h-full rounded-[2rem] bg-[#0A0A0B] border border-white/[0.08] p-8 space-y-6 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <Flame className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.focus.createMode}</span>
                                </div>
                                <p className="text-xs text-white/40">{t.focus.createModeDesc}</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">{t.focus.sequencePlaceholder}</label>
                                <Input
                                    placeholder={t.focus.modePlaceholder}
                                    value={modeForm.name}
                                    onChange={e => setModeForm({ ...modeForm, name: e.target.value })}
                                    className="bg-white/[0.03] border-white/[0.06] rounded-2xl h-12 px-5 focus:ring-indigo-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">{t.focus.workMin}</label>
                                    <Input
                                        type="number"
                                        value={modeForm.duration}
                                        onChange={e => setModeForm({ ...modeForm, duration: parseInt(e.target.value) })}
                                        className="bg-white/[0.03] border-white/[0.06] rounded-2xl h-12 px-5 text-center font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">{t.focus.breakMin}</label>
                                    <Input
                                        type="number"
                                        value={modeForm.breakDuration}
                                        onChange={e => setModeForm({ ...modeForm, breakDuration: parseInt(e.target.value) })}
                                        className="bg-white/[0.03] border-white/[0.06] rounded-2xl h-12 px-5 text-center font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
                            onClick={handleAddMode}
                        >
                            <Plus className="mr-2 h-4 w-4" /> {t.focus.saveMode}
                        </Button>
                    </div>
                </div>

                {/* Focus Sequence Builder */}
                <div className="relative group/card">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-rose-500/20 rounded-[2rem] blur opacity-75 group-hover/card:opacity-100 transition duration-1000 group-hover/card:duration-200"></div>
                    <div className="relative flex flex-col h-full rounded-[2rem] bg-[#0A0A0B] border border-white/[0.08] p-8 space-y-6 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-orange-400">
                                    <Layers className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.focus.buildSequence}</span>
                                </div>
                                <p className="text-xs text-white/40">{t.focus.buildSequenceDesc}</p>
                            </div>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">{t.focus.sequencePlaceholder}</label>
                            <Input
                                placeholder={t.focus.sequencePlaceholder}
                                value={seqForm.name}
                                onChange={e => setSeqForm({ ...seqForm, name: e.target.value })}
                                className="bg-white/[0.03] border-white/[0.06] rounded-2xl h-12 px-5 focus:ring-orange-500/50"
                            />
                        </div>

                        {/* Steps List */}
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {seqForm.cycles.map((cycle, idx) => (
                                <div key={idx} className="group/item flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] transition-all hover:border-white/10 hover:bg-white/[0.04]">
                                    <div className="h-8 w-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[10px] font-black text-orange-400">
                                        {idx + 1}
                                    </div>

                                    <select
                                        className="h-9 bg-transparent text-sm font-bold text-white/70 focus:outline-none appearance-none cursor-pointer pr-4"
                                        value={cycle.type}
                                        onChange={e => {
                                            const newCycles = [...seqForm.cycles];
                                            newCycles[idx].type = e.target.value as 'focus' | 'break';
                                            setSeqForm({ ...seqForm, cycles: newCycles });
                                        }}
                                    >
                                        <option value="focus" className="bg-[#0A0A0B]">{t.focus.focus}</option>
                                        <option value="break" className="bg-[#0A0A0B]">{t.focus.break}</option>
                                    </select>

                                    <div className="flex-1 flex items-center gap-2">
                                        <Input
                                            type="number"
                                            className="h-9 bg-white/[0.04] border-white/[0.08] rounded-xl text-center text-xs font-black p-0"
                                            value={cycle.duration}
                                            onChange={e => {
                                                const newCycles = [...seqForm.cycles];
                                                newCycles[idx].duration = parseInt(e.target.value) || 0;
                                                setSeqForm({ ...seqForm, cycles: newCycles });
                                            }}
                                        />
                                        <span className="text-[10px] font-black text-white/20 uppercase">min</span>
                                    </div>

                                    {seqForm.cycles.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveStep(idx)}
                                            className="p-1.5 opacity-0 group-hover/item:opacity-100 text-rose-500/50 hover:text-rose-500 transition-all active:scale-90"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-2xl border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest transition-all"
                                onClick={handleAddSeqCycle}
                            >
                                <Plus className="mr-2 h-3 w-3" /> {t.focus.addStep}
                            </Button>
                            <Button
                                className="flex-1 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
                                onClick={handleAddSequence}
                            >
                                {t.focus.saveSequence}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
