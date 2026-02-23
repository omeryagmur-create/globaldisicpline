import { NextResponse } from "next/server";
import { applyRestriction, calculateSeverity } from "@/lib/utils/restrictions";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify caller is admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
        return NextResponse.json({ error: "Forbidden – Admin access required" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { targetUserId, type, reason, consecutiveFailures } = body;

        if (!targetUserId) {
            return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
        }

        const severity = calculateSeverity(consecutiveFailures || 1) as 1 | 2 | 3;
        const restriction = await applyRestriction(
            targetUserId,
            type || "social_reduction",
            severity,
            reason || "Admin manual restriction via system-control"
        );

        return NextResponse.json({ success: true, restriction });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
