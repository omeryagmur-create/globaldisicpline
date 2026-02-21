import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, TrendingUp, DollarSign } from "lucide-react";

interface StatsData {
    totalUsers: number;
    activeUsers: number;
    totalFocusHours: number;
    growth: number;
    totalRevenue: number;
    retentionD1: number;
}

export function StatsOverview({ data }: { data: StatsData }) {
    const stats = [
        {
            title: "Total Users",
            value: data.totalUsers.toLocaleString(),
            change: `${data.growth >= 0 ? '+' : ''}${data.growth}% from last month`,
            icon: Users,
        },
        {
            title: "Active Users (7d)",
            value: data.activeUsers.toLocaleString(),
            change: "Based on focus activity",
            icon: TrendingUp,
        },
        {
            title: "Total Focus Hours",
            value: data.totalFocusHours.toLocaleString(),
            change: "All time total",
            icon: Clock,
        },
        {
            title: "Total Revenue",
            value: `$${data.totalRevenue.toLocaleString()}`,
            change: "Net processed",
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
