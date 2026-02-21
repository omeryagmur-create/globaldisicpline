import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend: string;
    trendType: 'up' | 'down' | 'neutral';
    color?: string;
    gradient?: string;
}

const colorMap: Record<string, { icon: string; glow: string; bg: string; border: string }> = {
    "text-indigo-400": {
        icon: "text-indigo-400",
        glow: "bg-indigo-500/10",
        bg: "from-indigo-500/5 to-transparent",
        border: "border-indigo-500/15",
    },
    "text-yellow-500": {
        icon: "text-amber-400",
        glow: "bg-amber-500/10",
        bg: "from-amber-500/5 to-transparent",
        border: "border-amber-500/15",
    },
    "text-purple-500": {
        icon: "text-violet-400",
        glow: "bg-violet-500/10",
        bg: "from-violet-500/5 to-transparent",
        border: "border-violet-500/15",
    },
    "text-emerald-400": {
        icon: "text-emerald-400",
        glow: "bg-emerald-500/10",
        bg: "from-emerald-500/5 to-transparent",
        border: "border-emerald-500/15",
    },
};

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    trendType,
    color = "text-indigo-400",
}: StatsCardProps) {
    const styles = colorMap[color] || colorMap["text-indigo-400"];

    return (
        <div className={cn(
            "stat-card relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 group cursor-default",
            "bg-gradient-to-br",
            styles.bg,
            styles.border,
        )}>
            {/* Ambient Glow */}
            <div className={cn(
                "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-12 -mt-12 opacity-70 group-hover:opacity-100 transition-opacity",
                styles.glow,
            )} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        "p-2.5 rounded-xl border",
                        styles.glow,
                        styles.border,
                    )}>
                        <Icon className={cn("h-5 w-5", styles.icon)} />
                    </div>

                    {/* Trend Badge */}
                    {trendType === 'up' && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            <TrendingUp className="h-3 w-3" />
                            {trend}
                        </div>
                    )}
                    {trendType === 'down' && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
                            <TrendingDown className="h-3 w-3" />
                            {trend}
                        </div>
                    )}
                    {trendType === 'neutral' && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold">
                            <Minus className="h-3 w-3" />
                            {trend}
                        </div>
                    )}
                </div>

                {/* Value */}
                <div className="mt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-1">{title}</p>
                    <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
                </div>

                {/* Bottom Line */}
                <div className={cn("mt-4 h-[1px] rounded-full opacity-30", styles.glow.replace('bg-', 'bg-'))} />
            </div>
        </div>
    );
}
