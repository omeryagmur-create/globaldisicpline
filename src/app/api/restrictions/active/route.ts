import { NextResponse } from "next/server";
import { checkActiveRestrictions } from "@/lib/utils/restrictions";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const restrictions = await checkActiveRestrictions(user.id);
        return NextResponse.json({ restrictions });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
