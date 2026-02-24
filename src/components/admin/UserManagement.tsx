"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, RefreshCw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface UserRow {
    id: string;
    email: string;
    full_name: string | null;
    total_xp: number;
    current_streak: number;
    is_admin: boolean;
    current_league: string;
    created_at: string;
}

export function UserManagement() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // fetchUsers is used for the refresh button
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("id, email, full_name, total_xp, current_streak, is_admin, current_league, created_at")
            .order("total_xp", { ascending: false })
            .limit(100);

        if (error) {
            toast.error("Failed to fetch users");
            setLoading(false);
            return;
        }
        setUsers(data || []);
        setLoading(false);
    }, []);

    // Initial load on mount — no setState directly in effect body
    useEffect(() => {
        let cancelled = false;
        const supabase = createClient();
        const query = supabase
            .from("profiles")
            .select("id, email, full_name, total_xp, current_streak, is_admin, current_league, created_at")
            .order("total_xp", { ascending: false })
            .limit(100);

        void query.then(({ data, error }) => {
            if (cancelled) return;
            if (error) toast.error("Failed to fetch users");
            else setUsers(data || []);
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, []);

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    // Replaced legacy getXpTier with current_league rendering

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Refresh
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>Streak</TableHead>
                            <TableHead>Total XP</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                                    Loading users from database...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    {searchTerm ? "No users match your search." : "No users found."}
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.map((user) => {
                            const tier = user.current_league || "Bronze";
                            return (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.full_name || "–"}</span>
                                            <span className="text-xs text-muted-foreground font-mono">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.is_admin ? "default" : tier === "Master" || tier === "Grandmaster" ? "default" : "secondary"}>
                                            {user.is_admin ? "Admin" : tier}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            🔥 {user.current_streak}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono">{(user.total_xp || 0).toLocaleString()}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => {
                                                    navigator.clipboard.writeText(user.id);
                                                    toast.success("User ID copied!");
                                                }}>
                                                    Copy User ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    Apply Restriction
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {!loading && (
                <p className="text-xs text-muted-foreground text-right">
                    Showing {filteredUsers.length} of {users.length} users (ordered by XP desc)
                </p>
            )}
        </div>
    );
}
