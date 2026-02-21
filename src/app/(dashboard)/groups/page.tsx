"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Plus,
    Trophy,
    ArrowRight,
    Lock,
    Globe,
    Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Image from "next/image";

const GROUPS = [
    {
        id: 1,
        name: "YKS Sayısal Tayfa 2026",
        description: "Focusing on Advanced Math and Physics problems. Daily 4h focus sessions.",
        members: 124,
        type: "Public",
        tags: ["YKS", "Math", "Science"],
        activity: "High",
        image: "https://images.unsplash.com/photo-1523240715639-93f8bb0a6a0e?q=80&w=200&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "IELTS 7.5+ Warriors",
        description: "Speaking practice and essay review sessions every Saturday.",
        members: 45,
        type: "Private",
        tags: ["English", "IELTS"],
        activity: "Medium",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=200&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Gece Çalışanlar (Night Owls)",
        description: "22:00 - 03:00 study sessions for independent learners.",
        members: 89,
        type: "Public",
        tags: ["Study", "Night"],
        activity: "Extreme",
        image: "https://images.unsplash.com/photo-1541199249251-f713e6145474?q=80&w=200&auto=format&fit=crop"
    }
];

import { getPersonalizedGroups } from "@/actions/groups";
import type { GroupRecommendation } from "@/services/RecommendationService";

export default function GroupsPage() {
    const [search, setSearch] = useState("");
    const [recommended, setRecommended] = useState<GroupRecommendation[]>([]);

    useEffect(() => {
        getPersonalizedGroups().then(setRecommended);
    }, []);

    return (
        <div className="container mx-auto max-w-6xl py-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Study Groups</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Find your tribe. Study together, achieve together.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="rounded-full shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> Create Group
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Search Groups</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name..."
                                    className="pl-9 bg-muted/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Category</Label>
                                <Select defaultValue="all">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="yks">YKS Preparations</SelectItem>
                                        <SelectItem value="lang">Language Learning</SelectItem>
                                        <SelectItem value="it">IT & Coding</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-amber-500" /> Top Groups this Week
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center font-bold text-xs">#{i}</div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold truncate">YKS Sayısal Tayfa</p>
                                        <p className="text-[10px] text-muted-foreground">41.2k Focus Minutes</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="all">All Groups</TabsTrigger>
                            <TabsTrigger value="my">My Groups</TabsTrigger>
                            <TabsTrigger value="suggested">Trending</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0">
                            {GROUPS.map((group) => (
                                <Card key={group.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/10">
                                    <div className="h-24 w-full relative overflow-hidden">
                                        <Image
                                            src={group.image}
                                            alt={group.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                                        <div className="absolute bottom-2 left-4 flex gap-2">
                                            {group.type === "Private" ? (
                                                <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                    <Lock className="h-3 w-3" /> Private
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                                                    <Globe className="h-3 w-3" /> Public
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <CardHeader className="space-y-1">
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{group.name}</CardTitle>
                                        <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {group.tags.map(tag => (
                                                <Badge key={tag} variant="outline" className="text-[10px] uppercase">{tag}</Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>{group.members} members</span>
                                            </div>
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                                        <AvatarFallback className="text-[8px]">U{i}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold">+5</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <Divider className="mx-6 border-muted/50" />
                                    <CardFooter className="pt-4 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                            Active Now
                                        </div>
                                        <Button variant="ghost" size="sm" className="group/btn">
                                            Join Group <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </TabsContent>

                        <TabsContent value="my" className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-bold">You haven&apos;t joined any groups yet</h3>
                            <p className="text-muted-foreground mt-1">Start by browsing the public groups or create your own.</p>
                            <Button variant="outline" className="mt-4" onClick={() => (window as unknown as { location: { href: string } }).location.href = "#"}>Browse Groups</Button>
                        </TabsContent>

                        <TabsContent value="suggested" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0">
                            {recommended.length > 0 ? recommended.map((group) => (
                                <Card key={group.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/20 bg-primary/5">
                                    <div className="h-24 w-full relative overflow-hidden">
                                        <Image
                                            src={group.coverImage}
                                            alt={group.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                                        <div className="absolute top-2 left-2 flex gap-2">
                                            <Badge variant="secondary" className="gap-1 bg-amber-500 text-black border-none font-bold shadow-lg shadow-amber-500/20">
                                                <Sparkles className="h-3 w-3" /> Recommended
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="space-y-1">
                                        <CardTitle className="text-xl text-primary transition-colors">{group.name}</CardTitle>
                                        <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded inline-block">
                                            {group.reason}
                                        </p>
                                    </CardContent>
                                    <Divider className="mx-6 border-muted/50" />
                                    <CardFooter className="pt-4 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                            <Users className="h-4 w-4" />
                                            {group.members} members
                                        </div>
                                        <Button size="sm" className="group/btn bg-primary hover:bg-primary/90 text-primary-foreground">
                                            Join Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )) : (
                                <div className="col-span-1 md:col-span-2 text-center py-20 bg-muted/20 rounded-xl border-dashed border-2">
                                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                                    <p className="mt-4 text-muted-foreground font-medium">Analyzing your profile for recommendations...</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function Divider({ className }: { className?: string }) {
    return <div className={cn("h-px", className)} />;
}

// Sub-components to avoid missing imports
// (Moved to top)
