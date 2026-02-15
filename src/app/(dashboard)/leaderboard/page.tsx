import { createClient } from "@/lib/supabase/server";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Leaderboard - Global Discipline Engine",
    description: "See the top performers globally.",
};

async function getLeaderboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Try RPC first
    let { data: users, error } = await supabase.rpc('get_leaderboard', { limit_count: 50 });

    if (error) {
        console.error("Leaderboard RPC error:", error);
        // Fallback to direct query if RPC missing
        const { data: fallbackUsers, error: fallbackError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, country, total_xp, current_level, tier')
            .order('total_xp', { ascending: false })
            .limit(50);

        if (fallbackError) {
            console.error("Leaderboard fallback error:", fallbackError);
            return { users: [], currentUserId: user?.id };
        }
        users = fallbackUsers;
    }

    return { users: users || [], currentUserId: user?.id };
}

export default async function LeaderboardPage() {
    const { users, currentUserId } = await getLeaderboardData();

    return (
        <div className="container mx-auto max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Global Leaderboard</h1>
                <p className="text-muted-foreground">
                    Top disciplined students from around the world.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>
                        Rankings are updated in real-time based on total XP earned.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LeaderboardTable users={users} currentUserId={currentUserId} />
                </CardContent>
            </Card>
        </div>
    );
}
