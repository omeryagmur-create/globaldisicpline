"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";

interface RestrictionRow {
    id: string;
    user_id: string;
    type: string;
    level: number;
    reason: string | null;
    start_date: string;
    end_date: string;
    is_active: boolean;
    // joined from profiles
    profiles?: { email: string; full_name: string | null } | null;
}

export function RestrictionControl() {
    const [targetUserId, setTargetUserId] = useState("");
    const [restrictionType, setRestrictionType] = useState("social_reduction");
    const [reason, setReason] = useState("");
    const [applying, setApplying] = useState(false);

    const [restrictions, setRestrictions] = useState<RestrictionRow[]>([]);
    const [loadingList, setLoadingList] = useState(true);

    const fetchRestrictions = useCallback(async () => {
        setLoadingList(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("restrictions")
            .select("*, profiles(email, full_name)")
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            toast.error("Failed to load restrictions");
        } else {
            setRestrictions((data as RestrictionRow[]) || []);
        }
        setLoadingList(false);
    }, []);

    useEffect(() => {
        fetchRestrictions();
    }, [fetchRestrictions]);

    const handleApply = async () => {
        if (!targetUserId.trim()) {
            toast.error("User ID is required");
            return;
        }
        setApplying(true);
        try {
            const res = await fetch("/api/restrictions/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetUserId: targetUserId.trim(),
                    type: restrictionType,
                    reason: reason || "Admin manual restriction",
                    consecutiveFailures: 3, // Default level 2
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Unknown error");
            toast.success("Restriction applied and persisted to database");
            setReason("");
            setTargetUserId("");
            await fetchRestrictions();
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setApplying(false);
        }
    };

    const isExpired = (endDate: string) => new Date(endDate) < new Date();

    const getStatusBadge = (row: RestrictionRow) => {
        if (!row.is_active) return <Badge variant="outline">Deactivated</Badge>;
        if (isExpired(row.end_date)) return <Badge variant="secondary">Expired</Badge>;
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Active</Badge>;
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return (
        <div className="space-y-8">
            {/* Apply Form */}
            <div className="p-5 border rounded-xl bg-card shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-orange-400" />
                    <h3 className="text-lg font-semibold">Apply Manual Restriction</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    <Input
                        placeholder="Target User UUID"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="font-mono text-xs"
                    />
                    <Select value={restrictionType} onValueChange={setRestrictionType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="social_reduction">Social Reduction</SelectItem>
                            <SelectItem value="feature_lock">Feature Lock</SelectItem>
                            <SelectItem value="xp_penalty">XP Penalty</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Reason for restriction"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <Button onClick={handleApply} disabled={applying} className="font-bold">
                        {applying ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Applying...</> : "Apply Restriction"}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">Restriction is persisted permanently to the database. Paste a User UUID from the Users page.</p>
            </div>

            {/* Live Restrictions Table */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Restrictions (Live from DB)</h3>
                    <Button variant="outline" size="sm" onClick={fetchRestrictions} disabled={loadingList}>
                        {loadingList ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingList ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : restrictions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No restrictions found in database.
                                    </TableCell>
                                </TableRow>
                            ) : restrictions.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium">{r.profiles?.full_name || r.profiles?.email || "–"}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono">{r.user_id.slice(0, 12)}…</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs capitalize">{r.type.replace("_", " ")}</Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-orange-400">{r.level}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{r.reason || "–"}</TableCell>
                                    <TableCell className="text-sm">{formatDate(r.end_date)}</TableCell>
                                    <TableCell>{getStatusBadge(r)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {!loadingList && (
                    <p className="text-xs text-muted-foreground">{restrictions.length} restriction record(s) in database</p>
                )}
            </div>
        </div>
    );
}
