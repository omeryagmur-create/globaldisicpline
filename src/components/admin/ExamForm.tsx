"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export function ExamForm() {
    const [subjects, setSubjects] = useState([{ id: 1, name: "", topics: "" }]);

    const addSubject = () => {
        setSubjects([...subjects, { id: Date.now(), name: "", topics: "" }]);
    };

    const removeSubject = (id: number) => {
        setSubjects(subjects.filter(s => s.id !== id));
    };

    const handleSubjectChange = (id: number, field: string, value: string) => {
        setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock save
        toast.success("Exam system saved successfully!");
        console.log({ subjects });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">System Code</Label>
                        <Input id="code" placeholder="e.g. TR-YKS" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tr">Turkey</SelectItem>
                                <SelectItem value="us">United States</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">System Name</Label>
                    <Input id="name" placeholder="e.g. Yükseköğretim Kurumları Sınavı" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="duration">Total Duration (minutes)</Label>
                    <Input id="duration" type="number" placeholder="180" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Subjects</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                        <Plus className="mr-2 h-4 w-4" /> Add Subject
                    </Button>
                </div>

                {subjects.map((subject, index) => (
                    <div key={subject.id} className="p-4 border rounded-md space-y-4 bg-card/50">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-muted-foreground">Subject {index + 1}</h4>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSubject(subject.id)} className="h-6 w-6 text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>Subject Name</Label>
                                <Input
                                    value={subject.name}
                                    onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                                    placeholder="e.g. Mathematics"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Topics (comma separated)</Label>
                                <Textarea
                                    value={subject.topics}
                                    onChange={(e) => handleSubjectChange(subject.id, 'topics', e.target.value)}
                                    placeholder="Algebra, Geometry, Trigonometry..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button type="submit" className="w-full">Save Exam System</Button>
        </form>
    );
}
