"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, RefreshCw, Globe } from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ExamSystem {
    id: string;
    code: string;
    name: string;
    country: string;
    created_at: string;
}

export function ExamSystemManager() {
    const [examSystems, setExamSystems] = useState<ExamSystem[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    // Form state
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [country, setCountry] = useState("");

    const fetchExamSystems = useCallback(async () => {
        setLoadingList(true);
        try {
            const res = await fetch("/api/admin/exams");
            if (!res.ok) throw new Error("Failed to fetch");
            const json = await res.json();
            setExamSystems(json.systems || []);
        } catch {
            toast.error("Failed to load exam systems");
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => {
        fetchExamSystems();
    }, [fetchExamSystems]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !name || !country) {
            toast.error("All fields are required");
            return;
        }
        setLoadingSubmit(true);
        try {
            const res = await fetch("/api/admin/exams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, name, country }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Unknown error");
            }
            toast.success(`Exam system "${name}" created successfully!`);
            setCode(""); setName(""); setCountry("");
            await fetchExamSystems();
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setLoadingSubmit(false);
        }
    };

    const COUNTRIES = [
        { value: "Turkey", label: "🇹🇷 Turkey" },
        { value: "United States", label: "🇺🇸 United States" },
        { value: "United Kingdom", label: "🇬🇧 United Kingdom" },
        { value: "Germany", label: "🇩🇪 Germany" },
        { value: "France", label: "🇫🇷 France" },
        { value: "Other", label: "🌐 Other" },
    ];

    return (
        <div className="grid gap-8 md:grid-cols-2">
            {/* Add Form */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Add New Exam System</h2>
                <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-card">
                    <div className="space-y-2">
                        <Label htmlFor="exam-code">System Code</Label>
                        <Input
                            id="exam-code"
                            placeholder="e.g. TR-YKS"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="exam-name">System Name</Label>
                        <Input
                            id="exam-name"
                            placeholder="e.g. Yükseköğretim Kurumları Sınavı"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Country</Label>
                        <Select value={country} onValueChange={setCountry}>
                            <SelectTrigger id="exam-country">
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map(c => (
                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={loadingSubmit}>
                        {loadingSubmit ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
                        ) : (
                            <><Plus className="h-4 w-4 mr-2" />Add Exam System</>
                        )}
                    </Button>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Existing Systems</h2>
                    <Button variant="outline" size="sm" onClick={fetchExamSystems} disabled={loadingList}>
                        {loadingList ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Country</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingList ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8">
                                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : examSystems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        No exam systems defined yet.
                                    </TableCell>
                                </TableRow>
                            ) : examSystems.map((sys) => (
                                <TableRow key={sys.id}>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-xs">{sys.code}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{sys.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Globe className="h-3 w-3" /> {sys.country}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {!loadingList && (
                    <p className="text-xs text-muted-foreground">{examSystems.length} system(s) in database</p>
                )}
            </div>
        </div>
    );
}

// Keep old export alias for any existing imports
export { ExamSystemManager as ExamForm };

// Unused subject icon — kept for future UI
export function _SubjectIcon() {
    return <Trash2 className="h-4 w-4" />;
}
