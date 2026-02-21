import { NextResponse } from "next/server";
import { applyRestriction, calculateSeverity } from "@/lib/utils/restrictions";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { type, reason, consecutiveFailures } = body;

        const severity = calculateSeverity(consecutiveFailures || 1) as 1 | 2 | 3;

        const restriction = await applyRestriction(user.id, type || 'social_reduction', severity, reason || 'Manual restriction applied via API');

        return NextResponse.json({ success: true, restriction });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
