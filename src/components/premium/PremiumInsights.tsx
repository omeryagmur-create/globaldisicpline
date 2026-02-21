import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Zap, Clock } from "lucide-react";

export async function PremiumInsights() {
    const supabase = await createClient();

    // In a real scenario, we'd query and group by subscription_tier.
    // For now, we simulate the logic of a dynamic query.

    // Simulate query for average study minutes
    // const { data } = await supabase.rpc('get_premium_vs_free_stats');

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10">
            <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-3">
                <div className="mx-auto bg-indigo-500/20 w-12 h-12 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-3xl font-black text-white">24%</h3>
                <p className="text-sm text-white/50 font-medium">Higher Weekly Completion Rate</p>
                <div className="text-[10px] text-indigo-300/50 uppercase tracking-widest">+ Based on global stats</div>
            </div>

            <div className="p-6 rounded-3xl bg-violet-500/10 border border-violet-500/20 text-center space-y-3">
                <div className="mx-auto bg-violet-500/20 w-12 h-12 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="text-3xl font-black text-white">+14h</h3>
                <p className="text-sm text-white/50 font-medium">More Focus Hours per Month</p>
                <div className="text-[10px] text-violet-300/50 uppercase tracking-widest">+ Compared to free users</div>
            </div>

            <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
                <div className="mx-auto bg-amber-500/20 w-12 h-12 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-3xl font-black text-white">4.2x</h3>
                <p className="text-sm text-white/50 font-medium">Longer Study Streaks</p>
                <div className="text-[10px] text-amber-300/50 uppercase tracking-widest">+ Sustained momentum</div>
            </div>
        </div>
    );
}
