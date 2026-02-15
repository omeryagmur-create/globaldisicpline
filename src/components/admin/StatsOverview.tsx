import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Clock, TrendingUp, DollarSign } from "lucide-react";

export function StatsOverview() {
    // Mock data
    const stats = [
        {
            title: "Total Users",
            value: "12,345",
            change: "+12% from last month",
            icon: Users,
        },
        {
            title: "Active Users (7d)",
            value: "8,920",
            change: "+5% from last week",
            icon: TrendingUp,
        },
        {
            title: "Total Focus Hours",
            value: "1.2M",
            change: "+15% all time",
            icon: Clock,
        },
        {
            title: "Total Revenue",
            value: "$45,231",
            change: "+22% this month",
            icon: DollarSign,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {stat.change}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
