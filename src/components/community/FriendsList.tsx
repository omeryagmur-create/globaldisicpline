"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, Check, X, UserMinus } from "lucide-react";

interface Friend {
    id: string;
    username: string;
    avatarUrl?: string;
    xp: number;
    streak: number;
    status: 'accepted' | 'pending_sent' | 'pending_received';
}

// Dummy data
const MOCK_FRIENDS: Friend[] = [
    { id: '1', username: 'Ali Veli', xp: 12500, streak: 5, status: 'accepted' },
    { id: '2', username: 'Ayşe Yılmaz', xp: 8900, streak: 12, status: 'accepted' },
    { id: '3', username: 'Mehmet Öz', xp: 4500, streak: 0, status: 'pending_received' },
    { id: '4', username: 'Zeynep Kaya', xp: 1500, streak: 2, status: 'pending_sent' },
];

export function FriendsList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("friends");

    const friends = MOCK_FRIENDS.filter(f => f.status === 'accepted');
    const requests = MOCK_FRIENDS.filter(f => f.status === 'pending_received');
    const sent = MOCK_FRIENDS.filter(f => f.status === 'pending_sent');

    const filteredFriends = friends.filter(f =>
        f.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    Community
                    <Button size="sm" variant="outline">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                    </Button>
                </CardTitle>
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search friends..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs defaultValue="friends" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                        <TabsTrigger
                            value="friends"
                            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            Friends ({friends.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="requests"
                            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            Requests ({requests.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="sent"
                            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            Sent ({sent.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="friends" className="p-4 space-y-4">
                        {filteredFriends.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No friends found.</p>
                        ) : (
                            filteredFriends.map(friend => (
                                <div key={friend.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar>
                                            <AvatarImage src={friend.avatarUrl} />
                                            <AvatarFallback>{friend.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{friend.username}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {friend.xp} XP • {friend.streak} day streak
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" title="Remove Friend">
                                        <UserMinus className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="requests" className="p-4 space-y-4">
                        {requests.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No pending requests.</p>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar>
                                            <AvatarImage src={req.avatarUrl} />
                                            <AvatarFallback>{req.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{req.username}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Wants to be friends
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 border-green-200 bg-green-50 hover:bg-green-100">
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="sent" className="p-4 space-y-4">
                        {sent.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No sent requests.</p>
                        ) : (
                            sent.map(req => (
                                <div key={req.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar>
                                            <AvatarImage src={req.avatarUrl} />
                                            <AvatarFallback>{req.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{req.username}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Pending acceptance
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" disabled>
                                        Sent
                                    </Button>
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
