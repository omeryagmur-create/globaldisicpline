import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdminAccess() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { authorized: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        return { authorized: false, error: NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 }) };
    }

    return { authorized: true };
}

export async function GET() {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.authorized) {
        return adminCheck.error;
    }

    const supabase = await createClient();
    const { data: systems, error } = await supabase
        .from('exam_systems')
        .select('*')
        .order('name');

    if (error) {
        return NextResponse.json({ error: "Failed to fetch exam systems" }, { status: 500 });
    }

    return NextResponse.json({ systems });
}

export async function POST(request: Request) {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.authorized) {
        return adminCheck.error;
    }

    const body = await request.json();
    const supabase = await createClient();

    const { data: system, error } = await supabase
        .from('exam_systems')
        .insert({
            code: body.code,
            name: body.name,
            country: body.country,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, ...system });
}
