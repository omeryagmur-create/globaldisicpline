"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-hot-toast";

export function RestrictionControl() {
    const [targetUserId, setTargetUserId] = useState("");
    const [restrictionType, setRestrictionType] = useState("social_reduction");
    const [reason, setReason] = useState("");

    const handleApply = async () => {
        if (!targetUserId) {
            toast.error("User ID is required");
            return;
        }

        try {
            await fetch('/api/restrictions/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: restrictionType,
                    reason: reason || "Admin manual restriction",
                    consecutiveFailures: 3 // Default severity 2
                })
            });
            toast.success("Restriction applied successfully");
            setReason("");
        } catch (_error) {
            toast.error("Failed to apply restriction");
        }
    };

    return (
        <div className="space-y-8">
            <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm space-y-4">
                <h3 className="text-lg font-semibold">Apply Manual Restriction</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Input
                        placeholder="User UUID"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
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
                        placeholder="Reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <Button onClick={handleApply}>
                        Apply Restriction
                    </Button>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Recent Restrictions</h3>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-mono text-xs">admin_user_id</TableCell>
                                <TableCell>Social Reduction</TableCell>
                                <TableCell>2</TableCell>
                                <TableCell>Failed &quot;Morning Focus&quot; Challenge</TableCell>
                                <TableCell>Active</TableCell>
                            </TableRow>
                            {/* More mock rows could go here */}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
