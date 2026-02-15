import { NextResponse } from "next/server";
import { checkActiveRestrictions } from "@/lib/utils/restrictions";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const restrictions = await checkActiveRestrictions(user.id);
        return NextResponse.json({ restrictions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
