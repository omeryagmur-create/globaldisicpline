"use client";

import { useState } from "react";
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
import { MoreHorizontal, Search, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MOCK_USERS = [
    { id: "1", email: "alice@example.com", name: "Alice Johnson", tier: "Free", streak: 5, xp: 1200, joined: "2024-01-15" },
    { id: "2", email: "bob@example.com", name: "Bob Smith", tier: "Pro", streak: 12, xp: 5400, joined: "2024-01-20" },
    { id: "3", email: "charlie@example.com", name: "Charlie Brown", tier: "Elite", streak: 30, xp: 15200, joined: "2023-12-10" },
    { id: "4", email: "david@example.com", name: "David Wilson", tier: "Free", streak: 0, xp: 100, joined: "2024-02-01" },
    { id: "5", email: "eve@example.com", name: "Eve Anderson", tier: "Pro", streak: 3, xp: 2100, joined: "2024-02-05" },
];

export function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = MOCK_USERS.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button>
                    Export CSV
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>Streak</TableHead>
                            <TableHead>XP</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.tier === 'Elite' ? 'default' : user.tier === 'Pro' ? 'secondary' : 'outline'}>
                                        {user.tier}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        <span className="fire-icon mr-1">🔥</span>
                                        {user.streak}
                                    </div>
                                </TableCell>
                                <TableCell>{user.xp.toLocaleString()}</TableCell>
                                <TableCell>{user.joined}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">Suspend User</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
