import { StatsOverview } from "@/components/admin/StatsOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        redirect("/dashboard");
    }

    // Fetch stats using our optimized RPC
    const { data: stats, error: rpcError } = await supabase.rpc('get_admin_dashboard_stats');

    if (rpcError) {
        logger.error('Failed to fetch admin stats in page', rpcError);
    }

    const defaultStats = {
        totalUsers: 0,
        activeUsers: 0,
        totalFocusHours: 0,
        growth: 0,
        totalRevenue: 0,
        retentionD1: 0
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

            <StatsOverview data={stats || defaultStats} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                            <span className="text-sm font-medium">User Retention (D1)</span>
                            <span className="text-3xl font-black text-indigo-400 mt-2">%{stats?.retentionD1 || '??'}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>System Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Database Latency</span>
                                <span className="text-sm font-bold text-emerald-400">Excellent</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Auth Service</span>
                                <span className="text-sm font-bold text-emerald-400">Operational</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Storage Engine</span>
                                <span className="text-sm font-bold text-emerald-400">Operational</span>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <p className="text-xs text-muted-foreground italic">Sprint-2 telemetry is active. All system events are being logged via centralized logger.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
