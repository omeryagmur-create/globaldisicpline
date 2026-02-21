import { NextResponse } from "next/server";
import { checkActiveRestrictions } from "@/lib/utils/restrictions";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const restrictions = await checkActiveRestrictions(user.id);
        return NextResponse.json({ restrictions });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
