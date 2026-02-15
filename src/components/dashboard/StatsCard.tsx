import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend: string;
    trendType: 'up' | 'down' | 'neutral';
    color?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    trendType,
    color,
}: StatsCardProps) {
    return (
        <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn("h-4 w-4 text-muted-foreground", color)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    {trendType === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />}
                    {trendType === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />}
                    <span className={cn(
                        trendType === 'up' && "text-green-500",
                        trendType === 'down' && "text-red-500",
                    )}>
                        {trend}
                    </span>
                    <span className="ml-1 text-muted-foreground">from last week</span>
                </p>
            </CardContent>
        </Card>
    );
}
