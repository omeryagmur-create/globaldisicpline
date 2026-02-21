import { createClient } from "@/lib/supabase/server";
import { FocusContent } from "@/components/focus/FocusContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Focus Timer - Global Discipline Engine",
    description: "Stay focused and track your study sessions.",
};

async function getFocusData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { history: [] };

    const { data: history } = await supabase
        .from("focus_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

    return { history: history || [] };
}

export default async function FocusPage() {
    const { history } = await getFocusData();

    return <FocusContent history={history} />;
}
