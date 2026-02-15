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

    return NextResponse.json({
        systems: [
            { id: '1', code: 'TR-YKS', name: 'YKS', country: 'Turkey' },
            { id: '2', code: 'US-SAT', name: 'SAT', country: 'USA' }
        ]
    });
}

export async function POST(request: Request) {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.authorized) {
        return adminCheck.error;
    }

    const body = await request.json();
    return NextResponse.json({ success: true, id: Date.now().toString(), ...body });
}
